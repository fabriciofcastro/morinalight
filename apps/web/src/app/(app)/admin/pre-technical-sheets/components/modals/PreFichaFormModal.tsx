"use client";

import { Button, FormField, GlassCard, Input } from "@morina/ui";
import { X, Send, Save, AlertCircle } from "lucide-react";
import { PreFichaTecnica, CreateTecidoInput, CreateInsumoTecnicoInput } from "@/lib/api/pre-fichas-tecnicas";
import { PreFichaFormData } from "../../../types";
import { BasicInfoSection } from "../../sections/BasicInfoSection";
import { TechnicalInfoSection } from "../../sections/TechnicalInfoSection";
import { TecidosSection } from "../../sections/TecidosSection";
import { InsumosSection } from "../../sections/InsumosSection";

interface PreFichaFormModalProps {
    editingPreFicha: PreFichaTecnica | null;
    formData: PreFichaFormData;
    setFormData: React.Dispatch<React.SetStateAction<PreFichaFormData>>;
    tecidoForm: CreateTecidoInput;
    setTecidoForm: React.Dispatch<React.SetStateAction<CreateTecidoInput>>;
    insumoTecnicoForm: CreateInsumoTecnicoInput;
    setInsumoTecnicoForm: React.Dispatch<React.SetStateAction<CreateInsumoTecnicoInput>>;
    consumoPorTamanho: { [key: string]: number };
    setConsumoPorTamanho: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
    photoPreview: string | null;
    setPhotoPreview: (preview: string | null) => void;
    onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    uploadingPhoto: boolean;
    onAddTecido: () => void;
    onRemoveTecido: (index: number) => void;
    onAddInsumoTecnico: () => void;
    onRemoveInsumoTecnico: (index: number) => void;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
    pending: boolean;
}

export function PreFichaFormModal({
    editingPreFicha,
    formData,
    setFormData,
    tecidoForm,
    setTecidoForm,
    insumoTecnicoForm,
    setInsumoTecnicoForm,
    consumoPorTamanho,
    setConsumoPorTamanho,
    photoPreview,
    setPhotoPreview,
    onPhotoUpload,
    uploadingPhoto,
    onAddTecido,
    onRemoveTecido,
    onAddInsumoTecnico,
    onRemoveInsumoTecnico,
    onSubmit,
    onClose,
    pending,
}: PreFichaFormModalProps) {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <GlassCard className="w-full max-w-5xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-200">
                <div className="sticky top-0 z-10 bg-[#0a0a0b]/90 backdrop-blur-md border-b border-white/10 p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            {editingPreFicha ? "Editar Pré-Ficha Técnica" : "Nova Pré-Ficha Técnica"}
                        </h2>
                        <p className="text-sm text-white/60">
                            {editingPreFicha
                                ? `Editando versão ${editingPreFicha.versaoAtual} da peça ${editingPreFicha.codigoPeca}`
                                : "Preencha os dados técnicos para iniciar o fluxo de aprovação."}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-white/60 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </Button>
                </div>

                <div className="p-8">
                    <form onSubmit={onSubmit} className="space-y-8">
                        <BasicInfoSection
                            formData={formData}
                            setFormData={setFormData}
                            photoPreview={photoPreview}
                            setPhotoPreview={setPhotoPreview}
                            onPhotoUpload={onPhotoUpload}
                            uploadingPhoto={uploadingPhoto}
                        />

                        <TechnicalInfoSection
                            formData={formData}
                            setFormData={setFormData}
                        />

                        <TecidosSection
                            formData={formData}
                            setFormData={setFormData}
                            tecidoForm={tecidoForm}
                            setTecidoForm={setTecidoForm}
                            onAddTecido={onAddTecido}
                            onRemoveTecido={onRemoveTecido}
                        />

                        <InsumosSection
                            formData={formData}
                            setFormData={setFormData}
                            insumoTecnicoForm={insumoTecnicoForm}
                            setInsumoTecnicoForm={setInsumoTecnicoForm}
                            consumoPorTamanho={consumoPorTamanho}
                            setConsumoPorTamanho={setConsumoPorTamanho}
                            onAddInsumoTecnico={onAddInsumoTecnico}
                            onRemoveInsumoTecnico={onRemoveInsumoTecnico}
                        />

                        {/* Observações Adicionais */}
                        <div className="border-t border-white/10 pt-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Informações Complementares</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField label="Observações Técnicas">
                                    <textarea
                                        value={formData.observacoesTecnicas}
                                        onChange={(e) =>
                                            setFormData({ ...formData, observacoesTecnicas: e.target.value })
                                        }
                                        className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white/80 focus:ring-blue-500 min-h-[100px]"
                                        placeholder="Detalhes sobre a construção da peça..."
                                    />
                                </FormField>
                                <FormField label="Instruções para Oficina">
                                    <textarea
                                        value={formData.observacoesOficina}
                                        onChange={(e) =>
                                            setFormData({ ...formData, observacoesOficina: e.target.value })
                                        }
                                        className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white/80 focus:ring-blue-500 min-h-[100px]"
                                        placeholder="Orientações específicas para a produção..."
                                    />
                                </FormField>
                            </div>
                        </div>

                        {/* Controle de Alteração (Apenas Edição) */}
                        {editingPreFicha && (
                            <GlassCard className="p-6 border-blue-500/20 bg-blue-500/5">
                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-500/20 p-2 rounded-lg">
                                        <AlertCircle className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <h4 className="text-white font-semibold">Registro de Alteração</h4>
                                            <p className="text-sm text-white/60">Descreva o que foi alterado nesta versão para manter o histórico.</p>
                                        </div>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.houveAlteracao}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, houveAlteracao: e.target.checked })
                                                }
                                                className="w-5 h-5 rounded border-blue-500/40 bg-blue-500/10 text-blue-500"
                                            />
                                            <span className="text-white font-medium">Houve alteração técnica significativa</span>
                                        </label>
                                        {formData.houveAlteracao && (
                                            <textarea
                                                value={formData.descricaoAlteracao}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, descricaoAlteracao: e.target.value })
                                                }
                                                className="w-full p-3 bg-black/20 border border-blue-500/30 rounded-lg text-white focus:ring-blue-500"
                                                placeholder="Descreva as mudanças..."
                                                required
                                            />
                                        )}
                                    </div>
                                </div>
                            </GlassCard>
                        )}

                        <div className="flex justify-end gap-3 sticky bottom-0 bg-[#0a0a0b]/90 backdrop-blur-md border-t border-white/10 p-6 -mx-8 -mb-8">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={pending}
                                className="px-8 border-white/10 hover:bg-white/5"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={pending || uploadingPhoto}
                                className="px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                            >
                                {pending ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Salvando...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        {editingPreFicha ? <Save className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                                        {editingPreFicha ? "Salvar Alterações" : "Criar Pré-Ficha"}
                                    </div>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </GlassCard>
        </div>
    );
}
