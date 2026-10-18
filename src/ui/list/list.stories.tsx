import { For } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { List, ListColumn, ListRow } from "./list";

const items = [
  { subtitle: "Reviewed", title: "Weird Fishes / Arpeggi" },
  { subtitle: "New", title: "Nude" },
  { subtitle: "In progress", title: "House of Cards" },
];

const meta = {
  title: "UI/List",
  component: List,
  tags: ["autodocs"],
  args: {
    class: "w-96",
  },
} satisfies Meta<typeof List>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <List {...args}>
      <For each={items}>
        {(item) => (
          <ListRow>
            <ListColumn grow>
              <div class="font-semibold">{item.title}</div>
              <div class="text-xs opacity-60">{item.subtitle}</div>
            </ListColumn>
          </ListRow>
        )}
      </For>
    </List>
  ),
};

export const Wrapped: Story = {
  render: (args) => (
    <List {...args}>
      <ListRow>
        <ListColumn grow wrap>
          <div class="font-semibold">Long title that wraps onto the next line</div>
          <div class="text-xs opacity-60">
            A longer subtitle that demonstrates the wrapped column layout.
          </div>
        </ListColumn>
      </ListRow>
    </List>
  ),
};
