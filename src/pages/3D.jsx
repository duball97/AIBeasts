import React, { useRef, Suspense, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// Import assets (adjust paths as needed)
import idleUrl from "../assets/monsterWalking.glb";
import walkingUrl from "../assets/animationMonsterWalking.glb";
import attack1Url from "../assets/animationMonsterAttack.glb";
import attack2Url from "../assets/animationMonsterAttack2.glb";

function Monster({ keys }) {
  // Load all four versions
  const idleGLTF = useGLTF(idleUrl);
  const walkingGLTF = useGLTF(walkingUrl);
  const attack1GLTF = useGLTF(attack1Url);
  const attack2GLTF = useGLTF(attack2Url);

  // We'll move all models together inside a group.
  const groupRef = useRef();

  // Set up animation mixers for models that are animated.
  const walkingMixer = useRef();
  const attack1Mixer = useRef();
  const attack2Mixer = useRef();

  // State to track current action: "idle", "walk", "attack1", or "attack2"
  const [currentAction, setCurrentAction] = useState("idle");

  // Keys state for movement (arrow keys)
  const keysRef = useRef({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  });

  // Set up key event listeners.
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
        e.preventDefault();
        keysRef.current[key] = true;
        if (currentAction !== "attack1" && currentAction !== "attack2") {
          setCurrentAction("walk");
        }
      } else if (key.toLowerCase() === "f") {
        e.preventDefault();
        setCurrentAction("attack1");
        setTimeout(() => {
          const moving = Object.values(keysRef.current).some((val) => val);
          setCurrentAction(moving ? "walk" : "idle");
        }, 500);
      } else if (key.toLowerCase() === "g") {
        e.preventDefault();
        setCurrentAction("attack2");
        setTimeout(() => {
          const moving = Object.values(keysRef.current).some((val) => val);
          setCurrentAction(moving ? "walk" : "idle");
        }, 500);
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
        e.preventDefault();
        keysRef.current[key] = false;
        // If no arrow keys are pressed and not attacking, go to idle.
        if (!Object.values(keysRef.current).some((val) => val)) {
          if (currentAction !== "attack1" && currentAction !== "attack2") {
            setCurrentAction("idle");
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp, { passive: false });
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [currentAction]);

  // Initialize animation mixers for walking and attacks
  useEffect(() => {
    if (walkingGLTF.animations.length > 0) {
      walkingMixer.current = new THREE.AnimationMixer(walkingGLTF.scene);
      const action = walkingMixer.current.clipAction(walkingGLTF.animations[0]);
      action.play();
    }
  }, [walkingGLTF]);

  useEffect(() => {
    if (attack1GLTF.animations.length > 0) {
      attack1Mixer.current = new THREE.AnimationMixer(attack1GLTF.scene);
      const action = attack1Mixer.current.clipAction(attack1GLTF.animations[0]);
      action.play();
    }
  }, [attack1GLTF]);

  useEffect(() => {
    if (attack2GLTF.animations.length > 0) {
      attack2Mixer.current = new THREE.AnimationMixer(attack2GLTF.scene);
      const action = attack2Mixer.current.clipAction(attack2GLTF.animations[0]);
      action.play();
    }
  }, [attack2GLTF]);

  // Set initial rotation when the component mounts
  useEffect(() => {
    if (groupRef.current) {
      // Set the initial rotation to face away from the user
      groupRef.current.rotation.y = Math.PI; // 180 degrees in radians
    }
  }, []);

  // Update movement and active animations on each frame
  useFrame((_, delta) => {
    // Update active mixers based on currentAction
    if (currentAction === "walk" && walkingMixer.current) {
      walkingMixer.current.update(delta);
    } else if (currentAction === "attack1" && attack1Mixer.current) {
      attack1Mixer.current.update(delta);
    } else if (currentAction === "attack2" && attack2Mixer.current) {
      attack2Mixer.current.update(delta);
    }

    // Update position and rotation if arrow keys are pressed (apply to the whole group)
    if (groupRef.current) {
      const speed = 2; // units per second
      const moveDistance = speed * delta;
      const direction = new THREE.Vector3();

      // Determine movement direction based on key presses
      if (keysRef.current.ArrowUp) direction.z -= 1; // Move forward
      if (keysRef.current.ArrowDown) direction.z += 1; // Move backward
      if (keysRef.current.ArrowLeft) direction.x -= 1; // Move left
      if (keysRef.current.ArrowRight) direction.x += 1; // Move right

      // Normalize the direction vector
      if (direction.length() > 0) {
        direction.normalize();

        // Move the character
        groupRef.current.position.addScaledVector(direction, moveDistance);

        // Calculate the target rotation based on movement direction
        const targetRotationY = Math.atan2(direction.x, direction.z);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          groupRef.current.rotation.y,
          targetRotationY,
          0.2 // Adjust this value for faster/smoother rotation
        );
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Only one model is visible at a time based on currentAction */}
      <primitive object={idleGLTF.scene} visible={currentAction === "idle"} scale={2} />
      <primitive object={walkingGLTF.scene} visible={currentAction === "walk"} scale={2} />
      <primitive object={attack1GLTF.scene} visible={currentAction === "attack1"} scale={2} />
      <primitive object={attack2GLTF.scene} visible={currentAction === "attack2"} scale={2} />
    </group>
  );
}

// Custom OrbitControls which waits for gl.domElement to be available
function CameraControls() {
  const { camera, gl } = useThree();
  const [domElement, setDomElement] = useState(null);

  useEffect(() => {
    if (gl && gl.domElement) {
      setDomElement(gl.domElement);
    }
  }, [gl]);

  if (!domElement) return null;
  return <OrbitControls args={[camera, domElement]} enableKeys={false} />;
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
      style={{
        width: "80vw",
        height: "80vh",
        border: "4px solid red",
        margin: "auto",
      }}
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