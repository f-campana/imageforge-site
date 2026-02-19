"use client";

import {
  Analytics,
  type AnalyticsProps,
  type BeforeSend,
} from "@vercel/analytics/next";

const ANALYTICS_QUERY_PARAM = "analytics";
const ANALYTICS_OPT_OUT_STORAGE_KEY = "imageforge.analytics.optOut";

type VercelAnalyticsProps = {
  mode: AnalyticsProps["mode"];
};

function shouldBlockAnalytics(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const queryValue = new URLSearchParams(window.location.search).get(
      ANALYTICS_QUERY_PARAM,
    );

    if (queryValue === "off") {
      window.localStorage.setItem(ANALYTICS_OPT_OUT_STORAGE_KEY, "1");
    } else if (queryValue === "on") {
      window.localStorage.removeItem(ANALYTICS_OPT_OUT_STORAGE_KEY);
    }

    return window.localStorage.getItem(ANALYTICS_OPT_OUT_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

const beforeSend: BeforeSend = (event) => {
  if (shouldBlockAnalytics()) {
    return null;
  }

  return event;
};

export function VercelAnalytics({ mode }: VercelAnalyticsProps) {
  return <Analytics mode={mode} debug={false} beforeSend={beforeSend} />;
}
