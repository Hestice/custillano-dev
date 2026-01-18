"use client";

import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Ground } from "./ground";
import { Character, type CharacterRef } from "./character";
import { SectionDisplays } from "./section-display";
import { CAMERA_SETTINGS } from "@/lib/three/constants";
import { Vector3 } from "three";

function CameraController({ characterRef }: { characterRef: React.RefObject<CharacterRef | null> }) {
  const { camera } = useThree();

  useFrame(() => {
    if (!characterRef.current) return;

    const characterPos = characterRef.current.position;
    const cameraOffset = new Vector3(0, 8, 10);
    const targetPosition = new Vector3(
      characterPos.x + cameraOffset.x,
      characterPos.y + cameraOffset.y,
      characterPos.z + cameraOffset.z
    );

    camera.position.lerp(targetPosition, 0.1);
    camera.lookAt(characterPos.x, characterPos.y + 2, characterPos.z);
  });

  return null;
}

export function ExperienceScene() {
  const characterRef = useRef<CharacterRef>(null);

  return (
    <Canvas
      shadows
      gl={{ antialias: true }}
      camera={{
        fov: CAMERA_SETTINGS.fov,
        near: CAMERA_SETTINGS.near,
        far: CAMERA_SETTINGS.far,
        position: CAMERA_SETTINGS.initialPosition,
      }}
      style={{ width: "100%", height: "100%" }}
    >
      <CameraController characterRef={characterRef} />

      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />

      <Ground />
      <Character ref={characterRef} />
      <SectionDisplays />
    </Canvas>
  );
}
