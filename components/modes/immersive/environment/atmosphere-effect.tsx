"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Fog, Color } from "three";
import type { Mesh, MeshBasicMaterial } from "three";
import { ATMOSPHERE } from "@/lib/three/constants";
import type { CharacterRef } from "../character";

// Smooth ease-in-out curve for natural transitions
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

interface AtmosphereEffectProps {
  characterRef: React.RefObject<CharacterRef | null>;
}

export function AtmosphereEffect({ characterRef }: AtmosphereEffectProps) {
  const { scene } = useThree();
  const skyRef = useRef<Mesh>(null);
  const bgColor = useRef(new Color(ATMOSPHERE.fogColor));
  const blackColor = useRef(new Color(0x000000));
  const lerpedBg = useRef(new Color(ATMOSPHERE.fogColor));

  // Initialize fog and scene background
  useEffect(() => {
    scene.fog = new Fog(ATMOSPHERE.fogColor, ATMOSPHERE.fogNear, ATMOSPHERE.fogFarStart);
    scene.background = lerpedBg.current;

    return () => {
      scene.fog = null;
      scene.background = null;
    };
  }, [scene]);

  useFrame(() => {
    const phase = characterRef.current?.launchPhase ?? "grounded";
    const progress = characterRef.current?.launchProgress ?? 0;

    if (phase === "grounded") {
      // Warm, inviting atmosphere — soft fog that doesn't obscure the station
      if (scene.fog instanceof Fog) {
        scene.fog.far = ATMOSPHERE.fogFarStart;
      }
      lerpedBg.current.copy(bgColor.current);
      scene.background = lerpedBg.current;
      if (skyRef.current) {
        (skyRef.current.material as MeshBasicMaterial).opacity = ATMOSPHERE.skyOpacityStart;
      }
    } else if (phase === "lifting") {
      const t = Math.min(progress, 1);
      const eased = smoothstep(t);

      // Fog recedes as we leave the planet
      if (scene.fog instanceof Fog) {
        scene.fog.far = ATMOSPHERE.fogFarStart + (ATMOSPHERE.fogFarEnd - ATMOSPHERE.fogFarStart) * eased;
      }

      // Background transitions from warm atmosphere to black space
      lerpedBg.current.copy(bgColor.current).lerp(blackColor.current, eased);
      scene.background = lerpedBg.current;

      // Sky dome fades out — stays visible a bit longer, then drops off
      if (skyRef.current) {
        const skyT = Math.max(0, (t - 0.2) / 0.8);
        const skyEased = smoothstep(skyT);
        (skyRef.current.material as MeshBasicMaterial).opacity =
          ATMOSPHERE.skyOpacityStart * (1 - skyEased);
      }
    } else {
      // Flying — no atmosphere
      if (scene.fog instanceof Fog) {
        scene.fog.far = ATMOSPHERE.fogFarEnd;
      }
      scene.background = null;
      if (skyRef.current) {
        (skyRef.current.material as MeshBasicMaterial).opacity = 0;
      }
    }
  });

  return (
    <mesh ref={skyRef}>
      <sphereGeometry args={[ATMOSPHERE.skyDomeRadius, 32, 32]} />
      <meshBasicMaterial
        color={ATMOSPHERE.skyColor}
        side={1}
        transparent
        opacity={ATMOSPHERE.skyOpacityStart}
        depthWrite={false}
      />
    </mesh>
  );
}
