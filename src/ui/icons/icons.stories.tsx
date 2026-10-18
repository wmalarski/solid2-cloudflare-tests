import { Dynamic } from "@solidjs/web";
import { For } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
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

const icons = [
  { Icon: AlertCircleIcon, name: "AlertCircleIcon" },
  { Icon: ChartNetworkIcon, name: "ChartNetworkIcon" },
  { Icon: CheckCircleIcon, name: "CheckCircleIcon" },
  { Icon: ChevronLeftIcon, name: "ChevronLeftIcon" },
  { Icon: DownloadIcon, name: "DownloadIcon" },
  { Icon: HandIcon, name: "HandIcon" },
  { Icon: InfoIcon, name: "InfoIcon" },
  { Icon: LinkIcon, name: "LinkIcon" },
  { Icon: MinusIcon, name: "MinusIcon" },
  { Icon: MoonIcon, name: "MoonIcon" },
  { Icon: PencilIcon, name: "PencilIcon" },
  { Icon: PlayIcon, name: "PlayIcon" },
  { Icon: PlusIcon, name: "PlusIcon" },
  { Icon: ProfileIcon, name: "ProfileIcon" },
  { Icon: SettingsIcon, name: "SettingsIcon" },
  { Icon: SquareIcon, name: "SquareIcon" },
  { Icon: SunIcon, name: "SunIcon" },
  { Icon: TagsIcon, name: "TagsIcon" },
  { Icon: TrashIcon, name: "TrashIcon" },
  { Icon: XCircleIcon, name: "XCircleIcon" },
] as const;

const meta = {
  title: "UI/Icons",
  component: AlertCircleIcon,
  tags: ["autodocs"],
} satisfies Meta<typeof AlertCircleIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Gallery: Story = {
  render: () => (
    <div class="grid grid-cols-2 gap-6 sm:grid-cols-4">
      <For each={icons}>
        {(icon) => (
          <div class="flex flex-col items-center gap-2 text-center">
            <Dynamic component={icon.Icon} class="size-8" />
            <span class="text-xs opacity-60">{icon.name}</span>
          </div>
        )}
      </For>
    </div>
  ),
};
