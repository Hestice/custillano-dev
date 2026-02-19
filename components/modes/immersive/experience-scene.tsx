"use client";

import { useRef, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Character, type CharacterRef } from "./character";
import { SpaceEnvironment } from "./environment/space-environment";
import { AtmosphereEffect } from "./environment/atmosphere-effect";
import { HomePlanet } from "./planets/home-planet";
import { Planet } from "./planets/planet";
import { CollectibleRing } from "./collectibles/collectible-ring";
import { SpaceBillboard } from "./billboards/space-billboard";
import { GuideTrail } from "./navigation/guide-trail";
import { CAMERA_SETTINGS, LAUNCH } from "@/lib/three/constants";
import { PLANETS, getSubPlanetWorldPosition } from "./planets/planet-layout";
import { NARRATION, PLANET_NARRATION_RADIUS } from "./state/story-data";
import { useStory } from "./state/story-context";
import { Vector3 } from "three";

function CameraController({
  characterRef,
}: {
  characterRef: React.RefObject<CharacterRef | null>;
}) {
  const { camera } = useThree();
  const { state } = useStory();
  const currentOffsetY = useRef(5);
  const currentOffsetZ = useRef(6);
  const currentLerp = useRef(0.1);

  useFrame(() => {
    if (!characterRef.current) return;

    const characterPos = characterRef.current.position;
    const launchPhase = characterRef.current.launchPhase;
    const progress = characterRef.current.launchProgress;

    // Determine target camera offsets based on phase
    let targetOffsetY: number;
    let targetOffsetZ: number;
    let targetLerp: number;

    if (launchPhase === "grounded") {
      // Intro: low angle so planet fills the frame
      targetOffsetY = 2;
      targetOffsetZ = 4;
      targetLerp = 0.1;
    } else if (launchPhase === "lifting") {
      // Cinematic pullback during launch
      const liftT = Math.min(progress, 1);
      targetOffsetY = 2 + (LAUNCH.camera.liftOffsetY - 2) * liftT;
      targetOffsetZ = 4 + (LAUNCH.camera.liftOffsetZ - 4) * liftT;
      targetLerp = LAUNCH.camera.liftLerp;
    } else {
      // Exploring: standard follow
      targetOffsetY = 8;
      targetOffsetZ = 10;
      targetLerp = 0.1;
    }

    // Smooth transition between modes
    currentOffsetY.current += (targetOffsetY - currentOffsetY.current) * 0.05;
    currentOffsetZ.current += (targetOffsetZ - currentOffsetZ.current) * 0.05;
    currentLerp.current += (targetLerp - currentLerp.current) * 0.05;

    // Screen shake during ignition and early ascent
    let shakeX = 0;
    let shakeY = 0;
    if (launchPhase === "lifting" && progress < LAUNCH.ascentEnd) {
      const shakeIntensity = progress < LAUNCH.ignitionEnd
        ? (progress / LAUNCH.ignitionEnd) * 0.15 // Ramp up during ignition
        : 0.15 * (1 - (progress - LAUNCH.ignitionEnd) / (LAUNCH.ascentEnd - LAUNCH.ignitionEnd)); // Fade during ascent
      shakeX = (Math.random() - 0.5) * shakeIntensity;
      shakeY = (Math.random() - 0.5) * shakeIntensity * 0.5;
    }

    const targetPosition = new Vector3(
      characterPos.x + shakeX,
      characterPos.y + currentOffsetY.current + shakeY,
      characterPos.z + currentOffsetZ.current
    );

    camera.position.lerp(targetPosition, currentLerp.current);
    camera.lookAt(characterPos.x, characterPos.y + 1, characterPos.z);
  });

  return null;
}

function PlanetNarrationTrigger({
  characterRef,
}: {
  characterRef: React.RefObject<CharacterRef | null>;
}) {
  const { state, dispatch } = useStory();
  const triggeredPlanets = useRef(new Set<string>());

  useFrame(() => {
    if (!characterRef.current || state.phase !== "exploring") return;

    const charPos = characterRef.current.position;

    for (const planet of PLANETS) {
      if (planet.id === "home") continue;
      if (triggeredPlanets.current.has(planet.id)) continue;

      const planetPos = new Vector3(...planet.position);
      const dist = charPos.distanceTo(planetPos);

      if (dist < PLANET_NARRATION_RADIUS) {
        triggeredPlanets.current.add(planet.id);
        dispatch({ type: "VISIT_PLANET", planetId: planet.id });

        const narration = NARRATION.nearPlanet[planet.id];
        if (narration) {
          dispatch({ type: "SET_NARRATION", text: narration });
        }
      }
    }
  });

  return null;
}

