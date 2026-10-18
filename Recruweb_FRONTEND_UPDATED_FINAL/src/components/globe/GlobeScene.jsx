import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import NeonEarth from "./NeonEarth";
import "./globe-scene.css";

export default function GlobeScene() {
  const wrapRef = useRef(null);
  const [inView, setInView] = useState(false);
  const isMobile = typeof window !== "undefined" && window.matchMedia?.("(max-width: 768px)").matches;

  // Only run the WebGL render loop while the globe is actually on screen.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !window.IntersectionObserver) {
      setInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "100px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="stats-globe stats-globe-webgl3d" aria-label="Rotating 3D neon Earth — HR Data Hub">
      <div className="approved-globe-aura" aria-hidden="true" />
      <div className="globe-star-field" aria-hidden="true" />
      <div className="webgl3d-canvas-wrap">
        <Canvas
          dpr={[1, isMobile ? 1 : 1.5]}
          frameloop={inView ? "always" : "never"}
          camera={{ position: [0, 0, 5.15], fov: 38 }}
          gl={{ antialias: !isMobile, alpha: true, powerPreference: "high-performance" }}
          style={{ width: "100%", height: "100%" }}
        >
          <ambientLight intensity={0.26} />
          <directionalLight position={[-4, 3.5, 5]} intensity={1.7} color="#d9eaff" />
          <pointLight position={[4, 1, 4]} intensity={0.95} color="#ff4be7" />
          <pointLight position={[-3, -2, 2]} intensity={0.8} color="#38bdf8" />
          <Suspense fallback={null}><NeonEarth /></Suspense>
        </Canvas>
      </div>
      <div className="approved-orbit approved-orbit-a" aria-hidden="true" />
      <div className="approved-orbit approved-orbit-b" aria-hidden="true" />
      <span className="globe-caption"><b>HR DATA HUB</b><br />REAL-TIME INTELLIGENCE</span>
    </div>
  );
}
