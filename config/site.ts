export type IconKey = "layers" | "command" | "sparkles" | "terminal" | "joystick";

export type ModeKey = "web" | "cli" | "immersive";

export const siteConfig = {
  info: {
    owner: "Marcus Custillano",
    siteName: "custillano.dev",
    focusAreas: ["Product Design", "Creative Technology", "Spatial UX"],
    description:
      "A config-driven playground featuring CLI, web, and immersive modes.",
  },
  hero: {
    modeLabel: "Mode · Web",
    eyebrow: "Product Design · Creative Tech · Spatial UX",
    headline: "Designing adaptive experiences with a single source of truth.",
    copy:
      "Pick your interface—CLI, web, or immersive. Each is powered by one configuration file and the same design primitives, so you see the craft, not chaos.",
    primaryCta: {
      label: "Collaborate",
      href: "#contact",
    },
    secondaryCta: {
      label: "Preview modes",
      href: "#modes",
    },
  },
  capabilities: [
    {
      title: "Systems UX",
      description:
        "Journeys, narratives, and flows for thoughtful 2D experiences that still feel alive.",
      icon: "layers",
    },
    {
      title: "Product OS",
      description:
        "Design ops, design tokens, and component governance powered by high-signal config.",
      icon: "command",
    },
    {
      title: "Creative Tech",
      description:
        "WebGL experiments, scroll-triggered narratives, and motion that stays performant.",
      icon: "sparkles",
    },
  ],
  modes: [
    {
      key: "cli",
      label: "CLI Mode",
      title: "Type-first portfolio",
      description:
        "A shadcn-powered terminal for fast navigation, intended for recruiters who want signal fast.",
      href: "/terminal",
      icon: "terminal",
    },
    {
      key: "immersive",
      label: "Immersive Mode",
      title: "Three.js playground",
      description:
        "A gamified trail with spatial UI, interactive prototypes, and shader toys.",
      href: "/experience",
      icon: "joystick",
    },
  ],
  labNotes: [
    {
      title: "Dynamic theming engine",
      copy: "Configurable palettes sync across motion, typography, and even HDRI choices so each mode still feels cohesive.",
    },
    {
      title: "Email bridge",
      copy: "Shared composer component routes messages to the right inbox while keeping the experience inline.",
    },
    {
      title: "Mode-aware telemetry",
      copy: "Simple analytics hooks record which experience resonates to help prioritize future drops.",
    },
  ],
  contact: {
    title: "Tell me about your brief",
    description:
      "The shared email composer will eventually live here. For now, drop a note with your focus and ideal mode.",
    reasons: [
      "Product design collaborations",
      "Creative technology consulting",
      "Speaking or workshop invites",
    ],
    email: "hello@custillano.dev",
    badge: "Open for collaborations",
  },
  projects: [
    {
      name: "Signal Deck",
      summary:
        "Design system and dashboard for portfolio triage teams, focused on clarity and speed.",
      role: "Lead Product Designer",
      stack: ["Next.js", "Radix UI", "Framer Motion"],
      link: "https://example.com",
    },
    {
      name: "Atlas Lab",
      summary:
        "Immersive narrative site showcasing WebGL prototypes and shader explorations.",
      role: "Creative Technologist",
      stack: ["Three.js", "React Three Fiber", "Custom GLSL"],
      link: "https://example.com",
    },
    {
      name: "Courier CLI",
      summary:
        "Terminal interface that mirrors the main portfolio but optimized for key commands.",
      role: "Product Designer & Engineer",
      stack: ["Next.js", "shadcn/ui", "Zustand"],
      link: "https://example.com",
    },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
