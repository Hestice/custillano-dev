"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from "react";
import {
  storyReducer,
  createInitialState,
  type StoryState,
  type StoryAction,
} from "./story-reducer";
import { PLANET_UNLOCK_REQUIREMENTS, NARRATION } from "./story-data";
import { PLANET_VISIT_ORDER } from "../planets/planet-layout";

interface StoryContextValue {
  state: StoryState;
  dispatch: (action: StoryAction) => void;
  collectItem: (planetId: string, itemIndex: number) => void;
  isCollected: (planetId: string, itemIndex: number) => boolean;
  getCollectedCount: (planetId: string) => number;
  getTotalForPlanet: (planetId: string) => number;
  isPlanetUnlocked: (planetId: string) => boolean;
}

const StoryContext = createContext<StoryContextValue | null>(null);

export function StoryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(storyReducer, undefined, createInitialState);

  const collectItem = useCallback(
    (planetId: string, itemIndex: number) => {
      dispatch({ type: "COLLECT_ITEM", planetId, itemIndex });

      // Check if all items for this planet are collected
      const currentCollected = state.collectedItems.get(planetId);
      const countAfter = (currentCollected?.size ?? 0) + (currentCollected?.has(itemIndex) ? 0 : 1);
      const required = PLANET_UNLOCK_REQUIREMENTS[planetId] ?? 0;

      // Tutorial first-collect narration
      if (planetId === "tutorial" && countAfter === 1) {
        dispatch({ type: "SET_NARRATION", text: NARRATION.tutorialFirstCollect });
      }

      if (required > 0 && countAfter >= required) {
        dispatch({ type: "UNLOCK_PLANET", planetId });

        // Update suggested next
        const parentKey = planetId.includes("-")
          ? planetId.split("-")[0]
          : planetId;
        const currentIndex = PLANET_VISIT_ORDER.indexOf(
          parentKey as (typeof PLANET_VISIT_ORDER)[number]
        );
        if (currentIndex < PLANET_VISIT_ORDER.length - 1) {
          dispatch({
            type: "SET_SUGGESTED_NEXT",
            planetId: PLANET_VISIT_ORDER[currentIndex + 1],
          });
        }
      }
    },
    [state.collectedItems]
  );

  const isCollected = useCallback(
    (planetId: string, itemIndex: number) => {
      return state.collectedItems.get(planetId)?.has(itemIndex) ?? false;
    },
    [state.collectedItems]
  );

  const getCollectedCount = useCallback(
    (planetId: string) => {
      return state.collectedItems.get(planetId)?.size ?? 0;
    },
    [state.collectedItems]
  );

  const getTotalForPlanet = useCallback((planetId: string) => {
    return PLANET_UNLOCK_REQUIREMENTS[planetId] ?? 0;
  }, []);

  const isPlanetUnlocked = useCallback(
    (planetId: string) => {
      return state.unlockedPlanets.has(planetId);
    },
    [state.unlockedPlanets]
  );

  return (
    <StoryContext.Provider
      value={{
        state,
        dispatch,
        collectItem,
        isCollected,
        getCollectedCount,
        getTotalForPlanet,
        isPlanetUnlocked,
      }}
    >
      {children}
    </StoryContext.Provider>
  );
}

export function useStory() {
  const context = useContext(StoryContext);
  if (!context) {
    throw new Error("useStory must be used within a StoryProvider");
  }
  return context;
}
