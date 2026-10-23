import { Loading } from "solid-js";
import { describe, expect, it } from "vite-plus/test";
import { page } from "vite-plus/test/browser";
import { expectScreenshot, renderWithProviders } from "~/testing";
import { seedMockDb } from "~/testing/msw";
import { CurrentlyPlayingContextProvider } from "../data-contexts/currently-playing-context";
import { TasksContextProvider } from "../data-contexts/tasks-context";
import { CurrentlyPlayingSection } from "./currently-playing-section";
import { createPlaybackState } from "../tests/fixtures";

/**
 * Integration coverage for the currently playing card: it renders whatever the
 * mocked `/api/player/currently-playing` endpoint returns.
 */
const renderCurrentlyPlayingSection = () =>
  renderWithProviders(() => (
    <Loading>
      <TasksContextProvider>
        <CurrentlyPlayingContextProvider>
          <CurrentlyPlayingSection />
        </CurrentlyPlayingContextProvider>
      </TasksContextProvider>
    </Loading>
  ));

describe("CurrentlyPlayingSection", () => {
  it("renders the currently playing album from the mocked player endpoint", async () => {
    seedMockDb({ currentlyPlaying: createPlaybackState() });

    renderCurrentlyPlayingSection();

    await expect.element(page.getByText("In Rainbows").first()).toBeVisible();
  });

  it("looks right with an album playing", async () => {
    seedMockDb({ currentlyPlaying: createPlaybackState() });

    renderCurrentlyPlayingSection();

    await expect.element(page.getByText("In Rainbows").first()).toBeVisible();

    await expectScreenshot("playing");
  });
});
