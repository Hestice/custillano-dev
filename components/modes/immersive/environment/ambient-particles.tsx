"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import type { Points } from "three";
import { BufferGeometry, BufferAttribute, Color } from "three";
import { AMBIENT_PARTICLE_COUNT } from "@/lib/three/constants";

export function AmbientParticles() {
  const pointsRef = useRef<Points>(null);

  const geometry = useMemo(() => {
    const geom = new BufferGeometry();
    const positions = new Float32Array(AMBIENT_PARTICLE_COUNT * 3);
    const colors = new Float32Array(AMBIENT_PARTICLE_COUNT * 3);

    for (let i = 0; i < AMBIENT_PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 400;
      positions[i3 + 1] = (Math.random() - 0.5) * 100;
      positions[i3 + 2] = (Math.random() - 0.5) * 500 - 200;

      const color = new Color();
      color.setHSL(0.6 + Math.random() * 0.1, 0.3, 0.5 + Math.random() * 0.3);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    geom.setAttribute("position", new BufferAttribute(positions, 3));
    geom.setAttribute("color", new BufferAttribute(colors, 3));
    return geom;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.elapsedTime;
    const positions = geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < AMBIENT_PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      positions[i3 + 1] += Math.sin(time * 0.2 + i * 0.1) * 0.005;
    }
    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.4}
        vertexColors
        transparent
        opacity={0.4}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}
