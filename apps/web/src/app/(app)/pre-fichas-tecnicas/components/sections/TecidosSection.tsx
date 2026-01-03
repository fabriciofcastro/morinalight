"use client";

import { FormField, Input, FormSelect, GlassCard, Button } from "@morina/ui";
import { Scissors, Trash2, Plus } from "lucide-react";
import { CreateTecidoInput, TipoTecido } from "@/lib/api/pre-fichas-tecnicas";
import { PreFichaFormData } from "../../types";

interface TecidosSectionProps {
    formData: PreFichaFormData;
    setFormData: React.Dispatch<React.SetStateAction<PreFichaFormData>>;
    tecidoForm: CreateTecidoInput;
    setTecidoForm: React.Dispatch<React.SetStateAction<CreateTecidoInput>>;
    onAddTecido: () => void;
    onRemoveTecido: (index: number) => void;
}

export function TecidosSection({
    formData,
    setFormData,
    tecidoForm,
    setTecidoForm,
    onAddTecido,
    onRemoveTecido,
}: TecidosSectionProps) {
    return (
        <div className="border-t border-white/10 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Scissors className="w-5 h-5 text-blue-400" />
                Tecidos *
            </h3>

            {/* Formulário de Adição de Tecido */}
            <GlassCard className="p-4 mb-4 border-white/10 bg-white/[0.02]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField label="Tipo *">
                        <FormSelect
                            value={tecidoForm.tipo}
                            onChange={(e) =>
                                setTecidoForm({ ...tecidoForm, tipo: e.target.value as TipoTecido })
                            }
                        >
                            <option value="principal">Principal</option>
                            <option value="forro">Forro</option>
                            <option value="entretela">Entretela</option>
                            <option value="outros">Outros</option>
                        </FormSelect>
                    </FormField>
                    <FormField label="Nome *">
                        <Input
                            value={tecidoForm.nome}
                            onChange={(e) => setTecidoForm({ ...tecidoForm, nome: e.target.value })}
                            placeholder="Ex: Algodão Pima"
                        />
                    </FormField>
                    <FormField label="Especificação">
                        <Input
                            value={tecidoForm.especificacao || ""}
                            onChange={(e) =>
                                setTecidoForm({ ...tecidoForm, especificacao: e.target.value })
                            }
                            placeholder="Ex: 180g/m²"
                        />
                    </FormField>
                    <FormField label="Consumo (m) *">
                        <Input
                            type="number"
                            step="0.01"
                            value={tecidoForm.consumo}
                            onChange={(e) =>
                                setTecidoForm({
                                    ...tecidoForm,
                                    consumo: parseFloat(e.target.value) || 0,
                                })
                            }
                        />
                    </FormField>
                    <FormField label="Largura (cm) *">
                        <Input
                            type="number"
                            step="0.01"
                            value={tecidoForm.largura}
                            onChange={(e) =>
                                setTecidoForm({
                                    ...tecidoForm,
                                    largura: parseFloat(e.target.value) || 0,
                                })
                            }
                        />
                    </FormField>
                    <div className="flex items-end">
                        <Button
                            type="button"
                            onClick={onAddTecido}
                            className="w-full bg-blue-600 hover:bg-blue-700 h-[40px]"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Tecido
                        </Button>
                    </div>
                </div>
            </GlassCard>

            {/* Listagem de Tecidos */}
            {formData.tecidos.length > 0 && (
                <div className="overflow-x-auto rounded-lg border border-white/10">
                    <table className="w-full text-sm text-left text-white/80">
                        <thead className="text-xs uppercase bg-white/5 text-white/60">
                            <tr>
                                <th className="px-4 py-3">Tipo</th>
                                <th className="px-4 py-3">Nome</th>
                                <th className="px-4 py-3">Consumo</th>
                                <th className="px-4 py-3">Largura</th>
                                <th className="px-4 py-3 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {formData.tecidos.map((t, idx) => (
                                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-4 py-3 capitalize">{t.tipo}</td>
                                    <td className="px-4 py-3">
                                        <div>
                                            <div className="font-medium text-white">{t.nome}</div>
                                            {t.especificacao && (
                                                <div className="text-xs text-white/40">{t.especificacao}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">{t.consumo}m</td>
                                    <td className="px-4 py-3">{t.largura}cm</td>
                                    <td className="px-4 py-3 text-right">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                            onClick={() => onRemoveTecido(idx)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
