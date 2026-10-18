import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Input } from "./input";

const meta = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  args: {
    placeholder: "Type here…",
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Colors: Story = {
  render: () => (
    <div class="flex flex-col gap-2">
      <Input color="primary" placeholder="Primary" />
      <Input color="secondary" placeholder="Secondary" />
      <Input color="accent" placeholder="Accent" />
      <Input color="info" placeholder="Info" />
      <Input color="success" placeholder="Success" />
      <Input color="warning" placeholder="Warning" />
      <Input color="error" placeholder="Error" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div class="flex flex-col gap-2">
      <Input size="xs" placeholder="Extra small" />
      <Input size="sm" placeholder="Small" />
      <Input size="md" placeholder="Medium" />
      <Input size="lg" placeholder="Large" />
      <Input size="xl" placeholder="Extra large" />
    </div>
  ),
};

export const Ghost: Story = {
  args: {
    placeholder: "Ghost input",
    variant: "ghost",
  },
};

export const FullWidth: Story = {
  args: {
    placeholder: "Full width",
    width: "full",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "Disabled",
  },
};
