import { describe, expect, it } from "vite-plus/test";
import { Input } from "../input/input";
import { renderUi } from "~/testing/render";
import { expectScreenshot } from "~/testing/screenshot";
import { FieldError } from "../field-error/field-error";
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

  it("marks the input invalid from FieldRoot", () => {
    const container = renderUi(() => (
      <FieldRoot name="email" isInvalid>
        <FieldsetLabel>Email</FieldsetLabel>
        <Input />
        <FieldError message="Enter a valid email" />
      </FieldRoot>
    ));

    const input = container.querySelector("input")!;
    const error = container.querySelector("[role=alert]")!;
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(error.id).not.toBe("");
    expect(input).toHaveAttribute("aria-describedby", error.id);
  });

  it("generates a distinct error id for each field", () => {
    const container = renderUi(() => (
      <>
        <FieldRoot name="email" isInvalid>
          <Input />
          <FieldError message="Required" />
        </FieldRoot>
        <FieldRoot name="password" isInvalid>
          <Input />
          <FieldError message="Required" />
        </FieldRoot>
      </>
    ));

    const errors = container.querySelectorAll("[role=alert]");
    expect(errors).toHaveLength(2);
    expect(errors[0].id).not.toBe(errors[1].id);
  });

  it("does not mark inputs invalid by default", () => {
    const container = renderUi(() => (
      <FieldRoot name="email">
        <FieldsetLabel>Email</FieldsetLabel>
        <Input />
      </FieldRoot>
    ));

    const input = container.querySelector("input")!;
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toHaveAttribute("aria-describedby");
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
