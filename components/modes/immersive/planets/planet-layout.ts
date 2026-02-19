import type { PlanetData } from "@/lib/three/types";

export const PLANET_VISIT_ORDER = [
  "home",
  "capabilities",
  "projects",
  "labNotes",
  "modes",
  "contact",
] as const;

export const PLANETS: PlanetData[] = [
  {
    id: "home",
    name: "Home Planet",
    sectionKey: "hero",
    position: [0, 0, 0],
    size: 8,
    color: "#1a6bb5",
    emissiveColor: "#0d3d6b",
    atmosphereColor: "#87ceeb",
    rotationSpeed: 0.05,
    collectibleCount: 0,
  },
  {
    id: "capabilities",
    name: "Capabilities Nebula",
    sectionKey: "capabilities",
    position: [60, 5, -80],
    size: 3,
    color: "#6c5ce7",
    emissiveColor: "#4834d4",
    atmosphereColor: "#a29bfe",
    rotationSpeed: 0.08,
    collectibleCount: 0,
    subPlanets: [
      {
        id: "capabilities-0",
        name: "Systems UX",
        sectionIndex: 0,
        offset: [-15, -2, -10],
        size: 2.5,
        color: "#e17055",
        emissiveColor: "#d63031",
        collectibleCount: 4,
      },
      {
        id: "capabilities-1",
        name: "Product OS",
        sectionIndex: 1,
        offset: [12, 3, 8],
        size: 2,
        color: "#00b894",
        emissiveColor: "#00a381",
        collectibleCount: 3,
      },
      {
        id: "capabilities-2",
        name: "Creative Tech",
        sectionIndex: 2,
        offset: [5, -4, -18],
        size: 2.8,
        color: "#fdcb6e",
        emissiveColor: "#f9a825",
        collectibleCount: 4,
      },
    ],
  },
  {
    id: "projects",
    name: "Projects System",
    sectionKey: "projects",
    position: [-50, -3, -180],
    size: 4,
    color: "#0984e3",
    emissiveColor: "#0652DD",
    atmosphereColor: "#74b9ff",
    rotationSpeed: 0.06,
    collectibleCount: 0,
    subPlanets: [
      {
        id: "projects-0",
        name: "Signal Deck",
        sectionIndex: 0,
        offset: [-18, 4, -12],
        size: 4,
        color: "#e84393",
        emissiveColor: "#c2185b",
        collectibleCount: 5,
      },
      {
        id: "projects-1",
        name: "Atlas Lab",
        sectionIndex: 1,
        offset: [16, -2, 8],
        size: 4.5,
        color: "#00cec9",
        emissiveColor: "#00a8a3",
        collectibleCount: 4,
      },
      {
        id: "projects-2",
        name: "Courier CLI",
        sectionIndex: 2,
        offset: [2, 5, -20],
        size: 3.5,
        color: "#6c5ce7",
        emissiveColor: "#5f3dc4",
        collectibleCount: 5,
      },
    ],
  },
  {
    id: "labNotes",
    name: "Lab Notes Belt",
    sectionKey: "labNotes",
    position: [70, 8, -260],
    size: 2.5,
    color: "#a0522d",
    emissiveColor: "#8b4513",
    atmosphereColor: "#cd853f",
    rotationSpeed: 0.1,
    collectibleCount: 0,
    subPlanets: [
      {
        id: "labNotes-0",
        name: "Dynamic Theming",
        sectionIndex: 0,
        offset: [-14, -3, -8],
        size: 2.5,
        color: "#795548",
        emissiveColor: "#5d4037",
        collectibleCount: 3,
      },
      {
        id: "labNotes-1",
        name: "Email Bridge",
        sectionIndex: 1,
        offset: [10, 2, 12],
        size: 2,
        color: "#8d6e63",
        emissiveColor: "#6d4c41",
        collectibleCount: 3,
      },
      {
        id: "labNotes-2",
        name: "Mode Telemetry",
        sectionIndex: 2,
        offset: [4, -5, -16],
        size: 2.8,
        color: "#a1887f",
        emissiveColor: "#8d6e63",
        collectibleCount: 3,
      },
    ],
  },
  {
    id: "modes",
    name: "Modes Station",
    sectionKey: "modes",
    position: [-30, -5, -340],
    size: 3.5,
    color: "#636e72",
    emissiveColor: "#2d3436",
    atmosphereColor: "#b2bec3",
    rotationSpeed: 0.04,
    collectibleCount: 0,
    subPlanets: [
      {
        id: "modes-0",
        name: "CLI Mode",
        sectionIndex: 0,
        offset: [-16, 3, -10],
        size: 3,
        color: "#00b894",
        emissiveColor: "#00a381",
        collectibleCount: 4,
      },
      {
        id: "modes-1",
        name: "Web Mode",
        sectionIndex: 1,
        offset: [14, -2, 6],
        size: 3.5,
        color: "#0984e3",
        emissiveColor: "#0652DD",
        collectibleCount: 3,
      },
      {
        id: "modes-2",
        name: "Immersive Mode",
        sectionIndex: 2,
        offset: [0, 4, -18],
        size: 4,
        color: "#6c5ce7",
        emissiveColor: "#5f3dc4",
        collectibleCount: 4,
      },
    ],
  },
  {
    id: "contact",
    name: "Contact Beacon",
    sectionKey: "contact",
    position: [0, 3, -420],
    size: 3,
    color: "#ffeaa7",
    emissiveColor: "#fdcb6e",
    atmosphereColor: "#fff3b0",
    rotationSpeed: 0.12,
    collectibleCount: 3,
  },
];

export function getPlanetById(id: string): PlanetData | undefined {
  return PLANETS.find((p) => p.id === id);
}

export function getSubPlanetWorldPosition(
  planet: PlanetData,
  subIndex: number
): [number, number, number] {
  const sub = planet.subPlanets?.[subIndex];
  if (!sub) return planet.position;
  return [
    planet.position[0] + sub.offset[0],
    planet.position[1] + sub.offset[1],
    planet.position[2] + sub.offset[2],
  ];
}

export function getAllCollectiblePlanetIds(): string[] {
  const ids: string[] = [];
  for (const planet of PLANETS) {
    if (planet.collectibleCount > 0) {
      ids.push(planet.id);
    }
    if (planet.subPlanets) {
      for (const sub of planet.subPlanets) {
        if (sub.collectibleCount > 0) {
          ids.push(sub.id);
        }
      }
    }
  }
  return ids;
}

export function getTotalCollectibles(): number {
  let total = 0;
  for (const planet of PLANETS) {
    total += planet.collectibleCount;
    if (planet.subPlanets) {
      for (const sub of planet.subPlanets) {
        total += sub.collectibleCount;
      }
    }
  }
  return total;
}
