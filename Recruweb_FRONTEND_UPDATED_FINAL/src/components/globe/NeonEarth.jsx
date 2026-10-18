import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createNeonEarthColorTexture, createNeonEarthEmissiveTexture } from "./neonEarthTexture";

// Premium true-3D neon Earth. The continents are texture-mapped on a real
// sphere and the sphere itself rotates continuously, so the reference look is
// preserved while the motion remains physically three-dimensional.
export default function NeonEarth({ radius = 1.42, autoRotateSpeed = 0.12 }) {
  const spinRef = useRef(null);
  const atmosphereRef = useRef(null);
  const glowRef = useRef(null);

  const [colorMap, emissiveMap] = useMemo(() => {
    const colorCanvas = createNeonEarthColorTexture(2048);
    const emissiveCanvas = createNeonEarthEmissiveTexture(2048);
    const color = new THREE.CanvasTexture(colorCanvas);
    const emissive = new THREE.CanvasTexture(emissiveCanvas);
    color.colorSpace = THREE.SRGBColorSpace;
    emissive.colorSpace = THREE.SRGBColorSpace;
    color.anisotropy = 12;
    emissive.anisotropy = 12;
    color.wrapS = THREE.RepeatWrapping;
    emissive.wrapS = THREE.RepeatWrapping;
    color.needsUpdate = true;
    emissive.needsUpdate = true;
    return [color, emissive];
  }, []);

  const gridGeometry = useMemo(() => {
    const group = new THREE.Group();
    const r = radius * 1.008;
    const mat = new THREE.LineBasicMaterial({ color: "#5a78ff", transparent: true, opacity: 0.22, depthWrite: false });
    // Latitude rings
    for (let lat = -60; lat <= 60; lat += 20) {
      const rr = r * Math.cos((lat * Math.PI) / 180);
      const y = r * Math.sin((lat * Math.PI) / 180);
      const pts = [];
      for (let i = 0; i <= 96; i++) {
        const a = (i / 96) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * rr, y, Math.sin(a) * rr));
      }
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
    }
    // Longitude arcs
    for (let lon = 0; lon < 180; lon += 20) {
      const a = (lon * Math.PI) / 180;
      const pts = [];
      for (let i = 0; i <= 96; i++) {
        const t = -Math.PI / 2 + (i / 96) * Math.PI;
        pts.push(new THREE.Vector3(Math.cos(t) * Math.cos(a) * r, Math.sin(t) * r, Math.cos(t) * Math.sin(a) * r));
      }
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
    }
    return group;
  }, [radius]);

  useFrame((state, delta) => {
    if (spinRef.current) spinRef.current.rotation.y += delta * autoRotateSpeed;
    const t = state.clock.elapsedTime;
    if (atmosphereRef.current) atmosphereRef.current.scale.setScalar(1 + Math.sin(t * 0.9) * 0.008);
    if (glowRef.current) glowRef.current.material.opacity = 0.08 + Math.sin(t * 1.15) * 0.018;
  });

  return (
    <group rotation={[0.22, 0, -0.06]}>
      {/* Start with the Americas toward camera, matching the supplied reference. */}
      <group ref={spinRef} rotation={[0, -1.55, 0]}>
        <mesh>
          <sphereGeometry args={[radius, 64, 64]} />
          <meshStandardMaterial
            map={colorMap}
            emissiveMap={emissiveMap}
            emissive={new THREE.Color("#147dff")}
            emissiveIntensity={1.45}
            roughness={0.46}
            metalness={0.22}
          />
        </mesh>
        <primitive object={gridGeometry} />
      </group>

      {/* Electric blue atmospheric rim */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[radius * 1.035, 48, 48]} />
        <meshBasicMaterial color="#54c7ff" transparent opacity={0.12} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[radius * 1.105, 48, 48]} />
        <meshBasicMaterial color="#137dff" transparent opacity={0.10} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}
