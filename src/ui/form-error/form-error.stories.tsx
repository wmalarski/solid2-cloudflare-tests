import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { FormError } from "./form-error";

const meta = {
  title: "UI/FormError",
  component: FormError,
  tags: ["autodocs"],
  args: {
    message: "Something went wrong. Please try again.",
  },
} satisfies Meta<typeof FormError>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Hidden: Story = {
  args: {
    message: undefined,
  },
};
