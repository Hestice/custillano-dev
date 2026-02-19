"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

interface PlanetProps {
  position: [number, number, number];
  size: number;
  color: string;
  emissiveColor: string;
  atmosphereColor?: string;
  rotationSpeed?: number;
}

export function Planet({
  position,
  size,
  color,
  emissiveColor,
  atmosphereColor,
  rotationSpeed = 0.05,
}: PlanetProps) {
  const meshRef = useRef<Mesh>(null);
  const atmosphereRef = useRef<Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed * 0.016;
      meshRef.current.position.y =
        position[1] + Math.sin(time * 0.5 + position[0]) * 0.3;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.position.y =
        position[1] + Math.sin(time * 0.5 + position[0]) * 0.3;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={0.3}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
      {atmosphereColor && (
        <mesh ref={atmosphereRef} position={position}>
          <sphereGeometry args={[size * 1.15, 32, 32]} />
          <meshStandardMaterial
            color={atmosphereColor}
            transparent
            opacity={0.1}
            emissive={atmosphereColor}
            emissiveIntensity={0.5}
            side={2}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}
