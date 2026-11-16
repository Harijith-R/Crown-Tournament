import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { sceneController } from './animationController';
import { CrownModel } from './CrownModel';
import { ShuttlecockModel } from './ShuttlecockModel';
import { createGoldParticleSprite } from './proceduralTextures';
import { WebGLFallback } from './WebGLFallback';

// Pre-allocated math helpers outside render loop to avoid GC pressure
const _targetCrownPos = new THREE.Vector3();
const _targetShuttlePos = new THREE.Vector3();
const _curvePoint = new THREE.Vector3();
const _curveTangent = new THREE.Vector3();
const _lookMatrix = new THREE.Matrix4();
const _targetQuat = new THREE.Quaternion();
const _upVec = new THREE.Vector3(0, 1, 0);
const _zeroVec = new THREE.Vector3(0, 0, 0);
const _negTangent = new THREE.Vector3();

function detectSoftwareWebGL(): { supported: boolean; isSoftwareGl: boolean } {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      (canvas.getContext('webgl2') as WebGL2RenderingContext | null) ||
      (canvas.getContext('webgl') as WebGLRenderingContext | null);
    if (!gl) return { supported: false, isSoftwareGl: true };

    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();

    const isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    return { supported: true, isSoftwareGl };
  } catch {
    return { supported: false, isSoftwareGl: true };
  }
}

/**
 * Generates zero-network procedural studio IBL reflections via RoomEnvironment.
 */
function StudioEnvironment() {
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmremGenerator = new THREE.PMREMGenerator(gl);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    scene.fog = new THREE.FogExp2('#090909', 0.048);

    return () => {
      scene.environment = null;
      envTarget.dispose();
      roomEnv.dispose();
      pmremGenerator.dispose();
    };
  }, [gl, scene]);

  return null;
}

/**
 * Adaptive floating golden dust particles.
 */
