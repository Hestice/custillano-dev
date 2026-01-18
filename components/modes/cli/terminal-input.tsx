"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TerminalInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  prompt?: string;
  disabled?: boolean;
}

export function TerminalInput({
  value,
  onChange,
  onKeyDown,
  prompt = "$ ",
  disabled = false,
}: TerminalInputProps) {
  const measureRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [cursorLeft, setCursorLeft] = useState(0);

  useEffect(() => {
    if (measureRef.current && inputRef.current) {
      measureRef.current.textContent = value;
      const width = measureRef.current.offsetWidth;
      setCursorLeft(width);
    }
  }, [value]);

  return (
    <div className="flex items-center font-mono text-sm">
      <span className="text-muted-foreground select-none">{prompt}</span>
      <div className="relative flex-1">
        <span
          ref={measureRef}
          className="absolute invisible whitespace-pre font-mono text-sm"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={disabled}
          className={cn(
            "w-full bg-transparent outline-none border-none",
            "text-foreground",
            "disabled:cursor-not-allowed"
          )}
          style={{ caretColor: "transparent" }}
          autoFocus
          autoComplete="off"
          spellCheck="false"
        />
        <span
          className="absolute inline-block w-2 h-4 bg-foreground pointer-events-none"
          style={{
            animation: "blink 1s step-end infinite",
            left: `${cursorLeft}px`,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
      </div>
    </div>
  );
}
