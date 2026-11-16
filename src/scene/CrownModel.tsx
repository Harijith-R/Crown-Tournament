import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { createBrushedGoldTexture } from './proceduralTextures';

interface CrownModelProps {
  isSoftwareGl?: boolean;
}

/**
 * Multi-part procedural Royal Championship Crown.
 * Built around origin so the inner velvet basin sits near y = 0.05..0.55,
 * allowing the shuttlecock to nest inside and emerge upward on scroll.
 */
export function CrownModel({ isSoftwareGl = false }: CrownModelProps) {
  const brushedMap = useMemo(() => createBrushedGoldTexture(), []);

  const materials = useMemo(() => {
    const royalGold = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#D4AF37'),
      metalness: 0.94,
      roughness: 0.2,
      roughnessMap: brushedMap,
      bumpMap: brushedMap,
      bumpScale: 0.004,
      clearcoat: 0.65,
      clearcoatRoughness: 0.14,
      envMapIntensity: 1.5,
    });

    const champagneGold = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#F5D77A'),
      metalness: 0.96,
      roughness: 0.14,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.7,
    });

    const darkObsidianVelvet = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#13110e'),
      metalness: 0.06,
      roughness: 0.88,
      envMapIntensity: 0.35,
    });

    const amberGem = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#F5D77A'),
      emissive: new THREE.Color('#5a3d06'),
      emissiveIntensity: 0.35,
      metalness: 0.1,
      roughness: 0.05,
      ior: 2.15,
      clearcoat: 1.0,
      transmission: isSoftwareGl ? 0 : 0.45,
      thickness: 0.4,
      envMapIntensity: 2.0,
    });

    return { royalGold, champagneGold, darkObsidianVelvet, amberGem };
  }, [brushedMap, isSoftwareGl]);

  const geometries = useMemo(() => {
    // 1. Sculpted Lathe Crown Base Band (hollow ring profile with flared upper & lower mouldings)
    const bandPoints = [
      new THREE.Vector2(1.16, 0.0),
      new THREE.Vector2(1.25, 0.05),
      new THREE.Vector2(1.26, 0.12),
      new THREE.Vector2(1.2, 0.17),
      new THREE.Vector2(1.19, 0.42),
      new THREE.Vector2(1.28, 0.49),
      new THREE.Vector2(1.29, 0.56),
      new THREE.Vector2(1.21, 0.61),
      new THREE.Vector2(1.12, 0.56),
      new THREE.Vector2(1.08, 0.14),
      new THREE.Vector2(1.16, 0.0),
    ];
    const bandGeo = new THREE.LatheGeometry(bandPoints, 64);
    bandGeo.computeVertexNormals();

    // 2. Sculpted Crown Spire / Prong Shape (Extrude with smooth bevels)
    const spireShape = new THREE.Shape();
    spireShape.moveTo(-0.26, 0);
    spireShape.quadraticCurveTo(-0.18, 0.42, -0.07, 0.84);
    spireShape.quadraticCurveTo(0, 1.02, 0.07, 0.84);
    spireShape.quadraticCurveTo(0.18, 0.42, 0.26, 0);
    spireShape.closePath();

    const spireGeo = new THREE.ExtrudeGeometry(spireShape, {
      steps: 1,
      depth: 0.09,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.025,
      bevelSegments: 3,
    });
    spireGeo.center();

    // 3. Secondary intermediate fleur-de-lis arch spire
    const miniSpireShape = new THREE.Shape();
    miniSpireShape.moveTo(-0.15, 0);
    miniSpireShape.quadraticCurveTo(-0.08, 0.28, 0, 0.52);
    miniSpireShape.quadraticCurveTo(0.08, 0.28, 0.15, 0);
    miniSpireShape.closePath();

    const miniSpireGeo = new THREE.ExtrudeGeometry(miniSpireShape, {
      steps: 1,
      depth: 0.07,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
    });
    miniSpireGeo.center();

    // 4. Inner velvet cushion dish (sits low inside crown so shuttlecock cork hides nicely)
    const cushionGeo = new THREE.CylinderGeometry(1.08, 1.02, 0.14, 48);

    // 5. Lower rim torus & upper beaded pearl ring
    const lowerTrimGeo = new THREE.TorusGeometry(1.24, 0.032, 16, 72);
    const upperTrimGeo = new THREE.TorusGeometry(1.26, 0.028, 16, 72);
    const beadGeo = new THREE.SphereGeometry(0.042, 14, 14);
    const finialOrbGeo = new THREE.SphereGeometry(0.085, 18, 18);
    const gemGeo = new THREE.OctahedronGeometry(0.09, 0);
    const bezelGeo = new THREE.TorusGeometry(0.095, 0.02, 10, 24);

    return {
      bandGeo,
      spireGeo,
      miniSpireGeo,
      cushionGeo,
      lowerTrimGeo,
      upperTrimGeo,
      beadGeo,
      finialOrbGeo,
      gemGeo,
      bezelGeo,
    };
  }, []);

  useEffect(() => {
    return () => {
      brushedMap.dispose();
      Object.values(materials).forEach((m) => m.dispose());
      Object.values(geometries).forEach((g) => g.dispose());
    };
  }, [brushedMap, materials, geometries]);

  const spireAngles = useMemo(
    () => Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2),
    []
  );

  const beadAngles = useMemo(
    () => Array.from({ length: 32 }, (_, i) => (i / 32) * Math.PI * 2),
    []
  );

  return (
    <group name="royal-crown">
      {/* Main sculpted royal gold circlet band */}
      <mesh geometry={geometries.bandGeo} material={materials.royalGold} castShadow receiveShadow />

      {/* Champagne gold rim mouldings */}
      <mesh
        geometry={geometries.lowerTrimGeo}
        material={materials.champagneGold}
        position={[0, 0.09, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      />
      <mesh
        geometry={geometries.upperTrimGeo}
        material={materials.champagneGold}
        position={[0, 0.53, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      />

      {/* Inner dark velvet cushion floor inside the crown */}
      <mesh
        geometry={geometries.cushionGeo}
        material={materials.darkObsidianVelvet}
        position={[0, 0.16, 0]}
        receiveShadow
      />

      {/* 32 Beaded pearl-gold studs along the upper rim */}
      {beadAngles.map((angle, idx) => (
        <mesh
          key={`bead-${idx}`}
          geometry={geometries.beadGeo}
          material={materials.champagneGold}
          position={[Math.cos(angle) * 1.28, 0.56, Math.sin(angle) * 1.28]}
        />
      ))}

      {/* 8 Major Imperial Spires + Finials + Circlet Gemstones */}
      {spireAngles.map((angle, idx) => {
        const radius = 1.2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const rotY = -angle + Math.PI / 2;

        // Interleaved secondary spire angle
        const midAngle = angle + Math.PI / 8;
        const mx = Math.cos(midAngle) * 1.21;
        const mz = Math.sin(midAngle) * 1.21;
        const mRotY = -midAngle + Math.PI / 2;

        return (
          <group key={`spire-${idx}`}>
            {/* Primary spire angled slightly outward for regal silhouette */}
            <group position={[x, 0.94, z]} rotation={[0, rotY, 0]}>
              <mesh
                geometry={geometries.spireGeo}
                material={materials.royalGold}
                rotation={[-0.14, 0, 0]}
                castShadow
              />
              {/* Finial gold orb at tip of spire */}
              <mesh
                geometry={geometries.finialOrbGeo}
                material={materials.champagneGold}
                position={[0, 0.52, -0.07]}
              />
            </group>

            {/* Secondary intermediate fleur spire */}
            <group position={[mx, 0.76, mz]} rotation={[0, mRotY, 0]}>
              <mesh
                geometry={geometries.miniSpireGeo}
                material={materials.champagneGold}
                rotation={[-0.1, 0, 0]}
              />
            </group>

            {/* Faceted Champagne Gemstones + Gold Bezels set around the circlet */}
            <group
              position={[Math.cos(angle) * 1.24, 0.3, Math.sin(angle) * 1.24]}
              rotation={[0, rotY, 0]}
            >
              <mesh
                geometry={geometries.gemGeo}
                material={materials.amberGem}
                scale={[0.85, 1.15, 0.55]}
              />
              <mesh geometry={geometries.bezelGeo} material={materials.champagneGold} />
            </group>
          </group>
        );
      })}
    </group>
  );
}
