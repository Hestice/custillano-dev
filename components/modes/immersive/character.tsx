"use client";

import { useRef, forwardRef, useImperativeHandle, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Points, Mesh } from "three";
import { Vector3, BufferAttribute, Color, BufferGeometry, CatmullRomCurve3 } from "three";
import { useCharacterControls } from "@/lib/three/controls";
import { CHARACTER_SPEED, CHARACTER_ACCELERATION, CHARACTER_DECELERATION, CHARACTER_ROTATION_SPEED_MIN, CHARACTER_ROTATION_SPEED_MAX, TURN_PENALTY_FACTOR, MIN_TURN_ANGLE, LAUNCH, COLLISION_BUFFER, BOUNCE_FACTOR, BLACK_HOLE } from "@/lib/three/constants";
import { PLANETS, getSubPlanetWorldPosition } from "./planets/planet-layout";
import { clampPosition } from "@/lib/three/utils";
import { useStory } from "./state/story-context";

export type LaunchPhase = "grounded" | "lifting" | "flying";

export interface CharacterRef {
  position: Vector3;
  launchPhase: LaunchPhase;
  launchProgress: number;
  applyForce: (force: Vector3) => void;
}

// --- Flying effects (existing) ---

function JetEffect({ isActive }: { isActive: boolean }) {
  const pointsRef = useRef<Points>(null);
  const particleCount = 50;

  const geometry = useMemo(() => {
    const geom = new BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 0.3;
      positions[i3 + 1] = (Math.random() - 0.5) * 0.3;
      positions[i3 + 2] = -Math.random() * 0.5 - 0.5;

      const color = new Color(1, 0.5 + Math.random() * 0.5, 0);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = Math.random() * 0.1 + 0.05;
    }

    geom.setAttribute("position", new BufferAttribute(positions, 3));
    geom.setAttribute("color", new BufferAttribute(colors, 3));
    geom.setAttribute("size", new BufferAttribute(sizes, 1));

    return geom;
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current || !isActive) return;

    const positions = geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3 + 2] -= delta * (2 + Math.random() * 2);

      if (positions[i3 + 2] < -1.5) {
        positions[i3] = (Math.random() - 0.5) * 0.3;
        positions[i3 + 1] = (Math.random() - 0.5) * 0.3;
        positions[i3 + 2] = -0.5;
      }
    }

    geometry.attributes.position.needsUpdate = true;
  });

  if (!isActive) return null;

  return (
    <points ref={pointsRef} geometry={geometry} position={[0, 0, -0.8]}>
      <pointsMaterial
        size={0.2}
        vertexColors
        transparent
        opacity={0.8}
        blending={2}
        depthWrite={false}
      />
    </points>
  );
}

function SmokeEffect({ isActive }: { isActive: boolean }) {
  const pointsRef = useRef<Points>(null);
  const particleCount = 30;

  const geometry = useMemo(() => {
    const geom = new BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 0.4;
      positions[i3 + 1] = (Math.random() - 0.5) * 0.4;
      positions[i3 + 2] = -Math.random() * 0.3 - 0.5;

      const gray = 0.3 + Math.random() * 0.2;
      colors[i3] = gray;
      colors[i3 + 1] = gray;
      colors[i3 + 2] = gray;

      sizes[i] = Math.random() * 0.15 + 0.1;
    }

    geom.setAttribute("position", new BufferAttribute(positions, 3));
    geom.setAttribute("color", new BufferAttribute(colors, 3));
    geom.setAttribute("size", new BufferAttribute(sizes, 1));

    return geom;
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current || !isActive) return;

    const positions = geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] += (Math.random() - 0.5) * delta * 0.5;
      positions[i3 + 1] += (Math.random() - 0.5) * delta * 0.5;
      positions[i3 + 2] -= delta * (0.5 + Math.random() * 0.5);

      if (positions[i3 + 2] < -2) {
        positions[i3] = (Math.random() - 0.5) * 0.4;
        positions[i3 + 1] = (Math.random() - 0.5) * 0.4;
        positions[i3 + 2] = -0.5;
      }
    }

    geometry.attributes.position.needsUpdate = true;
  });

  if (!isActive) return null;

  return (
    <points ref={pointsRef} geometry={geometry} position={[0, 0, -0.8]}>
      <pointsMaterial
        size={0.3}
        vertexColors
        transparent
        opacity={0.6}
        blending={2}
        depthWrite={false}
      />
    </points>
  );
}

