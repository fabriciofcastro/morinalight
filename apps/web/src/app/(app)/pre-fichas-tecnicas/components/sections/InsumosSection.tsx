"use client";

import { FormField, Input, FormSelect, GlassCard, Button } from "@morina/ui";
import { Package, Trash2, Plus } from "lucide-react";
import { CreateInsumoTecnicoInput, TipoInsumoTecnico, UnidadeMedida } from "@/lib/api/pre-fichas-tecnicas";
import { PreFichaFormData } from "../../types";

interface InsumosSectionProps {
    formData: PreFichaFormData;
    setFormData: React.Dispatch<React.SetStateAction<PreFichaFormData>>;
    insumoTecnicoForm: CreateInsumoTecnicoInput;
    setInsumoTecnicoForm: React.Dispatch<React.SetStateAction<CreateInsumoTecnicoInput>>;
    consumoPorTamanho: { [key: string]: number };
    setConsumoPorTamanho: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
    onAddInsumoTecnico: () => void;
    onRemoveInsumoTecnico: (index: number) => void;
}

export function InsumosSection({
    formData,
    setFormData,
    insumoTecnicoForm,
    setInsumoTecnicoForm,
    consumoPorTamanho,
    setConsumoPorTamanho,
    onAddInsumoTecnico,
    onRemoveInsumoTecnico,
}: InsumosSectionProps) {
    return (
        <div className="border-t border-white/10 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-400" />
                Insumos Técnicos
            </h3>

            {/* Formulário de Adição de Insumo */}
            <GlassCard className="p-4 mb-4 border-white/10 bg-white/[0.02]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField label="Descrição *">
                        <Input
                            value={insumoTecnicoForm.descricao}
                            onChange={(e) =>
                                setInsumoTecnicoForm({ ...insumoTecnicoForm, descricao: e.target.value })
                            }
                            placeholder="Ex: Zíper Invisível 20cm"
                        />
                    </FormField>
                    <FormField label="Tipo *">
                        <FormSelect
                            value={insumoTecnicoForm.tipo}
                            onChange={(e) =>
                                setInsumoTecnicoForm({
                                    ...insumoTecnicoForm,
                                    tipo: e.target.value as TipoInsumoTecnico,
                                })
                            }
                        >
                            <option value="linha">Linha</option>
                            <option value="ziper">Ziper</option>
                            <option value="botao">Botão</option>
                            <option value="etiqueta">Etiqueta</option>
                            <option value="outros">Outros</option>
                        </FormSelect>
                    </FormField>
                    <FormField label="Unidade de Medida *">
                        <FormSelect
                            value={insumoTecnicoForm.unidadeMedida}
                            onChange={(e) =>
                                setInsumoTecnicoForm({
                                    ...insumoTecnicoForm,
                                    unidadeMedida: e.target.value as UnidadeMedida,
                                })
                            }
                        >
                            <option value="unidade">Unidade</option>
                            <option value="cm">Centímetros (cm)</option>
                            <option value="metro">Metro</option>
                            <option value="kg">Quilograma (kg)</option>
                            <option value="litro">Litro</option>
                        </FormSelect>
                    </FormField>
                    <FormField label="Quantidade Base *">
                        <Input
                            type="number"
                            step="0.01"
                            value={insumoTecnicoForm.quantidadeBase}
                            onChange={(e) =>
                                setInsumoTecnicoForm({
                                    ...insumoTecnicoForm,
                                    quantidadeBase: parseFloat(e.target.value) || 0,
                                })
                            }
                        />
                    </FormField>

                    {formData.gradeTamanhos.length > 0 && (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3">
                            <p className="text-sm font-medium text-white/60 mb-3">Consumo por Tamanho (opcional)</p>
                            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
                                {formData.gradeTamanhos.map((tamanho) => (
                                    <FormField key={tamanho} label={tamanho}>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={consumoPorTamanho[tamanho] || ""}
                                            onChange={(e) =>
                                                setConsumoPorTamanho({
                                                    ...consumoPorTamanho,
                                                    [tamanho]: parseFloat(e.target.value) || 0,
                                                })
                                            }
                                            placeholder="0"
                                            className="bg-white/5"
                                        />
                                    </FormField>
                                ))}
                            </div>
                        </div>
                    )}

                    <FormField label="Observações Técnicas" className="col-span-1 md:col-span-2 lg:col-span-2">
                        <textarea
                            value={insumoTecnicoForm.observacoesTecnicas || ""}
                            onChange={(e) =>
                                setInsumoTecnicoForm({
                                    ...insumoTecnicoForm,
                                    observacoesTecnicas: e.target.value,
                                })
                            }
                            className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-white/80 focus:ring-blue-500 focus:border-blue-500 min-h-[40px]"
                            rows={1}
                        />
                    </FormField>

                    <div className="flex items-end">
                        <Button
                            type="button"
                            onClick={onAddInsumoTecnico}
                            className="w-full bg-blue-600 hover:bg-blue-700 h-[40px]"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Insumo
                        </Button>
                    </div>
                </div>
            </GlassCard>

            {/* Listagem de Insumos */}
            {formData.insumosTecnicos.length > 0 && (
                <div className="overflow-x-auto rounded-lg border border-white/10">
                    <table className="w-full text-sm text-left text-white/80">
                        <thead className="text-xs uppercase bg-white/5 text-white/60">
                            <tr>
                                <th className="px-4 py-3">Descrição</th>
                                <th className="px-4 py-3">Tipo</th>
                                <th className="px-4 py-3">Qtd Base</th>
                                <th className="px-4 py-3">Unidade</th>
                                <th className="px-4 py-3 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {formData.insumosTecnicos.map((ins, idx) => (
                                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-white">{ins.descricao}</div>
                                        {ins.observacoesTecnicas && (
                                            <div className="text-xs text-white/40">{ins.observacoesTecnicas}</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 capitalize">{ins.tipo}</td>
                                    <td className="px-4 py-3">{ins.quantidadeBase}</td>
                                    <td className="px-4 py-3">{ins.unidadeMedida}</td>
                                    <td className="px-4 py-3 text-right">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                            onClick={() => onRemoveInsumoTecnico(idx)}
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
