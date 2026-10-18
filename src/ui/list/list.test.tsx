import { describe, expect, it } from "vite-plus/test";
import { renderUi } from "~/testing/render";
import { expectScreenshot } from "~/testing/screenshot";
import { List, ListColumn, ListRow } from "./list";

describe("List", () => {
  it("renders a list with rows and columns", () => {
    const container = renderUi(() => (
      <List>
        <ListRow>
          <ListColumn grow>Nude</ListColumn>
        </ListRow>
      </List>
    ));

    expect(container.querySelector("ul")).toHaveClass("list");
    expect(container.querySelector("li")).toHaveClass("list-row");
    expect(container.querySelector("div")).toHaveClass("list-col-grow");
  });

  it("applies the wrap class", () => {
    const container = renderUi(() => (
      <List>
        <ListRow>
          <ListColumn wrap>Title</ListColumn>
        </ListRow>
      </List>
    ));

    expect(container.querySelector("div")).toHaveClass("list-col-wrap");
  });

  it("looks right with rows", async () => {
    const items = [
      { subtitle: "Reviewed", title: "Weird Fishes / Arpeggi" },
      { subtitle: "New", title: "Nude" },
      { subtitle: "In progress", title: "House of Cards" },
    ];

    renderUi(() => (
      <List class="w-96">
        {items.map((item) => (
          <ListRow>
            <ListColumn grow>
              <div class="font-semibold">{item.title}</div>
              <div class="text-xs opacity-60">{item.subtitle}</div>
            </ListColumn>
          </ListRow>
        ))}
      </List>
    ));

    await expectScreenshot("rows");
  });
});