// --- Launch-specific effects ---

function LaunchFlameEffect({ intensity }: { intensity: number }) {
  const pointsRef = useRef<Points>(null);
  const particleCount = 80;

  const geometry = useMemo(() => {
    const geom = new BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 0.5;
      positions[i3 + 1] = -Math.random() * 2 - 0.5;
      positions[i3 + 2] = (Math.random() - 0.5) * 0.5;

      // Hot colors: white core → orange → red tips
      const t = Math.random();
      const color = new Color();
      if (t < 0.3) {
        color.setRGB(1, 0.95, 0.8); // white-hot core
      } else if (t < 0.7) {
        color.setRGB(1, 0.6 + Math.random() * 0.3, 0); // orange
      } else {
        color.setRGB(1, 0.15 + Math.random() * 0.2, 0); // red tips
      }
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = Math.random() * 0.15 + 0.08;
    }

    geom.setAttribute("position", new BufferAttribute(positions, 3));
    geom.setAttribute("color", new BufferAttribute(colors, 3));
    geom.setAttribute("size", new BufferAttribute(sizes, 1));
    return geom;
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current || intensity <= 0) return;

    const positions = geometry.attributes.position.array as Float32Array;
    const speed = 4 + intensity * 6;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Particles shoot downward (-Y in local space for vertical thrust)
      positions[i3 + 1] -= delta * (speed + Math.random() * 2);
      // Slight spread
      positions[i3] += (Math.random() - 0.5) * delta * intensity * 2;
      positions[i3 + 2] += (Math.random() - 0.5) * delta * intensity * 2;

      if (positions[i3 + 1] < -3 * intensity - 1) {
        positions[i3] = (Math.random() - 0.5) * 0.5 * intensity;
        positions[i3 + 1] = -0.5;
        positions[i3 + 2] = (Math.random() - 0.5) * 0.5 * intensity;
      }
    }

    geometry.attributes.position.needsUpdate = true;
  });

  if (intensity <= 0) return null;

  return (
    <points ref={pointsRef} geometry={geometry} position={[0, -0.8, 0]}>
      <pointsMaterial
        size={0.25 * intensity}
        vertexColors
        transparent
        opacity={Math.min(intensity, 0.9)}
        blending={2}
        depthWrite={false}
      />
    </points>
  );
}

function LaunchSmokeEffect({ intensity }: { intensity: number }) {
  const pointsRef = useRef<Points>(null);
  const particleCount = 50;

  const geometry = useMemo(() => {
    const geom = new BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 1.0;
      positions[i3 + 1] = -Math.random() * 1.5 - 0.8;
      positions[i3 + 2] = (Math.random() - 0.5) * 1.0;

      const gray = 0.4 + Math.random() * 0.3;
      colors[i3] = gray;
      colors[i3 + 1] = gray;
      colors[i3 + 2] = gray;

      sizes[i] = Math.random() * 0.3 + 0.15;
    }

    geom.setAttribute("position", new BufferAttribute(positions, 3));
    geom.setAttribute("color", new BufferAttribute(colors, 3));
    geom.setAttribute("size", new BufferAttribute(sizes, 1));
    return geom;
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current || intensity <= 0) return;

    const positions = geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Smoke drifts down and outward
      positions[i3 + 1] -= delta * (1 + Math.random());
      positions[i3] += (Math.random() - 0.5) * delta * 3;
      positions[i3 + 2] += (Math.random() - 0.5) * delta * 3;

      if (positions[i3 + 1] < -4) {
        positions[i3] = (Math.random() - 0.5) * 1.0;
        positions[i3 + 1] = -0.8;
        positions[i3 + 2] = (Math.random() - 0.5) * 1.0;
      }
    }

    geometry.attributes.position.needsUpdate = true;
  });

  if (intensity <= 0) return null;

  return (
    <points ref={pointsRef} geometry={geometry} position={[0, -0.8, 0]}>
      <pointsMaterial
        size={0.5 * intensity}
        vertexColors
        transparent
        opacity={0.4 * intensity}
        blending={2}
        depthWrite={false}
      />
    </points>
  );
}

// --- Helpers ---

