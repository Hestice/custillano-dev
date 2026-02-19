"use client";

import { siteConfig } from "@/config/site";

type SectionType =
  | "hero"
  | "tutorial"
  | "capabilities"
  | "projects"
  | "labNotes"
  | "modes"
  | "contact";

interface BillboardContentProps {
  planetId: string;
  sectionKey: SectionType;
  sectionIndex?: number;
}

export function BillboardContent({
  planetId,
  sectionKey,
  sectionIndex,
}: BillboardContentProps) {
  if (sectionKey === "tutorial") {
    return (
      <div className="w-[240px] p-4 text-white">
        <p className="text-[10px] uppercase tracking-widest text-cyan-400 mb-1">
          Signal Primer
        </p>
        <h3 className="text-sm font-bold mb-2">How Exploration Works</h3>
        <p className="text-[11px] opacity-80 leading-relaxed">
          Each planet holds encrypted transmissions. Collect the orbiting signals nearby to decode them and reveal what&apos;s inside. Follow the guide trail to the next destination.
        </p>
      </div>
    );
  }

  if (sectionKey === "hero" || planetId === "home") {
    return (
      <div className="w-[280px] p-4 text-white">
        <p className="text-[10px] uppercase tracking-widest text-emerald-400 mb-1">
          {siteConfig.hero.eyebrow}
        </p>
        <h3 className="text-sm font-bold mb-2 leading-tight">
          {siteConfig.hero.headline}
        </h3>
        <p className="text-[11px] opacity-80 leading-relaxed">
          {siteConfig.hero.copy}
        </p>
      </div>
    );
  }

  if (sectionKey === "capabilities" && sectionIndex !== undefined) {
    const cap = siteConfig.capabilities[sectionIndex];
    if (!cap) return null;
    return (
      <div className="w-[240px] p-4 text-white">
        <h3 className="text-sm font-bold mb-2">{cap.title}</h3>
        <p className="text-[11px] opacity-80 leading-relaxed">
          {cap.description}
        </p>
      </div>
    );
  }

  if (sectionKey === "projects" && sectionIndex !== undefined) {
    const project = siteConfig.projects[sectionIndex];
    if (!project) return null;
    return (
      <div className="w-[280px] p-4 text-white">
        <h3 className="text-sm font-bold mb-1">{project.name}</h3>
        <p className="text-[10px] text-blue-400 mb-2">{project.role}</p>
        <p className="text-[11px] opacity-80 leading-relaxed mb-2">
          {project.summary}
        </p>
        <div className="flex flex-wrap gap-1">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="text-[9px] px-1.5 py-0.5 bg-white/10 rounded"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (sectionKey === "labNotes" && sectionIndex !== undefined) {
    const note = siteConfig.labNotes[sectionIndex];
    if (!note) return null;
    return (
      <div className="w-[240px] p-4 text-white">
        <h3 className="text-sm font-bold mb-2">{note.title}</h3>
        <p className="text-[11px] opacity-80 leading-relaxed">{note.copy}</p>
      </div>
    );
  }

  if (sectionKey === "modes" && sectionIndex !== undefined) {
    const mode = siteConfig.modes[sectionIndex];
    if (!mode) return null;
    return (
      <div className="w-[240px] p-4 text-white">
        <p className="text-[10px] uppercase tracking-wider text-purple-400 mb-1">
          {mode.label}
        </p>
        <h3 className="text-sm font-bold mb-2">{mode.title}</h3>
        <p className="text-[11px] opacity-80 leading-relaxed">
          {mode.description}
        </p>
      </div>
    );
  }

  if (sectionKey === "contact") {
    return (
      <div className="w-[260px] p-4 text-white">
        <p className="text-[10px] uppercase tracking-widest text-purple-400 mb-1">
          Channel Open
        </p>
        <h3 className="text-sm font-bold mb-2">Contact Channel Open</h3>
        <p className="text-[11px] opacity-80 leading-relaxed mb-3">
          A spatial rift has appeared beyond this beacon. Fly toward it to open a direct line of communication.
        </p>
        <div className="space-y-1">
          {siteConfig.contact.reasons.map((reason) => (
            <p key={reason} className="text-[10px] text-purple-400">
              &bull; {reason}
            </p>
          ))}
        </div>
        <p className="text-[10px] mt-2 text-purple-300 animate-pulse">
          The singularity awaits...
        </p>
      </div>
    );
  }

  return null;
}
