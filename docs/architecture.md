# Architecture Overview

This project hosts three UI modes (CLI, web, immersive) that are all powered by
one configuration source and a shared design system. The structure below keeps
each experience isolated while letting primitives, providers, and utilities stay
centralized.

## Directory Map

| Path | Purpose |
| --- | --- |
| `app/` | App Router entry point. Holds global layout plus route groups for each mode. |
| `app/(web)/` | Default editorial experience rendered at `/`. |
| `app/(cli)/` | Terminal-inspired interface for fast navigation. |
| `app/(immersive)/` | Three.js playground / spatial journey. |
| `app/api/` | Edge/serverless routes (email endpoint, telemetry, etc.). |
| `components/` | UI building blocks. Split into shared primitives, theme widgets, sections, and per-mode shells. |
| `components/ui/` | shadcn/ui generated primitives (button, card, etc.). |
| `config/` | Source of truth for mode metadata, content, and feature flags. |
| `lib/` | Framework-agnostic helpers (mode resolver, theme helpers, email utilities, Three.js bootstrapping). |
| `providers/` | React providers for theme toggling, config context, and mode state. |
| `public/assets/` | Static assets, grouped by mode (`cli`, `web`, `immersive`). |
| `styles/` | Global CSS/tokens overrides beyond `app/globals.css`. |
| `tests/` | Component/integration tests. Organize by feature or mode. |
| `docs/` | Documentation (this file, onboarding notes, playbooks). |

## Render Flow

1. **Mode resolver** (planned in `lib/` + `providers/mode/`) reads the config to
   decide which UI surface to render. This can respond to a query param,
   sub-route, or future personalization signal.
2. **Layout** (`app/layout.tsx`) wraps every page with font/theme providers.
   Additional providers (theme, mode, config) will mount here to keep context
   consistent between routes.
3. **Route groups** (`app/(web)`, etc.) export their own layout/page trees so
   each mode can opt into different loading states, metadata, and component
   compositions while sharing primitives from `components/`.
4. **Shared primitives** (buttons, cards, badges, etc.) live in
   `components/ui/` and `components/shared/`. Mode-specific shells compose those
   primitives with unique layouts.
5. **Config-driven content**: future `config/ui-modes.ts` (or similar) will hold
   text, sections, and feature flags so updating copy or adding a new mode does
   not require touching route code.

## Adding a New Mode

1. Duplicate an existing route group under `app/(new-mode)/`.
2. Create any unique shells under `components/modes/<new-mode>/`.
3. Extend the shared config with the new mode’s metadata and add any
   mode-specific assets under `public/assets/<new-mode>/`.
4. Update the mode resolver/provider so it knows how to route to the new
   experience.
5. Add test coverage (`tests/`) to ensure core sections render when the mode is
   active.

## Shared Email Composer (planned)

The email/contact component will live in `components/shared/` and mount inside
each mode. An API route under `app/api/contact` will process submissions. The
shared implementation keeps interaction design consistent even if the visual
shell changes.

## Dark / Light Support

Dark/light theming is handled by the shadcn token setup inside
`app/globals.css`. A dedicated `ThemeProvider` (planned under `providers/theme`)
should wrap the app to sync system preference, expose a toggle, and ensure all
Three.js materials respond to palette changes.
