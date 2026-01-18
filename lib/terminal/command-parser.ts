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
    // Execute effect if present
    if (cmd.effect) {
      await cmd.effect(args, context);
    }

    // Get response
    let output = "";
    if (cmd.response) {
      if (typeof cmd.response === "function") {
        output = cmd.response(args, context);
      } else {
        output = cmd.response;
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
