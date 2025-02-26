// Monster.jsx
import React, { useRef, useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Import assets
import idleUrl from "../../assets/monsterWalking.glb";
import walkingUrl from "../../assets/animationMonsterWalking.glb";
import attack1Url from "../../assets/animationMonsterAttack.glb";
import attack2Url from "../../assets/animationMonsterAttack2.glb";

export default function Monster() {
  const groupRef = useRef();
  const idleOffsetRef = useRef(0);

  // Load monster models
  const idleGLTF = useGLTF(idleUrl);
  const walkingGLTF = useGLTF(walkingUrl);
  const attack1GLTF = useGLTF(attack1Url);
  const attack2GLTF = useGLTF(attack2Url);

  // Animation mixers
  const walkingMixer = useRef();
  const attack1Mixer = useRef();
  const attack2Mixer = useRef();

  // Current action: idle, walk, attack1, attack2
  const [currentAction, setCurrentAction] = useState("idle");

  // Track arrow key states
  const keysRef = useRef({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  });

  // Keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        keysRef.current[e.key] = true;
        if (currentAction !== "attack1" && currentAction !== "attack2") {
          setCurrentAction("walk");
        }
      } else if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        setCurrentAction("attack1");
        // Return to idle/walk after 500 ms
        setTimeout(() => {
          const moving = Object.values(keysRef.current).some((val) => val);
          setCurrentAction(moving ? "walk" : "idle");
        }, 500);
      } else if (e.key.toLowerCase() === "g") {
        e.preventDefault();
        setCurrentAction("attack2");
        // Return to idle/walk after 500 ms
        setTimeout(() => {
          const moving = Object.values(keysRef.current).some((val) => val);
          setCurrentAction(moving ? "walk" : "idle");
        }, 500);
      }
    };

    const handleKeyUp = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        keysRef.current[e.key] = false;
        // If no movement keys remain, revert to idle (unless attacking)
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

  // Setup walking mixer
  useEffect(() => {
    if (walkingGLTF.animations.length > 0) {
      walkingMixer.current = new THREE.AnimationMixer(walkingGLTF.scene);
      const action = walkingMixer.current.clipAction(walkingGLTF.animations[0]);
      action.play();
    }
  }, [walkingGLTF]);

  // Setup attack1 mixer
  useEffect(() => {
    if (attack1GLTF.animations.length > 0) {
      attack1Mixer.current = new THREE.AnimationMixer(attack1GLTF.scene);
      const action = attack1Mixer.current.clipAction(attack1GLTF.animations[0]);
      action.play();
    }
  }, [attack1GLTF]);

  // Setup attack2 mixer
  useEffect(() => {
    if (attack2GLTF.animations.length > 0) {
      attack2Mixer.current = new THREE.AnimationMixer(attack2GLTF.scene);
      const action = attack2Mixer.current.clipAction(attack2GLTF.animations[0]);
      action.play();
    }
  }, [attack2GLTF]);

  // Initial position/rotation
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.PI;
      groupRef.current.position.set(3, 2.2, 0);
    }
  }, []);

  // Compute bounding box but force idle to 0.6
  useEffect(() => {
    if (groupRef.current && idleGLTF.scene) {
      const box = new THREE.Box3();
      idleGLTF.scene.traverse((child) => {
        if (child.isMesh) {
          child.geometry.computeBoundingBox();
          box.expandByObject(child);
        }
      });
      let offsetY = -box.min.y;
      console.log("Raw bounding-box offset:", offsetY);

      // *** Force idle offset to 0.6
      offsetY = 0.6;
      
      idleOffsetRef.current = offsetY;
      groupRef.current.position.y = offsetY;
      console.log("Forced idle offsetY:", idleOffsetRef.current);
    }
  }, [idleGLTF.scene]);

  // Reset Y when switching back to idle
  useEffect(() => {
    if (currentAction === "idle" && groupRef.current) {
      groupRef.current.position.y = idleOffsetRef.current;
      console.log("Switched to idle, y-position reset to", idleOffsetRef.current);
    }
  }, [currentAction]);

  // Movement + animation each frame
  useFrame((_, delta) => {
    // Update active mixer
    if (currentAction === "walk" && walkingMixer.current) {
      walkingMixer.current.update(delta);
    } else if (currentAction === "attack1" && attack1Mixer.current) {
      attack1Mixer.current.update(delta);
    } else if (currentAction === "attack2" && attack2Mixer.current) {
      attack2Mixer.current.update(delta);
    }

    if (!groupRef.current) return;
    const speed = 2;
    const moveDistance = speed * delta;
    const direction = new THREE.Vector3();

    if (keysRef.current.ArrowUp) direction.z -= 1;
    if (keysRef.current.ArrowDown) direction.z += 1;
    if (keysRef.current.ArrowLeft) direction.x -= 1;
    if (keysRef.current.ArrowRight) direction.x += 1;

    if (direction.length() > 0) {
      direction.normalize();
      groupRef.current.position.addScaledVector(direction, moveDistance);
      const targetY = Math.atan2(direction.x, direction.z);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetY,
        0.2
      );
    }

    // Lock y-position to 0 during "walk"
    if (currentAction === "walk") {
      groupRef.current.position.y = 0;
    }

    if (currentAction === "attack1") {
        groupRef.current.position.y = 0;
      }

      if (currentAction === "attack2") {
        groupRef.current.position.y = 0;
      }
  });

  return (
    <group ref={groupRef} scale={0.3}>
      <primitive object={idleGLTF.scene} visible={currentAction === "idle"} scale={2} />
      <primitive object={walkingGLTF.scene} visible={currentAction === "walk"} scale={2} />
      <primitive object={attack1GLTF.scene} visible={currentAction === "attack1"} scale={2} />
      <primitive object={attack2GLTF.scene} visible={currentAction === "attack2"} scale={2} />
    </group>
  );
}
