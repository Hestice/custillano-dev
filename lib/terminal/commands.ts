import {
  getFileSystem,
  listDirectory,
  resolveAbsolutePath,
  pathExists,
  getNode,
} from "./filesystem";
import type { Command, TerminalContext } from "./types";
import { siteConfig } from "@/config/site";

const fs = getFileSystem();

// Delay duration in milliseconds for commands that need visual feedback
const COMMAND_DELAY_MS = 500;

export const commands: Record<string, Command> = {
  cd: {
    name: "cd",
    description: "Change directory",
    response: (args: string[], context: TerminalContext) => {
      if (args.length === 0) {
        context.setCurrentDirectory("/");
        return "";
      }

      const targetPath = args[0];
      const resolvedPath = resolveAbsolutePath(
        context.currentDirectory,
        targetPath
      );

      if (!pathExists(fs, resolvedPath)) {
        return `cd: no such file or directory: ${targetPath}`;
      }

      const node = getNode(fs, resolvedPath);
      if (node?.type !== "directory") {
        return `cd: not a directory: ${targetPath}`;
      }

      context.setCurrentDirectory(resolvedPath);
      return "";
    },
  },

  ls: {
    name: "ls",
    description: "List directory contents",
    response: (args: string[], context: TerminalContext) => {
      const targetPath =
        args.length > 0
          ? resolveAbsolutePath(context.currentDirectory, args[0])
          : context.currentDirectory;

      if (!pathExists(fs, targetPath)) {
        return `ls: cannot access '${
          args[0] || context.currentDirectory
        }': No such file or directory`;
      }

      const contents = listDirectory(fs, targetPath);
      if (contents === null) {
        const node = getNode(fs, targetPath);
        if (node?.type === "file") {
          return node.name;
        }
        return `ls: cannot access '${targetPath}': Not a directory`;
      }

      if (contents.length === 0) {
        return "";
      }

      return contents
        .map((item) => {
          const suffix = item.type === "directory" ? "/" : "";
          return `${item.name}${suffix}`;
        })
        .join("  ");
    },
  },

  pwd: {
    name: "pwd",
    description: "Print working directory",
    response: (args: string[], context: TerminalContext) => {
      return context.currentDirectory;
    },
  },

  open: {
    name: "open",
    description: "Open/access a section or item",
    response: (args: string[], context: TerminalContext) => {
      if (args.length === 0) {
        return "open: missing file operand\nTry 'open --help' for more information.";
      }

      const targetPath = resolveAbsolutePath(context.currentDirectory, args[0]);

      if (!pathExists(fs, targetPath)) {
        return `open: cannot open '${args[0]}': No such file or directory`;
      }

      const node = getNode(fs, targetPath);
      if (!node) {
        return `open: cannot open '${args[0]}': Unknown error`;
      }

      if (node.type === "directory") {
        return `open: '${args[0]}' is a directory`;
      }

      if (node.content && typeof node.content === "object") {
        const content = node.content as Record<string, unknown>;
        let output = `\n${node.name}\n${"=".repeat(node.name.length)}\n\n`;

        if (content.name || content.title) {
          output += `Name: ${content.name || content.title}\n`;
        }
        if (content.role) {
          output += `Role: ${content.role}\n`;
        }
        if (content.summary || content.description) {
          output += `\n${content.summary || content.description}\n`;
        }
        if (content.stack && Array.isArray(content.stack)) {
          output += `\nStack: ${content.stack.join(", ")}\n`;
        }
        if (content.link) {
          output += `\nLink: ${content.link}\n`;
        }
        if (content.email) {
          output += `\nEmail: ${content.email}\n`;
        }
        if (content.reasons && Array.isArray(content.reasons)) {
          output += `\nReasons to reach out:\n`;
          content.reasons.forEach(
            (reason: unknown) => (output += `  • ${reason}\n`)
          );
        }
        if (content.focusAreas && Array.isArray(content.focusAreas)) {
          output += `\nFocus Areas: ${content.focusAreas.join(" · ")}\n`;
        }
        if (content.owner) {
          output += `\nOwner: ${content.owner}\n`;
        }

        return output;
      }

      if (typeof node.content === "string") {
        return node.content;
      }

      return `open: cannot display '${args[0]}': Unsupported content type`;
    },
  },

  help: {
    name: "help",
    description: "Show available commands",
    aliases: ["?"],
    response: () => {
      const commandList = Object.values(commands)
        .map((cmd) => {
          const aliases = cmd.aliases
            ? ` (aliases: ${cmd.aliases.join(", ")})`
            : "";
          return `  ${cmd.name.padEnd(8)} - ${cmd.description}${aliases}`;
        })
        .join("\n");

      return `Available commands:\n\n${commandList}\n\nUse 'help <command>' for more information about a specific command.`;
    },
  },

  clear: {
    name: "clear",
    description: "Clear terminal output",
    aliases: ["cls"],
    effect: (args: string[], context: TerminalContext) => {
      context.clearHistory();
    },
    response: () => "",
  },

  exit: {
    name: "exit",
    description: "Exit terminal (navigate back to web mode)",
    aliases: ["quit", "q"],
    delay: COMMAND_DELAY_MS,
    effect: () => {
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    },
    response: () => "Exiting terminal...",
  },
};

export function getCommand(name: string): Command | undefined {
  const lowerName = name.toLowerCase();
  const command = commands[lowerName];
  if (command) {
    return command;
  }

  // Check aliases
  for (const cmd of Object.values(commands)) {
    if (cmd.aliases?.includes(lowerName)) {
      return cmd;
    }
  }

  return undefined;
}

export function getAllCommands(): Command[] {
  return Object.values(commands);
}
