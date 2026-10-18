import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Menu, MenuDropdown, MenuDropdownToggle, MenuItem, MenuTitle } from "./menu";

const meta = {
  title: "UI/Menu",
  component: Menu,
  tags: ["autodocs"],
  args: {
    class: "w-56 bg-base-200 rounded-box",
  },
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Menu {...args}>
      <MenuTitle>Tasks</MenuTitle>
      <MenuItem>
        <a href="#new">New</a>
      </MenuItem>
      <MenuItem behaviour="active">
        <a href="#in-progress">In progress</a>
      </MenuItem>
      <MenuItem behaviour="disabled">
        <a href="#reviewed">Reviewed</a>
      </MenuItem>
      <MenuItem>
        <MenuDropdownToggle>More</MenuDropdownToggle>
        <MenuDropdown>
          <li>
            <a href="#archive">Archive</a>
          </li>
          <li>
            <a href="#delete">Delete</a>
          </li>
        </MenuDropdown>
      </MenuItem>
    </Menu>
  ),
};

export const Horizontal: Story = {
  args: {
    direction: "horizontal",
  },
  render: (args) => (
    <Menu {...args}>
      <MenuItem>
        <a href="#one">One</a>
      </MenuItem>
      <MenuItem>
        <a href="#two">Two</a>
      </MenuItem>
      <MenuItem>
        <a href="#three">Three</a>
      </MenuItem>
    </Menu>
  ),
};

export const Sizes: Story = {
  args: {
    size: "lg",
  },
};
