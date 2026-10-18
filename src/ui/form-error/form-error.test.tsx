import { describe, expect, it } from "vite-plus/test";
import { expectScreenshot, renderUi } from "../test-utils";
import { FormError } from "./form-error";

describe("FormError", () => {
  it("renders an error alert with an icon", () => {
    const container = renderUi(() => <FormError message="Something went wrong." />);

    const alert = container.querySelector('[role="alert"]');
    expect(alert).toHaveClass("alert-error");
    expect(alert).toHaveTextContent("Something went wrong.");
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders nothing without a message", () => {
    const container = renderUi(() => <FormError />);

    expect(container).toBeEmptyDOMElement();
  });

  it("looks right", async () => {
    renderUi(() => <FormError message="Something went wrong. Please try again." />);

    await expectScreenshot("message");
  });
});
