import * as v from "valibot";
import { describe, expect, it } from "vite-plus/test";
import {
  getInvalidStateProps,
  parseFormException,
  parseFormValidationError,
  transformFormData,
} from "./forms";

describe("parseFormValidationError", () => {
  it("maps valibot issues to a per-field error record", () => {
    const result = v.safeParse(
      v.object({
        email: v.pipe(v.string(), v.email("Please enter a valid email")),
        name: v.pipe(v.string(), v.minLength(2, "Too short")),
      }),
      { email: "nope", name: "A" },
    );

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(parseFormValidationError(result.issues)).toEqual({
      errors: {
        email: "Please enter a valid email",
        name: "Too short",
      },
      success: false,
    });
  });
});

describe("parseFormException", () => {
  it("wraps the error message", () => {
    expect(parseFormException(new Error("Boom"))).toEqual({
      error: "Boom",
      success: false,
    });
  });
});

describe("getInvalidStateProps", () => {
  it("returns aria attributes when invalid", () => {
    expect(getInvalidStateProps({ errorMessageId: "email-error", isInvalid: true })).toEqual({
      "aria-describedby": "email-error",
      "aria-invalid": "true",
    });
  });

  it("returns nothing when valid", () => {
    expect(getInvalidStateProps({ errorMessageId: "email-error", isInvalid: false })).toEqual({});
  });
});

describe("transformFormData", () => {
  const schema = v.object({
    age: v.pipe(v.number(), v.minValue(18, "Must be an adult")),
    email: v.pipe(v.string(), v.email("Invalid email")),
  });

  it("decodes and validates FormData", () => {
    const formData = new FormData();
    formData.set("email", "ada@example.com");
    formData.set("age", "36");

    const result = v.safeParse(transformFormData(schema, { numbers: ["age"] }), formData);

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.output).toEqual({ age: 36, email: "ada@example.com" });
  });

  it("returns issues for invalid FormData", () => {
    const formData = new FormData();
    formData.set("email", "not-an-email");
    formData.set("age", "12");

    const result = v.safeParse(transformFormData(schema, { numbers: ["age"] }), formData);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.issues.map((issue) => issue.message)).toEqual([
      "Must be an adult",
      "Invalid email",
    ]);
  });
});
