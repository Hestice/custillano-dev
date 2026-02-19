"use client";

import { useState, useEffect } from "react";
import { useStory } from "../state/story-context";
import { PLANETS, getTotalCollectibles } from "../planets/planet-layout";
import { useTouchDevice } from "@/lib/hooks/use-touch-device";

export function ProgressHud() {
  const { state, isPlanetUnlocked } = useStory();
  const isTouch = useTouchDevice();
  const [collapsed, setCollapsed] = useState(isTouch);

  const totalCollectibles = getTotalCollectibles();
  let collectedCount = 0;
  for (const items of state.collectedItems.values()) {
    collectedCount += items.size;
  }

  const planetsVisited = state.visitedPlanets.size;
  const totalPlanets = PLANETS.length;

  // Sync if isTouch resolves after initial render
  useEffect(() => {
    if (isTouch) setCollapsed(true);
  }, [isTouch]);

  if (collapsed) {
    return (
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setCollapsed(false)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 active:bg-white/10 cursor-pointer"
          style={{
            background: "rgba(0,0,0,0.6)",
            border: "1px solid rgba(100,150,255,0.15)",
          }}
          aria-label="Show exploration progress"
        >
          <span className="text-[10px] uppercase tracking-widest text-blue-400">
            Exploration
          </span>
          <span className="font-mono text-xs text-white">
            {planetsVisited}/{totalPlanets}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-4 right-4 z-20">
      <div
        className="px-4 py-3 rounded-lg min-w-[180px] cursor-pointer"
        style={{
          background: "rgba(0,0,0,0.7)",
          border: "1px solid rgba(100,150,255,0.15)",
        }}
        onClick={isTouch ? () => setCollapsed(true) : undefined}
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
        {isTouch && (
          <p className="text-[10px] font-mono mt-2 text-white/30">
            Tap to dismiss
          </p>
        )}
      </div>
    </div>
  );
}
