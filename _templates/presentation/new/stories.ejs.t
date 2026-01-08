---
to: apps/web/src/presentation/components/<%= name %>/<%= name %>.stories.tsx
---
import type { Meta, StoryObj } from "@storybook/react";
import { <%= name %> } from "./index";

const meta: Meta<typeof <%= name %>> = {
  title: "Presentation/Components/<%= name %>",
  component: <%= name %>,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof <%= name %>>;

export const Default: Story = {
  args: {},
};