function PlanetSystem({
  characterRef,
}: {
  characterRef: React.RefObject<CharacterRef | null>;
}) {
  const { isPlanetUnlocked } = useStory();
  const characterPosition = useRef(new Vector3());

  useFrame(() => {
    if (characterRef.current) {
      characterPosition.current.copy(characterRef.current.position);
    }
  });

  return (
    <>
      {PLANETS.map((planet) => {
        if (planet.id === "home") return null;

        const hasSubPlanets = planet.subPlanets && planet.subPlanets.length > 0;

        return (
          <group key={planet.id}>
            {/* Main planet (group anchor, visible only if no sub-planets or as the group center) */}
            <Planet
              position={planet.position}
              size={planet.size}
              color={planet.color}
              emissiveColor={planet.emissiveColor}
              atmosphereColor={planet.atmosphereColor}
              rotationSpeed={planet.rotationSpeed}
            />

            {/* Planet-level collectibles (for planets without sub-planets like contact) */}
            {!hasSubPlanets && planet.collectibleCount > 0 && (
              <>
                <CollectibleRing
                  planetId={planet.id}
                  planetCenter={planet.position}
                  planetSize={planet.size}
                  count={planet.collectibleCount}
                  color={planet.emissiveColor}
                  characterPosition={characterPosition}
                />
                <SpaceBillboard
                  planetId={planet.id}
                  sectionKey={planet.sectionKey as "contact"}
                  position={[
                    planet.position[0],
                    planet.position[1] + planet.size + 4,
                    planet.position[2],
                  ]}
                  isUnlocked={isPlanetUnlocked(planet.id)}
                />
              </>
            )}

            {/* Sub-planets */}
            {planet.subPlanets?.map((sub, subIndex) => {
              const worldPos = getSubPlanetWorldPosition(planet, subIndex);
              return (
                <group key={sub.id}>
                  <Planet
                    position={worldPos}
                    size={sub.size}
                    color={sub.color}
                    emissiveColor={sub.emissiveColor}
                    rotationSpeed={planet.rotationSpeed * 1.2}
                  />
                  {sub.collectibleCount > 0 && (
                    <CollectibleRing
                      planetId={sub.id}
                      planetCenter={worldPos}
                      planetSize={sub.size}
                      count={sub.collectibleCount}
                      color={sub.emissiveColor}
                      characterPosition={characterPosition}
                    />
                  )}
                  <SpaceBillboard
                    planetId={sub.id}
                    sectionKey={planet.sectionKey as "capabilities" | "projects" | "labNotes" | "modes"}
                    sectionIndex={sub.sectionIndex}
                    position={[
                      worldPos[0],
                      worldPos[1] + sub.size + 3,
                      worldPos[2],
                    ]}
                    isUnlocked={isPlanetUnlocked(sub.id)}
                  />
                </group>
              );
            })}
          </group>
        );
      })}
    </>
  );
}

function UnlockNarrationHandler() {
  const { state, dispatch } = useStory();
  const lastUnlockedRef = useRef(new Set(state.unlockedPlanets));

  useEffect(() => {
    for (const planetId of state.unlockedPlanets) {
      if (!lastUnlockedRef.current.has(planetId)) {
        const narration = NARRATION.unlock[planetId];
        if (narration) {
          dispatch({ type: "SET_NARRATION", text: narration });
        }
      }
    }
    lastUnlockedRef.current = new Set(state.unlockedPlanets);
  }, [state.unlockedPlanets, dispatch]);

  // Check for completion
  useEffect(() => {
    if (state.phase === "complete") return;

    let allUnlocked = true;
    for (const planet of PLANETS) {
      if (planet.id === "home") continue;
      if (planet.subPlanets) {
        for (const sub of planet.subPlanets) {
          if (sub.collectibleCount > 0 && !state.unlockedPlanets.has(sub.id)) {
            allUnlocked = false;
            break;
          }
        }
      } else if (planet.collectibleCount > 0 && !state.unlockedPlanets.has(planet.id)) {
        allUnlocked = false;
      }
      if (!allUnlocked) break;
    }

    if (allUnlocked && state.phase === "exploring") {
      dispatch({ type: "COMPLETE" });
      dispatch({ type: "SET_NARRATION", text: NARRATION.complete });
    }
  }, [state.unlockedPlanets, state.phase, dispatch]);

  return null;
}

export function ExperienceScene() {
  const characterRef = useRef<CharacterRef>(null);
  const { state } = useStory();

  const controlsEnabled =
    state.phase === "exploring" || state.phase === "complete";

  return (
    <Canvas
      gl={{ antialias: true }}
      camera={{
        fov: CAMERA_SETTINGS.fov,
        near: CAMERA_SETTINGS.near,
        far: CAMERA_SETTINGS.far,
        position: CAMERA_SETTINGS.initialPosition,
      }}
      style={{ width: "100%", height: "100%" }}
    >
      <CameraController characterRef={characterRef} />

      {/* Space lighting */}
      <ambientLight intensity={0.15} />
      <directionalLight
        position={[100, 80, 50]}
        intensity={0.8}
        color="#fff5e6"
      />
      <pointLight position={[0, 50, -200]} intensity={0.4} color="#4a9eff" distance={500} />

      <SpaceEnvironment />
      <AtmosphereEffect characterRef={characterRef} />
      <HomePlanet />
      <Character ref={characterRef} controlsEnabled={controlsEnabled} />
      <PlanetSystem characterRef={characterRef} />
      <GuideTrail />
      <PlanetNarrationTrigger characterRef={characterRef} />
      <UnlockNarrationHandler />

      {/* Home planet billboard (on planet surface, off to the right) */}
      <SpaceBillboard
        planetId="home"
        sectionKey="hero"
        position={[5, 1, 2]}
        isUnlocked={true}
      />
    </Canvas>
  );
}
