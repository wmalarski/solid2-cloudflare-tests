import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Select } from "./select";

const meta = {
  title: "UI/Select",
  component: Select,
  tags: ["autodocs"],
  args: {
    color: "primary",
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Select {...args}>
      <option disabled selected>
        Pick a status
      </option>
      <option>New</option>
      <option>In progress</option>
      <option>Reviewed</option>
    </Select>
  ),
};

export const Colors: Story = {
  render: () => (
    <div class="flex flex-col gap-2">
      <Select color="primary">
        <option>Primary</option>
      </Select>
      <Select color="secondary">
        <option>Secondary</option>
      </Select>
      <Select color="accent">
        <option>Accent</option>
      </Select>
      <Select color="error">
        <option>Error</option>
      </Select>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div class="flex flex-col gap-2">
      <Select size="xs">
        <option>xs</option>
      </Select>
      <Select size="sm">
        <option>sm</option>
      </Select>
      <Select size="md">
        <option>md</option>
      </Select>
      <Select size="lg">
        <option>lg</option>
      </Select>
    </div>
  ),
};

export const Ghost: Story = {
  render: (args) => (
    <Select {...args} variant="ghost">
      <option>Ghost</option>
    </Select>
  ),
};
