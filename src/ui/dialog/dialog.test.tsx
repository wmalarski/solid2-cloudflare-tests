import { describe, expect, it } from "vite-plus/test";
import { page } from "vite-plus/test/browser";
import { Button } from "../button/button";
import { expectScreenshot, renderUi } from "../test-utils";
import {
  closeDialog,
  Dialog,
  DialogActions,
  DialogBackdrop,
  DialogBox,
  DialogClose,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  openDialog,
} from "./dialog";

describe("Dialog", () => {
  it("renders a dialog element with its id and open styling", () => {
    const container = renderUi(() => <Dialog id="dialog-open" open />);

    const dialog = container.querySelector("dialog#dialog-open");
    expect(dialog).toHaveClass("modal");
    expect(dialog).toHaveClass("modal-open");
  });

  it("applies the placement classes", () => {
    const container = renderUi(() => (
      <>
        <Dialog id="dialog-top" vertical="top" />
        <Dialog id="dialog-end" horizontal="end" />
      </>
    ));

    expect(container.querySelector("#dialog-top")).toHaveClass("modal-top");
    expect(container.querySelector("#dialog-end")).toHaveClass("modal-end");
  });

  it("opens and closes a dialog imperatively", () => {
    const container = renderUi(() => <Dialog id="dialog-imperative" />);
    const dialog = container.querySelector<HTMLDialogElement>("#dialog-imperative")!;

    expect(dialog.open).toBe(false);

    openDialog("dialog-imperative");
    expect(dialog.open).toBe(true);

    closeDialog("dialog-imperative");
    expect(dialog.open).toBe(false);
  });

  it("opens the target dialog when its trigger is clicked", async () => {
    const container = renderUi(() => (
      <>
        <DialogTrigger color="primary" for="dialog-via-trigger">
          Open dialog
        </DialogTrigger>
        <Dialog id="dialog-via-trigger" />
      </>
    ));
    const dialog = container.querySelector<HTMLDialogElement>("#dialog-via-trigger")!;

    await page.getByRole("button", { name: "Open dialog" }).click();

    expect(dialog.open).toBe(true);
  });

  it("renders all of its parts", () => {
    const container = renderUi(() => (
      <Dialog id="dialog-parts" open>
        <DialogBox>
          <DialogTitle>Dialog title</DialogTitle>
          <DialogDescription>A dialog description.</DialogDescription>
          <DialogActions>
            <DialogClose />
          </DialogActions>
        </DialogBox>
        <DialogBackdrop />
      </Dialog>
    ));

    expect(container.querySelector(".modal-box")).toBeTruthy();
    expect(container.querySelector("h3")).toHaveTextContent("Dialog title");
    expect(container.querySelector("p")).toHaveTextContent("A dialog description.");
    expect(container.querySelector(".modal-action")).toBeTruthy();
    // DialogClose and DialogBackdrop each render a form with a submit button.
    expect(container.querySelectorAll("form")).toHaveLength(2);
    expect(container.querySelector("button[type=submit]")).toHaveTextContent("Close");
  });

  it("looks right when open", async () => {
    const container = renderUi(() => (
      <Dialog id="dialog-screenshot" open>
        <DialogBox>
          <DialogTitle>Dialog title</DialogTitle>
          <DialogDescription>This dialog is rendered in its open state.</DialogDescription>
          <DialogActions>
            <DialogClose />
            <Button color="primary" type="button">
              Confirm
            </Button>
          </DialogActions>
        </DialogBox>
        <DialogBackdrop />
      </Dialog>
    ));

    await expectScreenshot("open", page.elementLocator(container.querySelector(".modal-box")!));
  });
});
