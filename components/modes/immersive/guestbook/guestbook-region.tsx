"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Vector3, type Mesh } from "three";
import { GUESTBOOK, PLANET_PROXIMITY_THRESHOLD } from "@/lib/three/constants";
import { useGuestbook } from "@/lib/guestbook/use-guestbook";
import type { CharacterRef } from "../character";
import type { GuestbookEntry } from "@/lib/guestbook/types";
import { useStory } from "../state/story-context";

/** Golden angle spiral with minimum gap to prevent label overlap */
function spiralPosition(
  index: number,
  center: [number, number, number],
  spread: number
): [number, number, number] {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const angle = index * goldenAngle;
  // Minimum radius of spread/4 so first planet isn't on top of beacon,
  // then grow outward with each entry
  const radius = (spread / 4) + Math.sqrt(index) * (spread / 5);
  // Alternate Y heights so adjacent labels don't overlap
  const yOffsets = [-2, 2, -1, 3, 0];
  const y = yOffsets[index % yOffsets.length];
  return [
    center[0] + Math.cos(angle) * radius,
    center[1] + y,
    center[2] + Math.sin(angle) * radius,
  ];
}


function GuestbookLabel({
  characterRef,
}: {
  characterRef: React.RefObject<CharacterRef | null>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const billboardPos = useRef(
    new Vector3(GUESTBOOK.center[0], GUESTBOOK.center[1] + 4, GUESTBOOK.center[2])
  );

  useFrame(() => {
    if (!containerRef.current || !characterRef.current) return;
    const dist = characterRef.current.position.distanceTo(billboardPos.current);
    containerRef.current.style.display =
      dist < PLANET_PROXIMITY_THRESHOLD ? "" : "none";
  });

  return (
    <group
      position={[
        GUESTBOOK.center[0],
        GUESTBOOK.center[1] + 4,
        GUESTBOOK.center[2],
      ]}
    >
      <Html
        transform
        occlude={false}
        distanceFactor={15}
        style={{ pointerEvents: "none" }}
      >
        <div
          ref={containerRef}
          className="rounded-lg border border-white/20 backdrop-blur-sm"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,20,40,0.9) 100%)",
            boxShadow:
              "0 0 20px rgba(100,150,255,0.15), inset 0 0 20px rgba(100,150,255,0.05)",
          }}
        >
          <div className="w-[200px] p-4 text-white">
            <p className="text-[10px] uppercase tracking-widest text-amber-400/60 mb-1 font-mono">
              Open Frequency
            </p>
            <h3 className="text-sm font-bold mb-2">Visitor Cluster</h3>
            <p className="text-[11px] opacity-80 leading-relaxed">
              Travelers who&apos;ve passed through leave a signal here — each one a tiny world in orbit.
            </p>
          </div>
        </div>
      </Html>
    </group>
  );
}

function MiniPlanet({
  entry,
  position,
  characterRef,
}: {
  entry: GuestbookEntry;
  position: [number, number, number];
  characterRef: React.RefObject<CharacterRef | null>;
}) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [showLabel, setShowLabel] = useState(false);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      // Gentle bob
      meshRef.current.position.y =
        position[1] + Math.sin(t * 0.8 + position[0]) * 0.2;
      meshRef.current.rotation.y += 0.005;
    }

    // Proximity label
    if (characterRef.current) {
      const charPos = characterRef.current.position;
      const dx = charPos.x - position[0];
      const dz = charPos.z - position[2];
      const dist = Math.sqrt(dx * dx + dz * dz);
      setShowLabel(dist < GUESTBOOK.labelDistanceThreshold);
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        position={position}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <sphereGeometry args={[entry.planet_size * 4, 16, 16]} />
        <meshStandardMaterial
          color={entry.planet_color}
          emissive={entry.planet_color}
          emissiveIntensity={hovered ? 0.6 : 0.2}
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>
      {(showLabel || hovered) && (
        <group
          position={[
            position[0],
            position[1] + entry.planet_size * 4 + 0.8,
            position[2],
          ]}
        >
          <Html
            transform
            occlude={false}
            distanceFactor={15}
            style={{ pointerEvents: "none" }}
          >
            <div
              className="rounded-lg border border-white/20 backdrop-blur-sm"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,20,40,0.9) 100%)",
                boxShadow:
                  "0 0 20px rgba(100,150,255,0.15), inset 0 0 20px rgba(100,150,255,0.05)",
              }}
            >
              <div className="w-[200px] p-3 text-white">
                <p className="text-[10px] uppercase tracking-widest text-amber-400/60 mb-1 font-mono">
                  Visitor Signal
                </p>
                <h3 className="text-sm font-bold mb-1">{entry.name}</h3>
                <p className="text-[11px] opacity-80 leading-relaxed whitespace-normal">
                  {entry.message}
                </p>
                {entry.likes > 0 && (
                  <p className="text-[10px] mt-1" style={{ color: "#f472b6" }}>
                    {entry.likes} {entry.likes === 1 ? "like" : "likes"}
                  </p>
                )}
              </div>
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}

export function GuestbookRegion({
  characterRef,
}: {
  characterRef: React.RefObject<CharacterRef | null>;
}) {
  const { entries } = useGuestbook();
  const { state } = useStory();

  const showBillboards = state.phase === "exploring" || state.phase === "complete";

  // Precompute positions with golden angle spiral
  const positions = useMemo(() => {
    return entries.map((_, i) =>
      spiralPosition(i, GUESTBOOK.center, GUESTBOOK.spread)
    );
  }, [entries]);

  return (
    <group>
      {showBillboards && <GuestbookLabel characterRef={characterRef} />}
      {entries.map((entry, i) => (
        <MiniPlanet
          key={entry.id}
          entry={entry}
          position={positions[i]}
          characterRef={characterRef}
        />
      ))}
    </group>
  );
}
