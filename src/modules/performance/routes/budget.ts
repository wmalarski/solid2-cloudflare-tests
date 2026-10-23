import budget from "../../../../performance-budget.json";

/**
 * The Core Web Vitals the client reports and the Worker evaluates.
 *
 * Kept as a tuple so `v.picklist` can infer the union of names. The `Record`
 * below fails to compile if a name is added without a matching budget.
 */
export const webVitalNames = ["CLS", "FCP", "INP", "LCP", "TTFB"] as const;

export type WebVitalName = (typeof webVitalNames)[number];

export type WebVitalRating = "good" | "needs-improvement" | "poor";

/** `[good, poor]` boundaries from `performance-budget.json`. */
export const webVitalBudget: Record<WebVitalName, readonly number[]> = budget.webVitals;

/** Applies the same boundaries `web-vitals` uses, but from our budget file. */
export const rateWebVital = (name: WebVitalName, value: number): WebVitalRating => {
  const [good, poor] = webVitalBudget[name];

  if (value <= good) {
    return "good";
  }

  if (value <= poor) {
    return "needs-improvement";
  }

  return "poor";
};
