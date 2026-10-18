import { describe, expect, it } from "vite-plus/test";
import { renderUi } from "~/testing/render";
import { expectScreenshot } from "~/testing/screenshot";
import { Input } from "./input";

describe("Input", () => {
  it("renders an input with browser autofill disabled", () => {
    const container = renderUi(() => <Input placeholder="Type here…" />);

    const input = container.querySelector("input")!;
    expect(input).toHaveAttribute("autocomplete", "off");
    expect(input).toHaveAttribute("autocorrect", "off");
    expect(input).toHaveAttribute("placeholder", "Type here…");
    expect(input).toHaveClass("input");
  });

  it("applies color, size, variant and width classes", () => {
    const container = renderUi(() => (
      <Input color="error" size="sm" variant="ghost" width="full" />
    ));

    const input = container.querySelector("input");
    expect(input).toHaveClass("input-error");
    expect(input).toHaveClass("input-sm");
    expect(input).toHaveClass("input-ghost");
    expect(input).toHaveClass("w-full");
  });

  it("forwards the disabled state and value", () => {
    const container = renderUi(() => <Input disabled value="hello" />);

    const input = container.querySelector("input")!;
    expect(input).toBeDisabled();
    expect(input).toHaveValue("hello");
  });

  it("looks right across colors and sizes", async () => {
    renderUi(() => (
      <div class="flex w-64 flex-col gap-2">
        <Input color="primary" placeholder="Primary" />
        <Input color="error" placeholder="Error" />
        <Input size="sm" placeholder="Small" />
        <Input size="lg" placeholder="Large" />
        <Input placeholder="Disabled" disabled />
      </div>
    ));

    await expectScreenshot("gallery");
  });
});
