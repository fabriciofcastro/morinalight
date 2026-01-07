import type { Meta, StoryObj } from "@storybook/react";
import { GlassDropdown } from "./glass-dropdown";
import { User, Settings, LogOut, Bell } from "lucide-react";

/**
 * **GlassDropdown** implements the **Compound Component** pattern to provide ample flexibility in rendering.
 *
 * ## Design Patterns
 * - **Compound Component**: Usage involves `GlassDropdown.Trigger`, `GlassDropdown.Content`, and `GlassDropdown.Item`.
 * - **Glassmorphism**: Default styling uses translucent backgrounds and blurring.
 */
const meta: Meta<typeof GlassDropdown> = {
    title: "UI/Future/GlassDropdown",
    component: GlassDropdown,
    parameters: {
        layout: "centered",
        backgrounds: {
            default: "dark",
        },
    },
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof GlassDropdown>;

export const Default: Story = {
    render: (args) => (
        <div className="h-40 w-64 flex items-start justify-center">
            <GlassDropdown {...args}>
                <GlassDropdown.Trigger>Options</GlassDropdown.Trigger>
                <GlassDropdown.Content>
                    <GlassDropdown.Item onClick={() => console.log("Profile")}>
                        <User className="mr-2 h-4 w-4" /> Profile
                    </GlassDropdown.Item>
                    <GlassDropdown.Item onClick={() => console.log("Settings")}>
                        <Settings className="mr-2 h-4 w-4" /> Settings
                    </GlassDropdown.Item>
                    <div className="my-1 border-t border-white/10" />
                    <GlassDropdown.Item destructive onClick={() => console.log("Logout")}>
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                    </GlassDropdown.Item>
                </GlassDropdown.Content>
            </GlassDropdown>
        </div>
    ),
};

export const WithCustomTrigger: Story = {
    render: (args) => (
        <div className="h-40 w-64 flex items-start justify-center">
            <GlassDropdown {...args}>
                <GlassDropdown.Trigger className="rounded-full w-10 h-10 p-0 justify-center">
                    <Bell className="h-4 w-4" />
                </GlassDropdown.Trigger>
                <GlassDropdown.Content>
                    <GlassDropdown.Item>Notification 1</GlassDropdown.Item>
                    <GlassDropdown.Item>Notification 2</GlassDropdown.Item>
                </GlassDropdown.Content>
            </GlassDropdown>
        </div>
    ),
};
