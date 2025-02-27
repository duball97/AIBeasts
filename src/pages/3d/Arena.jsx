// Arena.jsx
import React from "react";
import { useGLTF } from "@react-three/drei";
import arenaUrl from "../../assets/arena3.glb";

export default function Arena() {
  const { scene } = useGLTF(arenaUrl);
  // Scale arena and shift it on the z-axis:
  scene.scale.set(20, 20, 20);
  scene.position.set(0, 2.5, 0);
  return <primitive object={scene} />;
}
    