import { describe, expect, it } from "vite-plus/test";
import { Button } from "../button/button";
import { expectScreenshot, renderUi } from "../test-utils";
import { Tooltip, TooltipContent } from "./tooltip";

describe("Tooltip", () => {
  it("applies color, placement and open classes", () => {
    const container = renderUi(() => (
      <Tooltip color="primary" open placement="bottom">
        <Button>Hover me</Button>
        <TooltipContent>Tooltip text</TooltipContent>
      </Tooltip>
    ));

    const tooltip = container.querySelector(".tooltip");
    expect(tooltip).toHaveClass("tooltip-primary");
    expect(tooltip).toHaveClass("tooltip-bottom");
    expect(tooltip).toHaveClass("tooltip-open");
    expect(container.querySelector(".tooltip-content")).toHaveTextContent("Tooltip text");
  });

  it("is closed by default", () => {
    const container = renderUi(() => <Tooltip />);

    expect(container.querySelector(".tooltip")).not.toHaveClass("tooltip-open");
  });

  it("looks right with placements", async () => {
    renderUi(() => (
      <div class="flex flex-col items-center gap-16 p-16">
        <Tooltip placement="top" open>
          <Button>Top</Button>
          <TooltipContent>Top tooltip</TooltipContent>
        </Tooltip>
        <Tooltip placement="bottom" open>
          <Button>Bottom</Button>
          <TooltipContent>Bottom tooltip</TooltipContent>
        </Tooltip>
        <Tooltip placement="left" open>
          <Button>Left</Button>
          <TooltipContent>Left tooltip</TooltipContent>
        </Tooltip>
        <Tooltip placement="right" open>
          <Button>Right</Button>
          <TooltipContent>Right tooltip</TooltipContent>
        </Tooltip>
      </div>
    ));

    await expectScreenshot("placements");
  });
});
