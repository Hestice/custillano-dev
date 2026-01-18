import type { SceneBounds } from "./types";

export const GROUND_SIZE = 100;
export const GROUND_HALF = GROUND_SIZE / 2;

export const SCENE_BOUNDS: SceneBounds = {
  minX: -GROUND_HALF,
  maxX: GROUND_HALF,
  minZ: -GROUND_HALF,
  maxZ: GROUND_HALF,
};

export const CHARACTER_SPEED = 20;
export const CHARACTER_ACCELERATION = 50; // How fast the rocket accelerates
export const CHARACTER_DECELERATION = 30; // How fast the rocket decelerates (drag/friction)
export const CHARACTER_ROTATION_SPEED_MIN = 2; // Base rotation speed for small turns (fine control)
export const CHARACTER_ROTATION_SPEED_MAX = 6; // Maximum rotation speed for sharp turns
export const TURN_PENALTY_FACTOR = 0.25; // Reduced penalty for sharp turns (0-1)
export const MIN_TURN_ANGLE = Math.PI / 4; // Angle threshold (45 degrees) before turn penalty applies

export const SECTION_SPACING = 15;
export const SECTION_HEIGHT = 2;

export const CAMERA_SETTINGS = {
  fov: 75,
  near: 0.1,
  far: 200,
  initialPosition: [0, 10, 10] as [number, number, number],
};
