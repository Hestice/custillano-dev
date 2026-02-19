"use client";

import { useMemo } from "react";
import { STATION } from "@/lib/three/constants";

interface TreeData {
  position: [number, number, number];
  scale: number;
  canopyColor: string;
  trunkHeight: number;
  canopyRadius: number;
  canopyHeight: number;
}

function Trees() {
  const trees = useMemo<TreeData[]>(() => {
    const result: TreeData[] = [];
    for (let i = 0; i < STATION.treeCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist =
        STATION.treeAreaMin +
        Math.random() * (STATION.treeAreaMax - STATION.treeAreaMin);
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const scale = 0.7 + Math.random() * 0.6;
      const trunkHeight = (1.5 + Math.random() * 1.0) * scale;
      const canopyRadius = (0.8 + Math.random() * 0.4) * scale;
      const canopyHeight = (2.0 + Math.random() * 1.0) * scale;
      const canopyColor =
        STATION.treeCanopyColors[
          Math.floor(Math.random() * STATION.treeCanopyColors.length)
        ];

      result.push({
        position: [x, -2 + trunkHeight / 2, z],
        scale,
        canopyColor,
        trunkHeight,
        canopyRadius,
        canopyHeight,
      });
    }
    return result;
  }, []);

  return (
    <>
      {trees.map((tree, i) => (
        <group key={i} position={tree.position}>
          {/* Trunk */}
          <mesh>
            <cylinderGeometry args={[0.12 * tree.scale, 0.15 * tree.scale, tree.trunkHeight, 6]} />
            <meshStandardMaterial color={STATION.treeTrunkColor} roughness={0.9} />
          </mesh>
          {/* Canopy */}
          <mesh position={[0, tree.trunkHeight / 2 + tree.canopyHeight / 2 - 0.2, 0]}>
            <coneGeometry args={[tree.canopyRadius, tree.canopyHeight, 7]} />
            <meshStandardMaterial color={tree.canopyColor} roughness={0.8} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function LaunchPad() {
  return (
    <group>
      {/* Concrete pad */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.98, 0]}>
        <circleGeometry args={[STATION.padRadius, 32]} />
        <meshStandardMaterial color={STATION.padColor} roughness={0.95} />
      </mesh>
      {/* Yellow safety ring marking */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.97, 0]}>
        <ringGeometry args={[2.5, 3.0, 32]} />
        <meshStandardMaterial color={STATION.padMarkingColor} roughness={0.7} />
      </mesh>
      {/* Cross markings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.96, 0]}>
        <planeGeometry args={[0.2, 4]} />
        <meshStandardMaterial color={STATION.padMarkingColor} roughness={0.7} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.96, 0]}>
        <planeGeometry args={[4, 0.2]} />
        <meshStandardMaterial color={STATION.padMarkingColor} roughness={0.7} />
      </mesh>
    </group>
  );
}

function StationBuilding() {
  return (
    <group position={[4, -1, -3]}>
      {/* Main structure */}
      <mesh>
        <boxGeometry args={[3, 1.8, 2]} />
        <meshStandardMaterial color={STATION.buildingColor} roughness={0.8} />
      </mesh>
      {/* Roof accent */}
      <mesh position={[0, 1.0, 0]}>
        <boxGeometry args={[3.2, 0.2, 2.2]} />
        <meshStandardMaterial color={STATION.buildingAccent} roughness={0.7} />
      </mesh>
      {/* Windows */}
      <mesh position={[0, 0.2, 1.01]}>
        <boxGeometry args={[0.6, 0.5, 0.05]} />
        <meshStandardMaterial color="#8ec8f0" emissive="#4a9eff" emissiveIntensity={0.3} roughness={0.3} />
      </mesh>
      <mesh position={[0.9, 0.2, 1.01]}>
        <boxGeometry args={[0.5, 0.5, 0.05]} />
        <meshStandardMaterial color="#8ec8f0" emissive="#4a9eff" emissiveIntensity={0.3} roughness={0.3} />
      </mesh>
      <mesh position={[-0.9, 0.2, 1.01]}>
        <boxGeometry args={[0.5, 0.5, 0.05]} />
        <meshStandardMaterial color="#8ec8f0" emissive="#4a9eff" emissiveIntensity={0.3} roughness={0.3} />
      </mesh>
    </group>
  );
}

function GantryTower() {
  return (
    <group position={[-2, 1, 0]}>
      {/* Vertical tower */}
      <mesh>
        <boxGeometry args={[0.4, 6, 0.4]} />
        <meshStandardMaterial color={STATION.buildingAccent} roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Horizontal arm extending toward rocket */}
      <mesh position={[1, 2, 0]}>
        <boxGeometry args={[2, 0.2, 0.2]} />
        <meshStandardMaterial color={STATION.buildingAccent} roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Base */}
      <mesh position={[0, -2.8, 0]}>
        <boxGeometry args={[0.8, 0.4, 0.8]} />
        <meshStandardMaterial color={STATION.buildingColor} roughness={0.8} />
      </mesh>
    </group>
  );
}

export function LaunchStation() {
  return (
    <group>
      <LaunchPad />
      <Trees />
      <StationBuilding />
      <GantryTower />

      {/* Warm daytime lighting */}
      <pointLight position={[5, 8, 5]} intensity={1.5} color="#fff5e6" distance={40} />
    </group>
  );
}
