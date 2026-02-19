"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import type { Mesh, Vector3 } from "three";
import type { Line2 } from "three/examples/jsm/lines/Line2.js";
import {
  MAGNET_RADIUS,
  MAGNET_STRENGTH,
  COLLECTION_RETURN_DURATION,
} from "@/lib/three/constants";

interface CollectibleProps {
  planetCenter: [number, number, number];
  orbitRadius: number;
  orbitSpeed: number;
  orbitOffset: number;
  color: string;
  collected: boolean;
  characterPosition: React.RefObject<Vector3>;
  onPositionUpdate?: (position: [number, number, number]) => void;
  onReachPlanet?: () => void;
}

export function Collectible({
  planetCenter,
  orbitRadius,
  orbitSpeed,
  orbitOffset,
  color,
  collected,
  characterPosition,
  onPositionUpdate,
  onReachPlanet,
}: CollectibleProps) {
  const meshRef = useRef<Mesh>(null);
  const tetherRef = useRef<Line2>(null);
  const [hidden, setHidden] = useState(false);

  // Magnet pull tracking — mutate in place to avoid GC
  const magnetizedPosition = useRef<[number, number, number]>([0, 0, 0]);

  // Return animation state
  const returnPhase = useRef<"idle" | "returning" | "done">("idle");
  const returnStartPos = useRef<[number, number, number]>([0, 0, 0]);
  const returnElapsed = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;

    // 1. Compute orbit position
    const angle = time * orbitSpeed + orbitOffset;
    const orbitX = planetCenter[0] + Math.cos(angle) * orbitRadius;
    const orbitY =
      planetCenter[1] + Math.sin(time * 0.8 + orbitOffset) * 1.5;
    const orbitZ = planetCenter[2] + Math.sin(angle) * orbitRadius;

    // 2. Magnet pull — blend orbit toward character if within radius
    let finalX = orbitX;
    let finalY = orbitY;
    let finalZ = orbitZ;

    if (
      characterPosition.current &&
      returnPhase.current === "idle" &&
      !collected
    ) {
      const charPos = characterPosition.current;
      const dx = charPos.x - orbitX;
      const dy = charPos.y - orbitY;
      const dz = charPos.z - orbitZ;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < MAGNET_RADIUS && dist > 0.01) {
        const normalized = 1 - dist / MAGNET_RADIUS;
        const t = normalized * normalized; // quadratic falloff
        const pull = t * MAGNET_STRENGTH;
        finalX += dx * pull;
        finalY += dy * pull;
        finalZ += dz * pull;
      }
    }

    // Mutate in place — no GC pressure
    magnetizedPosition.current[0] = finalX;
    magnetizedPosition.current[1] = finalY;
    magnetizedPosition.current[2] = finalZ;

    // 3. Return animation
    if (collected && returnPhase.current === "idle") {
      returnPhase.current = "returning";
      returnStartPos.current[0] = finalX;
      returnStartPos.current[1] = finalY;
      returnStartPos.current[2] = finalZ;
      returnElapsed.current = 0;
      if (tetherRef.current) tetherRef.current.visible = false;
    }

    if (returnPhase.current === "returning") {
      returnElapsed.current += delta;
      const progress = Math.min(
        returnElapsed.current / COLLECTION_RETURN_DURATION,
        1
      );
      // Smoothstep easing: 3t² - 2t³
      const eased = progress * progress * (3 - 2 * progress);

      const sp = returnStartPos.current;
      const rx = sp[0] + (planetCenter[0] - sp[0]) * eased;
      const ry = sp[1] + (planetCenter[1] - sp[1]) * eased;
      const rz = sp[2] + (planetCenter[2] - sp[2]) * eased;

      meshRef.current.position.set(rx, ry, rz);

      // Scale down linearly during return
      const scale = 1 - progress;
      meshRef.current.scale.set(scale, scale, scale);

      meshRef.current.rotation.y = time * 4;
      meshRef.current.rotation.x = time * 3;

      if (progress >= 1) {
        returnPhase.current = "done";
        setHidden(true);
        onReachPlanet?.();
      }
      return; // skip normal positioning during return
    }

    // 4. Normal positioning
    meshRef.current.position.set(finalX, finalY, finalZ);
    meshRef.current.rotation.y = time * 2;
    meshRef.current.rotation.x = time * 1.5;

    // 5. Pulsing glow — scale and emissive
    const pulseScale = 1 + Math.sin(time * 2.5 + orbitOffset) * 0.075;
    meshRef.current.scale.set(pulseScale, pulseScale, pulseScale);

    const material = meshRef.current.material;
    if (!Array.isArray(material) && "emissiveIntensity" in material) {
      material.emissiveIntensity = 0.6 + Math.sin(time * 3) * 0.4;
    }

    // 6. Update tether line positions
    if (tetherRef.current) {
      tetherRef.current.geometry.setPositions([
        finalX, finalY, finalZ,
        planetCenter[0], planetCenter[1], planetCenter[2],
      ]);
      tetherRef.current.visible = true;
    }

    // Report position for distance checks
    if (onPositionUpdate && !collected) {
      onPositionUpdate(magnetizedPosition.current);
    }
  });

  if (hidden) return null;

  return (
    <>
      {/* Tether line to planet */}
      <Line
        ref={tetherRef}
        points={[
          [planetCenter[0], planetCenter[1], planetCenter[2]],
          [planetCenter[0], planetCenter[1], planetCenter[2]],
        ]}
        color={color}
        lineWidth={2.5}
        transparent
        opacity={0.35}
      />

      {/* Collectible mesh */}
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
    </>
  );
}
