import { getAllCommands } from "./commands";
import {
  getFileSystem,
  listDirectory,
  resolveAbsolutePath,
  pathExists,
  getNode,
} from "./filesystem";
import type { TerminalContext, FileSystemNode } from "./types";
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

  // Check if there's whitespace after the first word (indicating we're past the command)
  const firstSpaceIndex = textBeforeCursor.indexOf(" ");
  if (firstSpaceIndex !== -1 && cursorPosition > firstSpaceIndex) {
    // There's a space and cursor is after it - we're completing a path/argument
    return "path";
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
 * Recursively searches for files and directories matching a prefix
 */
function searchFileSystem(
  node: FileSystemNode,
  prefix: string,
  currentPath: string,
  matches: Array<{ name: string; path: string; type: "file" | "directory" }>
): void {
  const lowerPrefix = prefix.toLowerCase();

  // Search children
  if (node.children) {
    for (const child of node.children) {
      const childPath = currentPath === "/" 
        ? `/${child.name}` 
        : `${currentPath}/${child.name}`;
      
      if (child.name.toLowerCase().startsWith(lowerPrefix)) {
        matches.push({ 
          name: child.name, 
          path: childPath, 
          type: child.type 
        });
      }

      // Recursively search subdirectories
      if (child.type === "directory" && child.children) {
        searchFileSystem(child, prefix, childPath, matches);
      }
    }
  }
}

/**
 * Recursively collects all links from filesystem nodes within a directory
 */
function collectAllLinks(
  node: FileSystemNode,
  links: Array<{ name: string; link: string; path: string }>,
  basePath: string = "/"
): void {
  // Check if this node is within or under the base path
  const nodePath = node.path;
  const isWithinBasePath = nodePath === basePath || nodePath.startsWith(basePath + "/");

  if (isWithinBasePath) {
    if (node.content && typeof node.content === "object") {
      const content = node.content as Record<string, unknown>;
      if (content.link && typeof content.link === "string") {
        links.push({
          name: node.name,
          link: content.link,
          path: node.path,
        });
      }
      if (content.href && typeof content.href === "string") {
        const href = content.href as string;
        const baseUrl = getBaseUrl();
        const fullUrl = href.startsWith("http") ? href : `${baseUrl}${href}`;
        links.push({
          name: node.name,
          link: fullUrl,
          path: node.path,
        });
      }
    }
  }

  if (node.children) {
    for (const child of node.children) {
      collectAllLinks(child, links, basePath);
    }
  }
}

/**
 * Gets all link completions (from projects, modes, etc.) within the current directory
 */
function getAllLinkCompletions(prefix: string, currentDirectory: string = "/"): CompletionResult {
  const allLinks: Array<{ name: string; link: string; path: string }> = [];
  collectAllLinks(fs.root, allLinks, currentDirectory);

  const lowerPrefix = prefix.toLowerCase();
  const matches: string[] = [];

  for (const item of allLinks) {
    const linkLower = item.link.toLowerCase();
    const nameLower = item.name.toLowerCase();
    
    // Match if link starts with prefix
    if (linkLower.startsWith(lowerPrefix)) {
      matches.push(item.link);
    }
    // Also match if name starts with prefix (for easier discovery)
    else if (nameLower.startsWith(lowerPrefix)) {
      matches.push(item.link);
    }
    // Match partial URL (like "example.com" matching "https://example.com/...")
    else if (linkLower.includes(lowerPrefix)) {
      matches.push(item.link);
    }
  }

  if (matches.length === 0) {
    return { completions: [], commonPrefix: "" };
  }

  const commonPrefix = findLongestCommonPrefix(matches);
  return {
    completions: [...new Set(matches)].sort(),
    commonPrefix,
  };
}

/**
 * Gets mode href completions for the open command
 */
function getModeHrefCompletions(prefix: string): CompletionResult {
  const baseUrl = getBaseUrl();
  const lowerPrefix = prefix.toLowerCase();
  const matches: string[] = [];

  // Extract the path part if it's a full URL
  let pathPrefix = prefix;
  if (prefix.startsWith("http://") || prefix.startsWith("https://")) {
    try {
      const url = new URL(prefix);
      pathPrefix = url.pathname;
    } catch {
      // If URL parsing fails, try to extract path manually
      const pathMatch = prefix.match(/https?:\/\/[^\/]+(\/.*)?$/);
      if (pathMatch?.[1]) {
        pathPrefix = pathMatch[1];
      } else {
        pathPrefix = "/";
      }
    }
  }

  const lowerPathPrefix = pathPrefix.toLowerCase();

  // Special case: if prefix is just "/", show all mode hrefs
  if (lowerPathPrefix === "/" || lowerPathPrefix === "") {
    for (const mode of siteConfig.modes) {
      const href = mode.href;
      const fullUrl = `${baseUrl}${href}`;
      if (prefix.startsWith("http://") || prefix.startsWith("https://")) {
        matches.push(fullUrl);
      } else {
        // For relative paths, only add the relative path (not full URL) to avoid clutter
        matches.push(href);
      }
    }
  } else {
    // Check all modes for matching hrefs
    for (const mode of siteConfig.modes) {
      const href = mode.href;
      const fullUrl = `${baseUrl}${href}`;
      const hrefLower = href.toLowerCase();
      const fullUrlLower = fullUrl.toLowerCase();
      
      // Check if the path prefix matches the href
      const pathMatches = hrefLower.startsWith(lowerPathPrefix);
      // Check if full URL matches
      const urlMatches = fullUrlLower.startsWith(lowerPrefix);
      
      if (pathMatches || urlMatches) {
        // If original prefix was a URL, return full URL, otherwise return relative path
        if (prefix.startsWith("http://") || prefix.startsWith("https://")) {
          matches.push(fullUrl);
        } else {
          // For relative paths, prefer the relative path for cleaner completions
          matches.push(href);
        }
      }
    }
  }

  if (matches.length === 0) {
    return { completions: [], commonPrefix: "" };
  }

  const commonPrefix = findLongestCommonPrefix(matches);
  return {
    completions: [...new Set(matches)].sort(),
    commonPrefix,
  };
}

/**
 * Gets path completions, including files and directories
 */
function getPathCompletions(
  prefix: string,
  context: TerminalContext,
  commandName?: string
): CompletionResult {
  // For open command, also complete URLs and mode hrefs
  if (commandName === "open") {
    // URL prefix — complete against known links
    if (prefix.startsWith("http://") || prefix.startsWith("https://") || prefix.includes(".")) {
      const linkCompletions = getAllLinkCompletions(prefix, context.currentDirectory);
      if (linkCompletions.completions.length > 0) {
        return linkCompletions;
      }
      if (context.currentDirectory === "/") {
        return getModeHrefCompletions(prefix);
      }
      return { completions: [], commonPrefix: "" };
    }

    // Slash prefix in root — merge mode hrefs with filesystem paths
    if (prefix.startsWith("/") && context.currentDirectory === "/") {
      const modeCompletions = getModeHrefCompletions(prefix);
      const pathCompletions = getPathCompletionsInternal(prefix, context);

      const allCompletions = [
        ...modeCompletions.completions,
        ...pathCompletions.completions,
      ];

      if (allCompletions.length > 0) {
        const commonPrefix = findLongestCommonPrefix(allCompletions);
        return {
          completions: [...new Set(allCompletions)].sort(),
          commonPrefix,
          isDirectory: pathCompletions.isDirectory,
        };
      }
      return { completions: [], commonPrefix: "" };
    }

    // Plain word — only complete filesystem paths (no link URLs)
  }
  
  return getPathCompletionsInternal(prefix, context);
}

/**
 * Internal path completion logic
 */
function getPathCompletionsInternal(
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
    // If prefix is empty, don't do recursive search - just return empty
    // (empty prefix means list current directory, which has no contents)
    if (searchPrefix === "" || prefix === "") {
      return { completions: [], commonPrefix: "" };
    }
    
    // If no contents in current directory, try searching recursively
    // But only if we have a non-empty prefix (not listing current directory)
    if (searchPrefix && !prefix.includes("/")) {
      const allMatches: Array<{ name: string; path: string; type: "file" | "directory" }> = [];
      searchFileSystem(fs.root, searchPrefix, "/", allMatches);
      
      if (allMatches.length > 0) {
        // Return relative paths from current directory
        const relativeMatches = allMatches.map(m => {
          if (m.path.startsWith(context.currentDirectory + "/")) {
            return m.path.substring(context.currentDirectory.length + 1);
          } else if (context.currentDirectory === "/") {
            return m.path.substring(1);
          } else {
            return m.path;
          }
        });
        
        const commonPrefix = findLongestCommonPrefix(relativeMatches);
        const isDirectory = relativeMatches.length === 1 && 
          allMatches[0].type === "directory";
        
        return {
          completions: relativeMatches.sort(),
          commonPrefix,
          isDirectory,
        };
      }
    }
    return { completions: [], commonPrefix: "" };
  }

  // Filter and match (includes both files and directories)
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

  // If no matches in current directory and we're searching for a simple name (no slashes),
  // try recursive search
  // BUT: Don't do recursive search if prefix is empty (we're listing current directory)
  if (matches.length === 0 && searchPrefix && !prefix.includes("/") && prefix !== "") {
    const allMatches: Array<{ name: string; path: string; type: "file" | "directory" }> = [];
    searchFileSystem(fs.root, searchPrefix, "/", allMatches);
    
    if (allMatches.length > 0) {
      // Return relative paths from current directory
      const relativeMatches = allMatches.map(m => {
        if (m.path.startsWith(context.currentDirectory + "/")) {
          return m.path.substring(context.currentDirectory.length + 1);
        } else if (context.currentDirectory === "/") {
          return m.path.substring(1);
        } else {
          return m.path;
        }
      });
      
      const commonPrefix = findLongestCommonPrefix(relativeMatches);
      const isDirectory = relativeMatches.length === 1 && 
        allMatches[0].type === "directory";
      
      return {
        completions: relativeMatches.sort(),
        commonPrefix,
        isDirectory,
      };
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
    // Path completion - detect command name for special handling
    const textBeforeCursor = input.substring(0, cursorPosition);
    const parts = textBeforeCursor.trim().split(/\s+/);
    const commandName = parts.length > 0 ? parts[0].toLowerCase() : undefined;
    
    // If current word is empty (just whitespace), use empty string for prefix
    // This allows showing all completions in current directory
    const prefix = currentWord.word.trim() || "";
    
    return getPathCompletions(prefix, context, commandName);
  }
}
