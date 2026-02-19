import {
  getFileSystem,
  listDirectory,
  resolveAbsolutePath,
  pathExists,
  getNode,
} from "./filesystem";
import type { Command, TerminalContext } from "./types";
import { siteConfig } from "@/config/site";

/**
 * Gets the base URL for the site
 */
function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.host}`;
  }
  return `https://${siteConfig.info.siteName}`;
}

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
    description: "Open/access a section or item, or open a URL in a new tab",
    response: (args: string[], context: TerminalContext) => {
      if (args.length === 0) {
        return "open: missing file operand\nTry 'open --help' for more information.";
      }

      const hasSiteFlag = args.includes("--site");
      const filteredArgs = args.filter((a) => a !== "--site");
      const firstArg = filteredArgs[0];

      if (!firstArg) {
        return "open: missing file operand\nTry 'open --help' for more information.";
      }

      // Check if the argument is a URL (starts with http:// or https://)
      if (firstArg.startsWith("http://") || firstArg.startsWith("https://")) {
        if (typeof window !== "undefined") {
          window.open(firstArg, "_blank", "noopener,noreferrer");
          return `Opening ${firstArg} in a new tab...`;
        }
        return `Would open ${firstArg} in a new tab`;
      }

      // Check if the argument matches a mode href (like /terminal, /experience, /)
      const matchingMode = siteConfig.modes.find(
        (mode) => mode.href === firstArg
      );
      if (matchingMode) {
        const fullUrl = `${getBaseUrl()}${matchingMode.href}`;
        if (typeof window !== "undefined") {
          window.open(fullUrl, "_blank", "noopener,noreferrer");
          return `Opening ${fullUrl} in a new tab...`;
        }
        return `Would open ${fullUrl} in a new tab`;
      }

      // Try to resolve as filesystem path
      let targetPath = resolveAbsolutePath(context.currentDirectory, firstArg);

      // If not found, try matching a project name from any directory
      if (!pathExists(fs, targetPath)) {
        const normalizedArg = firstArg.toLowerCase().replace(/\s+/g, "-");
        const projectPath = `/projects/${normalizedArg}`;
        if (pathExists(fs, projectPath)) {
          targetPath = projectPath;
        }
      }

      if (!pathExists(fs, targetPath)) {
        return `open: cannot open '${firstArg}': No such file or directory`;
      }

      const node = getNode(fs, targetPath);
      if (!node) {
        return `open: cannot open '${firstArg}': Unknown error`;
      }

      if (node.type === "directory") {
        return `open: '${firstArg}' is a directory`;
      }

      if (node.content && typeof node.content === "object") {
        const content = node.content as Record<string, unknown>;

        // --site flag: open the link/href directly in a new tab
        if (hasSiteFlag) {
          const url =
            typeof content.link === "string"
              ? content.link
              : typeof content.href === "string"
                ? (content.href as string).startsWith("http")
                  ? (content.href as string)
                  : `${getBaseUrl()}${content.href}`
                : null;
          if (url) {
            if (typeof window !== "undefined") {
              window.open(url, "_blank", "noopener,noreferrer");
              return `Opening ${url} in a new tab...`;
            }
            return `Would open ${url} in a new tab`;
          }
          return `open: '${firstArg}' has no associated link`;
        }

        // Special handling for email composer file
        if (content.type === "email_composer") {
          // Trigger email command interactively
          if (context.setCommandState) {
            context.setCommandState({
              type: "email",
              data: {},
              currentStep: 0,
              prompt: "Name: ",
            });
            return "Email composer (interactive mode)\nName: ";
          }
          return "Email composer\n\nUsage:\n  email --name \"Name\" --email \"email@example.com\" --body \"Message\"\n  email (for interactive mode)";
        }
        
        let output = `\n${node.name}\n${"=".repeat(node.name.length)}\n\n`;

        if (content.name || content.title) {
          const nameOrTitle = content.name || content.title;
          // Display icon inline with name/title if present
          if (content.icon && typeof content.icon === "string") {
            output += `[icon:${content.icon}] Name: ${nameOrTitle}\n`;
          } else {
            output += `Name: ${nameOrTitle}\n`;
          }
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
        if (content.href) {
          const href = content.href as string;
          // If href is a relative path, construct full URL
          const fullUrl = href.startsWith("http") 
            ? href 
            : `${getBaseUrl()}${href}`;
          output += `\nLink: ${fullUrl}\n`;
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
        if (content.usage) {
          output += `\nUsage:\n${content.usage}\n`;
        }

        return output;
      }

      if (typeof node.content === "string") {
        return node.content;
      }

      return `open: cannot display '${firstArg}': Unsupported content type`;
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

  email: {
    name: "email",
    description: "Send an email (use --name, --email, --body flags or run interactively)",
    response: (args: string[], context: TerminalContext) => {
      // Parse command-line arguments
      const parseArgs = (args: string[]): { name?: string; email?: string; body?: string } => {
        const result: { name?: string; email?: string; body?: string } = {};
        for (let i = 0; i < args.length; i++) {
          if (args[i] === "--name" && i + 1 < args.length) {
            result.name = args[i + 1].replace(/^["']|["']$/g, ""); // Remove quotes
            i++;
          } else if (args[i] === "--email" && i + 1 < args.length) {
            result.email = args[i + 1].replace(/^["']|["']$/g, "");
            i++;
          } else if (args[i] === "--body" && i + 1 < args.length) {
            result.body = args[i + 1].replace(/^["']|["']$/g, "");
            i++;
          }
        }
        return result;
      };

      const parsed = parseArgs(args);

      // If all arguments provided, send immediately
      if (parsed.name && parsed.email && parsed.body) {
        // This will be handled by the effect
        return "Sending email...";
      }

      // Otherwise, start interactive mode
      if (context.setCommandState) {
        context.setCommandState({
          type: "email",
          data: parsed,
          currentStep: 0,
          prompt: "Name: ",
        });
        return "Email composer (interactive mode)\nName: ";
      }

      return "Email command requires either all arguments (--name, --email, --body) or interactive mode.\nUsage: email --name \"John\" --email \"john@example.com\" --body \"message\"\nOr: email (for interactive mode)";
    },
    effect: async (args: string[], context: TerminalContext) => {
      const parseArgs = (args: string[]): { name?: string; email?: string; body?: string } => {
        const result: { name?: string; email?: string; body?: string } = {};
        for (let i = 0; i < args.length; i++) {
          if (args[i] === "--name" && i + 1 < args.length) {
            result.name = args[i + 1].replace(/^["']|["']$/g, "");
            i++;
          } else if (args[i] === "--email" && i + 1 < args.length) {
            result.email = args[i + 1].replace(/^["']|["']$/g, "");
            i++;
          } else if (args[i] === "--body" && i + 1 < args.length) {
            result.body = args[i + 1].replace(/^["']|["']$/g, "");
            i++;
          }
        }
        return result;
      };

      const parsed = parseArgs(args);

      // Only send if all arguments are provided
      if (parsed.name && parsed.email && parsed.body) {
        try {
          const baseUrl = getBaseUrl();
          const response = await fetch(`${baseUrl}/api/contact`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: parsed.name.trim(),
              email: parsed.email.trim(),
              body: parsed.body.trim(),
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            context.addToHistory({
              input: "",
              output: `Error: ${data.error || "Failed to send email"}`,
              timestamp: Date.now(),
              error: true,
            });
            return;
          }

          context.addToHistory({
            input: "",
            output: "Email sent successfully!",
            timestamp: Date.now(),
          });
        } catch (error) {
          context.addToHistory({
            input: "",
            output: `Error: ${error instanceof Error ? error.message : "Failed to send email"}`,
            timestamp: Date.now(),
            error: true,
          });
        }
      }
    },
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
