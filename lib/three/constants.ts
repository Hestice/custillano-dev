import type { SceneBounds } from "./types";

export const GROUND_SIZE = 100;
export const GROUND_HALF = GROUND_SIZE / 2;

export const SCENE_BOUNDS: SceneBounds = {
  minX: -500,
  maxX: 500,
  minZ: -540,
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

// Collectible magnet pull
export const MAGNET_RADIUS = 8;
export const MAGNET_STRENGTH = 0.15;

// Collection return animation
export const COLLECTION_RETURN_DURATION = 0.6;

// Planet collision
export const COLLISION_BUFFER = 0.5;
export const BOUNCE_FACTOR = 0.6;

// POI camera focus
export const POI_FOCUS_RADIUS = 40;
export const POI_MAX_BLEND = 0.3;
export const POI_LOCK_HYSTERESIS = 0.7;

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
  planet: {
    groundedScale: 5,
    flyingScale: 1,
  },
};

// Earth palette
export const EARTH = {
  ocean: "#1a6bb5",
  land: "#3a8c5c",
  atmosphere: "#87ceeb",
  emissive: "#0d3d6b",
};

// Planetary atmosphere (grounded feel — warm golden-hour)
export const ATMOSPHERE = {
  fogColor: "#e8d5c4",
  fogNear: 15,
  fogFarStart: 80,
  fogFarEnd: 1000,
  skyColor: "#f0c27f",
  skyDomeRadius: 80,
  skyOpacityStart: 0.7,
};

// Launch station ground scene
export const STATION = {
  groundRadius: 30,
  groundColor: "#4a7c59",
  padRadius: 3.5,
  padColor: "#666666",
  padMarkingColor: "#ffcc00",
  treeCount: 20,
  treeAreaMin: 8,
  treeAreaMax: 15,
  treeTrunkColor: "#5c3a1e",
  treeCanopyColors: ["#2d5a1e", "#3a6b2a", "#4a7c36"],
  buildingColor: "#555555",
  buildingAccent: "#333333",
  infoBoardColor: "#1a1a2e",
};

// Project black holes (project portals)
export const PROJECT_BLACK_HOLE = {
  coreRadius: 1,
  accretionInnerRadius: 1.5,
  accretionOuterRadius: 4,
  swirlParticleCount: 50,
  spawnDuration: 2,
  eventHorizonRadius: 2.5,
  approachRadius: 20,
  offsetFromPlanet: 8,
};

// Black hole (contact portal)
export const BLACK_HOLE = {
  position: [0, 2, -490] as [number, number, number],
  // Visual
  coreRadius: 2,
  accretionInnerRadius: 3,
  accretionOuterRadius: 8,
  colors: {
    core: "#0a0010",
    rimEmissive: "#7c3aed",
    accretion: "#a855f7",
    accretionEmissive: "#7c3aed",
    particles: "#c084fc",
  },
  swirlParticleCount: 200,
  spawnDuration: 2.5,
  // Physics
  pullRadius: 40,
  pullStrength: 0.08,
  eventHorizonRadius: 4,
  // Absorption
  spiralDuration: 3,
  fadeStartRatio: 0.6, // fade begins at 60% of spiral
  overlayFadeDelay: 1.8, // seconds before overlay starts
  overlayFadeDuration: 1.2, // seconds for fade-to-black
  redirectDelay: 500, // ms after full black before redirect
  // Narration
  approachRadius: 50,
};
