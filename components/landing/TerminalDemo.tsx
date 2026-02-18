"use client";

import { useEffect, useRef, useState } from "react";

import { TERMINAL_LINES } from "@/components/landing/constants";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { TERMINAL_ANIMATION } from "@/lib/animation/config";

const PREVIEW_LINE_COUNT = TERMINAL_ANIMATION.previewLines;
const INITIAL_VISIBLE_COUNT = Math.min(
  PREVIEW_LINE_COUNT,
  TERMINAL_LINES.length,
);

export function TerminalDemo() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const shouldAnimate = prefersReducedMotion === false;
  const shouldReduceMotion = prefersReducedMotion === true;
  const [isInView, setIsInView] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [showFullOutput, setShowFullOutput] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const revealTimerRef = useRef<number | null>(null);
  const animationStartedRef = useRef(false);

  const clearRevealTimer = () => {
    if (revealTimerRef.current !== null) {
      window.clearInterval(revealTimerRef.current);
      revealTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearRevealTimer();
    };
  }, []);

  useEffect(() => {
    if (!shouldAnimate || showFullOutput) return;

    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: TERMINAL_ANIMATION.observerThreshold,
        rootMargin: TERMINAL_ANIMATION.observerRootMargin,
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [shouldAnimate, showFullOutput]);

  useEffect(() => {
    if (
      !shouldAnimate ||
      !isInView ||
      showFullOutput ||
      animationStartedRef.current
    )
      return;

    animationStartedRef.current = true;

    revealTimerRef.current = window.setInterval(() => {
      setVisibleCount((currentCount) => {
        if (currentCount >= TERMINAL_LINES.length) {
          clearRevealTimer();
          return currentCount;
        }

        return currentCount + 1;
      });
    }, TERMINAL_ANIMATION.revealStepMs);

    return () => {
      clearRevealTimer();
    };
  }, [isInView, shouldAnimate, showFullOutput]);

  const handleShowFullOutput = () => {
    setShowFullOutput(true);
    clearRevealTimer();
    setVisibleCount(TERMINAL_LINES.length);
  };

  const renderedCount = shouldReduceMotion
    ? TERMINAL_LINES.length
    : showFullOutput
      ? TERMINAL_LINES.length
      : shouldAnimate
        ? visibleCount
        : PREVIEW_LINE_COUNT;

  const isRevealing =
    shouldAnimate &&
    isInView &&
    !showFullOutput &&
    renderedCount < TERMINAL_LINES.length;

  return (
    <div ref={containerRef} className="mx-auto w-full max-w-[760px]">
      <div className="panel-card-strong overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/14 bg-white/[0.05] px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
          <span className="ml-2 font-mono text-[0.68rem] tracking-[0.16em] text-zinc-500 uppercase">
            terminal
          </span>
        </div>
        <div className="min-h-[420px] overflow-x-auto px-4 py-4 md:px-6 md:py-6">
          {TERMINAL_LINES.slice(0, renderedCount).map((line, index) => (
            <div
              key={`${index}-${line.text}`}
              className={`terminal-line ${line.tone}`}
              style={{
                minHeight: line.text.length === 0 ? "1.3em" : undefined,
              }}
            >
              {line.text}
            </div>
          ))}
          {isRevealing ? (
            <span
              className="terminal-cursor"
              aria-hidden="true"
              style={{
                animationDuration: `${TERMINAL_ANIMATION.cursorBlinkSeconds}s`,
              }}
            />
          ) : null}
        </div>
      </div>
      {!shouldReduceMotion && renderedCount < TERMINAL_LINES.length ? (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={handleShowFullOutput}
            className="rounded-md border border-white/18 bg-white/[0.03] px-3 py-1.5 font-mono text-[0.68rem] tracking-[0.08em] text-zinc-300 uppercase transition hover:border-white/28 hover:text-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
          >
            Show full output
          </button>
        </div>
      ) : null}
    </div>
  );
}
