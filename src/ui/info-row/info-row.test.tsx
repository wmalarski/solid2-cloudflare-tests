import { describe, expect, it } from "vite-plus/test";
import { expectScreenshot, renderUi } from "../test-utils";
import { InfoRowContainer, InfoRowItem } from "./info-row";

describe("InfoRowItem", () => {
  it("renders the name and value", () => {
    const container = renderUi(() => <InfoRowItem name="Status" value="Reviewed" />);

    const spans = container.querySelectorAll("span");
    expect(spans).toHaveLength(2);
    expect(spans[0]).toHaveTextContent("Status");
    expect(spans[0]).toHaveClass("font-semibold");
    expect(spans[1]).toHaveTextContent("Reviewed");
  });

  it("renders nothing when the value is empty", () => {
    const container = renderUi(() => <InfoRowItem name="Note" value="" />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the value is missing", () => {
    const container = renderUi(() => <InfoRowItem name="Note" />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe("InfoRowContainer", () => {
  it("renders a two column grid", () => {
    const container = renderUi(() => (
      <InfoRowContainer>
        <InfoRowItem name="Artist" value="Radiohead" />
      </InfoRowContainer>
    ));

    const grid = container.firstElementChild;
    expect(grid).toHaveClass("grid-cols-2");
    expect(grid).toHaveClass("gap-2");
  });

  it("looks right with several rows", async () => {
    renderUi(() => (
      <InfoRowContainer class="w-80">
        <InfoRowItem name="Status" value="Reviewed" />
        <InfoRowItem name="Artist" value="Radiohead" />
        <InfoRowItem name="Release date" value="2007-10-10" />
      </InfoRowContainer>
    ));

    await expectScreenshot("rows");
  });
});
