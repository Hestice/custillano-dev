export const NARRATION = {
  intro:
    "Welcome to custillano.dev. I'm Marcus — product designer and creative technologist. Explore this universe to discover my work.",
  launch: "Systems online. Let's explore.",
  nearPlanet: {
    tutorial:
      "Signal Primer ahead. See those orbiting signals? Fly close to collect them.",
    capabilities:
      "The Capabilities Nebula — where craft meets systems thinking.",
    projects: "The Projects System — built work orbiting real problems.",
    howIWork: "The How I Work orbit — the principles behind every project.",
    modes:
      "Modes Station — three ways to experience the same portfolio, same source.",
    contact:
      "The Contact Beacon — ready to connect? Collect the signals to open the channel.",
    blackHole:
      "A rift in space... something pulls you toward it.",
  } as Record<string, string>,
  tutorialFirstCollect:
    "Signal acquired. One more to decode the transmission.",
  unlock: {
    tutorial:
      "First transmission decoded. Follow the trail — the Capabilities Nebula awaits.",
    "capabilities-0": "Systems UX decoded.",
    "capabilities-1": "Product OS online.",
    "capabilities-2": "Creative Tech unlocked.",
    "projects-0": "Lesson Planner decrypted.",
    "projects-1": "The One Hour Project unlocked.",
    "projects-2": "Custillano Room activated.",
    "projects-3": "VectorPM online.",
    "howIWork-0": "Problem-First Thinking decoded.",
    "howIWork-1": "AI-Augmented Delivery online.",
    "howIWork-2": "Multi-Angle Solutions unlocked.",
    "howIWork-3": "Security by Default activated.",
    "howIWork-4": "Iterative & Transparent loaded.",
    "howIWork-5": "Ship-Ready Quality confirmed.",
    "modes-0": "CLI Mode revealed.",
    "modes-1": "Web Mode revealed.",
    "modes-2": "Immersive Mode revealed.",
    contact:
      "Contact channel open. A rift has formed nearby... something pulls you toward it.",
  } as Record<string, string>,
  complete:
    "All transmissions decoded. The rift deepens — the singularity awaits.",
  absorbed:
    "Crossing the event horizon...",
} as const;

export const PLANET_UNLOCK_REQUIREMENTS: Record<string, number> = {};

// Auto-populate: each planet/sub-planet requires collecting ALL its items
import { PLANETS } from "../planets/planet-layout";

for (const planet of PLANETS) {
  if (planet.collectibleCount > 0) {
    PLANET_UNLOCK_REQUIREMENTS[planet.id] = planet.collectibleCount;
  }
  if (planet.subPlanets) {
    for (const sub of planet.subPlanets) {
      if (sub.collectibleCount > 0) {
        PLANET_UNLOCK_REQUIREMENTS[sub.id] = sub.collectibleCount;
      }
    }
  }
}

export const PLANET_NARRATION_RADIUS = 60;
