import { expect, test } from "@playwright/test";

/**
 * Example E2E spec.
 *
 * Runs against the real dev server started by `playwright.config.ts`. The app
 * boots unauthenticated, so the first thing a visitor sees is the "Sign In
 * With Spotify" screen (see `src/app.tsx` -> `src/modules/auth/sign-in-form.tsx`).
 */
test.describe("sign-in screen", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders the app and the sign-in form", async ({ page }) => {
    await expect(page).toHaveTitle(/solid2-cloudflare-tests/);
    await expect(page.locator("form")).toBeVisible();
  });

  test("shows the Spotify sign-in button", async ({ page }) => {
    const signIn = page.getByRole("button", { name: "Sign In With Spotify" });

    await expect(signIn).toBeVisible();
    await expect(signIn).toBeEnabled();
  });

  test("starts the Spotify sign-in flow when clicked", async ({ page }) => {
    const authRequest = page.waitForRequest(
      (request) =>
        request.url().includes("/api/auth/sign-in/social") && request.method() === "POST",
    );

    await page.getByRole("button", { name: "Sign In With Spotify" }).click();

    const request = await authRequest;
    expect(request.postDataJSON()).toMatchObject({ provider: "spotify" });
  });
});
