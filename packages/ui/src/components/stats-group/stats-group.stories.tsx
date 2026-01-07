import type { Meta, StoryObj } from "@storybook/react";
import { StatsGroup, StatCard } from "../../index";
import { Users, CheckCircle2, XCircle, AlertCircle, Building2 } from "lucide-react";

const meta: Meta<typeof StatsGroup> = {
    title: "Components/Stats/StatsGroup",
    component: StatsGroup,
    tags: ["autodocs"],
    parameters: {
        layout: "padded",
    },
};

export default meta;
type Story = StoryObj<typeof StatsGroup>;

export const Grid3: Story = {
    args: {
        layout: "grid-3",
        children: [
            <StatCard
                key="1"
                label="Total"
                value={150}
                icon={Users}
                variant="primary"
            />,
            <StatCard
                key="2"
                label="Ativos"
                value={120}
                icon={CheckCircle2}
                variant="success"
            />,
            <StatCard
                key="3"
                label="Inativos"
                value={30}
                icon={XCircle}
                variant="danger"
            />,
        ],
    },
};

export const Grid4: Story = {
    args: {
        layout: "grid-4",
        children: [
            <StatCard
                key="1"
                label="Total"
                value={150}
                icon={Users}
                variant="primary"
            />,
            <StatCard
                key="2"
                label="Ativos"
                value={120}
                icon={CheckCircle2}
                variant="success"
            />,
            <StatCard
                key="3"
                label="Inativos"
                value={25}
                icon={XCircle}
                variant="danger"
            />,
            <StatCard
                key="4"
                label="Bloqueados"
                value={5}
                icon={AlertCircle}
                variant="warning"
            />,
        ],
    },
};

export const HorizontalWithSeparators: Story = {
    args: {
        layout: "horizontal",
        showSeparators: true,
        children: [
            <StatCard
                key="1"
                label="Física"
                value={90}
                icon={Users}
                variant="info"
            />,
            <StatCard
                key="2"
                label="Jurídica"
                value={60}
                icon={Building2}
                variant="secondary"
            />,
        ],
    },
};
