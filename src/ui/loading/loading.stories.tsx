import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Loading } from "./loading";

const meta = {
  title: "UI/Loading",
  component: Loading,
  tags: ["autodocs"],
  args: {
    size: "md",
  },
} satisfies Meta<typeof Loading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div class="flex items-center gap-4">
      <Loading size="xs" />
      <Loading size="sm" />
      <Loading size="md" />
      <Loading size="lg" />
      <Loading size="xl" />
    </div>
  ),
};
