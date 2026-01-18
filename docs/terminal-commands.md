# Terminal Commands

This document describes all available commands in the terminal interface, their usage, and examples.

## Navigation Commands

### `cd` - Change Directory

Changes the current working directory.

**Usage:**
```bash
cd [path]
```

**Arguments:**
- `path` (optional): Directory path to navigate to. If omitted, navigates to root (`/`).

**Examples:**
```bash
cd                    # Navigate to root directory
cd projects           # Navigate to projects directory
cd /about             # Navigate to about directory (absolute path)
cd ../contact         # Navigate to contact (relative path)
cd ..                 # Navigate to parent directory
```

**Error Messages:**
- `cd: no such file or directory: <path>` - Path doesn't exist
- `cd: not a directory: <path>` - Path exists but is a file, not a directory

---

### `ls` - List Directory Contents

Lists files and directories in the current or specified directory.

**Usage:**
```bash
ls [path]
```

**Arguments:**
- `path` (optional): Directory path to list. If omitted, lists current directory.

**Examples:**
```bash
ls                    # List current directory
ls projects           # List projects directory
ls /                  # List root directory
ls ../about           # List about directory (relative path)
```

**Output Format:**
- Directories are shown with a trailing `/` (e.g., `projects/`)
- Files are shown without suffix (e.g., `signal-deck`)
- Items are separated by two spaces

**Error Messages:**
- `ls: cannot access '<path>': No such file or directory` - Path doesn't exist
- `ls: cannot access '<path>': Not a directory` - Path is a file, not a directory

---

### `pwd` - Print Working Directory

Displays the current working directory path.

**Usage:**
```bash
pwd
```

**Examples:**
```bash
pwd                   # Output: /
cd projects
pwd                   # Output: /projects
```

**Output:**
Returns the absolute path of the current directory (e.g., `/`, `/projects`, `/about`).

---

## Content Access Commands

### `open` - Open/Access a Section or Item

Opens and displays the content of a file.

**Usage:**
```bash
open <path>
```

**Arguments:**
- `path` (required): File path to open.

**Examples:**
```bash
open projects/signal-deck        # Open a project file
open about/info                  # Open about info
open contact/info                # Open contact information
open /projects/atlas-lab         # Open using absolute path
```

**Output Format:**

For structured content (projects, contact, etc.), displays formatted information:

```
signal-deck
===========

Name: Signal Deck
Role: Lead Product Designer

Design system and dashboard for portfolio triage teams, focused on clarity and speed.

Stack: Next.js, Radix UI, Framer Motion

Link: https://example.com
```

**Error Messages:**
- `open: missing file operand` - No path provided
- `open: cannot open '<path>': No such file or directory` - File doesn't exist
- `open: '<path>' is a directory` - Path is a directory, not a file
- `open: cannot display '<path>': Unsupported content type` - File content format not supported

---

## Utility Commands

### `help` - Show Available Commands

Displays a list of all available commands with descriptions.

**Usage:**
```bash
help
```

**Aliases:**
- `?`

**Examples:**
```bash
help
?
```

**Output:**
```
Available commands:

  cd        - Change directory
  ls        - List directory contents
  pwd       - Print working directory
  open      - Open/access a section or item
  help      - Show available commands (aliases: ?)
  clear     - Clear terminal output (aliases: cls)
  exit      - Exit terminal (navigate back to web mode) (aliases: quit, q)

Use 'help <command>' for more information about a specific command.
```

---

### `clear` - Clear Terminal Output

Clears all command history and output from the terminal.

**Usage:**
```bash
clear
```

**Aliases:**
- `cls`

**Examples:**
```bash
clear
cls
```

**Effect:**
- Removes all command history entries
- Clears the terminal display
- Resets command history navigation

**Note:** This only clears the display. The terminal session remains active.

---

### `exit` - Exit Terminal

Exits the terminal interface and navigates back to the web mode.

**Usage:**
```bash
exit
```

**Aliases:**
- `quit`
- `q`

**Examples:**
```bash
exit
quit
q
```

**Effect:**
- Navigates to the home page (`/`)
- Ends the terminal session

**Output:**
```
Exiting terminal...
```

---

## Command Aliases

Some commands support aliases for convenience:

| Command | Aliases |
|---------|---------|
| `help` | `?` |
| `clear` | `cls` |
| `exit` | `quit`, `q` |

---

## Common Workflows

### Exploring the Site Structure

```bash
ls                          # See what's available at root
cd projects                 # Navigate to projects
ls                          # List all projects
open signal-deck            # View a specific project
cd ..                       # Go back
cd about                    # Navigate to about
open info                   # View about information
```

### Finding Contact Information

```bash
cd contact
open info                   # View contact details
```

### Quick Navigation

```bash
cd /projects                # Jump directly to projects
ls                          # List projects
open atlas-lab              # View a project
```

### Getting Help

```bash
help                        # See all commands
pwd                         # Check current location
ls                          # See what's available
```

---

## Error Handling

All commands provide clear error messages when:

- A path doesn't exist
- A path is the wrong type (file vs directory)
- Required arguments are missing
- A command is not found

**Example Error Messages:**
```bash
$ cd nonexistent
cd: no such file or directory: nonexistent

$ open projects
open: 'projects' is a directory

$ open
open: missing file operand
Try 'open --help' for more information.

$ invalidcommand
invalidcommand: command not found
Try 'help' for a list of available commands.
```

---

## Tips

1. **Use Tab Completion**: (Future feature) Press Tab to autocomplete paths
2. **Relative vs Absolute Paths**: Use `../` for relative navigation, `/` for absolute paths
3. **Command History**: Use Arrow Up/Down to navigate previous commands
4. **Quick Exit**: Type `q` or `quit` instead of `exit` for faster exit
5. **Clear Screen**: Use `clear` or `cls` to clean up the terminal
6. **Check Location**: Use `pwd` if you're unsure where you are

---

## File System Structure Reference

The terminal file system mirrors the site structure:

```
/
├── about/
│   └── info              # Site owner, focus areas, description
├── projects/
│   ├── signal-deck        # Project details
│   ├── atlas-lab          # Project details
│   └── courier-cli        # Project details
├── contact/
│   └── info               # Contact information, email, reasons
├── capabilities/
│   ├── systems-ux         # Capability details
│   ├── product-os         # Capability details
│   └── creative-tech      # Capability details
└── modes/
    ├── cli                # CLI mode information
    └── immersive          # Immersive mode information
```
