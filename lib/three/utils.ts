import type { Vector3 } from "three";
import { SCENE_BOUNDS } from "./constants";
import type { SectionPosition } from "./types";

export function clampPosition(position: Vector3): Vector3 {
  position.x = Math.max(SCENE_BOUNDS.minX, Math.min(SCENE_BOUNDS.maxX, position.x));
  position.z = Math.max(SCENE_BOUNDS.minZ, Math.min(SCENE_BOUNDS.maxZ, position.z));
  return position;
}

export function calculateDistance(pos1: Vector3, pos2: Vector3): number {
  const dx = pos2.x - pos1.x;
  const dz = pos2.z - pos1.z;
  return Math.sqrt(dx * dx + dz * dz);
}

export function createSectionPosition(
  x: number,
  z: number,
  y: number = 0
): SectionPosition {
  return {
    position: [x, y, z],
    rotation: [0, 0, 0],
  };
}

export function getGridPosition(
  index: number,
  total: number,
  spacing: number,
  startOffset: number = 0
): number {
  const centerIndex = (total - 1) / 2;
  return (index - centerIndex) * spacing + startOffset;
}
