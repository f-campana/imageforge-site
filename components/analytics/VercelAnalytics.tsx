"use client";

import {
  Analytics,
  type AnalyticsProps,
  type BeforeSend,
} from "@vercel/analytics/next";

import { shouldSuppressTelemetry } from "@/lib/analytics/browser-opt-out";

type VercelAnalyticsProps = {
  mode: AnalyticsProps["mode"];
};

const beforeSend: BeforeSend = (event) => {
  if (shouldSuppressTelemetry()) {
    return null;
  }

  return event;
};

export function VercelAnalytics({ mode }: VercelAnalyticsProps) {
  return <Analytics mode={mode} debug={false} beforeSend={beforeSend} />;
}
