import { describe, expect, it } from "vite-plus/test";
import { renderUi } from "~/testing/render";
import { expectScreenshot } from "~/testing/screenshot";
import { FieldError } from "../field-error/field-error";
import { FieldRoot } from "../field/field";
import { Select } from "./select";

describe("Select", () => {
  it("renders a select with its options", () => {
    const container = renderUi(() => (
      <Select color="primary">
        <option>New</option>
        <option>Reviewed</option>
      </Select>
    ));

    const select = container.querySelector("select")!;
    expect(select).toHaveClass("select");
    expect(select).toHaveClass("select-primary");
    expect(select.querySelectorAll("option")).toHaveLength(2);
  });

  it("applies size and variant classes", () => {
    const container = renderUi(() => <Select size="lg" variant="ghost" />);

    const select = container.querySelector("select");
    expect(select).toHaveClass("select-lg");
    expect(select).toHaveClass("select-ghost");
  });

  it("forwards the value and disabled state", () => {
    const container = renderUi(() => (
      <Select disabled value="b">
        <option value="a">A</option>
        <option value="b">B</option>
      </Select>
    ));

    const select = container.querySelector("select")!;
    expect(select).toBeDisabled();
    expect(select).toHaveValue("b");
  });

  it("marks the select invalid from FieldRoot", () => {
    const container = renderUi(() => (
      <FieldRoot name="status" isInvalid>
        <Select />
        <FieldError message="Choose a status" />
      </FieldRoot>
    ));

    const select = container.querySelector("select")!;
    const error = container.querySelector("[role=alert]")!;
    expect(select).toHaveAttribute("aria-invalid", "true");
    expect(error.id).not.toBe("");
    expect(select).toHaveAttribute("aria-describedby", error.id);
  });

  it("looks right across colors and sizes", async () => {
    renderUi(() => (
      <div class="flex w-56 flex-col gap-2">
        <Select color="primary">
          <option>Primary</option>
        </Select>
        <Select color="error">
          <option>Error</option>
        </Select>
        <Select size="sm">
          <option>Small</option>
        </Select>
        <Select size="lg">
          <option>Large</option>
        </Select>
      </div>
    ));

    await expectScreenshot("gallery");
  });
});
