"use client";

import { SpeedInsights } from "@vercel/speed-insights/next";

import { shouldSuppressTelemetry } from "@/lib/analytics/browser-opt-out";

export function VercelSpeedInsights() {
  return (
    <SpeedInsights
      sampleRate={1}
      debug={false}
      beforeSend={(event) => {
        if (shouldSuppressTelemetry()) {
          return null;
        }

        return event;
      }}
    />
  );
}
