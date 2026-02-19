const ANALYTICS_QUERY_PARAM = "analytics";
const ANALYTICS_OPT_OUT_STORAGE_KEY = "imageforge.analytics.optOut";

export function applyAnalyticsOptOutFromQuery() {
  if (typeof window === "undefined") {
    return;
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
  } catch {
    // Ignore browser storage/query access failures and keep telemetry enabled.
  }
}

export function isAnalyticsOptOutEnabled(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(ANALYTICS_OPT_OUT_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function shouldSuppressTelemetry(): boolean {
  applyAnalyticsOptOutFromQuery();
  return isAnalyticsOptOutEnabled();
}
