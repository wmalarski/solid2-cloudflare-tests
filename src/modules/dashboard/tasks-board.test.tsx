import { Loading } from "solid-js";
import { describe, expect, it } from "vite-plus/test";
import { page } from "vite-plus/test/browser";
import { expectScreenshot, renderWithProviders } from "~/testing";
import { HttpResponse, http, seedMockDb, worker } from "~/testing/msw";
import { getMockDb } from "~/testing/msw/db";
import { STATUS_IN_PROGRESS, STATUS_NEW, STATUS_REVIEWED, TASKS_PAGE_SIZE } from "./constansts";
import { CurrentlyPlayingContextProvider } from "./data-contexts/currently-playing-context";
import { TasksContextProvider } from "./data-contexts/tasks-context";
import { TasksBoard } from "./tasks-board";
import { createTask } from "./tests/fixtures";
import type { TaskStatus } from "./validation";

/** Per-test override of the default `/api/tasks` handler. */
const getTasksOverride = () =>
  http.get("/api/tasks", ({ request }) => {
    const status = new URL(request.url).searchParams.get("status");

    return HttpResponse.json({
      hasNext: false,
      items:
        status === STATUS_NEW
          ? [createTask({ id: "task-override", title: "Custom Task", status: STATUS_NEW })]
          : [],
    });
  });

/** Seeds `count` tasks in one column, titled `<label> 01` … `<label> NN`. */
const createTasksForColumn = (status: TaskStatus, label: string, count: number) =>
  Array.from({ length: count }, (_, index) => {
    const suffix = String(index + 1).padStart(2, "0");

    return createTask({ id: `${status}-${suffix}`, status, title: `${label} ${suffix}` });
  });

/**
 * The column wrapper. Walking up from the heading reaches the cards and the
 * pagination controls, so assertions and clicks stay scoped to one column.
 */
const columnUnder = (heading: string) =>
  page.getByRole("heading", { name: heading }).element().closest("div")!;

const findColumnButton = (heading: string, name: string) =>
  [...columnUnder(heading).querySelectorAll("button")].find(
    (candidate) => candidate.textContent?.trim() === name,
  );

const columnButton = (heading: string, name: string): HTMLButtonElement => {
  const button = findColumnButton(heading, name);

  if (!button) {
    throw new Error(`No "${name}" button in the "${heading}" column`);
  }

  return button;
};

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

  it("loads more tasks into a column without replacing the loaded ones", async () => {
    seedMockDb({ tasks: createTasksForColumn(STATUS_NEW, "New", 12) });

    renderTasksBoard();

    await expect.element(page.getByText("New 01").first()).toBeVisible();
    expect(page.getByText("New 11").elements()).toHaveLength(0);

    columnButton("New", "Load more").click();

    // The second page is appended and the previously loaded page stays put.
    await expect.element(page.getByText("New 11").first()).toBeVisible();
    await expect.element(page.getByText("New 12").first()).toBeVisible();
    await expect.element(page.getByText("New 01").first()).toBeVisible();

    // All pages are loaded; nothing left to load.
    expect(findColumnButton("New", "Load more")).toBeUndefined();
  });

  it("loads more pages per column independently", async () => {
    seedMockDb({
      tasks: [
        ...createTasksForColumn(STATUS_NEW, "New", 12),
        ...createTasksForColumn(STATUS_IN_PROGRESS, "Progress", 12),
      ],
    });

    renderTasksBoard();

    await expect.element(page.getByText("New 01").first()).toBeVisible();
    await expect.element(page.getByText("Progress 01").first()).toBeVisible();

    // Growing "New" leaves "In progress" on its own first page.
    columnButton("New", "Load more").click();

    await expect.element(page.getByText("New 11").first()).toBeVisible();
    await expect.element(page.getByText("Progress 01").first()).toBeVisible();
    expect(page.getByText("Progress 11").elements()).toHaveLength(0);

    // Growing "In progress" leaves "New" fully loaded.
    columnButton("In progress", "Load more").click();

    await expect.element(page.getByText("Progress 11").first()).toBeVisible();
    await expect.element(page.getByText("New 11").first()).toBeVisible();
  });

  it("hides Load more for a column that fits on one page", async () => {
    seedMockDb({ tasks: createTasksForColumn(STATUS_NEW, "New", 3) });

    renderTasksBoard();

    await expect.element(page.getByText("New 03").first()).toBeVisible();
    expect(findColumnButton("New", "Load more")).toBeUndefined();
  });

  it("keeps the loaded tasks visible and disables Load more while a page is in flight", async () => {
    seedMockDb({ tasks: createTasksForColumn(STATUS_NEW, "New", 12) });

    // Same handler as the default one, but the second page answers slowly so
    // the pending state is observable.
    worker.use(
      http.get("/api/tasks", async ({ request }) => {
        const url = new URL(request.url);
        const status = url.searchParams.get("status");
        const page = Number(url.searchParams.get("page") ?? 0);

        if (page > 0) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }

        const tasks = getMockDb().tasks.filter((task) => task.status === status);
        const start = page * TASKS_PAGE_SIZE;

        return HttpResponse.json({
          hasNext: start + TASKS_PAGE_SIZE < tasks.length,
          items: tasks.slice(start, start + TASKS_PAGE_SIZE),
        });
      }),
    );

    renderTasksBoard();

    await expect.element(page.getByText("New 01").first()).toBeVisible();

    columnButton("New", "Load more").click();

    await expect.element(page.getByRole("button", { name: "Load more" })).toBeDisabled();
    await expect.element(page.getByText("New 01").first()).toBeVisible();

    await expect.element(page.getByText("New 11").first()).toBeVisible();
    expect(page.getByRole("button", { name: "Load more" }).elements()).toHaveLength(0);
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
