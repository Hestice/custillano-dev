"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { TerminalInput } from "./terminal-input";
import { TerminalOutput } from "./terminal-output";
import { executeCommand } from "@/lib/terminal/command-parser";
import { getCompletions } from "@/lib/terminal/autocomplete";
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
      // Allow empty input to create a blank line
      const entry: CommandHistoryEntry = {
        input: "",
        output: "",
        timestamp: Date.now(),
        error: false,
      };
      setHistory((prev) => [...prev, entry]);
      setHistoryIndex(-1);
      setInput("");

      // Scroll to bottom
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      }, 0);
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
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const textarea = e.currentTarget;
      const cursorPosition = textarea.selectionStart;

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
      } else if (e.key === "Tab") {
        e.preventDefault();
        const result = getCompletions(input, cursorPosition, context);
        
        if (result.completions.length === 0) {
          // No completions available
          return;
        }

        // Find the current word being typed
        let wordStart = cursorPosition;
        let wordEnd = cursorPosition;
        
        // Find start of word
        while (wordStart > 0 && !/\s/.test(input[wordStart - 1])) {
          wordStart--;
        }
        
        // Find end of word
        while (wordEnd < input.length && !/\s/.test(input[wordEnd])) {
          wordEnd++;
        }

        const currentWord = input.substring(wordStart, wordEnd);
        
        if (result.completions.length === 1) {
          // Single match - complete fully
          const completion = result.completions[0];
          const newInput =
            input.substring(0, wordStart) +
            completion +
            (result.isDirectory ? "/" : "") +
            input.substring(wordEnd);
          setInput(newInput);
          
          // Set cursor position after completion
          setTimeout(() => {
            const newCursorPos = wordStart + completion.length + (result.isDirectory ? 1 : 0);
            textarea.setSelectionRange(newCursorPos, newCursorPos);
          }, 0);
        } else if (result.completions.length > 1 && result.commonPrefix.length > currentWord.length) {
          // Multiple matches - complete common prefix
          const newInput =
            input.substring(0, wordStart) +
            result.commonPrefix +
            input.substring(wordEnd);
          setInput(newInput);
          
          // Set cursor position after common prefix
          setTimeout(() => {
            const newCursorPos = wordStart + result.commonPrefix.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
          }, 0);
        }
        // If common prefix is same as current word, do nothing (user can press Tab again to cycle)
      } else if (e.key === "Backspace" && (e.ctrlKey || e.altKey || e.metaKey)) {
        // Word deletion: Ctrl+Backspace (Windows/Linux) or Option+Backspace (Mac)
        e.preventDefault();
        
        const selectionStart = textarea.selectionStart;
        const selectionEnd = textarea.selectionEnd;
        
        if (selectionStart !== selectionEnd) {
          // Delete selected text
          const newInput = input.substring(0, selectionStart) + input.substring(selectionEnd);
          setInput(newInput);
          setTimeout(() => {
            textarea.setSelectionRange(selectionStart, selectionStart);
          }, 0);
          return;
        }

        // Find word boundaries (whitespace or hyphen are separators)
        let deleteStart = selectionStart;
        
        // If cursor is at start, nothing to delete
        if (deleteStart === 0) {
          return;
        }

        // Check if we're at a separator (whitespace or hyphen)
        const charBefore = input[deleteStart - 1];
        const isAtSeparator = /\s/.test(charBefore) || charBefore === "-";
        
        if (isAtSeparator) {
          // Delete the separator(s) and the previous word
          // First, skip all separators
          while (deleteStart > 0 && (/\s/.test(input[deleteStart - 1]) || input[deleteStart - 1] === "-")) {
            deleteStart--;
          }
          // Then, find the start of the previous word
          while (deleteStart > 0 && !/\s/.test(input[deleteStart - 1]) && input[deleteStart - 1] !== "-") {
            deleteStart--;
          }
        } else {
          // We're in the middle of a word - delete from word start to cursor
          while (deleteStart > 0 && !/\s/.test(input[deleteStart - 1]) && input[deleteStart - 1] !== "-") {
            deleteStart--;
          }
        }

        const newInput = input.substring(0, deleteStart) + input.substring(selectionStart);
        setInput(newInput);
        
        // Set cursor position after deletion
        setTimeout(() => {
          textarea.setSelectionRange(deleteStart, deleteStart);
        }, 0);
      }
    },
    [handleExecute, commandHistory, historyIndex, input, context]
  );

  useEffect(() => {
    // Keep focus on input when clicking terminal
    const handleClick = (e: MouseEvent) => {
      // Find the textarea element and focus it
      const textarea = containerRef.current?.querySelector("textarea");
      if (textarea && document.activeElement !== textarea) {
        textarea.focus();
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
        <div className="flex items-start w-full">
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
