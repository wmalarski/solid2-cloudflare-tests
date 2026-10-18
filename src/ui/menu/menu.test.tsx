import { describe, expect, it } from "vite-plus/test";
import { expectScreenshot, renderUi } from "../test-utils";
import { Menu, MenuDropdown, MenuDropdownToggle, MenuItem, MenuTitle } from "./menu";

describe("Menu", () => {
  it("applies direction and size classes", () => {
    const container = renderUi(() => <Menu direction="horizontal" size="lg" />);

    const menu = container.querySelector("ul");
    expect(menu).toHaveClass("menu");
    expect(menu).toHaveClass("menu-horizontal");
    expect(menu).toHaveClass("menu-lg");
  });

  it("applies item behaviour classes", () => {
    const container = renderUi(() => (
      <Menu>
        <MenuItem behaviour="active" />
        <MenuItem behaviour="disabled" />
        <MenuItem />
      </Menu>
    ));

    const items = container.querySelectorAll("li");
    expect(items[0]).toHaveClass("menu-active");
    expect(items[1]).toHaveClass("menu-disabled");
    expect(items[2]).not.toHaveClass("menu-active");
  });

  it("renders titles and dropdowns", () => {
    const container = renderUi(() => (
      <Menu>
        <MenuTitle>Tasks</MenuTitle>
        <MenuItem>
          <MenuDropdownToggle show>More</MenuDropdownToggle>
          <MenuDropdown show>
            <li>Archive</li>
          </MenuDropdown>
        </MenuItem>
      </Menu>
    ));

    expect(container.querySelector(".menu-title")).toHaveTextContent("Tasks");
    expect(container.querySelector(".menu-dropdown-toggle")).toHaveClass("menu-dropdown-show");
    expect(container.querySelector(".menu-dropdown")).toHaveClass("menu-dropdown-show");
  });

  it("looks right with nested items", async () => {
    renderUi(() => (
      <Menu class="w-56 bg-base-200 rounded-box">
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
      </Menu>
    ));

    await expectScreenshot("items");
  });
});
