import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarGroup } from "./avatar";

const meta: Meta<typeof Avatar> = {
    title: "Components/Avatar",
    component: Avatar,
    tags: ["autodocs"],
    argTypes: {
        size: {
            control: "select",
            options: ["sm", "md", "lg", "xl", "2xl"],
        },
        status: {
            control: "select",
            options: ["online", "offline", "busy", "away"],
        },
    },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
    render: (args) => (
        <Avatar {...args} src="https://github.com/shadcn.png" alt="@shadcn" fallback="CN" />
    ),
    args: {
        size: "md",
        fallback: "CN",
    },
};

export const WithStatus: Story = {
    render: (args) => (
        <div className="flex gap-4">
            <Avatar {...args} status="online" src="https://github.com/shadcn.png" alt="@shadcn" fallback="ON" />
            <Avatar {...args} status="busy" src="https://github.com/shadcn.png" alt="@shadcn" fallback="BZ" />
            <Avatar {...args} status="away" src="https://github.com/shadcn.png" alt="@shadcn" fallback="AW" />
        </div>
    ),
};

export const Sizes: Story = {
    render: () => (
        <div className="flex items-end gap-4">
            <Avatar size="sm" fallback="SM" />
            <Avatar size="md" fallback="MD" />
            <Avatar size="lg" fallback="LG" />
            <Avatar size="xl" fallback="XL" />
            <Avatar size="2xl" fallback="2X" />
        </div>
    ),
};

export const Group: StoryObj<typeof AvatarGroup> = {
    render: () => (
        <AvatarGroup max={3}>
            <Avatar src="https://github.com/shadcn.png" fallback="CN" />
            <Avatar src="https://github.com/vercel.png" fallback="VC" />
            <Avatar fallback="JD" />
            <Avatar fallback="AB" />
            <Avatar fallback="CD" />
        </AvatarGroup>
    ),
};

