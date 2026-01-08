import type { Meta, StoryObj } from "@storybook/react";
import { EnterpriseSidebar } from "./index";

const meta: Meta<typeof EnterpriseSidebar> = {
  title: "Widgets/EnterpriseSidebar",
  component: EnterpriseSidebar,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof EnterpriseSidebar>;

export const Default: Story = {};
