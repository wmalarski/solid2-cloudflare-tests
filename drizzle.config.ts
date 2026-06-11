/** biome-ignore-all lint/style/noNonNullAssertion: needed */
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  },
  dialect: "sqlite",
  driver: "d1-http",
  out: "./drizzle",
  schema: "./src/integrations/drizzle/schema.ts",
});
