import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Button } from "./button";

const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Button",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Colors: Story = {
  render: () => (
    <div class="flex flex-wrap items-center gap-2">
      <Button color="primary">Primary</Button>
      <Button color="secondary">Secondary</Button>
      <Button color="accent">Accent</Button>
      <Button color="neutral">Neutral</Button>
      <Button color="info">Info</Button>
      <Button color="success">Success</Button>
      <Button color="warning">Warning</Button>
      <Button color="error">Error</Button>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div class="flex flex-wrap items-center gap-2">
      <Button>Solid</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="dash">Dash</Button>
      <Button variant="soft">Soft</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div class="flex flex-wrap items-center gap-2">
      <Button size="xs">Extra small</Button>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra large</Button>
    </div>
  ),
};

export const Shapes: Story = {
  render: () => (
    <div class="flex flex-wrap items-center gap-2">
      <Button shape="wide">Wide</Button>
      <Button shape="block">Block</Button>
      <Button shape="square" aria-label="Square">
        A
      </Button>
      <Button shape="circle" aria-label="Circle">
        B
      </Button>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div class="flex flex-wrap items-center gap-2">
      <Button behaviour="active">Active</Button>
      <Button behaviour="disabled">Disabled</Button>
      <Button isLoading>Saving…</Button>
    </div>
  ),
};
