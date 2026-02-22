"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { useTouchDevice } from "@/lib/hooks/use-touch-device";

type Origin = "top-left" | "center" | "bottom-right";

interface ClipRevealProps {
  children: React.ReactNode;
  className?: string;
  origin?: Origin;
  delay?: number;
  duration?: number;
  once?: boolean;
}

const clipPaths: Record<Origin, { from: string; to: string }> = {
  "top-left": {
    from: "inset(0 100% 100% 0)",
    to: "inset(0 0% 0% 0)",
  },
  center: {
    from: "inset(50% 50% 50% 50%)",
    to: "inset(0% 0% 0% 0%)",
  },
  "bottom-right": {
    from: "inset(100% 0 0 100%)",
    to: "inset(0 0 0 0)",
  },
};

export function ClipReveal({
  children,
  className,
  origin = "center",
  delay = 0,
  duration = 0.7,
  once = true,
}: ClipRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const isTouch = useTouchDevice();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  // Mobile fallback: simple opacity + scale instead of clipPath
  if (isTouch) {
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0, scale: 0.92 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once, margin: "-30px" }}
        transition={{
          duration: duration * 0.8,
          delay,
          ease: [0.25, 0.4, 0.25, 1] as const,
        }}
      >
        {children}
      </motion.div>
    );
  }

  const paths = clipPaths[origin];

  return (
    <motion.div
      className={className}
      initial={{ clipPath: paths.from, opacity: 0 }}
      whileInView={{ clipPath: paths.to, opacity: 1 }}
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
