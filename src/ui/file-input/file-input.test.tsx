import { describe, expect, it } from "vite-plus/test";
import { expectScreenshot, renderUi } from "../test-utils";
import { FileInput } from "./file-input";

describe("FileInput", () => {
  it("renders a file input and forwards its attributes", () => {
    const container = renderUi(() => <FileInput accept="image/*" />);

    const input = container.querySelector("input")!;
    expect(input).toHaveAttribute("type", "file");
    expect(input).toHaveAttribute("accept", "image/*");
    expect(input).toHaveClass("file-input");
  });

  it("applies color, size and variant classes", () => {
    const container = renderUi(() => <FileInput color="primary" size="lg" variant="ghost" />);

    const input = container.querySelector("input");
    expect(input).toHaveClass("file-input-primary");
    expect(input).toHaveClass("file-input-lg");
    expect(input).toHaveClass("file-input-ghost");
  });

  it("disables the input", () => {
    const container = renderUi(() => <FileInput disabled />);

    expect(container.querySelector("input")).toBeDisabled();
  });

  it("looks right across colors and sizes", async () => {
    renderUi(() => (
      <div class="flex w-80 flex-col gap-2">
        <FileInput color="primary" />
        <FileInput color="secondary" />
        <FileInput size="sm" />
        <FileInput size="lg" />
      </div>
    ));

    await expectScreenshot("gallery");
  });
});
