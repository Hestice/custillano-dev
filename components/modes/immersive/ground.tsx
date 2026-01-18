"use client";

import { useRef } from "react";
import { Mesh } from "three";
import { GROUND_SIZE } from "@/lib/three/constants";

export function Ground() {
  const meshRef = useRef<Mesh>(null);

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
      <meshStandardMaterial color="#2a2a2a" />
    </mesh>
  );
}
