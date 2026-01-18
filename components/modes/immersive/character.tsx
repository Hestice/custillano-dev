"use client";

import { useRef, forwardRef, useImperativeHandle } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import { Vector3 } from "three";
import { useCharacterControls } from "@/lib/three/controls";
import { CHARACTER_SPEED } from "@/lib/three/constants";
import { clampPosition } from "@/lib/three/utils";

export interface CharacterRef {
  position: Vector3;
}

export const Character = forwardRef<CharacterRef>((props, ref) => {
  const meshRef = useRef<Mesh>(null);
  const { getMovementDirection } = useCharacterControls();
  const velocity = useRef(new Vector3(0, 0, 0));
  const position = useRef(new Vector3(0, 1, 0));

  useImperativeHandle(ref, () => ({
    get position() {
      return position.current;
    },
  }));

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const direction = getMovementDirection();
    const speed = CHARACTER_SPEED * delta;

    velocity.current.x = direction.x * speed;
    velocity.current.z = direction.z * speed;

    meshRef.current.position.x += velocity.current.x;
    meshRef.current.position.z += velocity.current.z;

    clampPosition(meshRef.current.position);
    position.current.copy(meshRef.current.position);

    if (direction.x !== 0 || direction.z !== 0) {
      const angle = Math.atan2(direction.x, direction.z);
      meshRef.current.rotation.y = angle;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 1, 0]} castShadow>
      <boxGeometry args={[1, 2, 1]} />
      <meshStandardMaterial color="#4a9eff" />
    </mesh>
  );
});

Character.displayName = "Character";
