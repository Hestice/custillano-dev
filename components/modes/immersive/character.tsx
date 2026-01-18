"use client";

import { useRef, forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Points } from "three";
import { Vector3, BufferAttribute, Color, BufferGeometry } from "three";
import { useCharacterControls } from "@/lib/three/controls";
import { CHARACTER_SPEED } from "@/lib/three/constants";
import { clampPosition } from "@/lib/three/utils";

export interface CharacterRef {
  position: Vector3;
}

function JetEffect({ isActive }: { isActive: boolean }) {
  const pointsRef = useRef<Points>(null);
  const particleCount = 50;

  const geometry = useMemo(() => {
    const geom = new BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 0.3;
      positions[i3 + 1] = (Math.random() - 0.5) * 0.3;
      positions[i3 + 2] = -Math.random() * 0.5 - 0.5;

      const color = new Color(1, 0.5 + Math.random() * 0.5, 0);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = Math.random() * 0.1 + 0.05;
    }

    geom.setAttribute("position", new BufferAttribute(positions, 3));
    geom.setAttribute("color", new BufferAttribute(colors, 3));
    geom.setAttribute("size", new BufferAttribute(sizes, 1));

    return geom;
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current || !isActive) return;

    const positions = geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3 + 2] -= delta * (2 + Math.random() * 2);

      if (positions[i3 + 2] < -1.5) {
        positions[i3] = (Math.random() - 0.5) * 0.3;
        positions[i3 + 1] = (Math.random() - 0.5) * 0.3;
        positions[i3 + 2] = -0.5;
      }
    }

    geometry.attributes.position.needsUpdate = true;
  });

  if (!isActive) return null;

  return (
    <points ref={pointsRef} geometry={geometry} position={[0, 0, -0.8]}>
      <pointsMaterial
        size={0.2}
        vertexColors
        transparent
        opacity={0.8}
        blending={2}
        depthWrite={false}
      />
    </points>
  );
}

function SmokeEffect({ isActive }: { isActive: boolean }) {
  const pointsRef = useRef<Points>(null);
  const particleCount = 30;

  const geometry = useMemo(() => {
    const geom = new BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 0.4;
      positions[i3 + 1] = (Math.random() - 0.5) * 0.4;
      positions[i3 + 2] = -Math.random() * 0.3 - 0.5;

      const gray = 0.3 + Math.random() * 0.2;
      colors[i3] = gray;
      colors[i3 + 1] = gray;
      colors[i3 + 2] = gray;

      sizes[i] = Math.random() * 0.15 + 0.1;
    }

    geom.setAttribute("position", new BufferAttribute(positions, 3));
    geom.setAttribute("color", new BufferAttribute(colors, 3));
    geom.setAttribute("size", new BufferAttribute(sizes, 1));

    return geom;
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current || !isActive) return;

    const positions = geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] += (Math.random() - 0.5) * delta * 0.5;
      positions[i3 + 1] += (Math.random() - 0.5) * delta * 0.5;
      positions[i3 + 2] -= delta * (0.5 + Math.random() * 0.5);

      if (positions[i3 + 2] < -2) {
        positions[i3] = (Math.random() - 0.5) * 0.4;
        positions[i3 + 1] = (Math.random() - 0.5) * 0.4;
        positions[i3 + 2] = -0.5;
      }
    }

    geometry.attributes.position.needsUpdate = true;
  });

  if (!isActive) return null;

  return (
    <points ref={pointsRef} geometry={geometry} position={[0, 0, -0.8]}>
      <pointsMaterial
        size={0.3}
        vertexColors
        transparent
        opacity={0.6}
        blending={2}
        depthWrite={false}
      />
    </points>
  );
}

export const Character = forwardRef<CharacterRef>((props, ref) => {
  const groupRef = useRef<Group>(null);
  const { getMovementDirection } = useCharacterControls();
  const velocity = useRef(new Vector3(0, 0, 0));
  const position = useRef(new Vector3(0, 1, 0));
  const [isMoving, setIsMoving] = useState(false);
  const lastRotation = useRef(0);

  useImperativeHandle(ref, () => ({
    get position() {
      return position.current;
    },
  }));

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const direction = getMovementDirection();
    const speed = CHARACTER_SPEED * delta;
    const moving = direction.x !== 0 || direction.z !== 0;
    
    if (moving !== isMoving) {
      setIsMoving(moving);
    }

    velocity.current.x = direction.x * speed;
    velocity.current.z = direction.z * speed;

    groupRef.current.position.x += velocity.current.x;
    groupRef.current.position.z += velocity.current.z;

    clampPosition(groupRef.current.position);
    position.current.copy(groupRef.current.position);

    if (moving) {
      const angle = Math.atan2(direction.x, direction.z);
      lastRotation.current = angle;
      groupRef.current.rotation.y = angle;
    } else {
      groupRef.current.rotation.y = lastRotation.current;
    }
  });

  return (
    <group ref={groupRef} position={[0, 1, 0]}>
      <mesh position={[0, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[0.4, 0.6, 8]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>
      <mesh position={[0, 0, -0.2]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.8, 8]} />
        <meshStandardMaterial color="#4a9eff" />
      </mesh>
      <mesh position={[0, 0, -0.75]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.3, 0.3, 8]} />
        <meshStandardMaterial color="#ffd93d" />
      </mesh>
      <mesh position={[0.4, 0, -0.6]} rotation={[0, 4, Math.PI / 2]} castShadow>
        <boxGeometry args={[0.15, 0.4, 0.05]} />
        <meshStandardMaterial color="#6c757d" />
      </mesh>
      <mesh position={[-0.4, 0, -0.6]} rotation={[0, -4, -Math.PI / 2]} castShadow>
        <boxGeometry args={[0.15, 0.4, 0.05]} />
        <meshStandardMaterial color="#6c757d" />
      </mesh>
      <JetEffect isActive={isMoving} />
      <SmokeEffect isActive={isMoving} />
    </group>
  );
});

Character.displayName = "Character";
