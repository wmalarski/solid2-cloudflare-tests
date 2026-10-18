import { describe, expect, it } from "vite-plus/test";
import { renderUi } from "~/testing/render";
import { expectScreenshot } from "~/testing/screenshot";
import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("renders a skeleton div", () => {
    const container = renderUi(() => <Skeleton />);

    expect(container.firstElementChild?.tagName).toBe("DIV");
    expect(container.firstElementChild).toHaveClass("skeleton");
  });

  it("merges custom sizing classes", () => {
    const container = renderUi(() => <Skeleton class="h-12 w-48" />);

    const skeleton = container.querySelector(".skeleton");
    expect(skeleton).toHaveClass("h-12");
    expect(skeleton).toHaveClass("w-48");
  });

  it("looks right for a card placeholder", async () => {
    renderUi(() => (
      <div class="flex w-72 flex-col gap-3">
        <Skeleton class="h-32 w-full" />
        <Skeleton class="h-5 w-3/4" />
        <Skeleton class="h-4 w-full" />
        <Skeleton class="h-4 w-1/2" />
      </div>
    ));

    await expectScreenshot("card-placeholder");
  });
});
