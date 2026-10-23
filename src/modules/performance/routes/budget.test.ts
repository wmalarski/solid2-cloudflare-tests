import { describe, expect, it } from "vite-plus/test";
import { rateWebVital, webVitalBudget, webVitalNames } from "./budget";

describe("rateWebVital", () => {
  it("rates a value against the good and poor boundaries", () => {
    expect(rateWebVital("LCP", 1_000)).toBe("good");
    expect(rateWebVital("LCP", 2_500)).toBe("good");
    expect(rateWebVital("LCP", 2_501)).toBe("needs-improvement");
    expect(rateWebVital("LCP", 4_000)).toBe("needs-improvement");
    expect(rateWebVital("LCP", 4_001)).toBe("poor");
  });

  it("gives every reported metric an ascending pair of boundaries", () => {
    for (const name of webVitalNames) {
      const [good, poor] = webVitalBudget[name];

      expect(good, `${name} good boundary`).toBeGreaterThan(0);
      expect(poor, `${name} poor boundary`).toBeGreaterThan(good);
    }
  });
});
