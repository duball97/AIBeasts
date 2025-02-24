import React, { useRef, Suspense, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "https://replicate.delivery/yhqm/Jz9VXkfVGgw9ZSMKPDXrL9DvDHXLGmyfhbk39cgDjWBFAbSUA/output.glb";

function Monster() {
  const { scene, animations } = useGLTF(MODEL_URL);
  const monsterRef = useRef();
  const mixerRef = useRef();

  useEffect(() => {
    if (animations.length > 0) {
      mixerRef.current = new THREE.AnimationMixer(scene);
      const action = mixerRef.current.clipAction(animations[0]);
      action.play();
    }
  }, [animations, scene]);

  useFrame((_, delta) => {
    if (mixerRef.current) mixerRef.current.update(delta);
  });

  return <primitive object={scene} ref={monsterRef} scale={2} />;
}

// Custom CameraControls which waits for gl.domElement to be available
function CameraControls() {
  const { camera, gl } = useThree();
  const [domElement, setDomElement] = useState(null);

  useEffect(() => {
    if (gl && gl.domElement) {
      setDomElement(gl.domElement);
    }
  }, [gl]);

  if (!domElement) return null;
  return <OrbitControls args={[camera, domElement]} />;
}

function Loading() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

export default function ThreeDScene() {
  return (
    <Canvas
      camera={{ position: [0, 2, 5], fov: 75 }}
      style={{ width: "100vw", height: "100vh", border: "4px solid red" }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <Suspense fallback={<Loading />}>
        <Monster />
      </Suspense>
      <CameraControls />
    </Canvas>
  );
}
