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

// Exclusion zones where trees must not spawn (center x, center z, radius)
const TREE_EXCLUSION_ZONES: [number, number, number][] = [
  [0, 0, 5],       // Launch pad area
  [4, -3, 3],      // Station building
  [-2.5, 0, 2],    // Gantry tower
];

function isInExclusionZone(x: number, z: number): boolean {
  for (const [cx, cz, r] of TREE_EXCLUSION_ZONES) {
    const dx = x - cx;
    const dz = z - cz;
    if (dx * dx + dz * dz < r * r) return true;
  }
  return false;
}

function Trees() {
  const trees = useMemo<TreeData[]>(() => {
    const result: TreeData[] = [];
    let attempts = 0;
    while (result.length < STATION.treeCount && attempts < 200) {
      attempts++;
      const angle = Math.random() * Math.PI * 2;
      const dist =
        STATION.treeAreaMin +
        Math.random() * (STATION.treeAreaMax - STATION.treeAreaMin);
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      if (isInExclusionZone(x, z)) continue;

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
  const groundY = -2;
  const platformTopY = -1.4;
  const platformHeight = platformTopY - groundY;

  return (
    <group>
      {/* Raised launch pedestal — rocket sits on this */}
      <mesh position={[0, groundY + platformHeight / 2, 0]}>
        <cylinderGeometry args={[0.9, 1.1, platformHeight, 16]} />
        <meshStandardMaterial color="#555555" roughness={0.8} metalness={0.2} />
      </mesh>
      {/* Pedestal top cap */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, platformTopY + 0.02, 0]}>
        <circleGeometry args={[1.0, 16]} />
        <meshStandardMaterial color="#777777" roughness={0.6} metalness={0.2} />
      </mesh>
      {/* Cross markings on pedestal top */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, platformTopY + 0.04, 0]}>
        <planeGeometry args={[0.12, 1.6]} />
        <meshStandardMaterial color={STATION.padMarkingColor} roughness={0.7} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, platformTopY + 0.04, 0]}>
        <planeGeometry args={[1.6, 0.12]} />
        <meshStandardMaterial color={STATION.padMarkingColor} roughness={0.7} />
      </mesh>

      {/* Support legs */}
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(angle) * 1.3,
            groundY + platformHeight * 0.35,
            Math.sin(angle) * 1.3,
          ]}
          rotation={[
            Math.sin(angle) * 0.15,
            0,
            -Math.cos(angle) * 0.15,
          ]}
        >
          <boxGeometry args={[0.08, platformHeight * 0.8, 0.08]} />
          <meshStandardMaterial color={STATION.buildingAccent} roughness={0.6} metalness={0.3} />
        </mesh>
      ))}
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
    <group position={[-2.5, -0.5, 0]}>
      {/* Vertical tower */}
      <mesh>
        <boxGeometry args={[0.15, 3, 0.15]} />
        <meshStandardMaterial color={STATION.buildingAccent} roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Cross braces */}
      <mesh position={[0.08, 0.3, 0.08]}>
        <boxGeometry args={[0.06, 1.2, 0.06]} />
        <meshStandardMaterial color={STATION.buildingAccent} roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[-0.08, -0.4, -0.08]}>
        <boxGeometry args={[0.06, 1.2, 0.06]} />
        <meshStandardMaterial color={STATION.buildingAccent} roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Horizontal arm — stops short of rocket with a gap */}
      <mesh position={[0.6, 0.8, 0]}>
        <boxGeometry args={[1.0, 0.1, 0.1]} />
        <meshStandardMaterial color={STATION.buildingAccent} roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Base */}
      <mesh position={[0, -1.3, 0]}>
        <boxGeometry args={[0.5, 0.3, 0.5]} />
        <meshStandardMaterial color={STATION.buildingColor} roughness={0.8} />
      </mesh>
    </group>
  );
}

function Fence() {
  const groundY = -2;
  const postHeight = 1.2;
  const railHeight1 = groundY + postHeight * 0.45;
  const railHeight2 = groundY + postHeight * 0.85;
  const radius = 7.5;
  const postCount = 16;

  const posts = useMemo(() => {
    const result: [number, number, number][] = [];
    for (let i = 0; i < postCount; i++) {
      const angle = (i / postCount) * Math.PI * 2;
      result.push([
        Math.cos(angle) * radius,
        groundY + postHeight / 2,
        Math.sin(angle) * radius,
      ]);
    }
    return result;
  }, []);

  const rails = useMemo(() => {
    const result: { position: [number, number, number]; rotation: [number, number, number]; length: number }[] = [];
    for (let i = 0; i < postCount; i++) {
      const a1 = (i / postCount) * Math.PI * 2;
      const a2 = ((i + 1) / postCount) * Math.PI * 2;
      const midAngle = (a1 + a2) / 2;
      const mx = Math.cos(midAngle) * radius;
      const mz = Math.sin(midAngle) * radius;
      const segLen = 2 * radius * Math.sin(Math.PI / postCount);

      result.push(
        { position: [mx, railHeight1, mz], rotation: [0, -midAngle + Math.PI / 2, 0], length: segLen },
        { position: [mx, railHeight2, mz], rotation: [0, -midAngle + Math.PI / 2, 0], length: segLen },
      );
    }
    return result;
  }, []);

  return (
    <group>
      {/* Posts */}
      {posts.map((pos, i) => (
        <mesh key={`post-${i}`} position={pos}>
          <boxGeometry args={[0.08, postHeight, 0.08]} />
          <meshStandardMaterial color="#8B7355" roughness={0.9} />
        </mesh>
      ))}
      {/* Rails */}
      {rails.map((rail, i) => (
        <mesh key={`rail-${i}`} position={rail.position} rotation={rail.rotation}>
          <boxGeometry args={[rail.length, 0.05, 0.05]} />
          <meshStandardMaterial color="#8B7355" roughness={0.9} />
        </mesh>
      ))}
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
      <Fence />

      {/* Warm daytime lighting */}
      <pointLight position={[5, 8, 5]} intensity={2.5} color="#fff5e6" distance={50} />
      <pointLight position={[-3, 6, 3]} intensity={1.0} color="#ffe8cc" distance={30} />
    </group>
  );
}
