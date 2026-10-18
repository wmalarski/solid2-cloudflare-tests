import { Dynamic } from "@solidjs/web";
import { describe, expect, it } from "vite-plus/test";
import { renderUi } from "~/testing/render";
import { expectScreenshot } from "~/testing/screenshot";
import { AlertCircleIcon } from "./alert-circle-icon";
import { ChartNetworkIcon } from "./chart-network-icon";
import { CheckCircleIcon } from "./check-circle-icon";
import { ChevronLeftIcon } from "./chevron-left-icon";
import { DownloadIcon } from "./download-icon";
import { HandIcon } from "./hand-icon";
import { InfoIcon } from "./info-icon";
import { LinkIcon } from "./link-icon";
import { MinusIcon } from "./minus-icon";
import { MoonIcon } from "./moon-icon";
import { PencilIcon } from "./pencil-icon";
import { PlayIcon } from "./play-icon";
import { PlusIcon } from "./plus-icon";
import { ProfileIcon } from "./profile-icon";
import { SettingsIcon } from "./settings-icon";
import { SquareIcon } from "./square-icon";
import { SunIcon } from "./sun-icon";
import { TagsIcon } from "./tags-icon";
import { TrashIcon } from "./trash-icon";
import { XCircleIcon } from "./x-circle-icon";

const icons = {
  AlertCircleIcon,
  ChartNetworkIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  DownloadIcon,
  HandIcon,
  InfoIcon,
  LinkIcon,
  MinusIcon,
  MoonIcon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  ProfileIcon,
  SettingsIcon,
  SquareIcon,
  SunIcon,
  TagsIcon,
  TrashIcon,
  XCircleIcon,
} as const;

describe("Icons", () => {
  for (const [name, Icon] of Object.entries(icons)) {
    it(`${name} renders an svg`, () => {
      const container = renderUi(() => <Icon />);

      const svg = container.querySelector("svg");
      expect(svg).toBeTruthy();
      expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
      expect(svg).toHaveAttribute("width", "24");
    });
  }

  it("forwards extra props to the svg", () => {
    const container = renderUi(() => <SunIcon aria-label="Brightness" class="size-8" />);

    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("aria-label", "Brightness");
    expect(svg).toHaveClass("size-8");
  });

  it("looks right as a gallery", async () => {
    renderUi(() => (
      <div class="grid grid-cols-4 gap-6">
        {Object.entries(icons).map(([name, Icon]) => (
          <div class="flex flex-col items-center gap-2 text-center">
            <Dynamic component={Icon} class="size-8" />
            <span class="text-xs opacity-60">{name}</span>
          </div>
        ))}
      </div>
    ));

    await expectScreenshot("gallery");
  });
});
