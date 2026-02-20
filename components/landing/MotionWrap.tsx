"use client";

import { motion, useReducedMotion } from "motion/react";
import { type ReactNode } from "react";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  MOTION_SURFACE_PRESETS,
  clampCycle3TopHalfDelay,
  clampCycle3TopHalfDistance,
  clampCycle3TopHalfDuration,
  clampMotionDelay,
  type MotionSurface,
} from "@/lib/animation/config";

type MotionWrapProps = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  surface?: MotionSurface;
  mode?: "in-view" | "load-once" | "static";
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
  const canAnimate =
    prefersReducedMotion === false && reduceMotionFromMotion !== true;

  if (!canAnimate || mode === "static") {
    return <div className={className}>{children}</div>;
  }

  const preset = MOTION_SURFACE_PRESETS[surface];
  const delayMsClamped =
    mode === "load-once"
      ? clampCycle3TopHalfDelay(delayMs)
      : clampMotionDelay(surface, delayMs);
  const durationSeconds =
    mode === "load-once"
      ? clampCycle3TopHalfDuration(preset.durationSeconds)
      : preset.durationSeconds;
  const distancePx =
    mode === "load-once"
      ? clampCycle3TopHalfDistance(preset.distancePx)
      : preset.distancePx;
  const delaySeconds = delayMsClamped / 1000;

  if (mode === "load-once") {
    return (
      <motion.div
        className={className}
        data-motion-wrap={surface}
        data-motion-mode="load-once"
        initial={{ opacity: 0, y: distancePx }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: durationSeconds,
          delay: delaySeconds,
          ease: preset.ease,
        }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      data-motion-wrap={surface}
      data-motion-mode="in-view"
      initial={{ opacity: 0, y: distancePx }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{
        once: true,
        amount: preset.viewportAmount,
        margin: preset.viewportMargin,
      }}
      transition={{
        duration: durationSeconds,
        delay: delaySeconds,
        ease: preset.ease,
      }}
    >
      {children}
    </motion.div>
  );
}
