"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

interface CollectibleProps {
  planetCenter: [number, number, number];
  orbitRadius: number;
  orbitSpeed: number;
  orbitOffset: number;
  color: string;
  collected: boolean;
  onPositionUpdate?: (position: [number, number, number]) => void;
}

export function Collectible({
  planetCenter,
  orbitRadius,
  orbitSpeed,
  orbitOffset,
  color,
  collected,
  onPositionUpdate,
}: CollectibleProps) {
  const meshRef = useRef<Mesh>(null);
  const scaleRef = useRef(collected ? 0 : 1);
  const [hidden, setHidden] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;

    const angle = time * orbitSpeed + orbitOffset;
    const x = planetCenter[0] + Math.cos(angle) * orbitRadius;
    const y =
      planetCenter[1] + Math.sin(time * 0.8 + orbitOffset) * 1.5;
    const z = planetCenter[2] + Math.sin(angle) * orbitRadius;

    meshRef.current.position.set(x, y, z);
    meshRef.current.rotation.y = time * 2;
    meshRef.current.rotation.x = time * 1.5;

    if (collected && scaleRef.current > 0) {
      scaleRef.current = Math.max(0, scaleRef.current - 0.08);
      if (scaleRef.current <= 0) {
        setHidden(true);
      }
    }
    const s = scaleRef.current;
    meshRef.current.scale.set(s, s, s);

    if (onPositionUpdate && !collected) {
      onPositionUpdate([x, y, z]);
    }
  });

  if (hidden) return null;

  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[0.4, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.8}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}
