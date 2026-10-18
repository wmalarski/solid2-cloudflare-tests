import { describe, expect, it } from "vite-plus/test";
import { renderUi } from "~/testing/render";
import { expectScreenshot } from "~/testing/screenshot";
import { Avatar, AvatarContent, AvatarGroup } from "./avatar";

describe("Avatar", () => {
  it("applies the state classes", () => {
    const container = renderUi(() => (
      <>
        <Avatar online>
          <AvatarContent>ON</AvatarContent>
        </Avatar>
        <Avatar offline>
          <AvatarContent>OF</AvatarContent>
        </Avatar>
        <Avatar placeholder>
          <AvatarContent>PH</AvatarContent>
        </Avatar>
      </>
    ));

    const [online, offline, placeholder] = container.querySelectorAll(".avatar");
    expect(online).toHaveClass("avatar-online");
    expect(offline).toHaveClass("avatar-offline");
    expect(placeholder).toHaveClass("avatar-placeholder");
  });

  it("renders content children", () => {
    const container = renderUi(() => (
      <Avatar>
        <AvatarContent>JD</AvatarContent>
      </Avatar>
    ));

    expect(container.querySelector(".avatar > div")).toHaveTextContent("JD");
  });

  it("lays out a group of avatars", () => {
    const container = renderUi(() => (
      <AvatarGroup>
        <Avatar>
          <AvatarContent>A</AvatarContent>
        </Avatar>
        <Avatar>
          <AvatarContent>B</AvatarContent>
        </Avatar>
      </AvatarGroup>
    ));

    const group = container.querySelector(".avatar-group");
    expect(group).toHaveClass("avatar-group");
    expect(group?.querySelectorAll(".avatar")).toHaveLength(2);
  });

  it("looks right for status and group", async () => {
    renderUi(() => (
      <div class="flex flex-col gap-4 p-4">
        <div class="flex items-center gap-4">
          <Avatar online>
            <AvatarContent class="bg-primary text-primary-content text-sm">ON</AvatarContent>
          </Avatar>
          <Avatar offline>
            <AvatarContent class="bg-neutral text-neutral-content text-sm">OF</AvatarContent>
          </Avatar>
          <Avatar placeholder>
            <AvatarContent class="bg-neutral text-neutral-content text-sm">PH</AvatarContent>
          </Avatar>
        </div>
        <AvatarGroup>
          <Avatar>
            <AvatarContent class="bg-primary text-primary-content text-sm">A</AvatarContent>
          </Avatar>
          <Avatar>
            <AvatarContent class="bg-secondary text-secondary-content text-sm">B</AvatarContent>
          </Avatar>
          <Avatar>
            <AvatarContent class="bg-accent text-accent-content text-sm">C</AvatarContent>
          </Avatar>
        </AvatarGroup>
      </div>
    ));

    await expectScreenshot("status-and-group");
  });
});
