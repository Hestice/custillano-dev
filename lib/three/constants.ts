import type { SceneBounds } from "./types";

export const GROUND_SIZE = 100;
export const GROUND_HALF = GROUND_SIZE / 2;

export const SCENE_BOUNDS: SceneBounds = {
  minX: -GROUND_HALF,
  maxX: GROUND_HALF,
  minZ: -GROUND_HALF,
  maxZ: GROUND_HALF,
};

export const CHARACTER_SPEED = 5;
export const CHARACTER_ROTATION_SPEED = 2;

export const SECTION_SPACING = 15;
export const SECTION_HEIGHT = 2;

export const CAMERA_SETTINGS = {
  fov: 75,
  near: 0.1,
  far: 200,
  initialPosition: [0, 10, 10] as [number, number, number],
};