function moveTowards(current: number, target: number, maxDelta: number): number {
  const difference = target - current;
  if (Math.abs(difference) <= maxDelta) {
    return target;
  }
  return current + Math.sign(difference) * maxDelta;
}

function lerpAngle(current: number, target: number, maxDelta: number): number {
  const normalizeAngle = (angle: number) => {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
  };

  current = normalizeAngle(current);
  target = normalizeAngle(target);

  let difference = target - current;

  if (difference > Math.PI) {
    difference -= 2 * Math.PI;
  } else if (difference < -Math.PI) {
    difference += 2 * Math.PI;
  }

  if (Math.abs(difference) <= maxDelta) {
    return target;
  }

  return normalizeAngle(current + Math.sign(difference) * maxDelta);
}

// --- Trail ---

interface TrailPoint {
  position: Vector3;
  time: number;
}

function Trail({ getPosition }: { getPosition: () => Vector3 }) {
  const trailRef = useRef<Mesh>(null);
  const pointsRef = useRef<TrailPoint[]>([]);
  const geometryRef = useRef<BufferGeometry | null>(null);
  const maxTrailLength = 50;
  const trailUpdateInterval = 0.05;
  const lastUpdateTime = useRef(0);
  const lastPositionRef = useRef<Vector3 | null>(null);
  const minDistance = 0.05;
  const maxTrailTime = 3.0;
  const maxTrailDistance = 20.0;
  const maxRadius = 0.3;
  const minRadius = 0.01;
  const radialSegments = 8;

  const createTaperedTrailGeometry = (points: TrailPoint[], currentPosition: Vector3, currentTime: number): BufferGeometry | null => {
    if (points.length < 2) return null;

    const curve = new CatmullRomCurve3(points.map(p => p.position), false);
    const segments = Math.min(points.length * 4, 200);

    const positions: number[] = [];
    const normals: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];

    const tempVec = new Vector3();
    const tempNormal = new Vector3();
    const tempColor = new Color();

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const point = curve.getPoint(t);
      const tangent = curve.getTangent(t).normalize();

      const pointIndex = Math.min(Math.floor(t * (points.length - 1)), points.length - 1);
      const pointData = points[pointIndex];
      const timeSinceCreation = currentTime - pointData.time;
      const distanceFromCurrent = point.distanceTo(currentPosition);

      const timeFade = Math.max(0, 1 - timeSinceCreation / maxTrailTime);
      const distanceFade = Math.max(0, 1 - distanceFromCurrent / maxTrailDistance);
      const fade = Math.min(timeFade, distanceFade);

      const radius = minRadius + (maxRadius - minRadius) * fade * (1 - t);

      const up = new Vector3(0, 1, 0);
      const right = new Vector3().crossVectors(tangent, up).normalize();
      if (right.length() < 0.1) {
        right.set(1, 0, 0);
      }
      const normal = new Vector3().crossVectors(right, tangent).normalize();

      for (let j = 0; j <= radialSegments; j++) {
        const angle = (j / radialSegments) * Math.PI * 2;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        tempVec.copy(normal).multiplyScalar(cos * radius);
        tempVec.addScaledVector(right, sin * radius);
        tempVec.add(point);

        positions.push(tempVec.x, tempVec.y, tempVec.z);

        tempNormal.copy(normal).multiplyScalar(cos);
        tempNormal.addScaledVector(right, sin);
        tempNormal.normalize();
        normals.push(tempNormal.x, tempNormal.y, tempNormal.z);

        const colorIntensity = fade * 0.8 + 0.2;
        tempColor.setRGB(0.29, 0.62, 1.0).multiplyScalar(colorIntensity);
        colors.push(tempColor.r, tempColor.g, tempColor.b);

        uvs.push(t, j / radialSegments);
      }
    }

    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < radialSegments; j++) {
        const a = i * (radialSegments + 1) + j;
        const b = a + radialSegments + 1;
        const c = a + 1;
        const d = b + 1;

        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
    geometry.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3));
    geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
    geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
  };

  useFrame((state) => {
    const currentTime = state.clock.elapsedTime;
    const currentPosition = getPosition();
    const trailPosition = new Vector3(currentPosition.x, currentPosition.y, currentPosition.z);

    if (!lastPositionRef.current) {
      pointsRef.current.push({ position: trailPosition.clone(), time: currentTime });
      lastPositionRef.current = trailPosition.clone();
      lastUpdateTime.current = currentTime;
    }

    const shouldAddPoint =
      currentTime - lastUpdateTime.current >= trailUpdateInterval &&
      (!lastPositionRef.current || trailPosition.distanceTo(lastPositionRef.current) >= minDistance);

    if (shouldAddPoint) {
      pointsRef.current.push({ position: trailPosition.clone(), time: currentTime });
      lastPositionRef.current = trailPosition.clone();
      lastUpdateTime.current = currentTime;
    }

    pointsRef.current = pointsRef.current.filter(point => {
      const timeSinceCreation = currentTime - point.time;
      const distanceFromCurrent = point.position.distanceTo(currentPosition);
      return timeSinceCreation < maxTrailTime && distanceFromCurrent < maxTrailDistance;
    });

    if (pointsRef.current.length > maxTrailLength) {
      pointsRef.current = pointsRef.current.slice(-maxTrailLength);
    }

    if (pointsRef.current.length >= 2) {
      const newGeometry = createTaperedTrailGeometry(pointsRef.current, currentPosition, currentTime);

      if (newGeometry) {
        if (geometryRef.current) {
          geometryRef.current.dispose();
        }
        geometryRef.current = newGeometry;
        if (trailRef.current) {
          trailRef.current.geometry = newGeometry;
        }
      }
    } else if (geometryRef.current && trailRef.current) {
      geometryRef.current.dispose();
      geometryRef.current = null;
      trailRef.current.geometry = new BufferGeometry();
    }
  });

  useEffect(() => {
    return () => {
      if (geometryRef.current) {
        geometryRef.current.dispose();
      }
    };
  }, []);

  if (pointsRef.current.length < 2 || !geometryRef.current) {
    return null;
  }

  return (
    <mesh ref={trailRef} geometry={geometryRef.current}>
      <meshStandardMaterial
        vertexColors
        transparent
        opacity={0.9}
        emissive="#1a5ca8"
        emissiveIntensity={0.4}
        side={2}
        depthWrite={false}
      />
    </mesh>
  );
}

