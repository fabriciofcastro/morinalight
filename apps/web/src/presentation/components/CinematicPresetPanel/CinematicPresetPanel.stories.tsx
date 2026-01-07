import type { Meta, StoryObj } from "@storybook/react";
import { CinematicPresetPanel } from "./index";

const meta: Meta<typeof CinematicPresetPanel> = {
  title: "Presentation/Components/CinematicPresetPanel",
  component: CinematicPresetPanel,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Painel de configuração de presets cinematográficos para o cockpit da Morina.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CinematicPresetPanel>;

export const Default: Story = {
  args: {},
};

export const CustomClassName: Story = {
  args: {
    className: "max-w-md border-primary/50",
  },
};
