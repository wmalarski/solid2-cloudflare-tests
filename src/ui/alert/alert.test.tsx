import { describe, expect, it } from "vite-plus/test";
import { expectScreenshot, renderUi } from "../test-utils";
import { Alert, AlertIcon } from "./alert";

describe("Alert", () => {
  it("renders its content inside a role=alert element", () => {
    const container = renderUi(() => <Alert>Something happened</Alert>);

    expect(container.querySelector('[role="alert"]')).toHaveTextContent("Something happened");
  });

  it("applies the color, variant and direction classes", () => {
    const container = renderUi(() => (
      <Alert color="error" direction="vertical" variant="outline">
        Error
      </Alert>
    ));

    const alert = container.querySelector(".alert");
    expect(alert).toHaveClass("alert-error");
    expect(alert).toHaveClass("alert-outline");
    expect(alert).toHaveClass("alert-vertical");
  });

  it("forwards extra attributes to the root element", () => {
    const container = renderUi(() => <Alert data-foo="bar">Hello</Alert>);

    expect(container.querySelector(".alert")).toHaveAttribute("data-foo", "bar");
  });

  it("renders one icon per variant", () => {
    const container = renderUi(() => (
      <>
        <Alert color="info">
          <AlertIcon variant="info" />
          Info
        </Alert>
        <Alert color="success">
          <AlertIcon variant="success" />
          Success
        </Alert>
        <Alert color="warning">
          <AlertIcon variant="warning" />
          Warning
        </Alert>
        <Alert color="error">
          <AlertIcon variant="error" />
          Error
        </Alert>
      </>
    ));

    expect(container.querySelectorAll("svg")).toHaveLength(4);
  });

  it("looks right across every color", async () => {
    renderUi(() => (
      <div class="flex w-96 flex-col gap-2">
        <Alert color="info">
          <AlertIcon variant="info" />
          Info alert
        </Alert>
        <Alert color="success">
          <AlertIcon variant="success" />
          Success alert
        </Alert>
        <Alert color="warning">
          <AlertIcon variant="warning" />
          Warning alert
        </Alert>
        <Alert color="error">
          <AlertIcon variant="error" />
          Error alert
        </Alert>
      </div>
    ));

    await expectScreenshot("colors");
  });
});
