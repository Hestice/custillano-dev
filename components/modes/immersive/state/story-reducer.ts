export interface StoryState {
  phase: "intro" | "launching" | "exploring" | "complete" | "absorbed";
  visitedPlanets: Set<string>;
  collectedItems: Map<string, Set<number>>;
  unlockedPlanets: Set<string>;
  currentNarration: string | null;
  suggestedNext: string | null;
}

export type StoryAction =
  | { type: "LAUNCH" }
  | { type: "START_EXPLORING" }
  | { type: "VISIT_PLANET"; planetId: string }
  | { type: "COLLECT_ITEM"; planetId: string; itemIndex: number }
  | { type: "UNLOCK_PLANET"; planetId: string }
  | { type: "SET_NARRATION"; text: string | null }
  | { type: "SET_SUGGESTED_NEXT"; planetId: string | null }
  | { type: "COMPLETE" }
  | { type: "ENTER_BLACK_HOLE" };

export function createInitialState(): StoryState {
  return {
    phase: "intro",
    visitedPlanets: new Set(),
    collectedItems: new Map(),
    unlockedPlanets: new Set(["home"]),
    currentNarration: null,
    suggestedNext: "tutorial",
  };
}

export function storyReducer(
  state: StoryState,
  action: StoryAction
): StoryState {
  switch (action.type) {
    case "LAUNCH":
      return { ...state, phase: "launching" };

    case "START_EXPLORING":
      return { ...state, phase: "exploring" };

    case "VISIT_PLANET": {
      const visited = new Set(state.visitedPlanets);
      visited.add(action.planetId);
      return { ...state, visitedPlanets: visited };
    }

    case "COLLECT_ITEM": {
      const items = new Map(state.collectedItems);
      const planetItems = new Set(items.get(action.planetId) ?? []);
      planetItems.add(action.itemIndex);
      items.set(action.planetId, planetItems);
      return { ...state, collectedItems: items };
    }

    case "UNLOCK_PLANET": {
      const unlocked = new Set(state.unlockedPlanets);
      unlocked.add(action.planetId);
      return { ...state, unlockedPlanets: unlocked };
    }

    case "SET_NARRATION":
      return { ...state, currentNarration: action.text };

    case "SET_SUGGESTED_NEXT":
      return { ...state, suggestedNext: action.planetId };

    case "COMPLETE":
      return { ...state, phase: "complete", suggestedNext: null };

    case "ENTER_BLACK_HOLE":
      return { ...state, phase: "absorbed" };

    default:
      return state;
  }
}
