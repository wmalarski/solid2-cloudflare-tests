import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Input } from "../input/input";
import { Fieldset, FieldsetLabel, FieldsetLegend } from "./fieldset";

const meta = {
  title: "UI/Fieldset",
  component: Fieldset,
  tags: ["autodocs"],
  args: {
    class: "w-80",
  },
} satisfies Meta<typeof Fieldset>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Fieldset {...args}>
      <FieldsetLegend>Account details</FieldsetLegend>
      <FieldsetLabel>Email</FieldsetLabel>
      <Input placeholder="you@example.com" type="email" width="full" />
      <FieldsetLabel>Password</FieldsetLabel>
      <Input placeholder="••••••••" type="password" width="full" />
    </Fieldset>
  ),
};
