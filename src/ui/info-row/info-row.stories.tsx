import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { InfoRowContainer, InfoRowItem } from "./info-row";

const meta = {
  title: "UI/InfoRow",
  component: InfoRowItem,
  tags: ["autodocs"],
  args: {
    name: "Status",
    value: "Reviewed",
  },
} satisfies Meta<typeof InfoRowItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <InfoRowContainer class="w-80">
      <InfoRowItem {...args} />
      <InfoRowItem name="Artist" value="Radiohead" />
      <InfoRowItem name="Release date" value="2007-10-10" />
    </InfoRowContainer>
  ),
};

export const EmptyValue: Story = {
  args: {
    name: "Note",
    value: "",
  },
};
