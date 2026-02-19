# Terminal Architecture

The terminal interface provides a keyboard-only, file-system-based CLI experience for navigating the site. This document outlines the architecture, components, and implementation details.

## Overview

The terminal mode (`/terminal`) presents site content as a file system structure, allowing users to navigate using traditional CLI commands (`cd`, `ls`, `open`, `pwd`). The interface disables mouse interaction and provides a blinking cursor for an authentic terminal experience.

## Architecture

### File System Structure

The terminal maps site sections to a file-system-like hierarchy:

```
/
├── about/
│   └── info
├── projects/
│   ├── signal-deck
│   ├── atlas-lab
│   └── courier-cli
├── contact/
│   └── info
├── capabilities/
│   ├── systems-ux
│   ├── product-os
│   └── creative-tech
└── modes/
    ├── cli
    └── immersive
```

The file system is generated from `config/site.ts` and dynamically creates nodes based on the site configuration.

### Component Structure

```
app/(cli)/terminal/
  └── page.tsx                    # Terminal page route

components/modes/cli/
  ├── terminal.tsx                 # Main terminal component
  ├── terminal-input.tsx          # Input line with blinking cursor
  └── terminal-output.tsx         # Output display component

lib/terminal/
  ├── types.ts                    # TypeScript type definitions
  ├── filesystem.ts               # File system structure and navigation
  ├── commands.ts                 # Command registry and definitions
  └── command-parser.ts           # Command parsing and execution
```

## Core Components

### Terminal Component (`components/modes/cli/terminal.tsx`)

The main terminal component manages:

- **State Management**: Current directory, command history, input state
- **Keyboard Interaction**: Handles Enter, Arrow keys, Escape
- **Command Execution**: Processes commands through the command parser
- **History Navigation**: Up/down arrows to navigate previous commands
- **Mouse Disabling**: Hides mouse cursor (`cursor: none`)

Key features:
- Auto-focuses input on mount
- Maintains command history (last 50 commands)
- Scrolls to bottom after command execution
- Click-to-focus input field

### Terminal Input (`components/modes/cli/terminal-input.tsx`)

The input component provides:

- **Hidden Caret**: Default browser caret is hidden (`caretColor: transparent`)
- **Animated Cursor**: Custom blinking cursor positioned at end of text
- **Text Measurement**: Uses hidden span to measure text width for accurate cursor positioning
- **Monospace Font**: Uses `font-mono` (Geist Mono) for consistent character width

### Terminal Output (`components/modes/cli/terminal-output.tsx`)

Displays command history with:

- Command input (with prompt)
- Command output (formatted text)
- Error messages (styled with destructive color)
- Whitespace preservation for formatted output

## File System (`lib/terminal/filesystem.ts`)

### Structure

The file system is built from `siteConfig` and creates:

- **Directories**: Represent site sections (projects, contact, etc.)
- **Files**: Represent individual items (project details, contact info, etc.)
- **Content**: Files contain structured data from site config

### Key Functions

- `createFileSystem()`: Generates the file system tree from site config
- `listDirectory(fs, path)`: Returns directory contents
- `resolveAbsolutePath(current, target)`: Resolves relative/absolute paths
- `pathExists(fs, path)`: Validates path existence
- `getNode(fs, path)`: Retrieves a file system node

### Path Resolution

Supports:
- Absolute paths: `/projects/signal-deck`
- Relative paths: `../about` (from current directory)
- Parent directory: `..`
- Current directory: `.`

## Command System (`lib/terminal/commands.ts`)

### Command Structure

Each command implements the `Command` type:

```typescript
type Command = {
  name: string;
  description: string;
  aliases?: string[];
  response?: string | ((args: string[], context: TerminalContext) => string);
  effect?: (args: string[], context: TerminalContext) => void | Promise<void>;
}
```

### Command Execution Flow

1. User types command and presses Enter
2. `command-parser.ts` parses input into command name and arguments
3. Command registry (`commands.ts`) looks up command by name or alias
4. Command's `effect` function executes (if present)
5. Command's `response` function generates output text
6. Output is added to history and displayed

### Terminal Context

Commands receive a `TerminalContext` providing:

- `currentDirectory`: Current working directory path
- `history`: Array of command history entries
- `setCurrentDirectory(path)`: Change current directory
- `addToHistory(entry)`: Add entry to history
- `clearHistory()`: Clear all history

## Command Parser (`lib/terminal/command-parser.ts`)

### Parsing

- Splits input by whitespace
- First token is command name (lowercased)
- Remaining tokens are arguments
- Handles empty input gracefully

### Execution

- Validates command exists
- Executes command effect (async support)
- Generates response text
- Returns `CommandResponse` with output and error flag

## Type Definitions (`lib/terminal/types.ts`)

Core types:

- `TerminalContext`: Context passed to commands
- `CommandHistoryEntry`: Input/output pair with timestamp
- `CommandResponse`: Result of command execution
- `Command`: Command definition structure
- `FileSystemNode`: File or directory node
- `FileSystem`: Root file system structure

## Styling

### CSS

- **Monospace Font**: `font-mono` class uses Geist Mono
- **Blinking Cursor**: CSS keyframe animation (`blink`)
- **Mouse Cursor**: Hidden via `cursor: none` on container
- **Theme Support**: Uses theme colors (foreground, background, muted)

### Cursor Animation

Defined in `app/globals.css`:

```css
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
```

## Keyboard Shortcuts

- **Enter**: Execute command
- **Arrow Up**: Navigate to previous command
- **Arrow Down**: Navigate to next command (or clear if at end)
- **Escape**: Clear current input

## Extensibility

### Adding a New Command

1. Add command definition to `lib/terminal/commands.ts`:

```typescript
export const commands: Record<string, Command> = {
  // ... existing commands
  newcommand: {
    name: "newcommand",
    description: "Description of new command",
    aliases: ["nc"], // optional
    response: (args, context) => {
      // Generate response text
      return "Command output";
    },
    effect: async (args, context) => {
      // Optional side effect
    },
  },
};
```

2. Command is automatically available via parser

### Adding File System Content

Modify `lib/terminal/filesystem.ts` in `createFileSystem()`:

```typescript
const root: FileSystemNode = createFileSystemNode("/", "directory", "/", [
  // ... existing directories
  createFileSystemNode("newsection", "directory", "/newsection", [
    createFileSystemNode("item", "file", "/newsection/item", undefined, {
      // content object
    }),
  ]),
]);
```

## Future Enhancements

Potential additions:

- Tab completion for commands and paths
- Command flags and options (`ls -la`, `cd --help`)
- Nested command structures
- Command pipes and redirects
- File system operations (`mkdir`, `touch`, `cat`)
- Search functionality (`find`, `grep`)
- Command aliases configuration
- History search (`Ctrl+R`)
