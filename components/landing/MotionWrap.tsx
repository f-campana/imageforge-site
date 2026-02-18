"use client";

import { motion, useReducedMotion } from "motion/react";
import { type ReactNode } from "react";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  MOTION_SURFACE_PRESETS,
  clampMotionDelay,
  type MotionSurface,
} from "@/lib/animation/config";

type MotionWrapProps = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  surface?: MotionSurface;
  mode?: "in-view" | "static";
};

export function MotionWrap({
  children,
  className,
  delayMs = 0,
  surface = "landing",
  mode = "in-view",
}: MotionWrapProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const reduceMotionFromMotion = useReducedMotion();
  const shouldAnimate =
    prefersReducedMotion === false &&
    reduceMotionFromMotion !== true &&
    mode === "in-view";

  if (!shouldAnimate) {
    return <div className={className}>{children}</div>;
  }

  const preset = MOTION_SURFACE_PRESETS[surface];
  const delaySeconds = clampMotionDelay(surface, delayMs) / 1000;

  return (
    <motion.div
      className={className}
      data-motion-wrap={surface}
      initial={{ opacity: 0, y: preset.distancePx }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{
        once: true,
        amount: preset.viewportAmount,
        margin: preset.viewportMargin,
      }}
      transition={{
        duration: preset.durationSeconds,
        delay: delaySeconds,
        ease: preset.ease,
      }}
    >
      {children}
    </motion.div>
  );
}
