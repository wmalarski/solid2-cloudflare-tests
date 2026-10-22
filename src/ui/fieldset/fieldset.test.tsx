import { describe, expect, it } from "vite-plus/test";
import { Input } from "../input/input";
import { renderUi } from "~/testing/render";
import { expectScreenshot } from "~/testing/screenshot";
import { FieldRoot } from "../field/field";
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

  it("shares the id and name from FieldRoot with the label and input", () => {
    const container = renderUi(() => (
      <FieldRoot id="email" name="email">
        <FieldsetLabel>Email</FieldsetLabel>
        <Input />
      </FieldRoot>
    ));

    expect(container.querySelector("label")).toHaveAttribute("for", "email");
    expect(container.querySelector("input")).toHaveAttribute("id", "email");
    expect(container.querySelector("input")).toHaveAttribute("name", "email");
  });

  it("generates an id when FieldRoot is not given one", () => {
    const container = renderUi(() => (
      <FieldRoot name="email">
        <FieldsetLabel>Email</FieldsetLabel>
        <Input />
      </FieldRoot>
    ));

    const input = container.querySelector("input")!;
    expect(input.id).not.toBe("");
    expect(container.querySelector("label")).toHaveAttribute("for", input.id);
  });

  it("lets explicit props override FieldRoot values", () => {
    const container = renderUi(() => (
      <FieldRoot id="email" name="email">
        <FieldsetLabel for="custom-email">Email</FieldsetLabel>
        <Input id="custom-email" name="custom-email" />
      </FieldRoot>
    ));

    expect(container.querySelector("label")).toHaveAttribute("for", "custom-email");
    expect(container.querySelector("input")).toHaveAttribute("id", "custom-email");
    expect(container.querySelector("input")).toHaveAttribute("name", "custom-email");
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
