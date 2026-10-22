import { describe, expect, it } from "vite-plus/test";
import { renderUi } from "~/testing/render";
import { expectScreenshot } from "~/testing/screenshot";
import { FieldError } from "../field-error/field-error";
import { FieldRoot } from "../field/field";
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

  it("marks the file input invalid from FieldRoot", () => {
    const container = renderUi(() => (
      <FieldRoot name="cover" isInvalid>
        <FileInput />
        <FieldError message="Choose a cover" />
      </FieldRoot>
    ));

    const input = container.querySelector("input")!;
    const error = container.querySelector("[role=alert]")!;
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(error.id).not.toBe("");
    expect(input).toHaveAttribute("aria-describedby", error.id);
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
