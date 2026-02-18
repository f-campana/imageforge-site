export type MotionSurface = "landing" | "benchmark";

type MotionSurfacePreset = {
  distancePx: number;
  durationSeconds: number;
  ease: [number, number, number, number];
  maxDelayMs: number;
  viewportAmount: number;
  viewportMargin: string;
};

const STANDARD_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const MOTION_SURFACE_PRESETS: Record<
  MotionSurface,
  MotionSurfacePreset
> = {
  landing: {
    distancePx: 10,
    durationSeconds: 0.3,
    ease: STANDARD_EASE,
    maxDelayMs: 160,
    viewportAmount: 0.2,
    viewportMargin: "0px 0px -6% 0px",
  },
  benchmark: {
    distancePx: 7,
    durationSeconds: 0.24,
    ease: STANDARD_EASE,
    maxDelayMs: 100,
    viewportAmount: 0.16,
    viewportMargin: "0px 0px -4% 0px",
  },
};

export const REVEAL_BUDGET = {
  landingAboveFoldAnimatedBlocks: 2,
  benchmarkAboveFoldAnimatedBlocks: 2,
} as const;

export const CYCLE3_TOP_HALF_BUDGET = {
  maxDurationSeconds: 0.24,
  maxDelayMs: 120,
  maxDistancePx: 8,
} as const;

export const TERMINAL_ANIMATION = {
  previewLines: 6,
  observerThreshold: 0.12,
  observerRootMargin: "0px 0px -12% 0px",
  revealStepMs: 95,
  cursorBlinkSeconds: 1.6,
} as const;

export function clampMotionDelay(surface: MotionSurface, delayMs = 0): number {
  const safeDelay = Number.isFinite(delayMs) ? Math.max(0, delayMs) : 0;
  return Math.min(safeDelay, MOTION_SURFACE_PRESETS[surface].maxDelayMs);
}

export function clampCycle3TopHalfDelay(delayMs = 0): number {
  const safeDelay = Number.isFinite(delayMs) ? Math.max(0, delayMs) : 0;
  return Math.min(safeDelay, CYCLE3_TOP_HALF_BUDGET.maxDelayMs);
}

export function clampCycle3TopHalfDuration(durationSeconds: number): number {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    return CYCLE3_TOP_HALF_BUDGET.maxDurationSeconds;
  }

  return Math.min(durationSeconds, CYCLE3_TOP_HALF_BUDGET.maxDurationSeconds);
}

export function clampCycle3TopHalfDistance(distancePx: number): number {
  if (!Number.isFinite(distancePx) || distancePx <= 0) {
    return CYCLE3_TOP_HALF_BUDGET.maxDistancePx;
  }

  return Math.min(distancePx, CYCLE3_TOP_HALF_BUDGET.maxDistancePx);
}
