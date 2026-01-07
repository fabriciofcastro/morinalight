import type { Meta, StoryObj } from "@storybook/react";
import { FuturisticInput } from "./futuristic-input";
import { Mail, Lock, Search } from "lucide-react";

/**
 * **FuturisticInput** provides a specialized input field with advanced visual effects like
 * glow borders, glassmorphism adaptation, and built-in tooltip support.
 */
const meta: Meta<typeof FuturisticInput> = {
    title: "UI/Future/FuturisticInput",
    component: FuturisticInput,
    parameters: {
        layout: "centered",
        backgrounds: {
            default: "dark",
        },
    },
    args: {
        placeholder: "Type something...",
        className: "w-80",
    },
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FuturisticInput>;

export const Default: Story = {
    args: {
        label: "Username",
    },
};

export const WithIcon: Story = {
    args: {
        label: "Email Address",
        type: "email",
        placeholder: "john@example.com",
        startIcon: <Mail className="h-4 w-4" />,
    },
};

export const WithGlowEffect: Story = {
    decorators: [
        (Story) => (
            <div className="p-8">
                <Story />
            </div>
        )
    ],
    args: {
        label: "Search",
        placeholder: "Hover me to see effect...",
        startIcon: <Search className="h-4 w-4" />,
    },
};

export const Required: Story = {
    args: {
        label: "Password",
        type: "password",
        required: true,
        startIcon: <Lock className="h-4 w-4" />,
    },
};

export const WithError: Story = {
    args: {
        label: "Email Address",
        value: "invalid-email",
        error: true,
        errorMessage: "Please enter a valid email address",
        startIcon: <Mail className="h-4 w-4" />,
    },
};

export const WithHelperText: Story = {
    args: {
        label: "Username",
        helperText: "Must be at least 3 characters long",
    },
};

export const WithTooltip: Story = {
    args: {
        label: "API Key",
        tooltip: "Your secret API key from the dashboard",
        placeholder: "sk_live_...",
    },
};
