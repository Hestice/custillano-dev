"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { CatmullRomCurve3, Vector3 } from "three";
import { PLANETS, PLANET_VISIT_ORDER } from "../planets/planet-layout";
import type { CharacterRef } from "../character";

export function GuideTrail({
  characterRef,
}: {
  characterRef: React.RefObject<CharacterRef | null>;
}) {
  const dashOffsetRef = useRef(0);
  const opacityRef = useRef(0);

  const points = useMemo(() => {
    const orderedPositions: Vector3[] = [];
    for (const id of PLANET_VISIT_ORDER) {
      const planet = PLANETS.find((p) => p.id === id);
      if (planet) {
        orderedPositions.push(
          new Vector3(planet.position[0], planet.position[1], planet.position[2])
        );
      }
    }
    if (orderedPositions.length < 2) return [];

    const curve = new CatmullRomCurve3(orderedPositions, false);
    return curve.getPoints(100).map((p) => [p.x, p.y, p.z] as [number, number, number]);
  }, []);

  useFrame((_, delta) => {
    dashOffsetRef.current -= delta * 2;

    const isFlying = characterRef.current?.launchPhase !== "grounded";
    const target = isFlying ? 0.5 : 0;
    opacityRef.current += (target - opacityRef.current) * Math.min(delta * 2, 1);
  });

  if (points.length < 2) return null;

  return (
    <Line
      points={points}
      color="#64b5f6"
      lineWidth={3}
      transparent
      opacity={opacityRef.current}
      dashed
      dashSize={2}
      dashScale={1}
      gapSize={1.5}
    />
  );
}
