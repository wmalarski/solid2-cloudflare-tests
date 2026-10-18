import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Badge } from "./badge";

const meta = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: {
    children: "Badge",
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Colors: Story = {
  render: () => (
    <div class="flex flex-wrap items-center gap-2">
      <Badge color="primary">Primary</Badge>
      <Badge color="secondary">Secondary</Badge>
      <Badge color="accent">Accent</Badge>
      <Badge color="neutral">Neutral</Badge>
      <Badge color="info">Info</Badge>
      <Badge color="success">Success</Badge>
      <Badge color="warning">Warning</Badge>
      <Badge color="error">Error</Badge>
    </div>
  ),
};

export const Styles: Story = {
  render: () => (
    <div class="flex flex-wrap items-center gap-2">
      <Badge>Default</Badge>
      <Badge style="outline">Outline</Badge>
      <Badge style="dash">Dash</Badge>
      <Badge style="soft">Soft</Badge>
      <Badge style="ghost">Ghost</Badge>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div class="flex flex-wrap items-center gap-2">
      <Badge size="xs">xs</Badge>
      <Badge size="sm">sm</Badge>
      <Badge size="md">md</Badge>
      <Badge size="lg">lg</Badge>
      <Badge size="xl">xl</Badge>
    </div>
  ),
};
