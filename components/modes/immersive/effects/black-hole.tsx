"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh, Points, MeshStandardMaterial } from "three";
import { Vector3, BufferGeometry, BufferAttribute, Color, AdditiveBlending } from "three";
import { BLACK_HOLE } from "@/lib/three/constants";
import { NARRATION } from "../state/story-data";
import { useStory } from "../state/story-context";
import type { CharacterRef } from "../character";

// --- Black Hole Core ---

function BlackHoleCore({ spawnProgress }: { spawnProgress: number }) {
  const meshRef = useRef<Mesh>(null);
  const rimRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (rimRef.current) {
      rimRef.current.rotation.z += delta * 0.5;
    }
  });

  const scale = spawnProgress;

  return (
    <group scale={[scale, scale, scale]}>
      {/* Dark core sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[BLACK_HOLE.coreRadius, 32, 32]} />
        <meshStandardMaterial
          color={BLACK_HOLE.colors.core}
          emissive={BLACK_HOLE.colors.core}
          emissiveIntensity={0.2}
          roughness={1}
        />
      </mesh>
      {/* Purple emissive rim halo */}
      <mesh ref={rimRef} scale={[1.15, 1.15, 1.15]}>
        <sphereGeometry args={[BLACK_HOLE.coreRadius, 32, 32]} />
        <meshStandardMaterial
          color={BLACK_HOLE.colors.rimEmissive}
          emissive={BLACK_HOLE.colors.rimEmissive}
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

function AccretionDisk({ spawnProgress }: { spawnProgress: number }) {
  const meshRef = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.z += delta * 0.8;
    // Pulsing emissive
    const mat = meshRef.current.material as MeshStandardMaterial;
    mat.emissiveIntensity = 0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.3;
  });

  const scale = spawnProgress;

  return (
    <mesh ref={meshRef} rotation={[Math.PI * 0.4, 0, 0]} scale={[scale, scale, scale]}>
      <ringGeometry args={[BLACK_HOLE.accretionInnerRadius, BLACK_HOLE.accretionOuterRadius, 64]} />
      <meshStandardMaterial
        color={BLACK_HOLE.colors.accretion}
        emissive={BLACK_HOLE.colors.accretionEmissive}
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

function ParticleSwirl({ spawnProgress }: { spawnProgress: number }) {
  const pointsRef = useRef<Points>(null);
  const count = BLACK_HOLE.swirlParticleCount;

  // Per-particle state: angle, radius, speed
  const particleState = useMemo(() => {
    const angles = new Float32Array(count);
    const radii = new Float32Array(count);
    const speeds = new Float32Array(count);
    const yOffsets = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      angles[i] = Math.random() * Math.PI * 2;
      radii[i] = BLACK_HOLE.accretionInnerRadius + Math.random() * (BLACK_HOLE.accretionOuterRadius - BLACK_HOLE.accretionInnerRadius);
      speeds[i] = 0.5 + Math.random() * 1.5;
      yOffsets[i] = (Math.random() - 0.5) * 2;
    }

    return { angles, radii, speeds, yOffsets };
  }, [count]);

  const geometry = useMemo(() => {
    const geom = new BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const color = new Color(BLACK_HOLE.colors.particles);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = 0;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = 0;

      const brightness = 0.5 + Math.random() * 0.5;
      colors[i3] = color.r * brightness;
      colors[i3 + 1] = color.g * brightness;
      colors[i3 + 2] = color.b * brightness;
    }

    geom.setAttribute("position", new BufferAttribute(positions, 3));
    geom.setAttribute("color", new BufferAttribute(colors, 3));
    return geom;
  }, [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current || spawnProgress < 0.1) return;

    const positions = geometry.attributes.position.array as Float32Array;
    const { angles, radii, speeds, yOffsets } = particleState;

    for (let i = 0; i < count; i++) {
      // Spiral inward
      angles[i] += delta * speeds[i];
      radii[i] -= delta * 0.5;

      // Reset to outer edge when reaching core
      if (radii[i] < BLACK_HOLE.coreRadius * 0.5) {
        radii[i] = BLACK_HOLE.accretionOuterRadius;
        angles[i] = Math.random() * Math.PI * 2;
      }

      const i3 = i * 3;
      positions[i3] = Math.cos(angles[i]) * radii[i] * spawnProgress;
      positions[i3 + 1] = yOffsets[i] * (radii[i] / BLACK_HOLE.accretionOuterRadius) * spawnProgress;
      positions[i3 + 2] = Math.sin(angles[i]) * radii[i] * spawnProgress;
    }

    geometry.attributes.position.needsUpdate = true;
  });

  if (spawnProgress < 0.1) return null;

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.7 * spawnProgress}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// --- Gravity Well (physics + trigger) ---

function GravityWell({
  characterRef,
}: {
  characterRef: React.RefObject<CharacterRef | null>;
}) {
  const { state, dispatch } = useStory();
  const triggered = useRef(false);
  const approachNarrated = useRef(false);
  const bhCenter = useMemo(() => new Vector3(...BLACK_HOLE.position), []);

  useFrame(() => {
    if (!characterRef.current || state.phase === "absorbed") return;

    const charPos = characterRef.current.position;
    const dx = charPos.x - bhCenter.x;
    const dz = charPos.z - bhCenter.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    // Approach narration
    if (!approachNarrated.current && dist < BLACK_HOLE.approachRadius) {
      approachNarrated.current = true;
      dispatch({ type: "SET_NARRATION", text: NARRATION.nearPlanet.blackHole });
    }

    // Gravitational pull
    if (dist < BLACK_HOLE.pullRadius && dist > 0.1 && !triggered.current) {
      // Quadratic falloff: stronger as you get closer
      const normalized = 1 - dist / BLACK_HOLE.pullRadius;
      const strength = BLACK_HOLE.pullStrength * normalized * normalized;

      const force = new Vector3(-dx, 0, -dz).normalize().multiplyScalar(strength);
      characterRef.current.applyForce(force);
    }

    // Event horizon trigger
    if (dist < BLACK_HOLE.eventHorizonRadius && !triggered.current) {
      triggered.current = true;
      dispatch({ type: "ENTER_BLACK_HOLE" });
      dispatch({ type: "SET_NARRATION", text: NARRATION.absorbed });
    }
  });

  return null;
}

// --- Main Black Hole Component ---

interface BlackHoleProps {
  characterRef: React.RefObject<CharacterRef | null>;
  visible: boolean;
}

export function BlackHole({ characterRef, visible }: BlackHoleProps) {
  const spawnTime = useRef(0);
  const spawnProgress = useRef(0);

  useFrame((_, delta) => {
    if (!visible) {
      spawnTime.current = 0;
      spawnProgress.current = 0;
      return;
    }

    spawnTime.current += delta;
    // Ease-out spawn animation
    const t = Math.min(spawnTime.current / BLACK_HOLE.spawnDuration, 1);
    spawnProgress.current = 1 - Math.pow(1 - t, 3);
  });

  if (!visible) return null;

  return (
    <group position={BLACK_HOLE.position}>
      <BlackHoleCore spawnProgress={spawnProgress.current} />
      <AccretionDisk spawnProgress={spawnProgress.current} />
      <ParticleSwirl spawnProgress={spawnProgress.current} />
      <GravityWell characterRef={characterRef} />
      {/* Purple point light for ambient glow */}
      <pointLight
        color={BLACK_HOLE.colors.rimEmissive}
        intensity={2 * spawnProgress.current}
        distance={60}
      />
    </group>
  );
}
