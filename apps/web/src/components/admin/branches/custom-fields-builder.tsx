"use client";

import { useState } from "react";
import {
    Plus,
    Trash2,
    MoveUp,
    MoveDown,
    Type,
    Settings,
    AlignLeft,
    Hash,
    Calendar,
    ToggleLeft,
    List,
    Mail,
    Link as LinkIcon,
    Palette
} from "lucide-react";
import { FuturisticInput } from "@/components/ui/futuristic-input";
import type {
    BranchCustomFieldsConfig,
    CustomFieldDefinition,
    CustomFieldType,
    CustomFieldOption
} from "@/types/custom-fields";

interface CustomFieldsBuilderProps {
    config: BranchCustomFieldsConfig;
    onChange: (config: BranchCustomFieldsConfig) => void;
}

const FIELD_TYPES: { type: CustomFieldType; label: string; icon: any }[] = [
    { type: "text", label: "Texto Curto", icon: Type },
    { type: "textarea", label: "Texto Longo", icon: AlignLeft },
    { type: "number", label: "Número", icon: Hash },
    { type: "date", label: "Data", icon: Calendar },
    { type: "boolean", label: "Sim/Não", icon: ToggleLeft },
    { type: "select", label: "Seleção Única", icon: List },
    { type: "email", label: "Email", icon: Mail },
    { type: "url", label: "URL/Link", icon: LinkIcon },
];

export function CustomFieldsBuilder({ config, onChange }: CustomFieldsBuilderProps) {
    const [editingFieldId, setEditingFieldId] = useState<string | null>(null);

    const addField = (type: CustomFieldType) => {
        const newField: CustomFieldDefinition = {
            id: crypto.randomUUID(),
            key: `field_${Date.now()}`,
            label: "Novo Campo",
            type,
            required: false,
            order: config.fields.length,
            options: type === "select" ? [{ label: "Opção 1", value: "opt1" }] : undefined,
        };

        onChange({
            ...config,
            fields: [...config.fields, newField],
        });
        setEditingFieldId(newField.id);
    };

    const updateField = (id: string, updates: Partial<CustomFieldDefinition>) => {
        onChange({
            ...config,
            fields: config.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
        });
    };

    const removeField = (id: string) => {
        onChange({
            ...config,
            fields: config.fields.filter((f) => f.id !== id),
        });
    };

    const moveField = (index: number, direction: "up" | "down") => {
        const newFields = [...config.fields];
        const targetIndex = direction === "up" ? index - 1 : index + 1;

        if (targetIndex >= 0 && targetIndex < newFields.length) {
            [newFields[index], newFields[targetIndex]] = [
                newFields[targetIndex],
                newFields[index],
            ];
            onChange({ ...config, fields: newFields });
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Toolbox: Tipos de Campos */}
            <div className="lg:col-span-1 space-y-4">
                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Tipos de Campos</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {FIELD_TYPES.map((item) => (
                            <button
                                key={item.type}
                                onClick={() => addField(item.type)}
                                className="flex flex-col items-center justify-center p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-center gap-2"
                                type="button"
                            >
                                <item.icon className="w-5 h-5 text-blue-400" />
                                <span className="text-xs text-white/80">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-sm text-blue-400">
                        <strong>Dica:</strong> Adicione campos para personalizar o formulário de filiais de acordo com as necessidades da sua empresa.
                    </p>
                </div>
            </div>

            {/* Lista de Campos */}
            <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-semibold text-white">Campos Configurados</h3>

                {config.fields.length === 0 ? (
                    <div className="p-8 rounded-xl bg-white/5 border border-white/10 border-dashed flex flex-col items-center justify-center text-center">
                        <Settings className="w-12 h-12 text-white/20 mb-3" />
                        <p className="text-white/50">Nenhum campo customizado adicionado.</p>
                        <p className="text-sm text-white/30">Selecione um tipo ao lado para começar.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {config.fields.map((field, index) => (
                            <div
                                key={field.id}
                                className={`rounded-xl border transition-all overflow-hidden ${editingFieldId === field.id
                                        ? "bg-white/10 border-blue-500/50"
                                        : "bg-white/5 border-white/10 hover:border-white/20"
                                    }`}
                            >
                                {/* Header do Campo */}
                                <div className="flex items-center justify-between p-4">
                                    <div
                                        className="flex items-center gap-3 cursor-pointer flex-1"
                                        onClick={() => setEditingFieldId(editingFieldId === field.id ? null : field.id)}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                            {FIELD_TYPES.find(t => t.type === field.type)?.icon({ className: "w-4 h-4 text-blue-400" }) || <Settings className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{field.label}</p>
                                            <p className="text-xs text-white/50">
                                                {FIELD_TYPES.find(t => t.type === field.type)?.label} • {field.required ? "Obrigatório" : "Opcional"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => moveField(index, "up")}
                                            disabled={index === 0}
                                            className="p-2 rounded hover:bg-white/10 text-white/50 hover:text-white disabled:opacity-30"
                                            type="button"
                                        >
                                            <MoveUp className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => moveField(index, "down")}
                                            disabled={index === config.fields.length - 1}
                                            className="p-2 rounded hover:bg-white/10 text-white/50 hover:text-white disabled:opacity-30"
                                            type="button"
                                        >
                                            <MoveDown className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => removeField(field.id)}
                                            className="p-2 rounded hover:bg-red-500/20 text-white/50 hover:text-red-400"
                                            type="button"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Editor do Campo (Expandido) */}
                                {editingFieldId === field.id && (
                                    <div className="p-4 pt-0 border-t border-white/10 space-y-4 animate-in slide-in-from-top-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FuturisticInput
                                                label="Rótulo (Label)"
                                                value={field.label}
                                                onChange={(e) => updateField(field.id, { label: e.target.value })}
                                            />
                                            <FuturisticInput
                                                label="Placeholder"
                                                value={field.placeholder || ""}
                                                onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                            />
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={field.required}
                                                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                                    className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-white">Campo Obrigatório</span>
                                            </label>
                                        </div>

                                        {/* Editor de Opções para Select */}
                                        {(field.type === "select" || field.type === "multiselect") && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-white/80">Opções</label>
                                                <div className="space-y-2">
                                                    {field.options?.map((option, optIndex) => (
                                                        <div key={optIndex} className="flex gap-2">
                                                            <input
                                                                className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm"
                                                                value={option.label}
                                                                onChange={(e) => {
                                                                    const newOptions = [...(field.options || [])];
                                                                    newOptions[optIndex].label = e.target.value;
                                                                    newOptions[optIndex].value = e.target.value.toLowerCase().replace(/\s+/g, "_");
                                                                    updateField(field.id, { options: newOptions });
                                                                }}
                                                                placeholder="Nome da opção"
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    const newOptions = field.options?.filter((_, i) => i !== optIndex);
                                                                    updateField(field.id, { options: newOptions });
                                                                }}
                                                                className="p-2 rounded bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400"
                                                                type="button"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={() => {
                                                            const newOptions = [...(field.options || []), { label: "", value: "" }];
                                                            updateField(field.id, { options: newOptions });
                                                        }}
                                                        className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                                        type="button"
                                                    >
                                                        <Plus className="w-4 h-4" /> Adicionar Opção
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
