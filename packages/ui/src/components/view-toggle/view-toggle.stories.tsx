import type { Meta, StoryObj } from "@storybook/react";
import { ViewToggle } from "./index";
import { useState } from "react";
import { LayoutGrid, List, Table } from "lucide-react";

const meta: Meta<typeof ViewToggle> = {
    title: "Components/ViewToggle",
    component: ViewToggle,
    tags: ["autodocs"],
    parameters: {
        layout: "centered",
    },
};

export default meta;
type Story = StoryObj<typeof ViewToggle>;

export const Default: Story = {
    render: () => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [view, setView] = useState<"grid" | "list">("grid");
        return <ViewToggle value={view} onChange={setView} />;
    },
};

export const Disabled: Story = {
    args: {
        value: "grid",
        onChange: () => { },
        disabled: true,
    },
};

export const CustomIcons: Story = {
    render: () => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [view, setView] = useState<"grid" | "list">("grid");
        return (
            <ViewToggle
                value={view}
                onChange={setView}
                gridIcon={LayoutGrid}
                listIcon={Table}
            />
        );
    },
};
