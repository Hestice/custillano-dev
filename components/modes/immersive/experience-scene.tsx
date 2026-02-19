"use client";

import { useRef, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Character, type CharacterRef } from "./character";
import { SpaceEnvironment } from "./environment/space-environment";
import { HomePlanet } from "./planets/home-planet";
import { Planet } from "./planets/planet";
import { CollectibleRing } from "./collectibles/collectible-ring";
import { SpaceBillboard } from "./billboards/space-billboard";
import { GuideTrail } from "./navigation/guide-trail";
import { CAMERA_SETTINGS, PLANET_PROXIMITY_THRESHOLD } from "@/lib/three/constants";
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

  useFrame(() => {
    if (!characterRef.current) return;

    const characterPos = characterRef.current.position;

    // Intro: camera closer. Normal: standard follow
    const isIntro = state.phase === "intro" || state.phase === "launching";
    const offsetY = isIntro ? 5 : 8;
    const offsetZ = isIntro ? 6 : 10;

    const cameraOffset = new Vector3(0, offsetY, offsetZ);
    const targetPosition = new Vector3(
      characterPos.x + cameraOffset.x,
      characterPos.y + cameraOffset.y,
      characterPos.z + cameraOffset.z
    );

    camera.position.lerp(targetPosition, 0.1);
    camera.lookAt(characterPos.x, characterPos.y + 2, characterPos.z);
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
      <HomePlanet />
      <Character ref={characterRef} controlsEnabled={controlsEnabled} />
      <PlanetSystem characterRef={characterRef} />
      <GuideTrail />
      <PlanetNarrationTrigger characterRef={characterRef} />
      <UnlockNarrationHandler />

      {/* Home planet billboard (pre-unlocked) */}
      <SpaceBillboard
        planetId="home"
        sectionKey="hero"
        position={[8, 3, 0]}
        isUnlocked={true}
      />
    </Canvas>
  );
}
