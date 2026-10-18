import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Skeleton } from "./skeleton";

const meta = {
  title: "UI/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  args: {
    class: "h-12 w-48",
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Circle: Story = {
  args: {
    class: "size-16 rounded-full",
  },
};

export const TextLines: Story = {
  render: () => (
    <div class="flex w-64 flex-col gap-2">
      <Skeleton class="h-4 w-full" />
      <Skeleton class="h-4 w-full" />
      <Skeleton class="h-4 w-2/3" />
    </div>
  ),
};

export const Card: Story = {
  render: () => (
    <div class="flex w-72 flex-col gap-3">
      <Skeleton class="h-32 w-full" />
      <Skeleton class="h-5 w-3/4" />
      <Skeleton class="h-4 w-full" />
      <Skeleton class="h-4 w-1/2" />
    </div>
  ),
};
