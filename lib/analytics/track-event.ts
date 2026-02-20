"use client";

import { track } from "@vercel/analytics";

import type {
  AnalyticsEventName,
  AnalyticsEventProperties,
} from "@/lib/analytics/events";

const customEventsEnabled =
  process.env.NEXT_PUBLIC_ANALYTICS_CUSTOM_EVENTS === "1";

export function trackEvent(
  name: AnalyticsEventName,
  properties?: AnalyticsEventProperties,
) {
  if (!customEventsEnabled) {
    return;
  }

  track(name, properties);
}
