"use client";

import { cn } from "@/lib/utils";
import type { CommandHistoryEntry } from "@/lib/terminal/types";
import type { IconKey } from "@/config/site";
import type { LucideIcon } from "lucide-react";
import {
  Command,
  Globe,
  Joystick,
  Layers,
  Sparkles,
  Terminal,
} from "lucide-react";

const iconMap: Record<IconKey, LucideIcon> = {
  layers: Layers,
  command: Command,
  sparkles: Sparkles,
  terminal: Terminal,
  joystick: Joystick,
  globe: Globe,
};

interface TerminalOutputProps {
  history: CommandHistoryEntry[];
}

function renderOutputWithIcons(output: string) {
  // Parse output for icon markers: [icon:iconKey]
  const parts: (string | { type: "icon"; key: IconKey })[] = [];
  let lastIndex = 0;
  const iconRegex = /\[icon:(\w+)\]/g;
  let match;

  while ((match = iconRegex.exec(output)) !== null) {
    // Add text before icon
    if (match.index > lastIndex) {
      parts.push(output.slice(lastIndex, match.index));
    }
    // Add icon
    const iconKey = match[1] as IconKey;
    if (iconKey in iconMap) {
      parts.push({ type: "icon", key: iconKey });
    } else {
      // If icon key not found, just add the text
      parts.push(match[0]);
    }
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < output.length) {
    parts.push(output.slice(lastIndex));
  }

  // If no icons found, return original output
  if (parts.length === 1 && typeof parts[0] === "string") {
    return <>{output}</>;
  }

  return (
    <>
      {parts.map((part, index) => {
        if (typeof part === "string") {
          return <span key={index}>{part}</span>;
        }
        const Icon = iconMap[part.key];
        return (
          <Icon
            key={index}
            className="inline-block size-4 align-middle mx-0.5"
            aria-hidden="true"
          />
        );
      })}
    </>
  );
}

export function TerminalOutput({ history }: TerminalOutputProps) {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="font-mono text-sm space-y-2">
      {history.map((entry, index) => (
        <div key={index} className="space-y-1">
          <div className="text-foreground/80">
            <span className="text-muted-foreground">$ </span>
            {entry.input}
          </div>
          {entry.output && (
            <div
              className={cn(
                "whitespace-pre-wrap break-words",
                entry.error ? "text-destructive" : "text-foreground"
              )}
            >
              {renderOutputWithIcons(entry.output)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
