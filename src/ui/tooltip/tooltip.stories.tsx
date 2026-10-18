import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Button } from "../button/button";
import { Tooltip, TooltipContent } from "./tooltip";

const meta = {
  title: "UI/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  args: {
    open: true,
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <Button color="primary">Hover me</Button>
      <TooltipContent>Tooltip text</TooltipContent>
    </Tooltip>
  ),
};

export const Colors: Story = {
  render: () => (
    <div class="flex flex-wrap gap-8 p-8">
      <Tooltip color="primary" open>
        <Button>Primary</Button>
        <TooltipContent>Primary tooltip</TooltipContent>
      </Tooltip>
      <Tooltip color="secondary" open>
        <Button>Secondary</Button>
        <TooltipContent>Secondary tooltip</TooltipContent>
      </Tooltip>
      <Tooltip color="error" open>
        <Button>Error</Button>
        <TooltipContent>Error tooltip</TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const Placements: Story = {
  render: () => (
    <div class="flex flex-wrap gap-16 p-16">
      <Tooltip placement="top" open>
        <Button>Top</Button>
        <TooltipContent>Top</TooltipContent>
      </Tooltip>
      <Tooltip placement="bottom" open>
        <Button>Bottom</Button>
        <TooltipContent>Bottom</TooltipContent>
      </Tooltip>
      <Tooltip placement="left" open>
        <Button>Left</Button>
        <TooltipContent>Left</TooltipContent>
      </Tooltip>
      <Tooltip placement="right" open>
        <Button>Right</Button>
        <TooltipContent>Right</TooltipContent>
      </Tooltip>
    </div>
  ),
};
