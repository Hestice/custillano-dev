"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import type { Mesh, MeshStandardMaterial } from "three";
import { Vector3 } from "three";
import { GUESTBOOK } from "@/lib/three/constants";
import { useGuestbook } from "@/lib/guestbook/use-guestbook";
import type { CharacterRef } from "../character";
import type { GuestbookEntry } from "@/lib/guestbook/types";

/** Golden angle spiral for organic distribution */
function spiralPosition(
  index: number,
  center: [number, number, number],
  spread: number
): [number, number, number] {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const angle = index * goldenAngle;
  const radius = Math.sqrt(index + 1) * (spread / 8);
  return [
    center[0] + Math.cos(angle) * radius,
    center[1] + (Math.random() - 0.5) * 4,
    center[2] + Math.sin(angle) * radius,
  ];
}

function GuestbookBeacon() {
  const meshRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y =
        GUESTBOOK.center[1] + Math.sin(t * 0.6) * 0.5;
    }
    if (glowRef.current) {
      glowRef.current.position.y =
        GUESTBOOK.center[1] + Math.sin(t * 0.6) * 0.5;
      const pulse = 0.3 + Math.sin(t * 2) * 0.15;
      (glowRef.current.material as MeshStandardMaterial).opacity = pulse;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} position={GUESTBOOK.center}>
        <sphereGeometry args={[GUESTBOOK.beaconSize, 32, 32]} />
        <meshStandardMaterial
          color={GUESTBOOK.beaconColor}
          emissive={GUESTBOOK.beaconEmissive}
          emissiveIntensity={0.6}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>
      {/* Pulsing glow */}
      <mesh ref={glowRef} position={GUESTBOOK.center}>
        <sphereGeometry args={[GUESTBOOK.beaconSize * 1.4, 16, 16]} />
        <meshStandardMaterial
          color={GUESTBOOK.beaconColor}
          transparent
          opacity={0.3}
          emissive={GUESTBOOK.beaconEmissive}
          emissiveIntensity={0.8}
          side={2}
          depthWrite={false}
        />
      </mesh>
      {/* Label */}
      <Html
        position={[
          GUESTBOOK.center[0],
          GUESTBOOK.center[1] + GUESTBOOK.beaconSize + 2,
          GUESTBOOK.center[2],
        ]}
        center
        distanceFactor={80}
        style={{ pointerEvents: "none" }}
      >
        <div className="text-white text-sm font-semibold whitespace-nowrap bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
          Guestbook
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
        <sphereGeometry args={[entry.planet_size, 16, 16]} />
        <meshStandardMaterial
          color={entry.planet_color}
          emissive={entry.planet_color}
          emissiveIntensity={hovered ? 0.6 : 0.2}
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>
      {(showLabel || hovered) && (
        <Html
          position={[
            position[0],
            position[1] + entry.planet_size + 0.8,
            position[2],
          ]}
          center
          distanceFactor={40}
          style={{ pointerEvents: "none" }}
        >
          <div className="text-white text-xs whitespace-nowrap bg-black/60 px-2 py-1 rounded backdrop-blur-sm max-w-[200px]">
            <span className="font-medium">{entry.name}</span>
            {hovered && (
              <p className="text-white/70 text-[10px] mt-0.5 whitespace-normal">
                {entry.message}
              </p>
            )}
          </div>
        </Html>
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

  // Precompute positions with golden angle spiral
  const positions = useMemo(() => {
    return entries.map((_, i) =>
      spiralPosition(i, GUESTBOOK.center, GUESTBOOK.spread)
    );
  }, [entries]);

  return (
    <group>
      <GuestbookBeacon />
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
