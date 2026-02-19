"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useStory } from "../state/story-context";

const CHAR_SPEED = 40; // ms per character
const DISMISS_DELAY = 2500; // ms after full text

export function NarrationHud() {
  const { state } = useStory();
  const [displayedText, setDisplayedText] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const currentNarration = useRef<string | null>(null);
  const queueRef = useRef<string[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showNarration = useCallback((text: string) => {
    setDisplayedText("");
    setIsVisible(true);
    currentNarration.current = text;

    let charIndex = 0;
    const interval = setInterval(() => {
      charIndex++;
      if (charIndex <= text.length) {
        setDisplayedText(text.slice(0, charIndex));
      } else {
        clearInterval(interval);
        // Auto-dismiss after delay
        timeoutRef.current = setTimeout(() => {
          setIsVisible(false);
          currentNarration.current = null;
          // Process queue
          if (queueRef.current.length > 0) {
            const next = queueRef.current.shift()!;
            setTimeout(() => showNarration(next), 300);
          }
        }, DISMISS_DELAY);
      }
    }, CHAR_SPEED);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!state.currentNarration) return;
    if (state.currentNarration === currentNarration.current) return;

    if (currentNarration.current) {
      // Queue it
      queueRef.current.push(state.currentNarration);
    } else {
      showNarration(state.currentNarration);
    }
  }, [state.currentNarration, showNarration]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="absolute bottom-40 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
      <div
        className="px-6 py-3 rounded-lg max-w-lg text-center"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(10,10,30,0.9) 100%)",
          border: "1px solid rgba(100,150,255,0.2)",
          boxShadow: "0 0 30px rgba(100,150,255,0.1)",
        }}
      >
        <p className="text-white/90 text-sm font-mono leading-relaxed">
          {displayedText}
          <span className="animate-pulse ml-0.5 text-blue-400">|</span>
        </p>
      </div>
    </div>
  );
}
