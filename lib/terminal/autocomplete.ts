import { getAllCommands } from "./commands";
import {
  getFileSystem,
  listDirectory,
  resolveAbsolutePath,
  pathExists,
  getNode,
} from "./filesystem";
import type { TerminalContext } from "./types";

const fs = getFileSystem();

export interface CompletionResult {
  completions: string[];
  commonPrefix: string;
  isDirectory?: boolean;
}

/**
 * Finds the longest common prefix among an array of strings
 */
export function findLongestCommonPrefix(strings: string[]): string {
  if (strings.length === 0) return "";
  if (strings.length === 1) return strings[0];

  const sorted = strings.sort();
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  let i = 0;

  while (i < first.length && i < last.length && first[i] === last[i]) {
    i++;
  }

  return first.substring(0, i);
}

/**
 * Gets the current word being typed at the cursor position
 */
function getCurrentWord(input: string, cursorPosition: number): {
  word: string;
  start: number;
  end: number;
} {
  // Find word boundaries (non-whitespace characters)
  let start = cursorPosition;
  let end = cursorPosition;

  // Find start of word
  while (start > 0 && !/\s/.test(input[start - 1])) {
    start--;
  }

  // Find end of word
  while (end < input.length && !/\s/.test(input[end])) {
    end++;
  }

  return {
    word: input.substring(start, end),
    start,
    end,
  };
}

/**
 * Determines if we're completing a command or a path
 */
function getCompletionContext(
  input: string,
  cursorPosition: number
): "command" | "path" {
  const textBeforeCursor = input.substring(0, cursorPosition);
  const trimmed = textBeforeCursor.trim();

  // If empty or starts with whitespace, we're completing a command
  if (trimmed.length === 0) {
    return "command";
  }

  // Check if there's already a command word
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    // Only one word - could be command or path
    // If it looks like a path (starts with / or . or ..), it's a path
    const firstChar = trimmed[0];
    if (firstChar === "/" || firstChar === ".") {
      return "path";
    }
    // Otherwise, check if cursor is at the end of the word
    // If we're in the middle of typing, it's likely a command
    const currentWord = getCurrentWord(input, cursorPosition);
    if (currentWord.end === cursorPosition && currentWord.start === 0) {
      // At the end of first word - could be either, default to command
      return "command";
    }
    return "command";
  }

  // Multiple words - we're completing a path (argument to a command)
  return "path";
}

/**
 * Gets command completions
 */
function getCommandCompletions(prefix: string): string[] {
  const commands = getAllCommands();
  const matches: string[] = [];
  const lowerPrefix = prefix.toLowerCase();

  for (const cmd of commands) {
    // Check command name
    if (cmd.name.toLowerCase().startsWith(lowerPrefix)) {
      matches.push(cmd.name);
    }
    // Check aliases
    if (cmd.aliases) {
      for (const alias of cmd.aliases) {
        if (alias.toLowerCase().startsWith(lowerPrefix)) {
          matches.push(alias);
        }
      }
    }
  }

  return [...new Set(matches)].sort();
}

/**
 * Gets path completions
 */
function getPathCompletions(
  prefix: string,
  context: TerminalContext
): CompletionResult {
  // Parse the path prefix
  const isAbsolute = prefix.startsWith("/");
  const basePath = isAbsolute
    ? "/"
    : context.currentDirectory === "/"
    ? "/"
    : context.currentDirectory;

  // Resolve the directory we're completing in
  let searchDir = basePath;
  let searchPrefix = prefix;

  if (isAbsolute) {
    // Absolute path
    const parts = prefix.split("/").filter(Boolean);
    if (parts.length > 0) {
      searchPrefix = parts.pop() || "";
      const dirPath = "/" + parts.join("/");
      if (pathExists(fs, dirPath)) {
        const node = getNode(fs, dirPath);
        if (node?.type === "directory") {
          searchDir = dirPath;
        }
      }
    }
  } else {
    // Relative path
    const parts = prefix.split("/").filter(Boolean);
    if (parts.length > 0) {
      searchPrefix = parts.pop() || "";
      const dirPath = resolveAbsolutePath(
        context.currentDirectory,
        parts.join("/")
      );
      if (pathExists(fs, dirPath)) {
        const node = getNode(fs, dirPath);
        if (node?.type === "directory") {
          searchDir = dirPath;
        }
      }
    }
  }

  // List directory contents
  const contents = listDirectory(fs, searchDir);
  if (!contents) {
    return { completions: [], commonPrefix: "" };
  }

  // Filter and match
  const lowerPrefix = searchPrefix.toLowerCase();
  const matches: string[] = [];
  const directoryMatches: string[] = [];

  for (const item of contents) {
    if (item.name.toLowerCase().startsWith(lowerPrefix)) {
      matches.push(item.name);
      if (item.type === "directory") {
        directoryMatches.push(item.name);
      }
    }
  }

  if (matches.length === 0) {
    return { completions: [], commonPrefix: "" };
  }

  const commonPrefix = findLongestCommonPrefix(matches);
  const isDirectory =
    matches.length === 1 && directoryMatches.includes(matches[0]);

  return {
    completions: matches.sort(),
    commonPrefix,
    isDirectory,
  };
}

/**
 * Main function to get completions for the current input
 */
export function getCompletions(
  input: string,
  cursorPosition: number,
  context: TerminalContext
): CompletionResult {
  const currentWord = getCurrentWord(input, cursorPosition);
  const contextType = getCompletionContext(input, cursorPosition);

  if (contextType === "command") {
    const commandCompletions = getCommandCompletions(currentWord.word);
    const commonPrefix = findLongestCommonPrefix(commandCompletions);
    return {
      completions: commandCompletions,
      commonPrefix,
    };
  } else {
    // Path completion
    return getPathCompletions(currentWord.word, context);
  }
}
