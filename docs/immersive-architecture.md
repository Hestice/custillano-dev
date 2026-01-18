# Immersive Experience Architecture

The immersive experience provides a 3D spatial interface where users control a character to explore site sections rendered as 3D objects. This document outlines the architecture, components, and implementation details.

## Overview

The immersive mode (`/experience`) presents site content from `config/site.ts` as explorable 3D objects in a bounded environment. Users control a character using WASD keys to move around and discover different sections of the portfolio.

## Architecture

### Component Structure

```
app/(immersive)/experience/
  └── page.tsx                    # Route entry point with UI overlay

components/modes/immersive/
  ├── experience-scene.tsx        # Main R3F Canvas wrapper
  ├── character.tsx              # Controllable character component
  ├── ground.tsx                  # Bounded ground plane
  └── section-display.tsx         # 3D representation of site sections

lib/three/
  ├── types.ts                    # TypeScript type definitions
  ├── controls.ts                 # Character control logic (WASD)
  ├── constants.ts                # Scene constants (bounds, speeds, etc.)
  └── utils.ts                    # Three.js utility functions
```

## Core Components

### Experience Scene (`components/modes/immersive/experience-scene.tsx`)

The main R3F Canvas component that orchestrates the 3D environment:

- Sets up Three.js scene with camera, lighting, and shadows
- Manages third-person camera that follows the character
- Renders all scene elements (ground, character, sections)
- Handles camera positioning and smooth following

**Key Features:**
- Third-person camera with smooth interpolation
- Shadow casting enabled for all objects
- Ambient and directional lighting
- Full viewport canvas

### Character (`components/modes/immersive/character.tsx`)

Controllable character component that responds to keyboard input:

- Uses `useFrame` hook for movement updates
- Implements WASD movement with normalized direction vectors
- Character rotation based on movement direction
- Position constrained to ground plane bounds
- Exposes position via ref for camera following

**Controls:**
- `W` - Move forward
- `S` - Move backward
- `A` - Move left
- `D` - Move right
- Movement is normalized (diagonal movement has same speed)

### Ground (`components/modes/immersive/ground.tsx`)

Bounded ground plane component:

- Large plane mesh (100x100 units by default)
- Receives shadows from other objects
- Defines movement boundaries for character
- Dark gray material for contrast

### Section Display (`components/modes/immersive/section-display.tsx`)

3D representation system for site sections:

- Maps all sections from `siteConfig` to 3D positions
- Each section rendered as a box with 3D text label
- Sections positioned in a logical grid layout
- All sections from `config/site.ts` are displayed:
  - `info` - Site name/info (center/starting area)
  - `hero` - Hero section
  - `capabilities` - Array of 3 capability objects
  - `modes` - Array of 3 mode objects
  - `labNotes` - Array of 3 lab note objects
  - `contact` - Contact section
  - `projects` - Array of 3 project objects

## Section Layout

Sections are positioned in a vertical grid pattern along the Z-axis:

```
        [Hero]
        
[Cap1] [Info] [Cap2]
        [Cap3]
        
[Mode1] [Mode2] [Mode3]

[Lab1] [Lab2] [Lab3]

[Contact]

[Proj1] [Proj2] [Proj3]
```

Each section object:
- Displays section title as 3D text above the box
- Has a distinct 3D box representation
- Is positioned at calculated coordinates based on grid layout
- Supports future interaction (hover/click for details)

## Control System

### Keyboard Controls (`lib/three/controls.ts`)

Centralized keyboard input management:

- `useKeyboardControls()` - Tracks keyboard state
- `useCharacterControls()` - Provides movement direction calculation
- Normalized movement vectors for consistent speed
- Supports both lowercase and uppercase key inputs

### Movement Logic

Character movement uses:
- Delta time for frame-rate independent movement
- Normalized direction vectors (prevents faster diagonal movement)
- Boundary clamping to keep character within ground bounds
- Smooth rotation based on movement direction

## Constants and Configuration

### Scene Constants (`lib/three/constants.ts`)

- `GROUND_SIZE` - Size of the ground plane (100 units)
- `SCENE_BOUNDS` - Movement boundaries for character
- `CHARACTER_SPEED` - Movement speed (5 units/second)
- `SECTION_SPACING` - Distance between sections (15 units)
- `CAMERA_SETTINGS` - Camera configuration (FOV, near/far planes)

### Utility Functions (`lib/three/utils.ts`)

Helper functions for:
- Position clamping to scene bounds
- Distance calculations
- Grid position calculations for section layout
- Section position creation

## Type Definitions

### Core Types (`lib/three/types.ts`)

- `CharacterState` - Character position, rotation, velocity
- `SceneBounds` - Ground plane boundaries
- `SectionPosition` - Position and rotation for sections
- `SectionData` - Section metadata with position
- `KeyboardState` - Keyboard input state

## Camera System

The camera follows the character in third-person view:

- Positioned behind and above the character
- Smooth interpolation using `lerp` for natural movement
- Always looks at the character position
- Camera offset: (0, 8, 10) relative to character

## Performance Considerations

1. **Memoization**: Section data is memoized to prevent recalculation
2. **Shadow Optimization**: Shadow maps configured for performance
3. **Frame Updates**: Movement uses delta time for consistent speed
4. **Component Structure**: Modular design allows easy optimization

## Future Enhancements

Potential additions (not yet implemented):

- Section detail panels/modal overlays on interaction
- Hover effects on section objects
- Animations and transitions
- Sound effects
- More sophisticated character model
- Collision detection with section objects
- First-person camera option
- Mouse look for camera rotation
- Section interaction (click to view details)

## Dependencies

- `@react-three/fiber` - React renderer for Three.js
- `@react-three/drei` - Useful helpers (Text component)
- `three` - Three.js core library
- `@types/three` - TypeScript definitions

## Usage

Navigate to `/experience` to access the immersive mode. Use WASD keys to move the character around and explore the 3D environment. The camera will automatically follow the character.
