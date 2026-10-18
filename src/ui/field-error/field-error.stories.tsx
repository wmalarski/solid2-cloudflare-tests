import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { FieldError } from "./field-error";

const meta = {
  title: "UI/FieldError",
  component: FieldError,
  tags: ["autodocs"],
  args: {
    id: "email-error",
    message: "Please enter a valid email address.",
  },
} satisfies Meta<typeof FieldError>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Hidden: Story = {
  args: {
    message: undefined,
  },
};
