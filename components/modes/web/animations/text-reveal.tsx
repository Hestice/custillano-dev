"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

const motionElements = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  p: motion.p,
  span: motion.span,
} as const;

type MotionTag = keyof typeof motionElements;

interface TextRevealProps {
  text: string;
  as?: MotionTag;
  className?: string;
  wordDelay?: number;
  delay?: number;
  duration?: number;
  mount?: boolean;
}

export function TextReveal({
  text,
  as: tag = "h1",
  className,
  wordDelay = 0.08,
  delay = 0,
  duration = 0.5,
  mount = false,
}: TextRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const Tag = tag;

  if (prefersReducedMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  const words = text.split(" ");
  const MotionTag = motionElements[tag];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: wordDelay,
        delayChildren: delay,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration, ease: [0.25, 0.4, 0.25, 1] as const },
    },
  };

  const viewProps = mount
    ? { initial: "hidden" as const, animate: "visible" as const }
    : {
        initial: "hidden" as const,
        whileInView: "visible" as const,
        viewport: { once: true, margin: "-50px" },
      };

  return (
    <MotionTag key={text} className={className} variants={containerVariants} {...viewProps}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          variants={wordVariants}
          className="inline-block"
        >
          {word}
          {i < words.length - 1 && "\u00A0"}
        </motion.span>
      ))}
    </MotionTag>
  );
}
