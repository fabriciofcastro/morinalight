import type { Meta, StoryObj } from "@storybook/react";
import { BulkActionsBar } from "./index";
import { CheckCircle2, XCircle, Trash2, Download, Mail } from "lucide-react";
import { useState } from "react";

const meta: Meta<typeof BulkActionsBar> = {
    title: "Components/BulkActionsBar",
    component: BulkActionsBar,
    tags: ["autodocs"],
    parameters: {
        layout: "padded",
        docs: {
            description: {
                component: "A bar component for displaying bulk actions when items are selected.",
            },
        },
    },
};

export default meta;
type Story = StoryObj<typeof BulkActionsBar>;

export const Default: Story = {
    args: {
        selectedCount: 5,
        actions: [
            {
                label: "Ativar",
                icon: <CheckCircle2 className="h-4 w-4" />,
                onClick: () => alert("Ativar clicked"),
                variant: "outline",
            },
            {
                label: "Desativar",
                icon: <XCircle className="h-4 w-4" />,
                onClick: () => alert("Desativar clicked"),
                variant: "outline",
            },
            {
                label: "Excluir",
                icon: <Trash2 className="h-4 w-4" />,
                onClick: () => alert("Excluir clicked"),
                variant: "destructive",
            },
        ],
        onCancel: () => alert("Cancelled"),
    },
};

export const WithExport: Story = {
    args: {
        selectedCount: 12,
        actions: [
            {
                label: "Exportar",
                icon: <Download className="h-4 w-4" />,
                onClick: () => alert("Export clicked"),
                variant: "outline",
            },
            {
                label: "Enviar Email",
                icon: <Mail className="h-4 w-4" />,
                onClick: () => alert("Email clicked"),
                variant: "outline",
            },
            {
                label: "Excluir",
                icon: <Trash2 className="h-4 w-4" />,
                onClick: () => alert("Delete clicked"),
                variant: "destructive",
            },
        ],
        onCancel: () => alert("Cancelled"),
    },
};

export const SingleItem: Story = {
    args: {
        selectedCount: 1,
        actions: [
            {
                label: "Editar",
                onClick: () => alert("Edit clicked"),
                variant: "outline",
            },
            {
                label: "Excluir",
                icon: <Trash2 className="h-4 w-4" />,
                onClick: () => alert("Delete clicked"),
                variant: "destructive",
            },
        ],
        onCancel: () => alert("Cancelled"),
    },
};

export const Interactive: Story = {
    render: () => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [selectedCount, setSelectedCount] = useState(3);

        return (
            <div className="space-y-4">
                <div className="flex gap-2">
                    <button
                        onClick={() => setSelectedCount(selectedCount + 1)}
                        className="px-3 py-1 bg-white/10 rounded text-sm"
                    >
                        Add Selection
                    </button>
                    <button
                        onClick={() => setSelectedCount(Math.max(0, selectedCount - 1))}
                        className="px-3 py-1 bg-white/10 rounded text-sm"
                    >
                        Remove Selection
                    </button>
                </div>
                <BulkActionsBar
                    selectedCount={selectedCount}
                    actions={[
                        {
                            label: "Ativar",
                            icon: <CheckCircle2 className="h-4 w-4" />,
                            onClick: () => alert(`Activating ${selectedCount} items`),
                            variant: "outline",
                        },
                        {
                            label: "Excluir",
                            icon: <Trash2 className="h-4 w-4" />,
                            onClick: () => alert(`Deleting ${selectedCount} items`),
                            variant: "destructive",
                        },
                    ]}
                    onCancel={() => setSelectedCount(0)}
                />
            </div>
        );
    },
};
