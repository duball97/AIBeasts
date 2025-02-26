import React, { useRef, useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import idleUrl from "../../assets/jordanIdle.glb";
import walkingUrl from "../../assets/jordanWalking.glb";
import attack1Url from "../../assets/animationMonsterAttack.glb";
import attack2Url from "../../assets/animationMonsterAttack2.glb";

// Tweak this angle until the walk animation matches your code’s directions
const WALK_ANGLE_OFFSET = Math.PI/16 ; // 90° as an example

export default function Monster() {
  const groupRef = useRef();
  const idleOffsetRef = useRef(0);

  const idleGLTF = useGLTF(idleUrl);
  const walkingGLTF = useGLTF(walkingUrl);
  const attack1GLTF = useGLTF(attack1Url);
  const attack2GLTF = useGLTF(attack2Url);

  const walkingMixer = useRef();
  const attack1Mixer = useRef();
  const attack2Mixer = useRef();

  const [currentAction, setCurrentAction] = useState("idle");

  const keysRef = useRef({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  });

  // Keyboard
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
      } else if (e.key.toLowerCase() === "g") {
        e.preventDefault();
        setCurrentAction("attack2");
      }
    };

    const handleKeyUp = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        keysRef.current[e.key] = false;
        // If no movement keys remain, revert to idle
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

  // Walking Mixer
  useEffect(() => {
    if (walkingGLTF.animations.length > 0) {
      walkingMixer.current = new THREE.AnimationMixer(walkingGLTF.scene);
      const action = walkingMixer.current.clipAction(walkingGLTF.animations[0]);
      action.play();

      // Apply offset so the walk faces your code’s "forward" axis
      walkingGLTF.scene.rotation.y += WALK_ANGLE_OFFSET;
    }
  }, [walkingGLTF]);

  // Attack1
  useEffect(() => {
    if (attack1GLTF.animations.length > 0) {
      attack1Mixer.current = new THREE.AnimationMixer(attack1GLTF.scene);
      const action = attack1Mixer.current.clipAction(attack1GLTF.animations[0]);
      action.timeScale = 2;
      action.setLoop(THREE.LoopOnce);
      action.clampWhenFinished = true;
      action.play();

      const handleFinish = () => {
        const moving = Object.values(keysRef.current).some((val) => val);
        setCurrentAction(moving ? "walk" : "idle");
      };
      attack1Mixer.current.addEventListener("finished", handleFinish);

      return () => {
        attack1Mixer.current?.removeEventListener("finished", handleFinish);
      };
    }
  }, [attack1GLTF]);

  // Attack2
  useEffect(() => {
    if (attack2GLTF.animations.length > 0) {
      attack2Mixer.current = new THREE.AnimationMixer(attack2GLTF.scene);
      const action = attack2Mixer.current.clipAction(attack2GLTF.animations[0]);
      action.timeScale = 2;
      action.setLoop(THREE.LoopOnce);
      action.clampWhenFinished = true;
      action.play();

      const handleFinish = () => {
        const moving = Object.values(keysRef.current).some((val) => val);
        setCurrentAction(moving ? "walk" : "idle");
      };
      attack2Mixer.current.addEventListener("finished", handleFinish);

      return () => {
        attack2Mixer.current?.removeEventListener("finished", handleFinish);
      };
    }
  }, [attack2GLTF]);

  // Initial
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(3, 2.2, 0);
    }
  }, []);

  // Force idle y=0.6
  useEffect(() => {
    if (groupRef.current && idleGLTF.scene) {
      idleOffsetRef.current = 0.6;
      groupRef.current.position.y = 0.6;
    }
  }, [idleGLTF.scene]);

  // Frame-by-frame
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Update the correct mixer
    if (currentAction === "walk" && walkingMixer.current) {
      walkingMixer.current.update(delta);
    } else if (currentAction === "attack1" && attack1Mixer.current) {
      attack1Mixer.current.update(delta);
    } else if (currentAction === "attack2" && attack2Mixer.current) {
      attack2Mixer.current.update(delta);
    }

    // Movement in X/Z
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

      // Smooth rotate toward movement direction
      const targetY = Math.atan2(direction.x, direction.z);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetY,
        0.2
      );
    }

    // Override Y per action
    if (currentAction === "walk") {
      groupRef.current.position.y = 0;
    } else if (currentAction === "attack1" || currentAction === "attack2") {
      groupRef.current.position.y = 0;
    } else {
      // Idle
      groupRef.current.position.y = idleOffsetRef.current;
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
