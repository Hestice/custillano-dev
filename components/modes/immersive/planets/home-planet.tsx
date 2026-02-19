"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { CanvasTexture } from "three";
import type { Mesh, Group } from "three";
import { EARTH } from "@/lib/three/constants";

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

export function HomePlanet() {
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
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.03 * 0.016;
    }
    if (cloudRef.current) {
      // Clouds rotate slightly faster for parallax
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

  return (
    <group position={[0, -10, 0]}>
      {/* Main planet body — Earth */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[8, 48, 48]} />
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
