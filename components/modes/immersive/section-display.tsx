"use client";

import { useMemo } from "react";
import { Text } from "@react-three/drei";
import { siteConfig } from "@/config/site";
import { SECTION_SPACING, SECTION_HEIGHT } from "@/lib/three/constants";
import { createSectionPosition, getGridPosition } from "@/lib/three/utils";
import type { SectionData } from "@/lib/three/types";

interface SectionObjectProps {
  section: SectionData;
}

function SectionObject({ section }: SectionObjectProps) {
  const [x, y, z] = section.position.position;

  return (
    <group position={[x, y, z]}>
      <mesh position={[0, SECTION_HEIGHT / 2, 0]} castShadow>
        <boxGeometry args={[3, SECTION_HEIGHT, 3]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
      <Text
        position={[0, SECTION_HEIGHT + 1, 0]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={10}
      >
        {section.title}
      </Text>
    </group>
  );
}

export function getAllSections(): SectionData[] {
  const sections: SectionData[] = [];

  const baseZ = -30;

  sections.push({
    id: "info",
    title: siteConfig.info.siteName,
    description: siteConfig.info.description,
    position: createSectionPosition(0, baseZ + 20, 0),
  });

  sections.push({
    id: "hero",
    title: "Hero",
    description: siteConfig.hero.headline,
    position: createSectionPosition(0, baseZ + 10, 0),
  });

  siteConfig.capabilities.forEach((cap, index) => {
    const x = getGridPosition(index, siteConfig.capabilities.length, SECTION_SPACING);
    sections.push({
      id: `capability-${index}`,
      title: cap.title,
      description: cap.description,
      position: createSectionPosition(x, baseZ, 0),
    });
  });

  siteConfig.modes.forEach((mode, index) => {
    const x = getGridPosition(index, siteConfig.modes.length, SECTION_SPACING);
    sections.push({
      id: `mode-${index}`,
      title: mode.title,
      description: mode.description,
      position: createSectionPosition(x, baseZ - 15, 0),
    });
  });

  siteConfig.labNotes.forEach((note, index) => {
    const x = getGridPosition(index, siteConfig.labNotes.length, SECTION_SPACING);
    sections.push({
      id: `lab-${index}`,
      title: note.title,
      description: note.copy,
      position: createSectionPosition(x, baseZ - 30, 0),
    });
  });

  sections.push({
    id: "contact",
    title: siteConfig.contact.title,
    description: siteConfig.contact.description,
    position: createSectionPosition(0, baseZ - 45, 0),
  });

  siteConfig.projects.forEach((project, index) => {
    const x = getGridPosition(index, siteConfig.projects.length, SECTION_SPACING);
    sections.push({
      id: `project-${index}`,
      title: project.name,
      description: project.summary,
      position: createSectionPosition(x, baseZ - 60, 0),
    });
  });

  return sections;
}

export function SectionDisplays() {
  const sections = useMemo(() => getAllSections(), []);

  return (
    <>
      {sections.map((section) => (
        <SectionObject key={section.id} section={section} />
      ))}
    </>
  );
}
