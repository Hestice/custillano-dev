"use client";

import { useRef, forwardRef, useImperativeHandle, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Points, Mesh } from "three";
import { Vector3, BufferAttribute, Color, BufferGeometry, CatmullRomCurve3 } from "three";
import { useCharacterControls } from "@/lib/three/controls";
import { CHARACTER_SPEED, CHARACTER_ACCELERATION, CHARACTER_DECELERATION, CHARACTER_ROTATION_SPEED_MIN, CHARACTER_ROTATION_SPEED_MAX, TURN_PENALTY_FACTOR, MIN_TURN_ANGLE } from "@/lib/three/constants";
import { clampPosition } from "@/lib/three/utils";

export interface CharacterRef {
  position: Vector3;
}

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

function moveTowards(current: number, target: number, maxDelta: number): number {
  const difference = target - current;
  if (Math.abs(difference) <= maxDelta) {
    return target;
  }
  return current + Math.sign(difference) * maxDelta;
}

function lerpAngle(current: number, target: number, maxDelta: number): number {
  // Normalize angles to [-π, π]
  const normalizeAngle = (angle: number) => {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
  };

  current = normalizeAngle(current);
  target = normalizeAngle(target);

  let difference = target - current;

  // Take the shortest path
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

  useFrame((state, delta) => {
    const currentTime = state.clock.elapsedTime;
    const currentPosition = getPosition();
    const groundPosition = new Vector3(currentPosition.x, 0.05, currentPosition.z);
    
    if (!lastPositionRef.current) {
      pointsRef.current.push({ position: groundPosition.clone(), time: currentTime });
      lastPositionRef.current = groundPosition.clone();
      lastUpdateTime.current = currentTime;
    }
    
    const shouldAddPoint = 
      currentTime - lastUpdateTime.current >= trailUpdateInterval &&
      (!lastPositionRef.current || groundPosition.distanceTo(lastPositionRef.current) >= minDistance);
    
    if (shouldAddPoint) {
      pointsRef.current.push({ position: groundPosition.clone(), time: currentTime });
      lastPositionRef.current = groundPosition.clone();
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
    <mesh ref={trailRef} geometry={geometryRef.current} receiveShadow>
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

export const Character = forwardRef<CharacterRef>((props, ref) => {
  const groupRef = useRef<Group>(null);
  const { getMovementDirection } = useCharacterControls();
  const velocity = useRef(new Vector3(0, 0, 0));
  const position = useRef(new Vector3(0, 1, 0));
  const [isMoving, setIsMoving] = useState(false);
  const lastRotation = useRef(0);

  useImperativeHandle(ref, () => ({
    get position() {
      return position.current;
    },
  }));

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const direction = getMovementDirection();
    const moving = direction.x !== 0 || direction.z !== 0;
    
    if (moving !== isMoving) {
      setIsMoving(moving);
    }

    const velocityMagnitude = Math.sqrt(
      velocity.current.x ** 2 + velocity.current.z ** 2
    );

    // Calculate current velocity direction
    const currentVelocityDirection = velocityMagnitude > 0.1
      ? new Vector3(velocity.current.x, 0, velocity.current.z).normalize()
      : null;

    // Calculate target direction and angle
    let targetAngle = lastRotation.current;
    let turnAngle = 0;

    if (moving) {
      const inputAngle = Math.atan2(direction.x, direction.z);
      
      if (currentVelocityDirection) {
        // Calculate angle between current velocity and input direction
        const currentAngle = Math.atan2(velocity.current.x, velocity.current.z);
        let angleDiff = inputAngle - currentAngle;
        
        // Normalize to [-π, π]
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        turnAngle = Math.abs(angleDiff);
        
        // Target angle is based on input, but velocity will follow rotation
        targetAngle = inputAngle;
      } else {
        // No current velocity, rotate towards input
        targetAngle = inputAngle;
      }
    } else if (velocityMagnitude > 0.1) {
      // No input but still moving, rotate towards velocity direction
      targetAngle = Math.atan2(velocity.current.x, velocity.current.z);
    }

    // Calculate rotation angle difference for dynamic rotation speed
    const currentRotation = groupRef.current.rotation.y;
    let rotationAngleDiff = targetAngle - currentRotation;
    
    // Normalize to [-π, π]
    while (rotationAngleDiff > Math.PI) rotationAngleDiff -= 2 * Math.PI;
    while (rotationAngleDiff < -Math.PI) rotationAngleDiff += 2 * Math.PI;
    
    const absRotationAngle = Math.abs(rotationAngleDiff);
    
    // Dynamic rotation speed: faster for sharp turns, slower for small adjustments
    // Use a smooth curve that scales from MIN to MAX based on rotation angle
    const normalizedAngle = Math.min(absRotationAngle / Math.PI, 1);
    // Use a power curve for smoother transition (cubic for more pronounced effect)
    const speedFactor = normalizedAngle ** 1.5;
    const dynamicRotationSpeed = CHARACTER_ROTATION_SPEED_MIN + 
      (CHARACTER_ROTATION_SPEED_MAX - CHARACTER_ROTATION_SPEED_MIN) * speedFactor;
    
    // Smoothly interpolate rotation with dynamic speed
    const rotationDelta = dynamicRotationSpeed * delta;
    const newRotation = lerpAngle(
      currentRotation,
      targetAngle,
      rotationDelta
    );
    groupRef.current.rotation.y = newRotation;
    lastRotation.current = newRotation;

    // Calculate turn penalty for sharp turns
    let turnPenalty = 0;
    if (moving && currentVelocityDirection && turnAngle > MIN_TURN_ANGLE) {
      // Use a smoother curve for turn penalty - less aggressive for very sharp turns
      // Square root curve makes 180-degree turns less penalized proportionally
      const normalizedAngle = Math.min(turnAngle / Math.PI, 1);
      const curveFactor = Math.sqrt(normalizedAngle); // Smoother curve
      turnPenalty = curveFactor * TURN_PENALTY_FACTOR;
    }

    // Apply acceleration or deceleration
    if (moving) {
      // Velocity direction should align with the rocket's current rotation
      // This constrains movement to follow physics - rocket can only accelerate in direction it's facing
      const currentRotation = groupRef.current.rotation.y;
      const rotationDirection = new Vector3(
        Math.sin(currentRotation),
        0,
        Math.cos(currentRotation)
      );
      
      // Calculate target speed with turn penalty applied
      const baseTargetSpeed = CHARACTER_SPEED;
      const targetSpeed = baseTargetSpeed * (1 - turnPenalty);
      
      // Target velocity is in the direction the rocket is facing
      const projectedTarget = rotationDirection.clone().multiplyScalar(targetSpeed);
      
      // Reduce acceleration when turning sharply (less aggressive reduction)
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
      
      // Apply additional deceleration during sharp turns to simulate drag (reduced)
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
      // Decelerate towards zero
      const deceleration = CHARACTER_DECELERATION * delta;
      velocity.current.x = moveTowards(velocity.current.x, 0, deceleration);
      velocity.current.z = moveTowards(velocity.current.z, 0, deceleration);
    }

    // Apply velocity to position
    groupRef.current.position.x += velocity.current.x * delta;
    groupRef.current.position.z += velocity.current.z * delta;

    clampPosition(groupRef.current.position);
    position.current.copy(groupRef.current.position);
  });

  return (
    <>
      <Trail getPosition={() => position.current} />
      <group ref={groupRef} position={[0, 1, 0]}>
        <mesh position={[0, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <coneGeometry args={[0.4, 0.6, 8]} />
          <meshStandardMaterial color="#ff6b6b" />
        </mesh>
        <mesh position={[0, 0, -0.2]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.8, 8]} />
          <meshStandardMaterial color="#4a9eff" />
        </mesh>
        <mesh position={[0, 0, -0.75]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.3, 0.3, 8]} />
          <meshStandardMaterial color="#ffd93d" />
        </mesh>
        <mesh position={[0.4, 0, -0.6]} rotation={[0, 4, Math.PI / 2]} castShadow>
          <boxGeometry args={[0.15, 0.4, 0.05]} />
          <meshStandardMaterial color="#6c757d" />
        </mesh>
        <mesh position={[-0.4, 0, -0.6]} rotation={[0, -4, -Math.PI / 2]} castShadow>
          <boxGeometry args={[0.15, 0.4, 0.05]} />
          <meshStandardMaterial color="#6c757d" />
        </mesh>
        <JetEffect isActive={isMoving} />
        <SmokeEffect isActive={isMoving} />
      </group>
    </>
  );
});

Character.displayName = "Character";
