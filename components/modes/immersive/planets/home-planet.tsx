"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { CanvasTexture, MathUtils } from "three";
import type { Mesh, Group } from "three";
import { EARTH, LAUNCH, STATION } from "@/lib/three/constants";
import type { CharacterRef } from "../character";
import { LaunchStation } from "../environment/launch-station";

function createEarthTexture(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  // Ocean base
  ctx.fillStyle = EARTH.ocean;
  ctx.fillRect(0, 0, 512, 256);

  // Draw stylized continent blobs
  ctx.fillStyle = EARTH.land;

  const continents = [
    // North America-ish
    { x: 120, y: 60, rx: 40, ry: 35 },
    { x: 100, y: 90, rx: 25, ry: 20 },
    // South America-ish
    { x: 150, y: 150, rx: 20, ry: 40 },
    // Europe / Africa
    { x: 270, y: 70, rx: 18, ry: 15 },
    { x: 265, y: 130, rx: 25, ry: 45 },
    // Asia-ish
    { x: 340, y: 60, rx: 55, ry: 30 },
    { x: 360, y: 100, rx: 30, ry: 20 },
    // Australia-ish
    { x: 410, y: 160, rx: 22, ry: 18 },
    // Greenland-ish
    { x: 180, y: 35, rx: 15, ry: 10 },
  ];

  for (const c of continents) {
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, c.rx, c.ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Add lighter green variation for depth
  ctx.fillStyle = "#4da66a";
  for (const c of continents) {
    ctx.beginPath();
    ctx.ellipse(
      c.x + c.rx * 0.15,
      c.y - c.ry * 0.1,
      c.rx * 0.5,
      c.ry * 0.5,
      0.3,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

const SPHERE_RADIUS = 8;
const SURFACE_Y = -2;
// Ground disc local radius — slightly less than sphere so it doesn't poke out at scale=1
const GROUND_CAP_RADIUS = 7.9;

function computePlanetY(scale: number) {
  return SURFACE_Y - SPHERE_RADIUS * scale;
}

export function HomePlanet({
  characterRef,
}: {
  characterRef: React.RefObject<CharacterRef | null>;
}) {
  const groupRef = useRef<Group>(null);
  const stationScaleRef = useRef<Group>(null);
  const groundDiscRef = useRef<Mesh>(null);
  const meshRef = useRef<Mesh>(null);
  const cloudRef = useRef<Mesh>(null);
  const ringRef = useRef<Group>(null);
  const atmosphereRef = useRef<Mesh>(null);

  const earthTexture = useMemo(() => {
    if (typeof document === "undefined") return null;
    return createEarthTexture();
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Animate planet scale based on launch phase
    if (groupRef.current && characterRef.current) {
      const { launchPhase, launchProgress } = characterRef.current;
      const grounded = LAUNCH.planet.groundedScale;
      const flying = LAUNCH.planet.flyingScale;

      let scale: number;
      let stationFade: number;

      if (launchPhase === "grounded") {
        scale = grounded;
        stationFade = 1;
      } else if (launchPhase === "lifting") {
        const scaleStart = LAUNCH.ignitionEnd;
        const scaleEnd = LAUNCH.ascentEnd;
        const t = MathUtils.clamp(
          (launchProgress - scaleStart) / (scaleEnd - scaleStart),
          0,
          1
        );
        const smooth = t * t * (3 - 2 * t);
        scale = MathUtils.lerp(grounded, flying, smooth);
        stationFade = 1 - smooth;
      } else {
        scale = flying;
        stationFade = 0;
      }

      groupRef.current.scale.setScalar(scale);
      groupRef.current.position.y = computePlanetY(scale);

      // Shrink station + ground disc out of existence during launch
      if (stationScaleRef.current) {
        const counterScale = stationFade > 0 ? (1 / scale) * stationFade : 0;
        stationScaleRef.current.scale.setScalar(counterScale);
      }
      if (groundDiscRef.current) {
        groundDiscRef.current.scale.setScalar(stationFade);
      }
    }

    if (meshRef.current) {
      meshRef.current.rotation.y += 0.03 * 0.016;
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y += 0.05 * 0.016;
    }
    if (ringRef.current) {
      ringRef.current.rotation.y += 0.02 * 0.016;
      ringRef.current.position.y = Math.sin(time * 0.3) * 0.1;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.position.y = Math.sin(time * 0.3) * 0.1;
    }
  });

  const initialScale = LAUNCH.planet.groundedScale;

  return (
    <group
      ref={groupRef}
      position={[0, computePlanetY(initialScale), 0]}
      scale={initialScale}
    >
      {/* Main planet body — Earth */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[SPHERE_RADIUS, 48, 48]} />
        {earthTexture ? (
          <meshStandardMaterial
            map={earthTexture}
            emissive={EARTH.emissive}
            emissiveIntensity={0.3}
            roughness={0.6}
            metalness={0.1}
          />
        ) : (
          <meshStandardMaterial
            color={EARTH.ocean}
            emissive={EARTH.emissive}
            emissiveIntensity={0.3}
            roughness={0.6}
            metalness={0.1}
          />
        )}
      </mesh>

      {/* Cloud layer */}
      <mesh ref={cloudRef}>
        <sphereGeometry args={[8.15, 48, 48]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.15}
          emissive="#ffffff"
          emissiveIntensity={0.1}
          depthWrite={false}
        />
      </mesh>

      {/* Atmosphere glow — sky blue */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[9.2, 48, 48]} />
        <meshStandardMaterial
          color={EARTH.atmosphere}
          transparent
          opacity={0.08}
          emissive={EARTH.atmosphere}
          emissiveIntensity={0.6}
          side={2}
          depthWrite={false}
        />
      </mesh>

      {/* Green ground cover — scales with planet, shrinks away during launch */}
      <mesh ref={groundDiscRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, SPHERE_RADIUS + 0.01, 0]}>
        <circleGeometry args={[GROUND_CAP_RADIUS, 64]} />
        <meshStandardMaterial color={STATION.groundColor} roughness={0.9} />
      </mesh>

      {/* Landing ring */}
      <group ref={ringRef} position={[0, 8.1, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 2, 32]} />
          <meshStandardMaterial
            color={EARTH.atmosphere}
            emissive={EARTH.atmosphere}
            emissiveIntensity={0.8}
            transparent
            opacity={0.6}
            side={2}
          />
        </mesh>
        {/* Landing ring inner glow */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[0.5, 1.5, 32]} />
          <meshStandardMaterial
            color="#fff"
            emissive={EARTH.atmosphere}
            emissiveIntensity={1}
            transparent
            opacity={0.3}
            side={2}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Station elements — positioned at sphere surface, counter-scaled to world size.
          Transform chain: planet(S, -2-8S) → pos(0,8,0) → scale(1/S) → offset(0,2,0) → P
          Result: world position = P (station elements keep their original world coordinates) */}
      <group position={[0, SPHERE_RADIUS, 0]}>
        <group ref={stationScaleRef} scale={1 / initialScale}>
          <group position={[0, 2, 0]}>
            <LaunchStation />
          </group>
        </group>
      </group>

      {/* Point light for the planet glow */}
      <pointLight
        position={[0, 0, 0]}
        color={EARTH.atmosphere}
        intensity={2}
        distance={30}
        decay={2}
      />
    </group>
  );
}
