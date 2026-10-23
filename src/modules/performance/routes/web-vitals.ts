import { sValidator } from "@hono/standard-validator";
import * as v from "valibot";
import { logInfo, logWarn } from "~/integrations/logger";
import {
  rateWebVital,
  webVitalNames,
  type WebVitalName,
} from "~/modules/performance/routes/budget";
import { factory } from "~/worker/factory";
import { webVitalsRateLimit } from "./rate-limit";

const metricSchema = v.object({
  name: v.picklist(webVitalNames),
  value: v.pipe(v.number(), v.finite(), v.minValue(0)),
  delta: v.pipe(v.number(), v.finite(), v.minValue(0)),
  id: v.pipe(v.string(), v.minLength(1), v.maxLength(64)),
  navigationType: v.optional(v.pipe(v.string(), v.maxLength(32))),
});

const reportSchema = v.object({
  path: v.pipe(v.string(), v.maxLength(512)),
  connection: v.optional(v.pipe(v.string(), v.maxLength(32))),
  metrics: v.pipe(v.array(metricSchema), v.minLength(1), v.maxLength(10)),
});

const roundValue = (name: WebVitalName, value: number) =>
  name === "CLS" ? Math.round(value * 1_000) / 1_000 : Math.round(value);

export const webVitalsRoute = factory
  .createApp()
  .use(webVitalsRateLimit)
  .post("/", sValidator("json", reportSchema), (context) => {
    const requestId = context.get("requestId");
    const { connection, metrics, path } = context.req.valid("json");

    for (const metric of metrics) {
      const rating = rateWebVital(metric.name, metric.value);
      const fields = {
        requestId,
        connection,
        delta: roundValue(metric.name, metric.delta),
        id: metric.id,
        metric: metric.name,
        navigationType: metric.navigationType,
        path,
        rating,
        value: roundValue(metric.name, metric.value),
      };

      if (rating === "poor") {
        logWarn("web_vital_budget_exceeded", fields);
      } else {
        logInfo("web_vital", fields);
      }
    }

    return context.body(null, 204);
  });
