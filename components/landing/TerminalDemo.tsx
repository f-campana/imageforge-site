"use client";

import { useEffect, useRef, useState } from "react";

import { TERMINAL_LINES } from "@/components/landing/constants";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const PREVIEW_LINE_COUNT = 6;

export function TerminalDemo() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const shouldAnimate = prefersReducedMotion === false;
  const shouldReduceMotion = prefersReducedMotion === true;
  const [isInView, setIsInView] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PREVIEW_LINE_COUNT);
  const containerRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<number[]>([]);
  const animationStartedRef = useRef(false);

  useEffect(() => {
    if (!shouldAnimate) return;

    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(node);

    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
      observer.disconnect();
    };
  }, [shouldAnimate]);

  useEffect(() => {
    if (!shouldAnimate || !isInView || animationStartedRef.current) return;

    animationStartedRef.current = true;

    const startIndex = Math.min(PREVIEW_LINE_COUNT, TERMINAL_LINES.length);
    const baseDelay =
      startIndex > 0 ? (TERMINAL_LINES[startIndex - 1]?.delayMs ?? 0) : 0;

    timersRef.current = TERMINAL_LINES.slice(startIndex).map((line, index) =>
      window.setTimeout(
        () => {
          setVisibleCount(startIndex + index + 1);
        },
        Math.max(line.delayMs - baseDelay, 0),
      ),
    );

    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
    };
  }, [isInView, shouldAnimate]);

  const renderedCount = shouldReduceMotion
    ? TERMINAL_LINES.length
    : shouldAnimate
      ? visibleCount
      : PREVIEW_LINE_COUNT;

  return (
    <div ref={containerRef} className="mx-auto w-full max-w-3xl">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/70 shadow-[0_24px_120px_rgba(0,0,0,0.55)]">
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
          <span className="ml-2 font-mono text-xs tracking-[0.16em] text-zinc-500 uppercase">
            imageforge-demo
          </span>
        </div>
        <div className="min-h-[360px] overflow-x-auto p-4 md:p-6">
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
          {shouldAnimate &&
          isInView &&
          renderedCount < TERMINAL_LINES.length ? (
            <span className="terminal-cursor" aria-hidden="true" />
          ) : null}
        </div>
      </div>
    </div>
  );
}
