import { describe, expect, it } from "vite-plus/test";
import { expectScreenshot, renderUi } from "../test-utils";
import { Button } from "./button";

describe("Button", () => {
  it("renders its children inside a button element", () => {
    const container = renderUi(() => <Button>Save</Button>);

    expect(container.querySelector("button")).toHaveTextContent("Save");
  });

  it("defaults to the md size", () => {
    const container = renderUi(() => <Button>Save</Button>);

    expect(container.querySelector("button")).toHaveClass("btn-md");
  });

  it("applies color, variant, size and shape classes", () => {
    const container = renderUi(() => (
      <Button color="secondary" shape="wide" size="lg" variant="outline">
        Save
      </Button>
    ));

    const button = container.querySelector("button");
    expect(button).toHaveClass("btn-secondary");
    expect(button).toHaveClass("btn-outline");
    expect(button).toHaveClass("btn-lg");
    expect(button).toHaveClass("btn-wide");
  });

  it("marks loading and disabled states", () => {
    const container = renderUi(() => (
      <>
        <Button isLoading>Saving…</Button>
        <Button behaviour="disabled">Disabled</Button>
        <Button behaviour="active">Active</Button>
      </>
    ));

    const [loading, disabled, active] = container.querySelectorAll("button");
    expect(loading).toHaveClass("pointer-events-none");
    expect(disabled).toHaveClass("btn-disabled");
    expect(active).toHaveClass("btn-active");
  });

  it("passes native attributes through and forwards clicks", () => {
    let clicks = 0;
    const container = renderUi(() => (
      <Button aria-label="Save" onClick={() => clicks++} type="submit">
        Save
      </Button>
    ));

    const button = container.querySelector("button")!;
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveAttribute("aria-label", "Save");

    button.click();
    expect(clicks).toBe(1);
  });

  it("looks right across colors and variants", async () => {
    renderUi(() => (
      <div class="flex w-[32rem] flex-col gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <Button color="primary">Primary</Button>
          <Button color="secondary">Secondary</Button>
          <Button color="accent">Accent</Button>
          <Button color="neutral">Neutral</Button>
          <Button color="info">Info</Button>
          <Button color="success">Success</Button>
          <Button color="warning">Warning</Button>
          <Button color="error">Error</Button>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <Button>Solid</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="dash">Dash</Button>
          <Button variant="soft">Soft</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <Button size="xs">xs</Button>
          <Button size="sm">sm</Button>
          <Button size="md">md</Button>
          <Button size="lg">lg</Button>
          <Button size="xl">xl</Button>
        </div>
      </div>
    ));

    await expectScreenshot("gallery");
  });
});
