import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./badge";

const meta: Meta<typeof Badge> = {
    title: "Components/Badge",
    component: Badge,
    tags: ["autodocs"],
    argTypes: {
        variant: {
            control: "select",
            options: [
                "default",
                "secondary",
                "outline",
                "danger",
                "success",
                "warning",
                "info",
            ],
        },
        size: {
            control: "select",
            options: ["sm", "md", "lg"],
        },
    },
    parameters: {
        docs: {
            description: {
                component: "Badges are used to highlight status, tags, or count.",
            },
        },
    },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
    args: {
        children: "Default",
        variant: "default",
    },
};

export const Secondary: Story = {
    args: {
        children: "Secondary",
        variant: "secondary",
    },
};

export const Outline: Story = {
    args: {
        children: "Outline",
        variant: "outline",
    },
};

export const Danger: Story = {
    args: {
        children: "Danger",
        variant: "danger",
    },
};

export const Success: Story = {
    args: {
        children: "Success",
        variant: "success",
    },
};

export const Warning: Story = {
    args: {
        children: "Warning",
        variant: "warning",
    },
};

export const Info: Story = {
    args: {
        children: "Info",
        variant: "info",
    },
};

export const Sizes: Story = {
    render: () => (
        <div className="flex items-center gap-4">
            <Badge size="sm">Small</Badge>
            <Badge size="md">Medium</Badge>
            <Badge size="lg">Large</Badge>
        </div>
    ),
};
