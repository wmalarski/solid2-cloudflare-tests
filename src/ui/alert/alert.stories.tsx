import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Alert, AlertIcon } from "./alert";

const meta = {
  title: "UI/Alert",
  component: Alert,
  tags: ["autodocs"],
  args: {
    children: "Something happened that you should know about.",
    color: "info",
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithIcon: Story = {
  render: (args) => (
    <Alert {...args}>
      <AlertIcon variant="info" />
      {args.children}
    </Alert>
  ),
};

export const Colors: Story = {
  render: () => (
    <div class="flex flex-col gap-2">
      <Alert color="info">
        <AlertIcon variant="info" />
        Info alert
      </Alert>
      <Alert color="success">
        <AlertIcon variant="success" />
        Success alert
      </Alert>
      <Alert color="warning">
        <AlertIcon variant="warning" />
        Warning alert
      </Alert>
      <Alert color="error">
        <AlertIcon variant="error" />
        Error alert
      </Alert>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div class="flex flex-col gap-2">
      <Alert color="info">Default</Alert>
      <Alert color="info" variant="outline">
        Outline
      </Alert>
      <Alert color="info" variant="dash">
        Dash
      </Alert>
      <Alert color="info" variant="soft">
        Soft
      </Alert>
    </div>
  ),
};

export const Vertical: Story = {
  args: {
    color: "warning",
    direction: "vertical",
  },
};
