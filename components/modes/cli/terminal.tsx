"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { TerminalInput } from "./terminal-input";
import { TerminalOutput } from "./terminal-output";
import { executeCommand } from "@/lib/terminal/command-parser";
import type {
  TerminalContext,
  CommandHistoryEntry,
} from "@/lib/terminal/types";
import { cn } from "@/lib/utils";

export function Terminal() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<CommandHistoryEntry[]>([]);
  const [currentDirectory, setCurrentDirectory] = useState("/");
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const context: TerminalContext = {
    currentDirectory,
    history,
    setCurrentDirectory: (path: string) => {
      setCurrentDirectory(path);
    },
    addToHistory: (entry: CommandHistoryEntry) => {
      setHistory((prev) => [...prev, entry]);
    },
    clearHistory: () => {
      setHistory([]);
      setCommandHistory([]);
      setHistoryIndex(-1);
    },
  };

  const handleExecute = useCallback(async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) {
      return;
    }

    const result = await executeCommand(trimmedInput, context);

    const entry: CommandHistoryEntry = {
      input: trimmedInput,
      output: result.output,
      timestamp: Date.now(),
      error: result.error,
    };

    setHistory((prev) => [...prev, entry]);
    setCommandHistory((prev) => {
      const newHistory = [...prev, trimmedInput];
      return newHistory.slice(-50); // Keep last 50 commands
    });
    setHistoryIndex(-1);
    setInput("");

    // Scroll to bottom
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }, 0);
  }, [input, currentDirectory]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleExecute();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (commandHistory.length > 0) {
          const newIndex =
            historyIndex === -1
              ? commandHistory.length - 1
              : Math.max(0, historyIndex - 1);
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (historyIndex !== -1) {
          const newIndex = historyIndex + 1;
          if (newIndex >= commandHistory.length) {
            setHistoryIndex(-1);
            setInput("");
          } else {
            setHistoryIndex(newIndex);
            setInput(commandHistory[newIndex]);
          }
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setInput("");
        setHistoryIndex(-1);
      }
    },
    [handleExecute, commandHistory, historyIndex]
  );

  useEffect(() => {
    // Keep focus on input when clicking terminal
    const handleClick = (e: MouseEvent) => {
      // Find the input element and focus it
      const input = containerRef.current?.querySelector("input");
      if (input && document.activeElement !== input) {
        input.focus();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("click", handleClick);
      return () => {
        container.removeEventListener("click", handleClick);
      };
    }
  }, []);

  const prompt = currentDirectory === "/" ? "$ " : `$ ${currentDirectory} `;

  return (
    <div
      ref={containerRef}
      className={cn(
        "h-screen w-full bg-background text-foreground",
        "overflow-y-auto p-6",
        "select-none"
      )}
      style={{ cursor: "none", pointerEvents: "auto" }}
    >
      <div className="max-w-4xl mx-auto space-y-4">
        <TerminalOutput history={history} />
        <div className="flex items-start">
          <TerminalInput
            value={input}
            onChange={setInput}
            onKeyDown={handleKeyDown}
            prompt={prompt}
          />
        </div>
      </div>
    </div>
  );
}
