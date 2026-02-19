import type { SceneBounds } from "./types";

export const GROUND_SIZE = 100;
export const GROUND_HALF = GROUND_SIZE / 2;

export const SCENE_BOUNDS: SceneBounds = {
  minX: -500,
  maxX: 500,
  minZ: -500,
  maxZ: 50,
};

export const CHARACTER_SPEED = 20;
export const CHARACTER_ACCELERATION = 50;
export const CHARACTER_DECELERATION = 30;
export const CHARACTER_ROTATION_SPEED_MIN = 2;
export const CHARACTER_ROTATION_SPEED_MAX = 6;
export const TURN_PENALTY_FACTOR = 0.25;
export const MIN_TURN_ANGLE = Math.PI / 4;

export const SECTION_SPACING = 15;
export const SECTION_HEIGHT = 2;

export const CAMERA_SETTINGS = {
  fov: 75,
  near: 0.1,
  far: 1000,
  initialPosition: [0, 1.5, 4] as [number, number, number],
};

// Space environment
export const STAR_COUNT = 5000;
export const STAR_RADIUS = 300;
export const STAR_DEPTH = 100;

// Ambient particles
export const AMBIENT_PARTICLE_COUNT = 200;

// Collectible detection
export const COLLECTIBLE_RADIUS = 3;
export const PLANET_PROXIMITY_THRESHOLD = 100;

// Launch sequence
export const LAUNCH = {
  liftSpeed: 0.25, // progress per second (~4s total)
  peakY: 15,
  endY: 1,
  endZ: -45,
  ignitionEnd: 0.15, // t where ignition phase ends
  ascentEnd: 0.6, // t where vertical ascent ends
  camera: {
    liftOffsetY: 12,
    liftOffsetZ: 18,
    liftLerp: 0.04,
  },
};

// Earth palette
export const EARTH = {
  ocean: "#1a6bb5",
  land: "#3a8c5c",
  atmosphere: "#87ceeb",
  emissive: "#0d3d6b",
};

// Planetary atmosphere (grounded feel)
export const ATMOSPHERE = {
  fogColor: "#a8d8ea",
  fogNear: 10,
  fogFarStart: 60,
  fogFarEnd: 1000,
  skyColor: "#6fb8e0",
  skyDomeRadius: 80,
  skyOpacityStart: 0.85,
};
