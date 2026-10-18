import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createEarthColorTexture, createEarthEmissiveTexture } from "./earthTexture";

// The rotating 3D planet mesh. Textures are generated procedurally on the
// canvas (see earthTexture.js) so no external image download is needed —
// keeps this drop-in and avoids adding new binary assets to the repo.
export default function Globe({ radius = 1.35, autoRotateSpeed = 0.09 }) {
  const groupRef = useRef(null);
  const cloudsRef = useRef(null);

  const [colorMap, emissiveMap] = useMemo(() => {
    const colorCanvas = createEarthColorTexture(1024);
    const emissiveCanvas = createEarthEmissiveTexture(1024);
    const color = new THREE.CanvasTexture(colorCanvas);
    const emissive = new THREE.CanvasTexture(emissiveCanvas);
    color.colorSpace = THREE.SRGBColorSpace;
    color.anisotropy = 4;
    emissive.anisotropy = 4;
    return [color, emissive];
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * autoRotateSpeed;
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * autoRotateSpeed * 1.6;
  });

  return (
    <group ref={groupRef}>
      {/* Solid planet */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial
          map={colorMap}
          emissiveMap={emissiveMap}
          emissive={new THREE.Color("#38bdf8")}
          emissiveIntensity={0.55}
          roughness={0.75}
          metalness={0.15}
        />
      </mesh>

      {/* Thin cloud / data-haze layer, rotates slightly faster than the core */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[radius * 1.012, 48, 48]} />
        <meshStandardMaterial
          color="#bfe9ff"
          transparent
          opacity={0.08}
          roughness={1}
          depthWrite={false}
        />
      </mesh>

      {/* Soft cyan atmosphere glow, matches the old .globe-halo CSS glow */}
      <mesh>
        <sphereGeometry args={[radius * 1.16, 48, 48]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}