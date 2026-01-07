import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "primary",
        "secondary",
        "gradient",
        "neon",
        "glass",
        "minimal",
        "link",
        "warning",
        "info",
        "accent",
        "destructive",
        "ghost",
        "outline",
      ],
      description: "Visual style variant of the button",
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl", "iconSm", "iconLg"],
      description: "Size of the button",
    },
    disabled: {
      control: "boolean",
      description: "Disabled state",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Enterprise-grade Button component with 15 variants, 8 sizes, and full theme support. Includes gradient, neon, and glass morphism effects.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: "Button",
  },
};

export const Primary: Story = {
  args: {
    variant: "default",
    children: "Primary Button",
  },
};

export const Gradient: Story = {
  args: {
    variant: "gradient",
    children: "Gradient Button",
  },
};

export const Neon: Story = {
  args: {
    variant: "neon",
    children: "Neon Button",
  },
};

export const Glass: Story = {
  args: {
    variant: "glass",
    children: "Glass Button",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="default">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="gradient">Gradient</Button>
      <Button variant="neon">Neon</Button>
      <Button variant="glass">Glass</Button>
      <Button variant="minimal">Minimal</Button>
      <Button variant="link">Link</Button>
      <Button variant="warning">Warning</Button>
      <Button variant="info">Info</Button>
      <Button variant="accent">Accent</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="outline">Outline</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="xs">Extra Small</Button>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
    </div>
  ),
};

export const IconButtons: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="iconSm" variant="default">
        ✓
      </Button>
      <Button size="iconLg" variant="gradient">
        ★
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    variant: "default",
    disabled: true,
    children: "Disabled Button",
  },
};
