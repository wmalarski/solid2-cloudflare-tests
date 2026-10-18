import { describe, expect, it } from "vite-plus/test";
import { expectScreenshot, renderUi } from "../test-utils";
import { Link } from "./link";

describe("Link", () => {
  it("renders an anchor with its href and content", () => {
    const container = renderUi(() => <Link href="https://solidjs.com">Solid documentation</Link>);

    const anchor = container.querySelector("a")!;
    expect(anchor).toHaveAttribute("href", "https://solidjs.com");
    expect(anchor).toHaveTextContent("Solid documentation");
    expect(anchor).toHaveClass("link");
  });

  it("applies color, hover and size classes", () => {
    const container = renderUi(() => (
      <Link color="primary" hover href="#" size="xs">
        Link
      </Link>
    ));

    const anchor = container.querySelector("a");
    expect(anchor).toHaveClass("link-primary");
    expect(anchor).toHaveClass("link-hover");
    expect(anchor).toHaveClass("text-xs");
  });

  it("forwards target and rel", () => {
    const container = renderUi(() => (
      <Link href="https://solidjs.com" rel="noreferrer" target="_blank">
        External
      </Link>
    ));

    const anchor = container.querySelector("a")!;
    expect(anchor).toHaveAttribute("target", "_blank");
    expect(anchor).toHaveAttribute("rel", "noreferrer");
  });

  it("looks right across colors", async () => {
    renderUi(() => (
      <div class="flex flex-col gap-2">
        <Link color="primary" href="#">
          Primary
        </Link>
        <Link color="secondary" href="#">
          Secondary
        </Link>
        <Link color="accent" href="#">
          Accent
        </Link>
        <Link color="error" href="#">
          Error
        </Link>
        <Link hover href="#">
          Hover
        </Link>
      </div>
    ));

    await expectScreenshot("colors");
  });
});
