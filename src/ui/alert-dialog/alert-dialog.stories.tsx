import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { AlertDialog } from "./alert-dialog";

const meta = {
  title: "UI/AlertDialog",
  component: AlertDialog,
  tags: ["autodocs"],
  args: {
    description: "This action cannot be undone.",
    dialogId: "storybook-alert-dialog",
    open: true,
    submitColor: "error",
    submitLabel: "Delete",
    title: "Delete task",
  },
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};