function GoldAtmosphereParticles({ count }: { count: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const sprite = useMemo(() => createGoldParticleSprite(), []);

  const { geometry, material } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const royal = new THREE.Color('#D4AF37');
    const champagne = new THREE.Color('#F5D77A');

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 9;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1.5;

      const mix = royal.clone().lerp(champagne, Math.random());
      colors[i * 3] = mix.r;
      colors[i * 3 + 1] = mix.g;
      colors[i * 3 + 2] = mix.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.09,
      map: sprite,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      sizeAttenuation: true,
    });

    return { geometry: geo, material: mat };
  }, [count, sprite]);

  useEffect(() => {
    return () => {
      sprite.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [sprite, geometry, material]);

  useFrame((state, delta) => {
    if (!pointsRef.current || sceneController.reducedMotion) return;
    const clampedDelta = Math.min(delta, 0.05);
    pointsRef.current.rotation.y += clampedDelta * 0.028;
    pointsRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.14;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

/**
 * Choreographs the 3D Golden Crown and Shuttlecock across scroll progress & route transitions.
 */
function SceneChoreographer({ isSoftwareGl }: { isSoftwareGl: boolean }) {
  const crownGroupRef = useRef<THREE.Group>(null);
  const shuttleGroupRef = useRef<THREE.Group>(null);
  const shuttleSpinRef = useRef<THREE.Group>(null);

  const smoothProgressRef = useRef(0);
  const smoothScaleRef = useRef(0.75);

  // Curved 3D trajectory for shuttlecock emerging from crown, weaving through sections, and returning
  const desktopCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(1.55, -0.05, 0.3),   // 0.00: Nested inside Hero crown
          new THREE.Vector3(1.52, 0.92, 0.75),   // 0.08: Emerges vertically from crown
          new THREE.Vector3(0.45, 0.55, 2.75),   // 0.18: Surges toward camera with perspective depth
          new THREE.Vector3(-2.35, 0.25, 1.55),  // 0.32: Sweeps left past Introduction / Categories
          new THREE.Vector3(2.45, -0.1, 1.25),   // 0.48: Crosses right past Categories / Rules
          new THREE.Vector3(-2.15, -0.25, 1.7),  // 0.64: Sweeps left past Journey / Timeline
          new THREE.Vector3(1.95, 0.55, 1.35),   // 0.78: Arcs high-right past Transparency / Venue
          new THREE.Vector3(0.18, 1.25, 1.45),   // 0.90: Hovers above center finale crown
          new THREE.Vector3(0.0, 0.18, 0.55),    // 1.00: Returns gracefully inside Finale crown
        ],
        false,
        'catmullrom',
        0.5
      ),
    []
  );

  const mobileCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(0.0, 0.95, -0.35),   // 0.00: Inside upper mobile Hero crown
          new THREE.Vector3(0.0, 1.65, 0.35),    // 0.10: Emerges upward
          new THREE.Vector3(0.15, 0.65, 2.2),    // 0.22: Approaches camera
          new THREE.Vector3(-1.05, 0.35, 1.2),   // 0.38: Left weave
          new THREE.Vector3(1.05, 0.05, 1.15),   // 0.56: Right weave
          new THREE.Vector3(-0.9, -0.15, 1.35),  // 0.74: Left weave
          new THREE.Vector3(0.05, 1.15, 1.1),    // 0.88: Above finale crown
          new THREE.Vector3(0.0, 0.12, 0.35),    // 1.00: Returns into finale crown
        ],
        false,
        'catmullrom',
        0.5
      ),
    []
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const elapsed = state.clock.elapsedTime;
    const isMobile = sceneController.isMobile;
    const reduced = sceneController.reducedMotion;
    const pointerX = reduced ? 0 : sceneController.pointer.x;
    const pointerY = reduced ? 0 : sceneController.pointer.y;

    if (!crownGroupRef.current || !shuttleGroupRef.current || !shuttleSpinRef.current) return;

    if (sceneController.routeMode === 'fixtures') {
      // Fixtures & Results mode: calm, persistent ambient trophy silhouette in upper-right corner
      const targetX = isMobile ? 0.0 : 2.85;
      const targetY = isMobile ? 1.7 : 0.95;
      const targetZ = isMobile ? -3.4 : -2.2;
      const targetScale = isMobile ? 0.52 : 0.72;

      crownGroupRef.current.position.x = THREE.MathUtils.damp(crownGroupRef.current.position.x, targetX, 3.5, dt);
      crownGroupRef.current.position.y = THREE.MathUtils.damp(crownGroupRef.current.position.y, targetY, 3.5, dt);
      crownGroupRef.current.position.z = THREE.MathUtils.damp(crownGroupRef.current.position.z, targetZ, 3.5, dt);

      const cs = THREE.MathUtils.damp(crownGroupRef.current.scale.x, targetScale, 3.5, dt);
      crownGroupRef.current.scale.setScalar(cs);

      crownGroupRef.current.rotation.x = THREE.MathUtils.damp(crownGroupRef.current.rotation.x, 0.22 - pointerY * 0.08, 4, dt);
      crownGroupRef.current.rotation.y = THREE.MathUtils.damp(
        crownGroupRef.current.rotation.y,
        (reduced ? 0.4 : elapsed * 0.18) + pointerX * 0.16,
        4,
        dt
      );

      // Shuttlecock rests poised cleanly inside the ambient crown
      shuttleGroupRef.current.position.x = THREE.MathUtils.damp(shuttleGroupRef.current.position.x, targetX, 4, dt);
      shuttleGroupRef.current.position.y = THREE.MathUtils.damp(
        shuttleGroupRef.current.position.y,
        targetY + (isMobile ? 0.34 : 0.48),
        4,
        dt
      );
      shuttleGroupRef.current.position.z = THREE.MathUtils.damp(shuttleGroupRef.current.position.z, targetZ, 4, dt);
      const ss = THREE.MathUtils.damp(shuttleGroupRef.current.scale.x, targetScale * 0.88, 4, dt);
      shuttleGroupRef.current.scale.setScalar(ss);
      shuttleGroupRef.current.rotation.x = THREE.MathUtils.damp(shuttleGroupRef.current.rotation.x, 0.18, 4, dt);
      shuttleGroupRef.current.rotation.z = THREE.MathUtils.damp(shuttleGroupRef.current.rotation.z, -0.15, 4, dt);
      shuttleSpinRef.current.rotation.y = reduced ? 0 : elapsed * 0.45;
      return;
    }

    // HOME ROUTE CHOREOGRAPHY
    const targetProgress = reduced ? 0 : sceneController.scrollProgress;
    smoothProgressRef.current = THREE.MathUtils.damp(smoothProgressRef.current, targetProgress, 5.5, dt);
    const p = smoothProgressRef.current;

    // 1. Crown Position & Scale Curve across Home
    // Hero (p=0): right-center on desktop, upper-center on mobile
    // Mid-scroll (p=0.22..0.75): gracefully recesses into deep background so shuttlecock leads
    // Finale (p=0.85..1.0): glides into grand center spotlight for "THE CROWN AWAITS"
    const heroWeight = Math.max(0, 1 - p / 0.2);
    const finaleWeight = Math.max(0, Math.min(1, (p - 0.76) / 0.2));
    const midWeight = Math.max(0, 1 - heroWeight - finaleWeight);

    const heroCrownX = isMobile ? 0.0 : 1.55;
    const heroCrownY = isMobile ? 0.62 : -0.45;
    const heroCrownZ = isMobile ? -0.35 : 0.3;

    const midCrownX = 0.0;
    const midCrownY = -0.35;
    const midCrownZ = -4.2;

    const finaleCrownX = 0.0;
    const finaleCrownY = isMobile ? -0.25 : -0.35;
    const finaleCrownZ = isMobile ? 0.35 : 0.55;

    _targetCrownPos.set(
      heroCrownX * heroWeight + midCrownX * midWeight + finaleCrownX * finaleWeight,
      heroCrownY * heroWeight + midCrownY * midWeight + finaleCrownY * finaleWeight,
      heroCrownZ * heroWeight + midCrownZ * midWeight + finaleCrownZ * finaleWeight
    );

    const targetCrownScale =
      (isMobile ? 0.72 : 1.02) * heroWeight +
      0.72 * midWeight +
      (isMobile ? 0.82 : 1.1) * finaleWeight;

    crownGroupRef.current.position.x = THREE.MathUtils.damp(crownGroupRef.current.position.x, _targetCrownPos.x, 5, dt);
    crownGroupRef.current.position.y = THREE.MathUtils.damp(
      crownGroupRef.current.position.y,
      _targetCrownPos.y + (reduced ? 0 : Math.sin(elapsed * 1.15) * 0.06),
      5,
      dt
    );
    crownGroupRef.current.position.z = THREE.MathUtils.damp(crownGroupRef.current.position.z, _targetCrownPos.z, 5, dt);

    const currentCrownScale = THREE.MathUtils.damp(crownGroupRef.current.scale.x, targetCrownScale, 5, dt);
    crownGroupRef.current.scale.setScalar(currentCrownScale);

    // Subtle cursor tilt + ceremonial rotation
    const crownSpin = reduced ? 0.35 : elapsed * 0.22 + p * Math.PI * 1.4;
    crownGroupRef.current.rotation.y = THREE.MathUtils.damp(
      crownGroupRef.current.rotation.y,
      crownSpin + pointerX * 0.22,
      5,
      dt
    );
    crownGroupRef.current.rotation.x = THREE.MathUtils.damp(
      crownGroupRef.current.rotation.x,
      0.24 - pointerY * 0.12,
      5,
      dt
    );
    crownGroupRef.current.rotation.z = THREE.MathUtils.damp(
      crownGroupRef.current.rotation.z,
      -pointerX * 0.06,
      5,
      dt
    );

    // 2. Shuttlecock 3D Trajectory & Realistic Flight Rotation
    const curve = isMobile ? mobileCurve : desktopCurve;
    curve.getPointAt(p, _curvePoint);
    curve.getTangentAt(Math.min(0.995, p), _curveTangent);

    _targetShuttlePos.copy(_curvePoint);
    if (!reduced) {
      _targetShuttlePos.y += Math.sin(elapsed * 1.6) * 0.05;
      _targetShuttlePos.x += pointerX * 0.14;
      _targetShuttlePos.y -= pointerY * 0.1;
    }

    shuttleGroupRef.current.position.x = THREE.MathUtils.damp(shuttleGroupRef.current.position.x, _targetShuttlePos.x, 7, dt);
    shuttleGroupRef.current.position.y = THREE.MathUtils.damp(shuttleGroupRef.current.position.y, _targetShuttlePos.y, 7, dt);
    shuttleGroupRef.current.position.z = THREE.MathUtils.damp(shuttleGroupRef.current.position.z, _targetShuttlePos.z, 7, dt);

    // Scale swell as shuttlecock approaches camera mid-emergence, tapering back into crown at finale
    const emergenceDepthBoost = Math.sin(Math.min(1, p / 0.35) * Math.PI) * 0.32;
    const midTravelScale = p > 0.06 && p < 0.9 ? 1.0 : 0.72;
    const targetShuttleScale =
      (isMobile ? 0.68 : 0.92) * (midTravelScale + emergenceDepthBoost);

    smoothScaleRef.current = THREE.MathUtils.damp(smoothScaleRef.current, targetShuttleScale, 6, dt);
    shuttleGroupRef.current.scale.setScalar(smoothScaleRef.current);

    // Orient shuttlecock smoothly: upright/canted inside crown at start/end, nose-first along curve in flight
    if (p < 0.06 || p > 0.93) {
      // Nestled crown posture
      const nestTiltX = p < 0.06 ? 0.24 : 0.18;
      const nestTiltZ = p < 0.06 ? -0.18 : 0.08;
      shuttleGroupRef.current.rotation.x = THREE.MathUtils.damp(shuttleGroupRef.current.rotation.x, nestTiltX, 5, dt);
      shuttleGroupRef.current.rotation.z = THREE.MathUtils.damp(shuttleGroupRef.current.rotation.z, nestTiltZ, 5, dt);
    } else {
      // Align cork nose along flight tangent + graceful pitch
      _negTangent.copy(_curveTangent).negate();
      _lookMatrix.lookAt(_zeroVec, _negTangent, _upVec);
      _targetQuat.setFromRotationMatrix(_lookMatrix);
      shuttleGroupRef.current.quaternion.slerp(_targetQuat, 1 - Math.exp(-5.5 * dt));
    }

    // Realistic axial aerodynamic spin on the feathered skirt
    if (!reduced) {
      const spinSpeed = p > 0.05 && p < 0.94 ? 2.4 : 0.55;
      shuttleSpinRef.current.rotation.y += dt * spinSpeed;
    }
  });

  return (
    <>
      <group ref={crownGroupRef} position={[1.55, -0.45, 0.3]}>
        <CrownModel isSoftwareGl={isSoftwareGl} />
      </group>

      <group ref={shuttleGroupRef} position={[1.55, -0.05, 0.3]} scale={0.75}>
        <group ref={shuttleSpinRef}>
          <ShuttlecockModel />
        </group>
      </group>
    </>
  );
}

