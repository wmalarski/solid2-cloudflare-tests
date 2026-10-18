import { describe, expect, it } from "vite-plus/test";
import { renderUi } from "../test-utils";
import { Loading } from "./loading";

/**
 * The daisyUI spinner animates via an SMIL mask, which cannot be frozen for a
 * stable screenshot, so the loading states are asserted through the DOM.
 */
describe("Loading", () => {
  it("renders a medium spinner by default", () => {
    const container = renderUi(() => <Loading />);

    const spinner = container.querySelector(".loading");
    expect(spinner?.tagName).toBe("SPAN");
    expect(spinner).toHaveClass("loading-spinner");
    expect(spinner).toHaveClass("loading-md");
  });

  it("applies the size class", () => {
    const container = renderUi(() => <Loading size="xl" />);

    expect(container.querySelector(".loading")).toHaveClass("loading-xl");
  });

  it("renders every size", () => {
    const container = renderUi(() => (
      <>
        <Loading size="xs" />
        <Loading size="sm" />
        <Loading size="md" />
        <Loading size="lg" />
        <Loading size="xl" />
      </>
    ));

    const sizes = ["loading-xs", "loading-sm", "loading-md", "loading-lg", "loading-xl"];
    container.querySelectorAll(".loading").forEach((spinner, index) => {
      expect(spinner).toHaveClass(sizes[index]);
    });
  });
});
