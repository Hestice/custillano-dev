"use client";

import { useRef, useCallback, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { Collectible } from "./collectible";
import { CollectionBurst } from "./collection-burst";
import { useStory } from "../state/story-context";
import { COLLECTIBLE_RADIUS } from "@/lib/three/constants";

interface CollectibleRingProps {
  planetId: string;
  planetCenter: [number, number, number];
  planetSize: number;
  count: number;
  color: string;
  characterPosition: React.RefObject<Vector3>;
}

export function CollectibleRing({
  planetId,
  planetCenter,
  planetSize,
  count,
  color,
  characterPosition,
}: CollectibleRingProps) {
  const { isCollected, collectItem } = useStory();
  const orbPositions = useRef<Map<number, [number, number, number]>>(new Map());
  const orbitRadius = planetSize * 2.5;
  const burstIdRef = useRef(0);
  const [bursts, setBursts] = useState<Array<{ id: number; position: [number, number, number] }>>([]);

  const handlePositionUpdate = useCallback(
    (index: number) => (pos: [number, number, number]) => {
      orbPositions.current.set(index, pos);
    },
    []
  );

  useFrame(() => {
    if (!characterPosition.current) return;
    const charPos = characterPosition.current;

    for (let i = 0; i < count; i++) {
      if (isCollected(planetId, i)) continue;

      const orbPos = orbPositions.current.get(i);
      if (!orbPos) continue;

      const dx = charPos.x - orbPos[0];
      const dy = charPos.y - orbPos[1];
      const dz = charPos.z - orbPos[2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < COLLECTIBLE_RADIUS) {
        const burstId = burstIdRef.current++;
        setBursts((prev) => [...prev, { id: burstId, position: [...orbPos] as [number, number, number] }]);
        collectItem(planetId, i);
      }
    }
  });

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Collectible
          key={`${planetId}-orb-${i}`}
          planetCenter={planetCenter}
          orbitRadius={orbitRadius}
          orbitSpeed={0.3 + i * 0.08}
          orbitOffset={(i / count) * Math.PI * 2}
          color={color}
          collected={isCollected(planetId, i)}
          onPositionUpdate={handlePositionUpdate(i)}
        />
      ))}
      {bursts.map((burst) => (
        <CollectionBurst
          key={`${planetId}-burst-${burst.id}`}
          position={burst.position}
          color={color}
        />
      ))}
    </>
  );
}
