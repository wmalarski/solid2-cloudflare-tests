import { describe, expect, it } from "vite-plus/test";
import { page } from "vite-plus/test/browser";
import { expectScreenshot, renderUi } from "../test-utils";
import { AlertDialog } from "./alert-dialog";

describe("AlertDialog", () => {
  it("renders the title, description and the default save label", async () => {
    const container = renderUi(() => (
      <AlertDialog
        description="Delete selected task from the list"
        dialogId="alert-default"
        open
        title="Delete task"
      />
    ));

    expect(container.querySelector("h3")).toHaveTextContent("Delete task");
    expect(container.querySelector("p")).toHaveTextContent("Delete selected task from the list");
    await expect.element(page.getByRole("button", { name: "Save" })).toBeVisible();
  });

  it("uses a custom submit label and colour", async () => {
    renderUi(() => (
      <AlertDialog
        description="This action cannot be undone."
        dialogId="alert-custom"
        open
        submitColor="error"
        submitLabel="Delete"
        title="Delete task"
      />
    ));

    const submit = page.getByRole("button", { name: "Delete" });
    await expect.element(submit).toHaveClass("btn-error");
  });

  it("calls onSave when the confirm button is clicked", async () => {
    let saves = 0;
    renderUi(() => (
      <AlertDialog
        description="Delete selected task from the list"
        dialogId="alert-save"
        onSave={() => saves++}
        open
        title="Delete task"
      />
    ));

    await page.getByRole("button", { name: "Save" }).click();

    expect(saves).toBe(1);
  });

  it("looks right when open", async () => {
    const container = renderUi(() => (
      <AlertDialog
        description="This action cannot be undone."
        dialogId="alert-screenshot"
        open
        submitColor="error"
        submitLabel="Delete"
        title="Delete task"
      />
    ));

    await expectScreenshot("open", page.elementLocator(container.querySelector(".modal-box")!));
  });
});
