"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Vector3, type Group } from "three";
import { PLANET_PROXIMITY_THRESHOLD } from "@/lib/three/constants";
import { BillboardContent } from "./billboard-content";

interface SpaceBillboardProps {
  planetId: string;
  sectionKey: "hero" | "capabilities" | "projects" | "howIWork" | "modes" | "contact" | "tutorial";
  sectionIndex?: number;
  position: [number, number, number];
  isUnlocked: boolean;
  planetName: string;
  collectedCount: number;
  totalRequired: number;
  characterPosition: React.RefObject<Vector3>;
}

function LockedBillboardContent({
  planetName,
  collectedCount,
  totalRequired,
}: {
  planetName: string;
  collectedCount: number;
  totalRequired: number;
}) {
  const progress = totalRequired > 0 ? collectedCount / totalRequired : 0;

  return (
    <div className="w-[200px] p-4 text-white relative overflow-hidden">
      {/* Scan-line overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(100,180,255,0.15) 2px, rgba(100,180,255,0.15) 4px)",
        }}
      />

      <p className="text-[9px] uppercase tracking-widest text-blue-400/60 mb-2 font-mono">
        Encrypted
      </p>
      <h3 className="text-sm font-bold opacity-40 mb-3">{planetName}</h3>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-400/50 rounded-full transition-all duration-500"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <p className="text-[9px] text-white/30 mt-1.5 font-mono text-right">
        {collectedCount}/{totalRequired}
      </p>
    </div>
  );
}

export function SpaceBillboard({
  planetId,
  sectionKey,
  sectionIndex,
  position,
  isUnlocked,
  planetName,
  collectedCount,
  totalRequired,
  characterPosition,
}: SpaceBillboardProps) {
  const groupRef = useRef<Group>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const billboardPos = useRef(new Vector3(...position));

  useFrame(() => {
    if (!containerRef.current) return;
    const dist = characterPosition.current.distanceTo(billboardPos.current);
    containerRef.current.style.display =
      dist < PLANET_PROXIMITY_THRESHOLD ? "" : "none";
  });

  return (
    <group ref={groupRef} position={position}>
      <Html
        transform
        occlude={false}
        distanceFactor={15}
        style={{
          pointerEvents: "none",
        }}
      >
        <div
          ref={containerRef}
          className="rounded-lg border border-white/20 backdrop-blur-sm transition-all duration-700"
          style={{
            background: isUnlocked
              ? "linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,20,40,0.9) 100%)"
              : "linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(10,10,30,0.7) 100%)",
            boxShadow: isUnlocked
              ? "0 0 20px rgba(100,150,255,0.15), inset 0 0 20px rgba(100,150,255,0.05)"
              : "0 0 10px rgba(100,150,255,0.08)",
            borderColor: isUnlocked
              ? "rgba(255,255,255,0.2)"
              : "rgba(100,150,255,0.15)",
          }}
        >
          {isUnlocked ? (
            <BillboardContent
              planetId={planetId}
              sectionKey={sectionKey}
              sectionIndex={sectionIndex}
            />
          ) : (
            <LockedBillboardContent
              planetName={planetName}
              collectedCount={collectedCount}
              totalRequired={totalRequired}
            />
          )}
        </div>
      </Html>
    </group>
  );
}
