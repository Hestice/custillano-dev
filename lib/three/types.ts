import type { Vector3 } from "three";

export interface CharacterState {
  position: Vector3;
  rotation: number;
  velocity: Vector3;
}

export interface SceneBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface SectionPosition {
  position: [number, number, number];
  rotation?: [number, number, number];
}

export interface SectionData {
  id: string;
  title: string;
  description?: string;
  position: SectionPosition;
}

export type KeyboardState = {
  [key: string]: boolean;
};
