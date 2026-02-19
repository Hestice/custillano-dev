"use client";

import { useRef, useMemo, useEffect, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh, Points, MeshStandardMaterial } from "three";
import { Vector3, BufferGeometry, BufferAttribute, Color, AdditiveBlending } from "three";
import { PROJECT_BLACK_HOLE } from "@/lib/three/constants";
import { useStory } from "../state/story-context";
import type { CharacterRef } from "../character";

// --- Core ---

function ProjectCore({ spawnProgress, color }: { spawnProgress: number; color: string }) {
  const rimRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (rimRef.current) {
      rimRef.current.rotation.z += delta * 0.5;
    }
  });

  const scale = spawnProgress;

  return (
    <group scale={[scale, scale, scale]}>
      <mesh>
        <sphereGeometry args={[PROJECT_BLACK_HOLE.coreRadius, 32, 32]} />
        <meshStandardMaterial
          color="#0a0010"
          emissive="#0a0010"
          emissiveIntensity={0.2}
          roughness={1}
        />
      </mesh>
      <mesh ref={rimRef} scale={[1.15, 1.15, 1.15]}>
        <sphereGeometry args={[PROJECT_BLACK_HOLE.coreRadius, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// --- Accretion Disk ---

function ProjectAccretionDisk({ spawnProgress, color }: { spawnProgress: number; color: string }) {
  const meshRef = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.z += delta * 0.8;
    const mat = meshRef.current.material as MeshStandardMaterial;
    mat.emissiveIntensity = 0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.3;
  });

  const scale = spawnProgress;

  return (
    <mesh ref={meshRef} rotation={[Math.PI * 0.4, 0, 0]} scale={[scale, scale, scale]}>
      <ringGeometry args={[PROJECT_BLACK_HOLE.accretionInnerRadius, PROJECT_BLACK_HOLE.accretionOuterRadius, 64]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.8}
        transparent
        opacity={0.6}
        side={2}
        depthWrite={false}
      />
    </mesh>
  );
}

// --- Particle Swirl ---

function ProjectParticleSwirl({ spawnProgress, color }: { spawnProgress: number; color: string }) {
  const pointsRef = useRef<Points>(null);
  const count = PROJECT_BLACK_HOLE.swirlParticleCount;

  const particleState = useMemo(() => {
    const angles = new Float32Array(count);
    const radii = new Float32Array(count);
    const speeds = new Float32Array(count);
    const yOffsets = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      angles[i] = Math.random() * Math.PI * 2;
      radii[i] = PROJECT_BLACK_HOLE.accretionInnerRadius + Math.random() * (PROJECT_BLACK_HOLE.accretionOuterRadius - PROJECT_BLACK_HOLE.accretionInnerRadius);
      speeds[i] = 0.5 + Math.random() * 1.5;
      yOffsets[i] = (Math.random() - 0.5) * 1.5;
    }

    return { angles, radii, speeds, yOffsets };
  }, [count]);

  const geometry = useMemo(() => {
    const geom = new BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const c = new Color(color);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = 0;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = 0;

      const brightness = 0.5 + Math.random() * 0.5;
      colors[i3] = c.r * brightness;
      colors[i3 + 1] = c.g * brightness;
      colors[i3 + 2] = c.b * brightness;
    }

    geom.setAttribute("position", new BufferAttribute(positions, 3));
    geom.setAttribute("color", new BufferAttribute(colors, 3));
    return geom;
  }, [count, color]);

  useFrame((_, delta) => {
    if (!pointsRef.current || spawnProgress < 0.1) return;

    const positions = geometry.attributes.position.array as Float32Array;
    const { angles, radii, speeds, yOffsets } = particleState;

    for (let i = 0; i < count; i++) {
      angles[i] += delta * speeds[i];
      radii[i] -= delta * 0.5;

      if (radii[i] < PROJECT_BLACK_HOLE.coreRadius * 0.5) {
        radii[i] = PROJECT_BLACK_HOLE.accretionOuterRadius;
        angles[i] = Math.random() * Math.PI * 2;
      }

      const i3 = i * 3;
      positions[i3] = Math.cos(angles[i]) * radii[i] * spawnProgress;
      positions[i3 + 1] = yOffsets[i] * (radii[i] / PROJECT_BLACK_HOLE.accretionOuterRadius) * spawnProgress;
      positions[i3 + 2] = Math.sin(angles[i]) * radii[i] * spawnProgress;
    }

    geometry.attributes.position.needsUpdate = true;
  });

  if (spawnProgress < 0.1) return null;

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.12}
        vertexColors
        transparent
        opacity={0.7 * spawnProgress}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// --- Proximity Trigger (press Space to open new tab) ---

