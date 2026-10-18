import { describe, expect, it } from "vite-plus/test";
import { Button } from "../button/button";
import { expectScreenshot, renderUi } from "../test-utils";
import { Card, CardActions, CardBody, CardDescription, CardTitle } from "./card";

describe("Card", () => {
  it("applies variant, size and side classes", () => {
    const container = renderUi(() => (
      <Card imageFull side size="lg" variant="bordered">
        <CardBody>Body</CardBody>
      </Card>
    ));

    const card = container.querySelector(".card");
    expect(card).toHaveClass("card-border");
    expect(card).toHaveClass("card-lg");
    expect(card).toHaveClass("card-side");
    expect(card).toHaveClass("image-full");
  });

  it("renders the title through the component prop", () => {
    const container = renderUi(() => (
      <Card>
        <CardBody>
          <CardTitle component="h2">Card title</CardTitle>
        </CardBody>
      </Card>
    ));

    expect(container.querySelector("h2.card-title")).toHaveTextContent("Card title");
  });

  it("renders body, description and actions", () => {
    const container = renderUi(() => (
      <Card>
        <CardBody>
          <CardTitle component="h3">Title</CardTitle>
          <CardDescription>A short description.</CardDescription>
          <CardActions justify="end">
            <Button size="sm">Save</Button>
          </CardActions>
        </CardBody>
      </Card>
    ));

    expect(container.querySelector(".card-body")).toBeTruthy();
    expect(container.querySelector("span.text-sm")).toHaveTextContent("A short description.");
    expect(container.querySelector(".card-actions")).toHaveClass("justify-end");
  });

  it("looks right with content and actions", async () => {
    renderUi(() => (
      <Card class="w-80" variant="bordered">
        <CardBody>
          <CardTitle component="h2">Card title</CardTitle>
          <CardDescription>A short description of the card contents.</CardDescription>
          <CardActions justify="end">
            <Button size="sm" variant="ghost">
              Cancel
            </Button>
            <Button size="sm" color="primary">
              Save
            </Button>
          </CardActions>
        </CardBody>
      </Card>
    ));

    await expectScreenshot("content");
  });
});
