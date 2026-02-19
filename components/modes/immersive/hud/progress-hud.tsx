"use client";

import { useStory } from "../state/story-context";
import { PLANETS, getTotalCollectibles } from "../planets/planet-layout";

export function ProgressHud() {
  const { state, isPlanetUnlocked } = useStory();

  const totalCollectibles = getTotalCollectibles();
  let collectedCount = 0;
  for (const items of state.collectedItems.values()) {
    collectedCount += items.size;
  }

  const planetsVisited = state.visitedPlanets.size;
  const totalPlanets = PLANETS.length;

  return (
    <div className="absolute top-4 right-4 z-20 pointer-events-none">
      <div
        className="px-4 py-3 rounded-lg min-w-[180px]"
        style={{
          background: "rgba(0,0,0,0.7)",
          border: "1px solid rgba(100,150,255,0.15)",
        }}
      >
        <div className="text-[10px] uppercase tracking-widest text-blue-400 mb-2">
          Exploration
        </div>
        <div className="flex justify-between text-xs text-white/70 mb-1">
          <span>Planets</span>
          <span className="font-mono text-white">
            {planetsVisited}/{totalPlanets}
          </span>
        </div>
        <div className="flex justify-between text-xs text-white/70 mb-3">
          <span>Signals</span>
          <span className="font-mono text-white">
            {collectedCount}/{totalCollectibles}
          </span>
        </div>
        <div className="space-y-1">
          {PLANETS.map((planet) => {
            const unlocked = isPlanetUnlocked(planet.id);
            const visited = state.visitedPlanets.has(planet.id);
            return (
              <div
                key={planet.id}
                className="flex items-center gap-2 text-[10px]"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    unlocked
                      ? "bg-emerald-400"
                      : visited
                        ? "bg-yellow-400"
                        : "bg-white/20"
                  }`}
                />
                <span
                  className={
                    unlocked
                      ? "text-white"
                      : visited
                        ? "text-white/60"
                        : "text-white/30"
                  }
                >
                  {planet.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
