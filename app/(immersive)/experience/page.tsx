"use client";

import { ExperienceScene } from "@/components/modes/immersive/experience-scene";

export default function ExperiencePage() {
  return (
    <div className="fixed inset-0 w-full h-full bg-black">
      <ExperienceScene />
      <div className="absolute top-4 left-4 z-10 text-white bg-black/50 p-4 rounded">
        <p className="text-sm font-mono">WASD to move</p>
      </div>
    </div>
  );
}
