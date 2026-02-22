"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { useTouchDevice } from "@/lib/hooks/use-touch-device";

interface ParallaxProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  direction?: "vertical" | "horizontal";
}

export function Parallax({
  children,
  className,
  speed = 0.3,
  direction = "vertical",
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isTouch = useTouchDevice();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const effectiveSpeed = isTouch ? speed * 0.5 : speed;
  const range = 100 * effectiveSpeed;

  const y = useTransform(scrollYProgress, [0, 1], [-range, range]);
  const x = useTransform(scrollYProgress, [0, 1], [-range, range]);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={direction === "vertical" ? { y } : { x }}
    >
      {children}
    </motion.div>
  );
}
