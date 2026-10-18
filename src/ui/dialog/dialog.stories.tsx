import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Button } from "../button/button";
import {
  Dialog,
  DialogActions,
  DialogBackdrop,
  DialogBox,
  DialogClose,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

const meta = {
  title: "UI/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  args: {
    id: "storybook-dialog",
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Trigger: Story = {
  render: () => (
    <>
      <DialogTrigger for="storybook-dialog-trigger" color="primary">
        Open dialog
      </DialogTrigger>
      <Dialog id="storybook-dialog-trigger">
        <DialogBox>
          <DialogTitle>Dialog title</DialogTitle>
          <DialogDescription>This dialog is opened through DialogTrigger.</DialogDescription>
          <DialogActions>
            <DialogClose />
            <Button color="primary" type="button">
              Confirm
            </Button>
          </DialogActions>
        </DialogBox>
        <DialogBackdrop />
      </Dialog>
    </>
  ),
};

export const Open: Story = {
  args: {
    open: true,
  },
  render: (args) => (
    <Dialog {...args}>
      <DialogBox>
        <DialogTitle>Dialog title</DialogTitle>
        <DialogDescription>Rendered with the open variant.</DialogDescription>
        <DialogActions>
          <DialogClose />
          <Button color="primary" type="button">
            Confirm
          </Button>
        </DialogActions>
      </DialogBox>
      <DialogBackdrop />
    </Dialog>
  ),
};

export const Positions: Story = {
  render: () => (
    <div class="flex flex-col gap-2">
      <DialogTrigger for="storybook-dialog-top" variant="outline">
        Top
      </DialogTrigger>
      <DialogTrigger for="storybook-dialog-bottom" variant="outline">
        Bottom
      </DialogTrigger>
      <DialogTrigger for="storybook-dialog-start" variant="outline">
        Start
      </DialogTrigger>
      <DialogTrigger for="storybook-dialog-end" variant="outline">
        End
      </DialogTrigger>

      <Dialog id="storybook-dialog-top" vertical="top" open>
        <DialogBox>
          <DialogTitle>Top</DialogTitle>
          <DialogActions>
            <DialogClose />
          </DialogActions>
        </DialogBox>
        <DialogBackdrop />
      </Dialog>
      <Dialog id="storybook-dialog-bottom" vertical="bottom" open>
        <DialogBox>
          <DialogTitle>Bottom</DialogTitle>
          <DialogActions>
            <DialogClose />
          </DialogActions>
        </DialogBox>
        <DialogBackdrop />
      </Dialog>
      <Dialog id="storybook-dialog-start" horizontal="start" open>
        <DialogBox>
          <DialogTitle>Start</DialogTitle>
          <DialogActions>
            <DialogClose />
          </DialogActions>
        </DialogBox>
        <DialogBackdrop />
      </Dialog>
      <Dialog id="storybook-dialog-end" horizontal="end" open>
        <DialogBox>
          <DialogTitle>End</DialogTitle>
          <DialogActions>
            <DialogClose />
          </DialogActions>
        </DialogBox>
        <DialogBackdrop />
      </Dialog>
    </div>
  ),
};
