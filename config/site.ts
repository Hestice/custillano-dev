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
    headline: "I design products that feel right and ship clean.",
    copy:
      "From product design to creative technology, I build adaptive experiences that solve real problems. Let's talk about yours.",
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
  howIWork: [
    {
      title: "Problem-First Thinking",
      copy: "High-level planning where most of the work is figuring out what the real problem is. A problem well-identified is a problem half-solved.",
    },
    {
      title: "AI-Augmented Delivery",
      copy: "AI handles the repetitive nitty-gritty so I can focus on what matters: talking with the client and making strategic decisions.",
    },
    {
      title: "Multi-Angle Solutions",
      copy: "I draft multiple approaches with a clear recommendation, but nothing is set in stone. Client input is always part of the process.",
    },
    {
      title: "Security by Default",
      copy: "Every system I build is hardened from the start. Auth flows, data handling, and infra are reviewed against real-world threat models.",
    },
    {
      title: "Iterative & Transparent",
      copy: "Regular check-ins, async updates, and working demos over slide decks. You see progress, not just promises.",
    },
    {
      title: "Ship-Ready Quality",
      copy: "I care about what happens after handoff. Clean code, documented decisions, and infra that the next engineer can actually maintain.",
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
        "A 3D room portfolio built with Blender, where web development started as a way to share 3D art with the world.",
      role: "Designer & Developer",
      stack: ["Three.js", "Blender"],
      link: "https://custillano-room-bokoko33.vercel.app",
    },
    {
      name: "VectorPM",
      summary:
        "AI-augmented project management tool with kanban, gantt, workload dashboard, built in a single day with Symph's rapid development workflow.",
      role: "Full-Stack Engineer",
      stack: ["Next.js", "Firebase"],
      link: "https://vectorpm.io",
    },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
