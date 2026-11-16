import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { createCorkLeatherTexture } from './proceduralTextures';

/**
 * Multi-part procedural Badminton Shuttlecock.
 * Origin sits near the cork base so rotation & curve alignment feel natural.
 * Comprises:
 * - Lathe beveled cork dome base
 * - Royal Gold & Obsidian championship collar band
 * - Dual stitched thread binding rings
 * - 16 angled feathered quills with realistic shaft & curved vane silhouette
 */
export function ShuttlecockModel() {
  const corkTexture = useMemo(() => createCorkLeatherTexture(), []);

  const materials = useMemo(() => {
    const corkMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FAF6EB'),
      map: corkTexture,
      roughness: 0.62,
      metalness: 0.04,
    });

    const collarGoldMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#D4AF37'),
      metalness: 0.92,
      roughness: 0.2,
      clearcoat: 0.7,
      envMapIntensity: 1.5,
    });

    const collarBlackMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#121212'),
      roughness: 0.55,
      metalness: 0.15,
    });

    const featherVaneMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#FDFBF7'),
      roughness: 0.42,
      metalness: 0.02,
      sheen: 0.6,
      sheenRoughness: 0.45,
      sheenColor: new THREE.Color('#F5D77A'),
      side: THREE.DoubleSide,
    });

    const quillShaftMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#EFE7D6'),
      roughness: 0.38,
      metalness: 0.05,
    });

    const threadMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D4AF37'),
      roughness: 0.45,
      metalness: 0.65,
    });

    return {
      corkMat,
      collarGoldMat,
      collarBlackMat,
      featherVaneMat,
      quillShaftMat,
      threadMat,
    };
  }, [corkTexture]);

  const geometries = useMemo(() => {
    // 1. Cork dome + tapered skirt base
    const corkPoints: THREE.Vector2[] = [];
    for (let i = 0; i <= 12; i++) {
      const t = (i / 12) * (Math.PI / 2);
      corkPoints.push(new THREE.Vector2(Math.sin(t) * 0.24, -0.26 + (1 - Math.cos(t)) * 0.24));
    }
    corkPoints.push(new THREE.Vector2(0.24, 0.14));
    corkPoints.push(new THREE.Vector2(0.21, 0.18));
    corkPoints.push(new THREE.Vector2(0.0, 0.18));

    const corkGeo = new THREE.LatheGeometry(corkPoints, 32);
    corkGeo.computeVertexNormals();

    // 2. Collar bands wrapping upper cork edge
    const goldBandGeo = new THREE.CylinderGeometry(0.244, 0.244, 0.065, 32, 1, true);
    const blackBandGeo = new THREE.CylinderGeometry(0.246, 0.246, 0.022, 32, 1, true);

    // 3. Thread stitching rings binding the feather skirt
    const lowerThreadGeo = new THREE.TorusGeometry(0.275, 0.011, 10, 36);
    const upperThreadGeo = new THREE.TorusGeometry(0.365, 0.011, 10, 42);

    // 4. Quill shaft
    const shaftGeo = new THREE.CylinderGeometry(0.011, 0.016, 0.98, 8);

    // 5. Realistic asymmetric badminton feather vane
    const vaneShape = new THREE.Shape();
    vaneShape.moveTo(0, 0.24);
    vaneShape.quadraticCurveTo(0.11, 0.48, 0.13, 0.84);
    vaneShape.quadraticCurveTo(0.08, 1.0, -0.02, 0.99);
    vaneShape.quadraticCurveTo(-0.08, 0.94, -0.075, 0.62);
    vaneShape.quadraticCurveTo(-0.05, 0.36, 0, 0.24);
    vaneShape.closePath();

    const vaneGeo = new THREE.ExtrudeGeometry(vaneShape, {
      steps: 1,
      depth: 0.008,
      bevelEnabled: false,
    });
    vaneGeo.translate(0, 0, -0.004);

    return {
      corkGeo,
      goldBandGeo,
      blackBandGeo,
      lowerThreadGeo,
      upperThreadGeo,
      shaftGeo,
      vaneGeo,
    };
  }, []);

  useEffect(() => {
    return () => {
      corkTexture.dispose();
      Object.values(materials).forEach((m) => m.dispose());
      Object.values(geometries).forEach((g) => g.dispose());
    };
  }, [corkTexture, materials, geometries]);

  const feathers = useMemo(
    () => Array.from({ length: 16 }, (_, i) => (i / 16) * Math.PI * 2),
    []
  );

  return (
    <group name="badminton-shuttlecock">
      {/* Cork Base */}
      <mesh geometry={geometries.corkGeo} material={materials.corkMat} castShadow receiveShadow />

      {/* Royal Gold & Obsidian Championship Collar */}
      <mesh
        geometry={geometries.goldBandGeo}
        material={materials.collarGoldMat}
        position={[0, 0.11, 0]}
      />
      <mesh
        geometry={geometries.blackBandGeo}
        material={materials.collarBlackMat}
        position={[0, 0.068, 0]}
      />

      {/* Braided Gold Thread Rings */}
      <mesh
        geometry={geometries.lowerThreadGeo}
        material={materials.threadMat}
        position={[0, 0.29, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      />
      <mesh
        geometry={geometries.upperThreadGeo}
        material={materials.threadMat}
        position={[0, 0.49, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      />

      {/* 16 Angled Overlapping Feathers */}
      {feathers.map((angle, idx) => {
        const radius = 0.19;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <group
            key={`feather-${idx}`}
            position={[x, 0.13, z]}
            rotation={[0, -angle + Math.PI / 2, 0]}
          >
            {/* Flare outward by ~25 degrees and overlap slightly via subtle yaw */}
            <group rotation={[0.42, 0.2, 0]}>
              <mesh
                geometry={geometries.shaftGeo}
                material={materials.quillShaftMat}
                position={[0, 0.48, 0]}
                castShadow
              />
              <mesh
                geometry={geometries.vaneGeo}
                material={materials.featherVaneMat}
                castShadow
              />
            </group>
          </group>
        );
      })}
    </group>
  );
}
