import { getCommand } from "./commands";
import type { CommandResponse, TerminalContext } from "./types";

export function parseCommand(input: string): {
  command: string;
  args: string[];
} {
  const trimmed = input.trim();
  if (!trimmed) {
    return { command: "", args: [] };
  }

  const parts = trimmed.split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  return { command, args };
}

export async function executeCommand(
  input: string,
  context: TerminalContext
): Promise<CommandResponse> {
  const { command, args } = parseCommand(input);

  if (!command) {
    return { output: "" };
  }

  const cmd = getCommand(command);
  if (!cmd) {
    return {
      output: `${command}: command not found\nTry 'help' for a list of available commands.`,
      error: true,
    };
  }

  try {
    // Get response first (so it can be displayed immediately)
    let output = "";
    if (cmd.response) {
      if (typeof cmd.response === "function") {
        output = cmd.response(args, context);
      } else {
        output = cmd.response;
      }
    }

    // Execute effect - with delay if specified, otherwise immediately
    if (cmd.effect) {
      if (cmd.delay && cmd.delay > 0) {
        // Schedule effect to run after delay (non-blocking)
        setTimeout(() => {
          cmd.effect?.(args, context);
        }, cmd.delay);
      } else {
        // Execute effect immediately
        await cmd.effect(args, context);
      }
    }

    return { output };
  } catch (error) {
    return {
      output: `Error executing command: ${
        error instanceof Error ? error.message : String(error)
      }`,
      error: true,
    };
  }
}
