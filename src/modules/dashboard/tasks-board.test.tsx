import { Loading } from "solid-js";
import { describe, expect, it } from "vite-plus/test";
import { page } from "vite-plus/test/browser";
import { expectScreenshot, renderWithProviders } from "~/testing";
import { HttpResponse, http, seedMockDb, worker } from "~/testing/msw";
import { STATUS_IN_PROGRESS, STATUS_NEW, STATUS_REVIEWED } from "./constansts";
import { CurrentlyPlayingContextProvider } from "./data-contexts/currently-playing-context";
import { TasksContextProvider } from "./data-contexts/tasks-context";
import { TasksBoard } from "./tasks-board";
import { createTask } from "./tests/fixtures";

/** Per-test override of the default `/api/tasks` handler. */
const getTasksOverride = () =>
  http.get("/api/tasks", ({ request }) => {
    const status = new URL(request.url).searchParams.get("status");

    return HttpResponse.json(
      status === STATUS_NEW
        ? [createTask({ id: "task-override", title: "Custom Task", status: STATUS_NEW })]
        : [],
    );
  });

describe("TasksBoard", () => {
  it("renders the tasks returned by the Hono API, grouped by status", async () => {
    seedMockDb({
      tasks: [
        createTask({ id: "task-new", title: "Nude", status: STATUS_NEW }),
        createTask({
          id: "task-progress",
          status: STATUS_IN_PROGRESS,
          title: "House of Cards",
        }),
        createTask({
          id: "task-reviewed",
          status: STATUS_REVIEWED,
          title: "Weird Fishes / Arpeggi",
        }),
      ],
    });

    renderTasksBoard();

    await expect.element(page.getByText("Nude").first()).toBeVisible();
    await expect.element(page.getByText("House of Cards").first()).toBeVisible();
    await expect.element(page.getByText("Weird Fishes / Arpeggi").first()).toBeVisible();
  });

  it("lets a test override an API handler for a single case", async () => {
    worker.use(getTasksOverride());

    renderTasksBoard();

    await expect.element(page.getByText("Custom Task").first()).toBeVisible();
    expect(page.getByText("In Rainbows").elements()).toHaveLength(0);
  });

  it("looks right with tasks in every column", async () => {
    // The three-column board is wider than the default test viewport; widen it
    // so the screenshot paints every column instead of the clipped scroll view.
    await page.viewport(2000, 900);

    seedMockDb({
      tasks: [
        createTask({ id: "task-new", title: "Nude", status: STATUS_NEW }),
        createTask({ id: "task-progress", status: STATUS_IN_PROGRESS, title: "House of Cards" }),
        createTask({
          id: "task-reviewed",
          status: STATUS_REVIEWED,
          title: "Weird Fishes / Arpeggi",
        }),
      ],
    });

    renderTasksBoard();

    await expect.element(page.getByText("Nude").first()).toBeVisible();
    await expect.element(page.getByText("House of Cards").first()).toBeVisible();
    await expect.element(page.getByText("Weird Fishes / Arpeggi").first()).toBeVisible();

    await expectScreenshot("columns");
  });
});

/**
 * Integration coverage for a composed UI feature: the board renders whatever
 * the Hono API returns through MSW, including mutations the components make.
 */
const renderTasksBoard = () =>
  renderWithProviders(() => (
    <Loading>
      <TasksContextProvider>
        <CurrentlyPlayingContextProvider>
          <TasksBoard />
        </CurrentlyPlayingContextProvider>
      </TasksContextProvider>
    </Loading>
  ));
