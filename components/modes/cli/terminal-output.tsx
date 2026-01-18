"use client";

import { cn } from "@/lib/utils";
import type { CommandHistoryEntry } from "@/lib/terminal/types";

interface TerminalOutputProps {
  history: CommandHistoryEntry[];
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
              {entry.output}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
