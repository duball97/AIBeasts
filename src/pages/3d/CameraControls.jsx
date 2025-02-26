// CameraControls.jsx
import React, { useState, useEffect } from "react";
import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

export default function CameraControls() {
  const { camera, gl } = useThree();
  const [domElement, setDomElement] = useState(null);

  // Wait until gl.domElement is ready
  useEffect(() => {
    if (gl && gl.domElement) {
      setDomElement(gl.domElement);
    }
  }, [gl]);

  // If there's no domElement yet, don't render OrbitControls
  if (!domElement) return null;

  return <OrbitControls args={[camera, domElement]} enableKeys={false} />;
}