// --- Character ---

interface CharacterProps {
  controlsEnabled?: boolean;
}

export const Character = forwardRef<CharacterRef, CharacterProps>(({ controlsEnabled = true }, ref) => {
  const groupRef = useRef<Group>(null);
  const { getMovementDirection } = useCharacterControls();
  const velocity = useRef(new Vector3(0, 0, 0));
  const position = useRef(new Vector3(0, 1, 0));
  const [isMoving, setIsMoving] = useState(false);
  const lastRotation = useRef(Math.PI); // Start facing -Z
  const { state, dispatch } = useStory();
  const [launchFlameIntensity, setLaunchFlameIntensity] = useState(0);
  const [launchSmokeIntensity, setLaunchSmokeIntensity] = useState(0);

  // External force accumulator (consumed each frame)
  const externalForce = useRef(new Vector3());

  // Absorption animation state
  const absorptionTime = useRef(0);
  const absorptionStartPos = useRef(new Vector3());
  const absorptionStartAngle = useRef(0);
  const absorptionStartRadius = useRef(0);
  const absorptionInitialized = useRef(false);

  // Launch sequence state
  const launchPhaseRef = useRef<LaunchPhase>(
    state.phase === "intro" || state.phase === "launching" ? "grounded" : "flying"
  );
  const launchProgress = useRef(0);

  useImperativeHandle(ref, () => ({
    get position() {
      return position.current;
    },
    get launchPhase() {
      return launchPhaseRef.current;
    },
    get launchProgress() {
      return launchProgress.current;
    },
    applyForce(force: Vector3) {
      externalForce.current.add(force);
    },
  }));

  // Handle launch trigger
  useEffect(() => {
    if (state.phase === "launching" && launchPhaseRef.current === "grounded") {
      launchPhaseRef.current = "lifting";
      launchProgress.current = 0;
    }
  }, [state.phase]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Launch sequence animation
    if (launchPhaseRef.current === "grounded") {
      // Sit on home planet surface — nose points straight up
      groupRef.current.position.set(0, -0.5, 0);
      groupRef.current.rotation.y = Math.PI;
      groupRef.current.rotation.x = Math.PI / 2;
      position.current.copy(groupRef.current.position);
      return;
    }

    if (launchPhaseRef.current === "lifting") {
      launchProgress.current += delta * LAUNCH.liftSpeed;
      const t = Math.min(launchProgress.current, 1);

      // Three-phase lift animation
      if (t <= LAUNCH.ignitionEnd) {
        // Phase 1: Ignition (t 0→0.15) — rumble, slight lift, no Z
        const phase = t / LAUNCH.ignitionEnd; // 0→1 within this phase
        const eased = phase * phase;

        // Slight lift from -0.5 to 0
        groupRef.current.position.y = -0.5 + 0.5 * eased;
        groupRef.current.position.z = 0;
        groupRef.current.position.x = 0;

        // Rumble shake
        groupRef.current.position.x += (Math.random() - 0.5) * 0.06 * phase;
        groupRef.current.position.z += (Math.random() - 0.5) * 0.06 * phase;

        // Keep vertical (nose straight up) during ignition
        groupRef.current.rotation.y = Math.PI;
        groupRef.current.rotation.x = Math.PI / 2;

        // Ramp up effects
        setLaunchFlameIntensity(eased * 0.6);
        setLaunchSmokeIntensity(eased * 0.8);
      } else if (t <= LAUNCH.ascentEnd) {
        // Phase 2: Vertical ascent (t 0.15→0.6) — rapid climb, rocket tilts nose-up
        const phase = (t - LAUNCH.ignitionEnd) / (LAUNCH.ascentEnd - LAUNCH.ignitionEnd); // 0→1
        const eased = 1 - (1 - phase) * (1 - phase); // ease out

        // Y: 0 → peakY
        groupRef.current.position.y = LAUNCH.peakY * eased;
        // Z: 0 → -10
        groupRef.current.position.z = -10 * eased;
        groupRef.current.position.x = 0;

        // Rumble decreases
        const shake = 0.04 * (1 - phase);
        groupRef.current.position.x += (Math.random() - 0.5) * shake;

        // Arc from vertical (PI/2) to 45° (PI/4) during ascent
        groupRef.current.rotation.y = Math.PI;
        groupRef.current.rotation.x = Math.PI / 2 - (Math.PI / 4) * eased;

        // Full thrust
        setLaunchFlameIntensity(0.6 + 0.4 * eased);
        setLaunchSmokeIntensity(0.8 * (1 - phase * 0.5));
      } else {
        // Phase 3: Arc & level (t 0.6→1.0) — descend to cruise, accelerate forward
        const phase = (t - LAUNCH.ascentEnd) / (1 - LAUNCH.ascentEnd); // 0→1
        const eased = phase * (2 - phase); // ease out

        // Y: peakY → endY
        groupRef.current.position.y = LAUNCH.peakY + (LAUNCH.endY - LAUNCH.peakY) * eased;
        // Z: -10 → endZ
        groupRef.current.position.z = -10 + (LAUNCH.endZ - (-10)) * eased;
        groupRef.current.position.x = 0;

        // Arc from 45° (PI/4) to horizontal (0) — fully forward-facing
        groupRef.current.rotation.y = Math.PI;
        groupRef.current.rotation.x = Math.PI / 4 - (Math.PI / 4) * eased;

        // Effects fade out
        setLaunchFlameIntensity(1 - eased * 0.8);
        setLaunchSmokeIntensity(0.4 * (1 - eased));
      }

      position.current.copy(groupRef.current.position);

      if (t >= 1) {
        launchPhaseRef.current = "flying";
        setLaunchFlameIntensity(0);
        setLaunchSmokeIntensity(0);
        // Reset rotation for normal flight
        groupRef.current.rotation.y = Math.PI;
        groupRef.current.rotation.x = 0;
        lastRotation.current = Math.PI;
        dispatch({ type: "START_EXPLORING" });
      }
      return;
    }

    // Absorption spiral animation
    if (state.phase === "absorbed") {
      const bhCenter = new Vector3(...BLACK_HOLE.position);

      if (!absorptionInitialized.current) {
        absorptionStartPos.current.copy(position.current);
        const dx = position.current.x - bhCenter.x;
        const dz = position.current.z - bhCenter.z;
        absorptionStartRadius.current = Math.sqrt(dx * dx + dz * dz);
        absorptionStartAngle.current = Math.atan2(dx, dz);
        absorptionTime.current = 0;
        absorptionInitialized.current = true;
      }

      absorptionTime.current += delta;
      const t = Math.min(absorptionTime.current / BLACK_HOLE.spiralDuration, 1);

      // Exponentially decreasing radius
      const radius = absorptionStartRadius.current * Math.pow(1 - t, 2);
      // Accelerating angular velocity
      const angle = absorptionStartAngle.current + t * t * Math.PI * 6;

      const x = bhCenter.x + Math.sin(angle) * radius;
      const z = bhCenter.z + Math.cos(angle) * radius;
      const y = bhCenter.y + (position.current.y - bhCenter.y) * (1 - t);

      groupRef.current.position.set(x, y, z);

      // Shrink scale as we approach center
      const scale = Math.max(1 - t * 0.9, 0.1);
      groupRef.current.scale.setScalar(scale);

      // Spin the rocket
      groupRef.current.rotation.y += delta * (5 + t * 15);

      position.current.copy(groupRef.current.position);
      return;
    }

    // Normal flight controls (only when controlsEnabled)
    if (!controlsEnabled) return;

    const direction = getMovementDirection();
    const moving = direction.x !== 0 || direction.z !== 0;

    if (moving !== isMoving) {
      setIsMoving(moving);
    }

    const velocityMagnitude = Math.sqrt(
      velocity.current.x ** 2 + velocity.current.z ** 2
    );

    const currentVelocityDirection = velocityMagnitude > 0.1
      ? new Vector3(velocity.current.x, 0, velocity.current.z).normalize()
      : null;

    let targetAngle = lastRotation.current;
    let turnAngle = 0;

    if (moving) {
      const inputAngle = Math.atan2(direction.x, direction.z);

      if (currentVelocityDirection) {
        const currentAngle = Math.atan2(velocity.current.x, velocity.current.z);
        let angleDiff = inputAngle - currentAngle;

        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

        turnAngle = Math.abs(angleDiff);
        targetAngle = inputAngle;
      } else {
        targetAngle = inputAngle;
      }
    } else if (velocityMagnitude > 0.1) {
      targetAngle = Math.atan2(velocity.current.x, velocity.current.z);
    }

    const currentRotation = groupRef.current.rotation.y;
    let rotationAngleDiff = targetAngle - currentRotation;

    while (rotationAngleDiff > Math.PI) rotationAngleDiff -= 2 * Math.PI;
    while (rotationAngleDiff < -Math.PI) rotationAngleDiff += 2 * Math.PI;

    const absRotationAngle = Math.abs(rotationAngleDiff);
    const normalizedAngle = Math.min(absRotationAngle / Math.PI, 1);
    const speedFactor = normalizedAngle ** 1.5;
    const dynamicRotationSpeed = CHARACTER_ROTATION_SPEED_MIN +
      (CHARACTER_ROTATION_SPEED_MAX - CHARACTER_ROTATION_SPEED_MIN) * speedFactor;

    const rotationDelta = dynamicRotationSpeed * delta;
    const newRotation = lerpAngle(
      currentRotation,
      targetAngle,
      rotationDelta
    );
    groupRef.current.rotation.y = newRotation;
    lastRotation.current = newRotation;

    let turnPenalty = 0;
    if (moving && currentVelocityDirection && turnAngle > MIN_TURN_ANGLE) {
      const normalizedTurnAngle = Math.min(turnAngle / Math.PI, 1);
      const curveFactor = Math.sqrt(normalizedTurnAngle);
      turnPenalty = curveFactor * TURN_PENALTY_FACTOR;
    }

    if (moving) {
      const currentRot = groupRef.current.rotation.y;
      const rotationDirection = new Vector3(
        Math.sin(currentRot),
        0,
        Math.cos(currentRot)
      );

      const baseTargetSpeed = CHARACTER_SPEED;
      const targetSpeed = baseTargetSpeed * (1 - turnPenalty);
      const projectedTarget = rotationDirection.clone().multiplyScalar(targetSpeed);

      const effectiveAcceleration = CHARACTER_ACCELERATION * (1 - turnPenalty * 0.3);
      const acceleration = effectiveAcceleration * delta;

      velocity.current.x = moveTowards(
        velocity.current.x,
        projectedTarget.x,
        acceleration
      );
      velocity.current.z = moveTowards(
        velocity.current.z,
        projectedTarget.z,
        acceleration
      );

      if (turnPenalty > 0) {
        const turnDeceleration = CHARACTER_DECELERATION * turnPenalty * 0.3 * delta;
        const currentSpeed = Math.sqrt(velocity.current.x ** 2 + velocity.current.z ** 2);
        if (currentSpeed > 0.1) {
          const decelFactor = Math.max(0, 1 - turnDeceleration / currentSpeed);
          velocity.current.x *= decelFactor;
          velocity.current.z *= decelFactor;
        }
      }
    } else {
      const deceleration = CHARACTER_DECELERATION * delta;
      velocity.current.x = moveTowards(velocity.current.x, 0, deceleration);
      velocity.current.z = moveTowards(velocity.current.z, 0, deceleration);
    }

    // Apply external forces (e.g. black hole gravity)
    velocity.current.x += externalForce.current.x;
    velocity.current.z += externalForce.current.z;
    externalForce.current.set(0, 0, 0);

    groupRef.current.position.x += velocity.current.x * delta;
    groupRef.current.position.z += velocity.current.z * delta;

    // Planet collision (XZ plane only)
    for (const planet of PLANETS) {
      if (planet.id === "home") continue;

      const checkAndBounce = (center: [number, number, number], size: number) => {
        const dx = groupRef.current!.position.x - center[0];
        const dz = groupRef.current!.position.z - center[2];
        const distXZ = Math.sqrt(dx * dx + dz * dz);
        const minDist = size + COLLISION_BUFFER;

        if (distXZ < minDist && distXZ > 0.001) {
          // Push to boundary
          const nx = dx / distXZ;
          const nz = dz / distXZ;
          groupRef.current!.position.x = center[0] + nx * minDist;
          groupRef.current!.position.z = center[2] + nz * minDist;

          // Reflect velocity across collision normal
          const dot = velocity.current.x * nx + velocity.current.z * nz;
          velocity.current.x = (velocity.current.x - 2 * dot * nx) * BOUNCE_FACTOR;
          velocity.current.z = (velocity.current.z - 2 * dot * nz) * BOUNCE_FACTOR;
        }
      };

      checkAndBounce(planet.position, planet.size);

      if (planet.subPlanets) {
        for (let si = 0; si < planet.subPlanets.length; si++) {
          const worldPos = getSubPlanetWorldPosition(planet, si);
          checkAndBounce(worldPos, planet.subPlanets[si].size);
        }
      }
    }

    // Keep Y locked to travel plane
    groupRef.current.position.y = 1;

    clampPosition(groupRef.current.position);
    position.current.copy(groupRef.current.position);
  });

  const showFlyingEffects = isMoving && launchPhaseRef.current === "flying";
  const showLaunchEffects = launchPhaseRef.current === "lifting";
  const showTrail = launchPhaseRef.current !== "grounded";

  return (
    <>
      {showTrail && <Trail getPosition={() => position.current} />}
      <group ref={groupRef} position={[0, 1, 0]}>
        <mesh position={[0, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.4, 0.6, 8]} />
          <meshStandardMaterial color="#ff6b6b" />
        </mesh>
        <mesh position={[0, 0, -0.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.8, 8]} />
          <meshStandardMaterial color="#4a9eff" />
        </mesh>
        <mesh position={[0, 0, -0.75]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.35, 0.3, 0.3, 8]} />
          <meshStandardMaterial color="#ffd93d" />
        </mesh>
        <mesh position={[0.4, 0, -0.6]} rotation={[0, 4, Math.PI / 2]}>
          <boxGeometry args={[0.15, 0.4, 0.05]} />
          <meshStandardMaterial color="#6c757d" />
        </mesh>
        <mesh position={[-0.4, 0, -0.6]} rotation={[0, -4, -Math.PI / 2]}>
          <boxGeometry args={[0.15, 0.4, 0.05]} />
          <meshStandardMaterial color="#6c757d" />
        </mesh>

        {/* Flying effects (normal movement) */}
        <JetEffect isActive={showFlyingEffects} />
        <SmokeEffect isActive={showFlyingEffects} />

        {/* Launch effects (liftoff) */}
        {showLaunchEffects && (
          <>
            <LaunchFlameEffect intensity={launchFlameIntensity} />
            <LaunchSmokeEffect intensity={launchSmokeIntensity} />
          </>
        )}
      </group>
    </>
  );
});

Character.displayName = "Character";
