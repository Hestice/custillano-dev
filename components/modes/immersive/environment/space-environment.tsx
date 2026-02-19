"use client";

import { Stars } from "@react-three/drei";
import { STAR_COUNT, STAR_RADIUS, STAR_DEPTH } from "@/lib/three/constants";
import { AmbientParticles } from "./ambient-particles";

export function SpaceEnvironment() {
  return (
    <>
      <Stars
        radius={STAR_RADIUS}
        depth={STAR_DEPTH}
        count={STAR_COUNT}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />
      <AmbientParticles />
    </>
  );
}
