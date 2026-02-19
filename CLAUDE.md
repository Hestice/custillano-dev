# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Next.js dev server
npm run build     # Production build
npm run lint      # ESLint (flat config, v9)
npm run start     # Start production server
```

No test runner is configured yet. Test directories exist at `tests/components/` and `tests/integration/` but are empty.

## Architecture

This is a **multi-mode personal portfolio** (custillano.dev) built with Next.js 16 App Router. It presents the same content through three distinct UI experiences, all driven by a single configuration source.

### Three Modes

| Mode | Route Group | Route | Key Tech |
|------|------------|-------|----------|
| Web | `app/(web)/` | `/` | Standard editorial layout with sections |
| CLI | `app/(cli)/` | `/terminal` | Simulated terminal with virtual filesystem |
| Immersive | `app/(immersive)/` | `/experience` | React Three Fiber 3D scene with character controller |

### Config-Driven Content

`config/site.ts` is the single source of truth. All modes read from `siteConfig` (exported `as const` for literal types). To update content, edit this file — mode components consume it directly.

### Key Directories

- **`components/modes/{cli,web,immersive}/`** — Mode-specific component shells
- **`components/shared/`** — Cross-mode components (email composer)
- **`components/ui/`** — shadcn/ui primitives (generated via CLI, style: new-york)
- **`lib/three/`** — R3F utilities: constants (physics values, scene settings), keyboard controls hook, types, helpers
- **`lib/terminal/`** — Virtual filesystem, command registry, parser, autocomplete
- **`providers/theme/`** — next-themes wrapper for dark/light mode
- **`docs/`** — Architecture docs, setup guides, command references

### 3D Experience (Immersive Mode)

The R3F scene (`components/modes/immersive/`) features:
- A controllable character with acceleration/deceleration physics
- Third-person camera with smooth lerp following
- WASD keyboard controls (normalized to prevent diagonal speed boost)
- JetEffect particle system and trail visuals
- Scene constants defined in `lib/three/constants.ts`

### Terminal Mode

A simulated filesystem generated from `siteConfig`. Commands are registered in `lib/terminal/commands.ts` with a name/description/aliases/effect pattern. The command parser is case-insensitive and supports async commands.

## Conventions

- **Path alias**: `@/*` maps to project root (e.g., `@/components/ui/button`)
- **Client components**: Use `"use client"` directive only for interactive components; default to server components
- **Styling**: Tailwind 4 with OKLCH color space tokens in `globals.css`. Use `cn()` from `lib/utils.ts` for conditional class merging
- **File naming**: kebab-case for files, PascalCase for components, UPPER_CASE for constants
- **shadcn/ui**: Components added via CLI land in `components/ui/`. Do not manually edit generated primitives
- **Branching**: `development` is the main branch; current release branch is `release/v1.0.0`

## External Services

- **Supabase**: Database and edge functions (email sending via Resend API). Config in `.env`. Edge functions in `supabase/functions/`.
