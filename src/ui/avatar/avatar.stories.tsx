import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Avatar, AvatarContent, AvatarGroup } from "./avatar";

const meta = {
  title: "UI/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  args: {
    placeholder: true,
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarContent class="bg-neutral text-neutral-content text-sm">JD</AvatarContent>
    </Avatar>
  ),
};

export const Status: Story = {
  render: () => (
    <div class="flex items-center gap-4">
      <Avatar online>
        <AvatarContent class="bg-primary text-primary-content text-sm">ON</AvatarContent>
      </Avatar>
      <Avatar offline>
        <AvatarContent class="bg-neutral text-neutral-content text-sm">OF</AvatarContent>
      </Avatar>
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <AvatarGroup>
      <Avatar>
        <AvatarContent class="bg-primary text-primary-content text-sm">A</AvatarContent>
      </Avatar>
      <Avatar>
        <AvatarContent class="bg-secondary text-secondary-content text-sm">B</AvatarContent>
      </Avatar>
      <Avatar>
        <AvatarContent class="bg-accent text-accent-content text-sm">C</AvatarContent>
      </Avatar>
    </AvatarGroup>
  ),
};
