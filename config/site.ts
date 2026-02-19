export type IconKey = "layers" | "command" | "sparkles" | "terminal" | "joystick" | "globe";

export type ModeKey = "web" | "cli" | "immersive";

export const siteConfig = {
  info: {
    owner: "Marcus Martillano",
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
      key: "web",
      label: "Web Mode",
      title: "Web-based portfolio",
      description:
        "A web-based portfolio for recruiters who want a more traditional experience.",
      href: "/",
      icon: "globe",
      activeModes: ["cli", "immersive"],
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
      title: "Per-mode contact",
      copy: "Each mode has its own way to reach out — form on web, interactive command on CLI, beacon in immersive.",
    },
    {
      title: "Mode-aware telemetry",
      copy: "Simple analytics hooks record which experience resonates to help prioritize future drops.",
    },
  ],
  contact: {
    title: "Tell me about your brief",
    description:
      "Have a project, collaboration, or idea in mind? Drop a note and I'll get back to you.",
    reasons: [
      "Product design collaborations",
      "Creative technology consulting",
      "Speaking or workshop invites",
    ],
    email: "custillano@gmail.com",
    badge: "Open for collaborations",
  },
  projects: [
    {
      name: "Lesson Planner",
      summary:
        "AI-powered lesson plan generator for Philippine teachers, aligned with MATATAG and major curriculum frameworks. Proudest work: a thread-based UX replacing multi-tab workflows.",
      role: "Maintainer",
      stack: ["Next.js", "Nx", "NestJS", "Datastore NoSQL"],
      link: "https://lessonplanner.org",
    },
    {
      name: "The One Hour Project",
      summary:
        "Exclusive events management platform built for The One Hour Project. Focused on intuitive microanimations and seamless interactions.",
      role: "Product Engineer",
      stack: ["Next.js", "Nx", "NestJS"],
      link: "https://theonehourproject.app",
    },
    {
      name: "Custillano Room",
      summary:
        "A 3D room portfolio built with Blender — where web development started as a way to share 3D art with the world.",
      role: "Designer & Developer",
      stack: ["Three.js", "Blender"],
      link: "https://custillano-room-bokoko33.vercel.app",
    },
    {
      name: "VectorPM",
      summary:
        "AI-augmented project management tool with kanban, gantt, workload dashboard — built in a single day with Symph's rapid development workflow.",
      role: "Full-Stack Engineer",
      stack: ["Next.js", "Firebase"],
      link: "https://vectorpm.io",
    },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
