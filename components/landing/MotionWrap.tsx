"use client";

import { type CSSProperties, type ReactNode } from "react";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type MotionWrapProps = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
};

export function MotionWrap({
  children,
  className,
  delayMs = 0,
}: MotionWrapProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const shouldAnimate = prefersReducedMotion === false;

  const style: CSSProperties | undefined = shouldAnimate
    ? { animationDelay: `${delayMs}ms` }
    : undefined;

  return (
    <div
      className={`${className ?? ""} ${shouldAnimate ? "motion-rise" : ""}`}
      style={style}
    >
      {children}
    </div>
  );
}
