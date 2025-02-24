import React, { useState, useEffect } from "react";
import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

function CameraControls() {
  const { camera, gl } = useThree();
  const [domElement, setDomElement] = useState(null);

  useEffect(() => {
    if (gl && gl.domElement) {
      setDomElement(gl.domElement);
    }
  }, [gl]);

  // Only render OrbitControls when the domElement is available
  if (!domElement) return null;
  return <OrbitControls args={[camera, domElement]} />;
}

export default CameraControls;
