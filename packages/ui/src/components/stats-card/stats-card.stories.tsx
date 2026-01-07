import type { Meta, StoryObj } from "@storybook/react";
import { StatsCard } from "./index";
import { Users, CheckCircle2, XCircle, AlertCircle, Building2, TrendingUp } from "lucide-react";

const meta: Meta<typeof StatsCard> = {
    title: "Components/StatsCard",
    component: StatsCard,
    tags: ["autodocs"],
    parameters: {
        layout: "padded",
        docs: {
            description: {
                component: "A card component for displaying summary statistics with glassmorphism styling.",
            },
        },
    },
};

export default meta;
type Story = StoryObj<typeof StatsCard>;

export const Default: Story = {
    args: {
        label: "Total",
        value: 150,
    },
};

export const WithIcon: Story = {
    args: {
        label: "Total Users",
        value: 1250,
        icon: <Users className="h-4 w-4" />,
        subtitle: "100% ACTIVE",
    },
};

export const Primary: Story = {
    args: {
        label: "Total",
        value: 150,
        icon: <Users className="h-4 w-4" />,
        subtitle: "100% REGISTROS",
        color: "primary",
    },
};

export const Success: Story = {
    args: {
        label: "Ativos",
        value: 120,
        icon: <CheckCircle2 className="h-4 w-4" />,
        subtitle: "80% DA BASE",
        color: "success",
    },
};

export const Danger: Story = {
    args: {
        label: "Inativos",
        value: 30,
        icon: <XCircle className="h-4 w-4" />,
        subtitle: "20% DA BASE",
        color: "danger",
    },
};

export const Warning: Story = {
    args: {
        label: "Bloqueados",
        value: 5,
        icon: <AlertCircle className="h-4 w-4" />,
        subtitle: "3% DA BASE",
        color: "warning",
    },
};

export const Info: Story = {
    args: {
        label: "Empresas",
        value: 45,
        icon: <Building2 className="h-4 w-4" />,
        subtitle: "30% DO TOTAL",
        color: "info",
    },
};

export const StatsGrid: Story = {
    render: () => (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 w-full">
            <StatsCard
                label="Total"
                value={150}
                icon={<Users className="h-4 w-4" />}
                subtitle="100% REGISTROS"
                color="primary"
            />
            <StatsCard
                label="Ativos"
                value={120}
                icon={<CheckCircle2 className="h-4 w-4" />}
                subtitle="80% DA BASE"
                color="success"
            />
            <StatsCard
                label="Inativos"
                value={25}
                icon={<XCircle className="h-4 w-4" />}
                subtitle="17% DA BASE"
                color="danger"
            />
            <StatsCard
                label="Bloqueados"
                value={5}
                icon={<AlertCircle className="h-4 w-4" />}
                subtitle="3% DA BASE"
                color="warning"
            />
            <StatsCard
                label="Física"
                value={90}
                icon={<Users className="h-4 w-4" />}
                subtitle="60% DO TOTAL"
                color="info"
            />
            <StatsCard
                label="Jurídica"
                value={60}
                icon={<Building2 className="h-4 w-4" />}
                subtitle="40% DO TOTAL"
                color="info"
            />
        </div>
    ),
};
