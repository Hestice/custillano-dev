"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Globe, Joystick, Menu, Moon, Sun, Terminal } from "lucide-react";
import { useCurrentMode } from "@/lib/hooks/use-current-mode";
import type { ModeKey } from "@/config/site";
import { cn } from "@/lib/utils";

const modes: { key: ModeKey; icon: typeof Globe; href: string; label: string }[] = [
  { key: "web", icon: Globe, href: "/", label: "Web" },
  { key: "cli", icon: Terminal, href: "/terminal", label: "Terminal" },
  { key: "immersive", icon: Joystick, href: "/experience", label: "Experience" },
];

export function FloatingToolbar() {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentMode = useCurrentMode();
  const { setTheme, theme, systemTheme } = useTheme();
  const router = useRouter();

  const resolvedTheme = theme === "system" ? systemTheme : theme;
  const isDark = resolvedTheme === "dark";
  const isImmersive = currentMode === "immersive";

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startAutoClose = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => setOpen(false), 3000);
  }, [clearTimer]);

  const toggle = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      if (next) startAutoClose();
      else clearTimer();
      return next;
    });
  }, [startAutoClose, clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const pillBase = cn(
    "fixed bottom-6 right-6 z-40 flex items-center gap-1 rounded-full p-1 shadow-lg transition-all duration-300",
    isImmersive
      ? "bg-black/60 border border-white/10 backdrop-blur-md"
      : "bg-background/80 border border-border/60 backdrop-blur-md"
  );

  const btnBase = cn(
    "flex items-center justify-center rounded-full transition-colors cursor-pointer",
    "h-10 w-10",
    isImmersive
      ? "text-white/80 hover:bg-white/10 hover:text-white"
      : "text-foreground/70 hover:bg-accent hover:text-foreground"
  );

  const activeBtn = isImmersive ? "bg-white/15 text-white" : "bg-accent text-foreground";

  return (
    <div className={pillBase}>
      {open && (
        <>
          {/* Theme toggle */}
          <button
            className={btnBase}
            aria-label="Toggle theme"
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          {/* Divider */}
          <div
            className={cn(
              "mx-0.5 h-5 w-px",
              isImmersive ? "bg-white/20" : "bg-border"
            )}
          />

          {/* Mode buttons */}
          {modes.map((m) => {
            const Icon = m.icon;
            const isActive = m.key === currentMode;
            return (
              <button
                key={m.key}
                className={cn(btnBase, isActive && activeBtn)}
                aria-label={`Switch to ${m.label} mode`}
                onClick={() => {
                  if (!isActive) router.push(m.href);
                }}
              >
                <Icon className="size-4" />
              </button>
            );
          })}

          {/* Divider */}
          <div
            className={cn(
              "mx-0.5 h-5 w-px",
              isImmersive ? "bg-white/20" : "bg-border"
            )}
          />
        </>
      )}

      {/* Toggle button */}
      <button
        className={cn(btnBase, "h-11 w-11")}
        aria-label={open ? "Close toolbar" : "Open toolbar"}
        onClick={toggle}
      >
        <Menu
          className={cn(
            "size-5 transition-transform duration-300",
            open && "rotate-90"
          )}
        />
      </button>
    </div>
  );
}
