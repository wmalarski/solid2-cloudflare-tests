import { Loading } from "solid-js";
import { describe, expect, it } from "vite-plus/test";
import { page } from "vite-plus/test/browser";
import { renderWithProviders } from "~/testing";
import { seedMockDb } from "~/testing/msw";
import { STATUS_IN_PROGRESS, STATUS_NEW, STATUS_REVIEWED } from "./primitives/constansts";
import { CurrentlyPlayingContextProvider } from "./data-contexts/currently-playing-context";
import { TasksContextProvider } from "./data-contexts/tasks-context";
import { CurrentlyPlayingSection } from "./currently-playing-section/currently-playing-section";
import { TasksBoard } from "./tasks-board";
import { createPlaybackState, createTask } from "./tests/fixtures";

/** The `<dialog>` currently in the top layer; closed dialogs stay hidden. */
const openDialog = () => page.getByRole("dialog");

/** Poll options generous enough to cover the mocked round-trip and refresh. */
const poll = { timeout: 5_000 };

/**
 * The board column rendered under the heading with the given (translated)
 * label. Walks up from the heading to its column wrapper so assertions can be
 * scoped to a single status.
 */
const columnUnder = (heading: string) =>
  page.getByRole("heading", { name: heading }).element().closest("div")!;

const columnText = (heading: string) => columnUnder(heading).textContent ?? "";

/** The card whose title matches, located by its title instead of its actions. */
const cardWithTitle = (title: string) =>
  [...document.querySelectorAll<HTMLElement>("li")].find(
    (card) => card.querySelector(".card-title")?.textContent === title,
  ) ?? null;

/** Reads the value shown next to an `InfoRowItem` label inside a card. */
const infoValue = (card: HTMLElement, name: string) => {
  const label = [...card.querySelectorAll("span.font-semibold")].find(
    (span) => span.textContent === name,
  );

  return label?.nextElementSibling?.textContent ?? null;
};

/** Nests the board (and optionally the player card) in the dashboard contexts. */
const renderBoard = (withPlayer = false) =>
  renderWithProviders(() => (
    <Loading>
      <TasksContextProvider>
        <CurrentlyPlayingContextProvider>
          <TasksBoard />
          {withPlayer ? <CurrentlyPlayingSection /> : null}
        </CurrentlyPlayingContextProvider>
      </TasksContextProvider>
    </Loading>
  ));

/**
 * Integration coverage for the task mutations exposed on the board: each test
 * drives the real dialogs and forms, lets the `action` hit the mocked Hono API,
 * and asserts on what the board shows after it refreshes.
 */
describe("task actions", () => {
  it("creates a task from the currently playing album", async () => {
    seedMockDb({ currentlyPlaying: createPlaybackState(), tasks: [] });

    renderBoard(true);

    // The player card only offers the "Save album" dialog once the album loads.
    await expect.element(page.getByRole("button", { name: "Save" })).toBeVisible();
    await page.getByRole("button", { name: "Save" }).click();

    const dialog = openDialog();
    await dialog.getByLabelText("Note").fill("Great record");
    await dialog.getByLabelText("Rate").fill("9");
    await dialog.getByLabelText("Status").selectOptions(STATUS_IN_PROGRESS);
    await dialog.getByRole("button", { name: "Save" }).click();

    // The optimistic insert lands in the "In progress" column and the follow-up
    // GET confirms it with the note that was submitted.
    await expect.poll(() => columnText("In progress"), poll).toContain("Great record");
  });

  it("updates a task's note and rate", async () => {
    seedMockDb({
      tasks: [createTask({ id: "task-1", note: null, rate: null, status: STATUS_NEW })],
    });

    renderBoard();

    await page.getByRole("button", { name: "Update" }).first().click();

    const dialog = openDialog();
    await dialog.getByLabelText("Note").fill("Best song");
    await dialog.getByLabelText("Rate").fill("7");
    await dialog.getByRole("button", { name: "Update" }).click();

    await expect.poll(() => cardWithTitle("In Rainbows")?.textContent, poll).toContain("Best song");
    await expect
      .poll(() => {
        const card = cardWithTitle("In Rainbows");
        return card ? infoValue(card, "Rate") : null;
      }, poll)
      .toBe("7");
  });

  it("moves a task to another column when its status changes", async () => {
    seedMockDb({
      tasks: [createTask({ id: "task-1", title: "Kid A", status: STATUS_NEW })],
    });

    renderBoard();

    await page.getByRole("button", { name: "Update" }).first().click();

    const dialog = openDialog();
    await dialog.getByLabelText("Status").selectOptions(STATUS_REVIEWED);
    await dialog.getByRole("button", { name: "Update" }).click();

    await expect.poll(() => columnText("Reviewed"), poll).toContain("Kid A");
    expect(columnText("New")).not.toContain("Kid A");
  });

  it("deletes a task after confirming the alert dialog", async () => {
    seedMockDb({
      tasks: [createTask({ id: "task-1", title: "Kid A", status: STATUS_NEW })],
    });

    renderBoard();

    await expect.poll(() => cardWithTitle("Kid A"), poll).not.toBeNull();

    await page.getByRole("button", { name: "Delete" }).first().click();
    await openDialog().getByRole("button", { name: "Delete" }).click();

    await expect.poll(() => cardWithTitle("Kid A"), poll).toBeNull();
  });

  it("keeps the task when the delete dialog is dismissed", async () => {
    seedMockDb({
      tasks: [createTask({ id: "task-1", title: "Kid A", status: STATUS_NEW })],
    });

    renderBoard();

    await page.getByRole("button", { name: "Delete" }).first().click();
    await expect.poll(() => document.querySelector("dialog[open]"), poll).not.toBeNull();

    // The alert dialog offers two "Close" buttons (action + backdrop).
    await openDialog().getByRole("button", { name: "Close" }).first().click();

    await expect.poll(() => document.querySelector("dialog[open]"), poll).toBeNull();
    expect(cardWithTitle("Kid A")).not.toBeNull();
  });
});
