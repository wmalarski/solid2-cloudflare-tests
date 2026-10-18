import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { FileInput } from "./file-input";

const meta = {
  title: "UI/FileInput",
  component: FileInput,
  tags: ["autodocs"],
  args: {
    accept: "image/*",
  },
} satisfies Meta<typeof FileInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Colors: Story = {
  render: () => (
    <div class="flex flex-col gap-2">
      <FileInput color="primary" />
      <FileInput color="secondary" />
      <FileInput color="accent" />
      <FileInput color="error" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div class="flex flex-col gap-2">
      <FileInput size="xs" />
      <FileInput size="sm" />
      <FileInput size="md" />
      <FileInput size="lg" />
      <FileInput size="xl" />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
