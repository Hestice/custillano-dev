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

export interface PlanetData {
  id: string;
  name: string;
  sectionKey: string;
  position: [number, number, number];
  size: number;
  color: string;
  emissiveColor: string;
  atmosphereColor: string;
  rotationSpeed: number;
  collectibleCount: number;
  subPlanets?: SubPlanetData[];
}

export interface SubPlanetData {
  id: string;
  name: string;
  sectionIndex: number;
  offset: [number, number, number];
  size: number;
  color: string;
  emissiveColor: string;
  collectibleCount: number;
}

export interface PlanetState {
  visited: boolean;
  unlocked: boolean;
  collectedItems: Set<number>;
  totalItems: number;
}
