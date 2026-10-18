import { describe, expect, it } from "vite-plus/test";
import { expectScreenshot, renderUi } from "../test-utils";
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
