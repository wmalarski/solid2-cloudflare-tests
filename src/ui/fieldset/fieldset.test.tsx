import { describe, expect, it } from "vite-plus/test";
import { Input } from "../input/input";
import { expectScreenshot, renderUi } from "../test-utils";
import { Fieldset, FieldsetLabel, FieldsetLegend } from "./fieldset";

describe("Fieldset", () => {
  it("renders a fieldset with legend and labels", () => {
    const container = renderUi(() => (
      <Fieldset>
        <FieldsetLegend>Account details</FieldsetLegend>
        <FieldsetLabel>Email</FieldsetLabel>
        <Input placeholder="you@example.com" />
      </Fieldset>
    ));

    expect(container.querySelector("fieldset")).toHaveClass("fieldset");
    expect(container.querySelector("legend")).toHaveClass("fieldset-legend");
    expect(container.querySelector("label")).toHaveClass("fieldset-label");
  });

  it("merges custom classes", () => {
    const container = renderUi(() => <Fieldset class="my-fieldset" />);

    expect(container.querySelector("fieldset")).toHaveClass("my-fieldset");
  });

  it("looks right with form controls", async () => {
    renderUi(() => (
      <Fieldset class="w-80">
        <FieldsetLegend>Account details</FieldsetLegend>
        <FieldsetLabel>Email</FieldsetLabel>
        <Input placeholder="you@example.com" type="email" width="full" />
        <FieldsetLabel>Password</FieldsetLabel>
        <Input placeholder="••••••••" type="password" width="full" />
      </Fieldset>
    ));

    await expectScreenshot("form");
  });
});
