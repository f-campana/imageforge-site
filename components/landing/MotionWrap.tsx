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

  const style: CSSProperties | undefined = prefersReducedMotion
    ? undefined
    : { animationDelay: `${delayMs}ms` };

  return (
    <div
      className={`${className ?? ""} ${prefersReducedMotion ? "" : "motion-rise"}`}
      style={style}
    >
      {children}
    </div>
  );
}
