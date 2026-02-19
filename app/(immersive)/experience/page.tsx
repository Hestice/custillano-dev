"use client";

import { useCallback, useEffect, useState } from "react";
import { ExperienceScene } from "@/components/modes/immersive/experience-scene";
import { StoryProvider, useStory } from "@/components/modes/immersive/state/story-context";
import { NarrationHud } from "@/components/modes/immersive/hud/narration-hud";
import { ProgressHud } from "@/components/modes/immersive/hud/progress-hud";
import { NARRATION } from "@/components/modes/immersive/state/story-data";

function LaunchOverlay() {
  const { state, dispatch } = useStory();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (state.phase === "intro") {
      dispatch({ type: "SET_NARRATION", text: NARRATION.intro });
      const timer = setTimeout(() => setShowPrompt(true), 4000);
      return () => clearTimeout(timer);
    }
  }, [state.phase, dispatch]);

  const handleLaunch = useCallback(() => {
    dispatch({ type: "LAUNCH" });
    dispatch({ type: "SET_NARRATION", text: NARRATION.launch });
    dispatch({ type: "VISIT_PLANET", planetId: "home" });
  }, [dispatch]);

  useEffect(() => {
    if (!showPrompt || state.phase !== "intro") return;

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleLaunch();
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [showPrompt, state.phase, handleLaunch]);

  if (state.phase !== "intro") return null;

  return (
    <div className="absolute inset-0 z-30 flex items-end justify-center pb-20 pointer-events-none">
      {showPrompt && (
        <button
          onClick={handleLaunch}
          className="pointer-events-auto px-6 py-3 rounded-lg text-white text-sm font-mono animate-pulse cursor-pointer"
          style={{
            background: "rgba(0,0,0,0.7)",
            border: "1px solid rgba(100,200,255,0.3)",
          }}
        >
          Press SPACE to launch
        </button>
      )}
    </div>
  );
}

function ExperienceControls() {
  const { state, isPlanetUnlocked } = useStory();

  if (state.phase === "intro" || state.phase === "launching") return null;

  const tutorialComplete = isPlanetUnlocked("tutorial");

  return (
    <div className="absolute top-4 left-4 z-10 text-white bg-black/50 p-4 rounded">
      <p className="text-sm font-mono">WASD to move</p>
      <p
        className={`text-xs font-mono mt-1 ${
          tutorialComplete ? "text-white/50" : "text-cyan-400/80"
        }`}
      >
        {tutorialComplete
          ? "Collect signals to decode planet transmissions"
          : "Fly toward the Signal Primer ahead"}
      </p>
    </div>
  );
}

export default function ExperiencePage() {
  return (
    <StoryProvider>
      <div className="fixed inset-0 w-full h-full bg-black">
        <ExperienceScene />
        <LaunchOverlay />
        <NarrationHud />
        <ProgressHud />
        <ExperienceControls />
      </div>
    </StoryProvider>
  );
}
