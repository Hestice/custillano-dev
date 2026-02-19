"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh, Group } from "three";

export function HomePlanet() {
  const meshRef = useRef<Mesh>(null);
  const ringRef = useRef<Group>(null);
  const atmosphereRef = useRef<Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.03 * 0.016;
    }
    if (ringRef.current) {
      ringRef.current.rotation.y += 0.02 * 0.016;
      ringRef.current.position.y = Math.sin(time * 0.3) * 0.1;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.position.y = Math.sin(time * 0.3) * 0.1;
    }
  });

  return (
    <group position={[0, -10, 0]}>
      {/* Main planet body */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[8, 48, 48]} />
        <meshStandardMaterial
          color="#2d8a6e"
          emissive="#1a5c4a"
          emissiveIntensity={0.3}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Atmosphere glow */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[9.2, 48, 48]} />
        <meshStandardMaterial
          color="#4adfb5"
          transparent
          opacity={0.08}
          emissive="#4adfb5"
          emissiveIntensity={0.6}
          side={2}
          depthWrite={false}
        />
      </mesh>

      {/* Landing ring */}
      <group ref={ringRef} position={[0, 8.1, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 2, 32]} />
          <meshStandardMaterial
            color="#4adfb5"
            emissive="#4adfb5"
            emissiveIntensity={0.8}
            transparent
            opacity={0.6}
            side={2}
          />
        </mesh>
        {/* Landing ring inner glow */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[0.5, 1.5, 32]} />
          <meshStandardMaterial
            color="#fff"
            emissive="#4adfb5"
            emissiveIntensity={1}
            transparent
            opacity={0.3}
            side={2}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Point light for the planet glow */}
      <pointLight
        position={[0, 0, 0]}
        color="#4adfb5"
        intensity={2}
        distance={30}
        decay={2}
      />
    </group>
  );
}
