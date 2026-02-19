"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import type { Group } from "three";
import { BillboardContent } from "./billboard-content";

interface SpaceBillboardProps {
  planetId: string;
  sectionKey: "hero" | "capabilities" | "projects" | "labNotes" | "modes" | "contact";
  sectionIndex?: number;
  position: [number, number, number];
  isUnlocked: boolean;
}

export function SpaceBillboard({
  planetId,
  sectionKey,
  sectionIndex,
  position,
  isUnlocked,
}: SpaceBillboardProps) {
  const groupRef = useRef<Group>(null);
  const scaleProgress = useRef(isUnlocked ? 1 : 0);

  useFrame(() => {
    if (!groupRef.current) return;

    const target = isUnlocked ? 1 : 0;
    scaleProgress.current += (target - scaleProgress.current) * 0.05;

    const s = scaleProgress.current;
    groupRef.current.scale.set(s, s, s);
    groupRef.current.visible = s > 0.01;
  });

  return (
    <group ref={groupRef} position={position}>
      <Html
        transform
        occlude={false}
        distanceFactor={15}
        style={{
          transition: "opacity 0.3s",
          opacity: isUnlocked ? 1 : 0,
          pointerEvents: "none",
        }}
      >
        <div
          className="rounded-lg border border-white/20 backdrop-blur-sm"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,20,40,0.9) 100%)",
            boxShadow: "0 0 20px rgba(100,150,255,0.15), inset 0 0 20px rgba(100,150,255,0.05)",
          }}
        >
          <BillboardContent
            planetId={planetId}
            sectionKey={sectionKey}
            sectionIndex={sectionIndex}
          />
        </div>
      </Html>
    </group>
  );
}
