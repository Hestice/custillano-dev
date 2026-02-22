"use client";

import { useEffect, useRef } from "react";

const DOT_SPACING = 32;
const DOT_BASE_RADIUS = 1;
const DOT_GLOW_RADIUS = 3;
const GLOW_RANGE = 150;

// Light mode: deeper violet
const LIGHT_COLOR = [120, 80, 220] as const;
const LIGHT_BASE_OPACITY = 0.15;
const LIGHT_GLOW_OPACITY = 0.6;

// Dark mode: brighter violet, higher opacity
const DARK_COLOR = [168, 130, 255] as const;
const DARK_BASE_OPACITY = 0.3;
const DARK_GLOW_OPACITY = 0.8;

function isDarkMode() {
  return (
    document.documentElement.classList.contains("dark") ||
    document.documentElement.dataset.theme === "dark"
  );
}

export function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);
  const reducedMotionRef = useRef(false);
  const darkRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    darkRef.current = isDarkMode();

    const observer = new MutationObserver(() => {
      darkRef.current = isDarkMode();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      canvas!.style.width = `${window.innerWidth}px`;
      canvas!.style.height = `${window.innerHeight}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      if (!ctx || !canvas) return;

      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const useGlow = !reducedMotionRef.current && mx > -999;
      const dark = darkRef.current;
      const [r, g, b] = dark ? DARK_COLOR : LIGHT_COLOR;
      const baseOpacity = dark ? DARK_BASE_OPACITY : LIGHT_BASE_OPACITY;
      const glowOpacity = dark ? DARK_GLOW_OPACITY : LIGHT_GLOW_OPACITY;

      for (let x = DOT_SPACING; x < w; x += DOT_SPACING) {
        for (let y = DOT_SPACING; y < h; y += DOT_SPACING) {
          let radius = DOT_BASE_RADIUS;
          let opacity = baseOpacity;

          if (useGlow) {
            const dx = x - mx;
            const dy = y - my;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < GLOW_RANGE) {
              const t = 1 - dist / GLOW_RANGE;
              radius = DOT_BASE_RADIUS + (DOT_GLOW_RADIUS - DOT_BASE_RADIUS) * t;
              opacity = baseOpacity + (glowOpacity - baseOpacity) * t;
            }
          }

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    function onMouseMove(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    }

    function onMouseLeave() {
      mouseRef.current = { x: -1000, y: -1000 };
    }

    resize();
    draw();

    window.addEventListener("resize", resize);
    if (!reducedMotionRef.current) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseleave", onMouseLeave);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 hidden md:block"
      aria-hidden="true"
    />
  );
}
