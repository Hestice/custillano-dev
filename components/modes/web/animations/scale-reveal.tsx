"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

interface ScaleRevealProps {
  children: React.ReactNode;
  className?: string;
  initialScale?: number;
  delay?: number;
  duration?: number;
  once?: boolean;
}

export function ScaleReveal({
  children,
  className,
  initialScale = 0.85,
  delay = 0,
  duration = 0.6,
  once = true,
}: ScaleRevealProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: initialScale }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once, margin: "-50px" }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.4, 0.25, 1] as const,
      }}
    >
      {children}
    </motion.div>
  );
}
