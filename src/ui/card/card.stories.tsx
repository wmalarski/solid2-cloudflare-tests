import { For } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Button } from "../button/button";
import { Card, CardActions, CardBody, CardDescription, CardTitle } from "./card";

const meta = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
  args: {
    class: "w-80",
    variant: "bordered",
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Card {...args}>
      <CardBody>
        <CardTitle component="h2">Card title</CardTitle>
        <CardDescription>A short description of the card contents.</CardDescription>
        <CardActions justify="end">
          <Button size="sm" variant="ghost">
            Cancel
          </Button>
          <Button size="sm" color="primary">
            Save
          </Button>
        </CardActions>
      </CardBody>
    </Card>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div class="flex flex-wrap items-start gap-4">
      <For each={["xs", "sm", "md", "lg", "xl"] as const}>
        {(size) => (
          <Card size={size} class="w-56" variant="bordered">
            <CardBody>
              <CardTitle component="h2">{size}</CardTitle>
              <CardDescription>Card size {size}</CardDescription>
            </CardBody>
          </Card>
        )}
      </For>
    </div>
  ),
};

export const Dash: Story = {
  args: {
    variant: "dash",
  },
  render: (args) => (
    <Card {...args}>
      <CardBody>
        <CardTitle component="h2">Dashed card</CardTitle>
        <CardDescription>Uses the dashed border variant.</CardDescription>
      </CardBody>
    </Card>
  ),
};
