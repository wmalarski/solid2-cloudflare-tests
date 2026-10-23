import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { webVitalsRoute } from "./web-vitals";

const post = (body: unknown) =>
  webVitalsRoute.request("/", {
    method: "POST",
    headers: { "content-type": "application/json", "cf-connecting-ip": "203.0.113.10" },
    body: JSON.stringify(body),
  });

const sample = (overrides: Record<string, unknown> = {}) => ({
  name: "LCP",
  value: 1_234.6,
  delta: 1_234.6,
  id: "v6-1",
  navigationType: "navigate",
  ...overrides,
});

const report = (metrics: unknown[]) => ({ path: "/", connection: "4g", metrics });

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/rum", () => {
  it("accepts a report and logs normalized values", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const response = await post(report([sample()]));

    expect(response.status).toBe(204);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('"event":"web_vital"'));
    expect(log.mock.calls[0]?.[0]).toContain('"value":1235');
  });

  it("warns when a metric is over the poor boundary", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const response = await post(report([sample({ value: 4_500, delta: 4_500 })]));

    expect(response.status).toBe(204);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("web_vital_budget_exceeded"));
  });

  it("rejects unknown metrics and oversized batches", async () => {
    expect((await post(report([sample({ name: "FID" })]))).status).toBe(400);
    expect((await post(report(Array.from({ length: 11 }, () => sample())))).status).toBe(400);
  });
});
