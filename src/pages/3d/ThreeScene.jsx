// ThreeDScene.jsx
import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import Arena from "./Arena";
import Monster from "./Monster";
import CameraControls from "./CameraControls";
import Loading from "./Loading";

export default function ThreeDScene() {
  return (
    <Canvas
      camera={{ position: [0, 5, 10], fov: 75 }}
      style={{
        width: "80vw",
        height: "80vh",
        border: "4px solid red",
        margin: "auto",
      }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} />

      {/* Grid Helper + Axes Helper */}
      <gridHelper args={[100, 100]} />
      <axesHelper args={[5]} />

      <Suspense fallback={<Loading />}>
        <Arena />
        <Monster />
      </Suspense>

      <CameraControls />
    </Canvas>
  );
}
