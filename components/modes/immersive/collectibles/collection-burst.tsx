"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { Points } from "three";
import { BufferGeometry, BufferAttribute, Color } from "three";

interface CollectionBurstProps {
  position: [number, number, number];
  color: string;
}

export function CollectionBurst({ position, color }: CollectionBurstProps) {
  const pointsRef = useRef<Points>(null);
  const [alive, setAlive] = useState(true);
  const startTime = useRef<number | null>(null);
  const particleCount = 30;

  const { geometry, velocities } = useMemo(() => {
    const geom = new BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const vels: Float32Array = new Float32Array(particleCount * 3);

    const baseColor = new Color(color);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = 0;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = 0;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 2 + Math.random() * 4;
      vels[i3] = Math.sin(phi) * Math.cos(theta) * speed;
      vels[i3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
      vels[i3 + 2] = Math.cos(phi) * speed;

      colors[i3] = baseColor.r;
      colors[i3 + 1] = baseColor.g;
      colors[i3 + 2] = baseColor.b;
    }

    geom.setAttribute("position", new BufferAttribute(positions, 3));
    geom.setAttribute("color", new BufferAttribute(colors, 3));
    return { geometry: geom, velocities: vels };
  }, [color]);

  useFrame((state, delta) => {
    if (!alive || !pointsRef.current) return;

    if (startTime.current === null) {
      startTime.current = state.clock.elapsedTime;
    }

    const elapsed = state.clock.elapsedTime - startTime.current;
    if (elapsed > 0.8) {
      setAlive(false);
      return;
    }

    const positions = geometry.attributes.position.array as Float32Array;
    const fade = 1 - elapsed / 0.8;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] += velocities[i3] * delta;
      positions[i3 + 1] += velocities[i3 + 1] * delta;
      positions[i3 + 2] += velocities[i3 + 2] * delta;
    }

    geometry.attributes.position.needsUpdate = true;

    if (pointsRef.current.material && "opacity" in pointsRef.current.material) {
      (pointsRef.current.material as { opacity: number }).opacity = fade;
    }
  });

  if (!alive) return null;

  return (
    <points ref={pointsRef} position={position} geometry={geometry}>
      <pointsMaterial
        size={0.3}
        vertexColors
        transparent
        opacity={1}
        blending={2}
        depthWrite={false}
      />
    </points>
  );
}