/**
 * Persistent Root-Level 3D Canvas mounted across both routes.
 */
export function ChampionshipCanvas() {
  const [{ supported, isSoftwareGl }] = useState(() => detectSoftwareWebGL());
  const [contextLost, setContextLost] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    sceneController.reducedMotion = mqMotion.matches;

    const handleMotionChange = (e: MediaQueryListEvent) => {
      sceneController.reducedMotion = e.matches;
    };
    mqMotion.addEventListener('change', handleMotionChange);

    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      sceneController.isMobile = mobile;
      setIsMobile(mobile);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const handlePointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      sceneController.setPointer(nx, ny);
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      mqMotion.removeEventListener('change', handleMotionChange);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  if (!supported || contextLost) {
    return <WebGLFallback />;
  }

  const particleCount = sceneController.reducedMotion
    ? 0
    : isSoftwareGl
      ? 40
      : isMobile
        ? 55
        : 140;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none select-none bg-[#090909]"
    >
      {/* Subtle radial arena atmospheric glow behind 3D subject */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 60% 42%, rgba(212, 175, 55, 0.11) 0%, rgba(21, 21, 21, 0.25) 42%, rgba(9, 9, 9, 0.98) 78%)',
        }}
      />

      <Canvas
        dpr={isSoftwareGl ? 1 : [1, 2]}
        shadows={!isSoftwareGl}
        camera={{ position: [0, 0.35, 6.2], fov: 42, near: 0.1, far: 50 }}
        gl={{
          antialias: !isSoftwareGl,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
          const dom = gl.domElement;
          dom.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            setContextLost(true);
          });
          dom.addEventListener('webglcontextrestored', () => {
            setContextLost(false);
          });
        }}
      >
        <StudioEnvironment />

        {/* Three-point Royal Championship studio lighting */}
        <hemisphereLight args={['#e2e8f0', '#1c1917', 0.45]} />

        {/* Warm Royal Gold Key Light */}
        <directionalLight
          position={[4.5, 6.5, 5.5]}
          intensity={2.4}
          color="#FFF3D1"
          castShadow={!isSoftwareGl}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.0005}
        />

        {/* Cool Fill Light */}
        <directionalLight position={[-5, 2, 4]} intensity={0.75} color="#CBD5E1" />

        {/* Sharp Champagne Rim Light */}
        <spotLight
          position={[0, 5.5, -5]}
          angle={0.55}
          penumbra={0.8}
          intensity={3.2}
          color="#F5D77A"
        />

        {particleCount > 0 && <GoldAtmosphereParticles count={particleCount} />}

        <SceneChoreographer isSoftwareGl={isSoftwareGl} />
      </Canvas>
    </div>
  );
}
