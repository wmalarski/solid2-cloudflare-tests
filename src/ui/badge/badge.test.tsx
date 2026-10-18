import { describe, expect, it } from "vite-plus/test";
import { renderUi } from "~/testing/render";
import { expectScreenshot } from "~/testing/screenshot";
import { Badge } from "./badge";

describe("Badge", () => {
  it("renders its children", () => {
    const container = renderUi(() => <Badge>New</Badge>);

    expect(container.firstElementChild).toHaveTextContent("New");
    expect(container.firstElementChild?.tagName).toBe("DIV");
  });

  it("applies color, size and style classes", () => {
    const container = renderUi(() => (
      <Badge color="success" size="lg" style="outline">
        New
      </Badge>
    ));

    const badge = container.querySelector(".badge");
    expect(badge).toHaveClass("badge-success");
    expect(badge).toHaveClass("badge-lg");
    expect(badge).toHaveClass("badge-outline");
  });

  it("merges custom classes", () => {
    const container = renderUi(() => <Badge class="my-badge">New</Badge>);

    expect(container.querySelector(".badge")).toHaveClass("my-badge");
  });

  it("looks right across colors, styles and sizes", async () => {
    renderUi(() => (
      <div class="flex w-[28rem] flex-col gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <Badge color="primary">Primary</Badge>
          <Badge color="secondary">Secondary</Badge>
          <Badge color="accent">Accent</Badge>
          <Badge color="neutral">Neutral</Badge>
          <Badge color="info">Info</Badge>
          <Badge color="success">Success</Badge>
          <Badge color="warning">Warning</Badge>
          <Badge color="error">Error</Badge>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <Badge style="outline">Outline</Badge>
          <Badge style="dash">Dash</Badge>
          <Badge style="soft">Soft</Badge>
          <Badge style="ghost">Ghost</Badge>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <Badge size="xs">xs</Badge>
          <Badge size="sm">sm</Badge>
          <Badge size="md">md</Badge>
          <Badge size="lg">lg</Badge>
          <Badge size="xl">xl</Badge>
        </div>
      </div>
    ));

    await expectScreenshot("gallery");
  });
});
