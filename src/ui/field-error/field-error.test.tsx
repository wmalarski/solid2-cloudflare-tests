import { describe, expect, it } from "vite-plus/test";
import { expectScreenshot, renderUi } from "../test-utils";
import { FieldError } from "./field-error";

describe("FieldError", () => {
  it("renders a role=alert element with the message", () => {
    const container = renderUi(() => <FieldError id="email-error" message="Invalid email" />);

    const error = container.querySelector('[role="alert"]');
    expect(error).toHaveAttribute("id", "email-error");
    expect(error).toHaveTextContent("Invalid email");
    expect(error).toHaveClass("text-error");
  });

  it("renders nothing without a message", () => {
    const container = renderUi(() => <FieldError id="email-error" />);

    expect(container).toBeEmptyDOMElement();
  });

  it("looks right", async () => {
    renderUi(() => <FieldError id="email-error" message="Please enter a valid email address." />);

    await expectScreenshot("message");
  });
});
