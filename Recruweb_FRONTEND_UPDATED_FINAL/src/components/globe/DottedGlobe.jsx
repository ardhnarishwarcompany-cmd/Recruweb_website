import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { generateLandDots } from "./landDots";
import { createEarthColorTexture, createEarthEmissiveTexture } from "./earthTexture";

function useGlowSprite() {
  return useMemo(() => {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const x = c.getContext("2d");
    const g = x.createRadialGradient(64,64,0,64,64,64);
    g.addColorStop(0,"rgba(255,255,255,1)");
    g.addColorStop(.10,"rgba(255,190,255,.98)");
    g.addColorStop(.34,"rgba(255,38,213,.9)");
    g.addColorStop(.62,"rgba(93,92,255,.38)");
    g.addColorStop(1,"rgba(0,0,0,0)");
    x.fillStyle=g; x.fillRect(0,0,128,128);
    return new THREE.CanvasTexture(c);
  }, []);
}

function Orbit({ tilt=0.55, radius=1.72, color="#dca6ff", speed=.12, phase=0 }) {
  const ref = useRef();
  const geo = useMemo(() => {
    const pts=[];
    for(let i=0;i<=240;i++) { const a=(i/240)*Math.PI*2; pts.push(new THREE.Vector3(Math.cos(a)*radius, Math.sin(a)*radius*.20, 0)); }
    return new THREE.BufferGeometry().setFromPoints(pts);
  },[radius]);
  useFrame(({clock})=>{ if(ref.current) ref.current.rotation.z = phase + clock.getElapsedTime()*speed; });
  return <line ref={ref} rotation={[tilt,.15,0]}><primitive object={geo} attach="geometry"/><lineBasicMaterial color={color} transparent opacity={.68}/></line>;
}

function CityParticles({ count=150 }) {
  const ref=useRef(); const sprite=useGlowSprite();
  const data=useMemo(()=>{
    const p=[]; const c=[];
    for(let i=0;i<count;i++){
      const a=Math.random()*Math.PI*2, r=1.35+Math.random()*1.05, y=(Math.random()-.5)*3.2;
      p.push(Math.cos(a)*r, y, Math.sin(a)*r*.58);
      const pink=Math.random()>.42; c.push(pink?1:.25,pink?.18:.85,pink?0.9:1);
    }
    return {p:new Float32Array(p),c:new Float32Array(c)};
  },[count]);
  useFrame(({clock})=>{ if(ref.current){ ref.current.rotation.y=clock.getElapsedTime()*.025; ref.current.rotation.z=Math.sin(clock.getElapsedTime()*.18)*.04; } });
  return <points ref={ref}><bufferGeometry><bufferAttribute attach="attributes-position" array={data.p} count={count} itemSize={3}/><bufferAttribute attach="attributes-color" array={data.c} count={count} itemSize={3}/></bufferGeometry><pointsMaterial map={sprite} size={.045} vertexColors transparent opacity={.9} depthWrite={false} blending={THREE.AdditiveBlending}/></points>;
}

export default function DottedGlobe({ radius=1.34, autoRotateSpeed=.10 }) {
  const group=useRef(), dots=useRef(); const sprite=useGlowSprite();
  const {positions,colors}=useMemo(()=>generateLandDots(radius*1.012,{widthSegments:170,heightSegments:86}),[radius]);
  const pink=useMemo(()=>{
    const out=new Float32Array(colors.length);
    for(let i=0;i<colors.length;i+=3){ const t=(i/3%11)/10; out[i]=.72+.28*t; out[i+1]=.05+.18*t; out[i+2]=.76+.24*(1-t); }
    return out;
  },[colors]);
  const maps=useMemo(()=>{
    const map=new THREE.CanvasTexture(createEarthColorTexture(512)); map.colorSpace=THREE.SRGBColorSpace;
    const em=new THREE.CanvasTexture(createEarthEmissiveTexture(512));
    return {map,em};
  },[]);
  useFrame(({clock},delta)=>{
    if(group.current){ group.current.rotation.y += delta*autoRotateSpeed; group.current.rotation.x=.035+Math.sin(clock.getElapsedTime()*.23)*.018; }
    if(dots.current) dots.current.material.size=.032+Math.sin(clock.getElapsedTime()*2)*.004;
  });
  return <>
    <CityParticles />
    <group ref={group} rotation={[.08,-.82,0]}>
      <mesh><sphereGeometry args={[radius,72,72]}/><meshStandardMaterial map={maps.map} emissiveMap={maps.em} emissive="#7b1d86" emissiveIntensity={1.8} roughness={.45} metalness={.15}/></mesh>
      <mesh><sphereGeometry args={[radius*1.006,48,32]}/><meshBasicMaterial color="#8c5bff" wireframe transparent opacity={.12}/></mesh>
      <points ref={dots}><bufferGeometry><bufferAttribute attach="attributes-position" array={positions} count={positions.length/3} itemSize={3}/><bufferAttribute attach="attributes-color" array={pink} count={pink.length/3} itemSize={3}/></bufferGeometry><pointsMaterial map={sprite} size={.038} vertexColors transparent opacity={1} alphaTest={.02} depthWrite={false} blending={THREE.AdditiveBlending}/></points>
      <mesh><sphereGeometry args={[radius*1.045,64,64]}/><meshBasicMaterial color="#43dfff" transparent opacity={.085} side={THREE.BackSide} blending={THREE.AdditiveBlending}/></mesh>
      <mesh><sphereGeometry args={[radius*1.095,64,64]}/><meshBasicMaterial color="#ee43ff" transparent opacity={.055} side={THREE.BackSide} blending={THREE.AdditiveBlending}/></mesh>
    </group>
    <Orbit tilt={.55} radius={1.78} color="#f2b4ff" speed={.11}/>
    <Orbit tilt={-.55} radius={1.86} color="#66eaff" speed={-.075} phase={1.2}/>
  </>;
}
