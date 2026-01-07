import type { Meta, StoryObj } from "@storybook/react";
import { Download, Filter, Plus, Save, Settings, Trash2 } from "lucide-react";
import * as React from "react";
import { ActionButton } from "./action-button";
import { ActionToolbar } from "./action-toolbar";
import { Button } from "./button";
import { FilterInput } from "./filter-input";

const meta: Meta = {
    title: "Components/Action Components",
    parameters: {
        layout: "padded",
    },
};

export default meta;

export const ActionButtonStory: StoryObj<typeof ActionButton> = {
    render: () => (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <ActionButton icon={<Plus className="h-4 w-4" />} tooltip="Adicionar novo item" />
                <ActionButton icon={<Trash2 className="h-4 w-4" />} tooltip="Excluir selecionados" variant="destructive" />
                <ActionButton icon={<Settings className="h-4 w-4" />} tooltip="Configurações" variant="outline" />
            </div>
            <div className="flex items-center gap-2">
                <ActionButton icon={<Save className="h-4 w-4" />} tooltip="Salvar alterações" size="sm">
                    Salvar
                </ActionButton>
                <ActionButton icon={<Download className="h-4 w-4" />} tooltip="Exportar dados" size="sm" variant="secondary">
                    Exportar
                </ActionButton>
            </div>
        </div>
    ),
};

export const FilterInputStory: StoryObj<typeof FilterInput> = {
    render: () => {
        const [val, setVal] = React.useState("");
        const [debouncedVal, setDebouncedVal] = React.useState("");

        return (
            <div className="space-y-4 max-w-sm">
                <FilterInput
                    value={val}
                    onChange={(v) => {
                        setVal(v);
                        console.log("Immediate:", v);
                        setTimeout(() => setDebouncedVal(v), 300);
                    }}
                    placeholder="Buscar por nome..."
                />
                <div className="text-sm text-text-secondary">
                    <div>Value: {val}</div>
                    <div>Debounced (simulated): {debouncedVal}</div>
                </div>
            </div>
        );
    },
};

export const ActionToolbarStory: StoryObj<typeof ActionToolbar> = {
    render: () => {
        const [filter, setFilter] = React.useState("");

        return (
            <div className="space-y-8 bg-background-primary p-4 rounded-lg border border-border-default">
                <ActionToolbar
                    prefix={
                        <>
                            <FilterInput
                                value={filter}
                                onChange={setFilter}
                                placeholder="Buscar registros..."
                                className="w-64"
                            />
                            <Button variant="outline" size="sm" leftIcon={<Filter className="h-4 w-4" />}>
                                Filtros
                            </Button>
                        </>
                    }
                    suffix={
                        <>
                            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>
                                Exportar
                            </Button>
                            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
                                Novo Registro
                            </Button>
                        </>
                    }
                />
            </div>
        );
    },
};
