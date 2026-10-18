import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import DottedGlobe from "./DottedGlobe";

// A smaller, caption-free version of the Voyager2-style dotted globe used
// wherever we just want "the globe, nothing else" as a decorative visual —
// e.g. filling the empty alternating slots in the "How It Works" timeline.
// Fully transparent background so it drops onto any dark section.
export default function MiniGlobe({ className = "", radius = 1.3, autoRotateSpeed = 0.22 }) {
  return (
    <div className={`zebra-globe-mini ${className}`} aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 4.2], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 2, 4]} intensity={1.3} color="#e0f2fe" />
        <pointLight position={[-4, -2, -3]} intensity={0.5} color="#38bdf8" />
        <Suspense fallback={null}>
          <DottedGlobe radius={radius} autoRotateSpeed={autoRotateSpeed} />
        </Suspense>
      </Canvas>
    </div>
  );
}
