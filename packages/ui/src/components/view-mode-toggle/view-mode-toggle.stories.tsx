import type { Meta, StoryObj } from "@storybook/react";
import { ViewModeToggle } from "./index";
import { useState } from "react";
import type { ViewModeType } from "./index";

const meta: Meta<typeof ViewModeToggle> = {
    title: "Components/ViewModeToggle",
    component: ViewModeToggle,
    tags: ["autodocs"],
    parameters: {
        layout: "padded",
        docs: {
            description: {
                component: "A toggle component for switching between grid and list view modes.",
            },
        },
    },
};

export default meta;
type Story = StoryObj<typeof ViewModeToggle>;

export const GridMode: Story = {
    args: {
        mode: "grid",
        onModeChange: (mode) => console.log("Mode changed to:", mode),
    },
};

export const ListMode: Story = {
    args: {
        mode: "list",
        onModeChange: (mode) => console.log("Mode changed to:", mode),
    },
};

export const Interactive: Story = {
    render: () => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [mode, setMode] = useState<ViewModeType>("grid");

        return (
            <div className="space-y-4">
                <ViewModeToggle mode={mode} onModeChange={setMode} />
                <div className="text-sm text-white/60">
                    Current mode: <span className="font-semibold text-white">{mode}</span>
                </div>
                {mode === "grid" ? (
                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-24 bg-white/10 rounded flex items-center justify-center">
                                Item {i}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-12 bg-white/10 rounded flex items-center px-4">
                                Item {i}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    },
};
