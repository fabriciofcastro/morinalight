import type { Meta, StoryObj } from "@storybook/react";
import { ListPageLayout } from "./list-page-layout";
import { StatsGroup, StatCard } from "../../index";
import { Users, Plus, FileText, Download, CheckCircle2 } from "lucide-react";
import { Button } from "../button";

const meta: Meta<typeof ListPageLayout> = {
    title: "Templates/ListPageLayout",
    component: ListPageLayout,
    tags: ["autodocs"],
    parameters: {
        layout: "fullscreen",
    },
};

export default meta;
type Story = StoryObj<typeof ListPageLayout>;

export const Default: Story = {
    args: {
        header: {
            title: "Página de Exemplo",
            description: "Uma descrição detalhada da página de listagem.",
            icon: FileText,
            breadcrumbs: [
                { label: "Home", href: "/" },
                { label: "Módulo", href: "/modulo" },
                { label: "Lista" },
            ],
            stats: (
                <StatsGroup layout="horizontal" showSeparators>
                    <StatCard label="Total" value={100} icon={Users} variant="primary" />
                    <StatCard label="Ativos" value={80} icon={CheckCircle2} variant="success" />
                </StatsGroup>
            )
        },
        controls: {
            searchValue: "",
            onSearchChange: (v) => console.log("Search:", v),
            actions: (
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                    </Button>
                    <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Item
                    </Button>
                </div>
            )
        },
        children: (
            <div className="p-8 border-2 border-dashed border-white/10 rounded-xl text-center text-white/40">
                Conteúdo da Lista (Tabela ou Grid)
            </div>
        ),
        pagination: {
            total: 100,
            page: 1,
            pageSize: 10,
            onPageChange: (p) => console.log("Page:", p)
        }
    },
};
