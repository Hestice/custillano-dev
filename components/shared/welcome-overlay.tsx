"use client";

import { useState, useRef, useEffect } from "react";
import { useUserName } from "@/providers/user/user-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function WelcomeOverlay() {
  const { name, hydrated, setName } = useUserName();
  const [input, setInput] = useState("");
  const [dismissing, setDismissing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (hydrated && name === null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [name, hydrated]);

  if (!hydrated || name !== null) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setDismissing(true);
    setTimeout(() => setName(trimmed), 400);
  };

  const handleSkip = () => {
    setDismissing(true);
    setTimeout(() => setName(""), 400);
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm transition-opacity duration-400",
        dismissing && "opacity-0 pointer-events-none"
      )}
    >
      <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-6 text-center">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
            custillano.dev
          </p>
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
            Before we begin
          </h1>
          <p className="text-muted-foreground">
            What should I call you?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Your first name"
            maxLength={30}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-center text-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
            autoComplete="given-name"
          />
          <Button
            type="submit"
            size="lg"
            disabled={!input.trim()}
          >
            Continue
          </Button>
        </form>

        <button
          onClick={handleSkip}
          className="text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-pointer"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
