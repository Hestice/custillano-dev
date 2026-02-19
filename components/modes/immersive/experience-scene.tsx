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
import { BlackHole } from "./effects/black-hole";
import { ProjectBlackHole } from "./effects/project-black-hole";
import { CAMERA_SETTINGS, LAUNCH, POI_FOCUS_RADIUS, POI_MAX_BLEND, POI_LOCK_HYSTERESIS, BLACK_HOLE, PROJECT_BLACK_HOLE } from "@/lib/three/constants";
import { siteConfig } from "@/config/site";
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

  // POI camera focus state
  const poiBlend = useRef(0);
  const poiLockedId = useRef<string | null>(null);
  const poiLockedDist = useRef(Infinity);
  const lookAtTarget = useRef(new Vector3());
  const lookAtInitialized = useRef(false);

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

    // Default lookAt target
    const defaultLookAt = new Vector3(characterPos.x, characterPos.y + 1, characterPos.z);

    // Absorption phase: cinematic pull-back toward black hole
    if (state.phase === "absorbed") {
      const bhCenter = new Vector3(...BLACK_HOLE.position);
      const cinematicPos = new Vector3(
        bhCenter.x,
        bhCenter.y + 12,
        bhCenter.z + 15
      );
      camera.position.lerp(cinematicPos, 0.03);
      const cinematicLookAt = new Vector3(
        bhCenter.x,
        bhCenter.y,
        bhCenter.z
      );
      lookAtTarget.current.lerp(cinematicLookAt, 0.05);
      camera.lookAt(lookAtTarget.current);
      return;
    }

    // POI focus (exploring phase only)
    const isExploring = launchPhase === "flying" && (state.phase === "exploring" || state.phase === "complete");

    if (isExploring) {
      // Find nearest planet/sub-planet in XZ
      let nearestId: string | null = null;
      let nearestDist = Infinity;
      let nearestBillboardPos: [number, number, number] | null = null;

      for (const planet of PLANETS) {
        if (planet.id === "home") continue;

        const checkPOI = (id: string, pos: [number, number, number], size: number) => {
          const dx = characterPos.x - pos[0];
          const dz = characterPos.z - pos[2];
          const distXZ = Math.sqrt(dx * dx + dz * dz);

          if (distXZ < POI_FOCUS_RADIUS && distXZ < nearestDist) {
            nearestDist = distXZ;
            nearestId = id;
            nearestBillboardPos = [pos[0], pos[1] + size + 3, pos[2]];
          }
        };

        if (planet.subPlanets && planet.subPlanets.length > 0) {
          for (let si = 0; si < planet.subPlanets.length; si++) {
            const sub = planet.subPlanets[si];
            const worldPos = getSubPlanetWorldPosition(planet, si);
            checkPOI(sub.id, worldPos, sub.size);
          }
        } else if (planet.collectibleCount > 0) {
          checkPOI(planet.id, planet.position, planet.size);
        }

        // Always check main planet for billboard-bearing planets without sub-planets
        // Main planets with sub-planets don't have their own billboard
      }

      // Hysteresis: current lock stays unless a new one is significantly closer
      if (poiLockedId.current && nearestId !== poiLockedId.current) {
        if (nearestDist > poiLockedDist.current * POI_LOCK_HYSTERESIS) {
          // Keep current lock
          nearestId = poiLockedId.current;
          nearestDist = poiLockedDist.current;
          // But we need the billboard pos for the locked planet — recalculate
          nearestBillboardPos = null;
          for (const planet of PLANETS) {
            if (planet.subPlanets) {
              for (let si = 0; si < planet.subPlanets.length; si++) {
                if (planet.subPlanets[si].id === poiLockedId.current) {
                  const wp = getSubPlanetWorldPosition(planet, si);
                  nearestBillboardPos = [wp[0], wp[1] + planet.subPlanets[si].size + 3, wp[2]];
                  // Update locked distance with actual current distance
                  const dx = characterPos.x - wp[0];
                  const dz = characterPos.z - wp[2];
                  nearestDist = Math.sqrt(dx * dx + dz * dz);
                }
              }
            } else if (planet.id === poiLockedId.current) {
              nearestBillboardPos = [planet.position[0], planet.position[1] + planet.size + 3, planet.position[2]];
              const dx = characterPos.x - planet.position[0];
              const dz = characterPos.z - planet.position[2];
              nearestDist = Math.sqrt(dx * dx + dz * dz);
            }
          }
          // If locked planet went out of focus radius, release
          if (nearestDist >= POI_FOCUS_RADIUS) {
            nearestId = null;
            nearestBillboardPos = null;
          }
        }
      }

      poiLockedId.current = nearestId;
      poiLockedDist.current = nearestDist;

      // Compute target blend
      let targetBlend = 0;
      if (nearestId && nearestBillboardPos && nearestDist < POI_FOCUS_RADIUS) {
        // Closer = stronger blend, max POI_MAX_BLEND
        targetBlend = POI_MAX_BLEND * (1 - nearestDist / POI_FOCUS_RADIUS);
      }

      // Smooth ramp blend
      poiBlend.current += (targetBlend - poiBlend.current) * 0.05;

      // Compute blended lookAt
      if (poiBlend.current > 0.001 && nearestBillboardPos) {
        const blend = poiBlend.current;
        // XZ shifts 30% toward billboard, Y shifts 15%
        const focusX = defaultLookAt.x + (nearestBillboardPos[0] - defaultLookAt.x) * blend;
        const focusY = defaultLookAt.y + (nearestBillboardPos[1] - defaultLookAt.y) * blend;
        const focusZ = defaultLookAt.z + (nearestBillboardPos[2] - defaultLookAt.z) * blend;

        if (!lookAtInitialized.current) {
          lookAtTarget.current.set(focusX, focusY, focusZ);
          lookAtInitialized.current = true;
        } else {
          lookAtTarget.current.lerp(new Vector3(focusX, focusY, focusZ), 0.08);
        }

        camera.lookAt(lookAtTarget.current);
      } else {
        if (!lookAtInitialized.current) {
          lookAtTarget.current.copy(defaultLookAt);
          lookAtInitialized.current = true;
        } else {
          lookAtTarget.current.lerp(defaultLookAt, 0.08);
        }
        camera.lookAt(lookAtTarget.current);
      }
    } else {
      // Non-exploring phases: direct lookAt
      camera.lookAt(defaultLookAt);
      lookAtTarget.current.copy(defaultLookAt);
      lookAtInitialized.current = true;
      poiBlend.current = 0;
      poiLockedId.current = null;
      poiLockedDist.current = Infinity;
    }
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
  const { state, isPlanetUnlocked, getCollectedCount, getTotalForPlanet } = useStory();
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

        const showBillboards = state.phase === "exploring" || state.phase === "complete";

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
              <CollectibleRing
                planetId={planet.id}
                planetCenter={planet.position}
                planetSize={planet.size}
                count={planet.collectibleCount}
                color={planet.emissiveColor}
                characterPosition={characterPosition}
              />
            )}
            {showBillboards && !hasSubPlanets && planet.collectibleCount > 0 && (
              <SpaceBillboard
                planetId={planet.id}
                sectionKey={planet.sectionKey as "contact" | "tutorial"}
                position={[
                  planet.position[0],
                  planet.position[1] + planet.size + 4,
                  planet.position[2],
                ]}
                isUnlocked={isPlanetUnlocked(planet.id)}
                planetName={planet.name}
                collectedCount={getCollectedCount(planet.id)}
                totalRequired={getTotalForPlanet(planet.id)}
                characterPosition={characterPosition}
              />
            )}

            {/* Sub-planets */}
            {planet.subPlanets?.map((sub, subIndex) => {
              const worldPos = getSubPlanetWorldPosition(planet, subIndex);

              // Compute project blackhole position (offset away from parent planet center)
              const isProjectPlanet = planet.sectionKey === "projects";
              const project = isProjectPlanet ? siteConfig.projects[sub.sectionIndex] : undefined;
              let blackHolePos: [number, number, number] | undefined;
              if (isProjectPlanet && project) {
                const dirX = sub.offset[0];
                const dirZ = sub.offset[2];
                const len = Math.sqrt(dirX * dirX + dirZ * dirZ) || 1;
                blackHolePos = [
                  worldPos[0] + (dirX / len) * PROJECT_BLACK_HOLE.offsetFromPlanet,
                  worldPos[1],
                  worldPos[2] + (dirZ / len) * PROJECT_BLACK_HOLE.offsetFromPlanet,
                ];
              }

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
                  {showBillboards && (
                    <SpaceBillboard
                      planetId={sub.id}
                      sectionKey={planet.sectionKey as "capabilities" | "projects" | "howIWork" | "modes"}
                      sectionIndex={sub.sectionIndex}
                      position={[
                        worldPos[0],
                        worldPos[1] + sub.size + 3,
                        worldPos[2],
                      ]}
                      isUnlocked={isPlanetUnlocked(sub.id)}
                      planetName={sub.name}
                      collectedCount={getCollectedCount(sub.id)}
                      totalRequired={getTotalForPlanet(sub.id)}
                      characterPosition={characterPosition}
                    />
                  )}
                  {isProjectPlanet && project && blackHolePos && (
                    <ProjectBlackHole
                      position={blackHolePos}
                      link={project.link}
                      color={sub.color}
                      visible={isPlanetUnlocked(sub.id)}
                      characterRef={characterRef}
                    />
                  )}
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
  const { state, isPlanetUnlocked } = useStory();

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
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[100, 80, 50]}
        intensity={1.2}
        color="#fff5e6"
      />
      <pointLight position={[0, 50, -200]} intensity={0.5} color="#4a9eff" distance={500} />

      <SpaceEnvironment />
      <AtmosphereEffect characterRef={characterRef} />
      <HomePlanet characterRef={characterRef} />
      <Character ref={characterRef} controlsEnabled={controlsEnabled} />
      <PlanetSystem characterRef={characterRef} />
      <BlackHole
        characterRef={characterRef}
        visible={isPlanetUnlocked("contact")}
      />
      <GuideTrail />
      <PlanetNarrationTrigger characterRef={characterRef} />
      <UnlockNarrationHandler />
    </Canvas>
  );
}
