import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Link } from "./link";

const meta = {
  title: "UI/Link",
  component: Link,
  tags: ["autodocs"],
  args: {
    children: "Solid documentation",
    href: "https://solidjs.com",
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Colors: Story = {
  render: () => (
    <div class="flex flex-wrap gap-4">
      <Link color="primary" href="#">
        Primary
      </Link>
      <Link color="secondary" href="#">
        Secondary
      </Link>
      <Link color="accent" href="#">
        Accent
      </Link>
      <Link color="info" href="#">
        Info
      </Link>
      <Link color="success" href="#">
        Success
      </Link>
      <Link color="warning" href="#">
        Warning
      </Link>
      <Link color="error" href="#">
        Error
      </Link>
    </div>
  ),
};

export const Hover: Story = {
  args: {
    hover: true,
  },
};

export const External: Story = {
  args: {
    href: "https://solidjs.com",
    rel: "noreferrer",
    target: "_blank",
  },
};

export const Small: Story = {
  args: {
    size: "xs",
  },
};