const NAV_KEYS = new Set(["KeyW", "KeyA", "KeyS", "KeyD"]);
const OPEN_DELAY_MS = 1200;

function ProximityTrigger({
  characterRef,
  link,
  position,
}: {
  characterRef: React.RefObject<CharacterRef | null>;
  link: string;
  position: [number, number, number];
}) {
  const { dispatch } = useStory();
  const approachNarrated = useRef(false);
  const insideHorizon = useRef(false);
  const prompted = useRef(false);
  const cooldown = useRef(false);
  const pendingOpen = useRef(false);
  const pendingTimestamp = useRef(0);
  const heldKeys = useRef(new Set<string>());
  const center = useMemo(() => new Vector3(...position), [position]);

  // Track navigation keys held down
  const handleNavKeyDown = useCallback((e: KeyboardEvent) => {
    if (NAV_KEYS.has(e.code)) heldKeys.current.add(e.code);
  }, []);

  const handleNavKeyUp = useCallback((e: KeyboardEvent) => {
    if (NAV_KEYS.has(e.code)) heldKeys.current.delete(e.code);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.code !== "Space" || !insideHorizon.current || cooldown.current || pendingOpen.current) return;
      pendingOpen.current = true;
      pendingTimestamp.current = performance.now();
      cooldown.current = true;
      dispatch({
        type: "SET_NARRATION",
        text: "Crossing the threshold...",
      });
    },
    [dispatch],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keydown", handleNavKeyDown);
    window.addEventListener("keyup", handleNavKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keydown", handleNavKeyDown);
      window.removeEventListener("keyup", handleNavKeyUp);
    };
  }, [handleKeyDown, handleNavKeyDown, handleNavKeyUp]);

  useFrame(() => {
    // Check if we can open the tab (delay met + no nav keys held)
    if (pendingOpen.current) {
      const elapsed = performance.now() - pendingTimestamp.current;
      const delayMet = elapsed >= OPEN_DELAY_MS;
      const noNavKeys = heldKeys.current.size === 0;

      if (delayMet && noNavKeys) {
        pendingOpen.current = false;
        window.open(link, "_blank");
        setTimeout(() => {
          cooldown.current = false;
          prompted.current = false;
        }, 3000);
      }
      return;
    }

    if (!characterRef.current) return;

    const charPos = characterRef.current.position;
    const dx = charPos.x - center.x;
    const dz = charPos.z - center.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (!approachNarrated.current && dist < PROJECT_BLACK_HOLE.approachRadius) {
      approachNarrated.current = true;
      dispatch({
        type: "SET_NARRATION",
        text: "A rift nearby... it leads somewhere beyond this space.",
      });
    }

    const wasInside = insideHorizon.current;
    insideHorizon.current = dist < PROJECT_BLACK_HOLE.eventHorizonRadius;

    if (insideHorizon.current && !prompted.current && !cooldown.current) {
      prompted.current = true;
      dispatch({
        type: "SET_NARRATION",
        text: "Press Space to cross the threshold.",
      });
    }

    // Reset prompt when player leaves the horizon
    if (wasInside && !insideHorizon.current && !cooldown.current) {
      prompted.current = false;
    }
  });

  return null;
}

// --- Main ProjectBlackHole ---

interface ProjectBlackHoleProps {
  position: [number, number, number];
  link: string;
  color: string;
  visible: boolean;
  characterRef: React.RefObject<CharacterRef | null>;
}

export function ProjectBlackHole({
  position,
  link,
  color,
  visible,
  characterRef,
}: ProjectBlackHoleProps) {
  const spawnTime = useRef(0);
  const spawnProgress = useRef(0);

  useFrame((_, delta) => {
    if (!visible) {
      spawnTime.current = 0;
      spawnProgress.current = 0;
      return;
    }

    spawnTime.current += delta;
    const t = Math.min(spawnTime.current / PROJECT_BLACK_HOLE.spawnDuration, 1);
    spawnProgress.current = 1 - Math.pow(1 - t, 3);
  });

  if (!visible) return null;

  return (
    <group position={position}>
      <ProjectCore spawnProgress={spawnProgress.current} color={color} />
      <ProjectAccretionDisk spawnProgress={spawnProgress.current} color={color} />
      <ProjectParticleSwirl spawnProgress={spawnProgress.current} color={color} />
      <ProximityTrigger characterRef={characterRef} link={link} position={position} />
      <pointLight
        color={color}
        intensity={1.5 * spawnProgress.current}
        distance={30}
      />
    </group>
  );
}
