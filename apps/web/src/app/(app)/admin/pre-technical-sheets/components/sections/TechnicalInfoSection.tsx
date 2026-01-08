"use client";

import { FormField, Input } from "@morina/ui";
import { Users } from "lucide-react";
import { PreFichaFormData } from "../../../types";
import { GRADE_TAMANHOS } from "../../../constants";

interface TechnicalInfoSectionProps {
    formData: PreFichaFormData;
    setFormData: React.Dispatch<React.SetStateAction<PreFichaFormData>>;
}

export function TechnicalInfoSection({
    formData,
    setFormData,
}: TechnicalInfoSectionProps) {
    return (
        <div className="space-y-6">
            {/* Grade de Tamanhos */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Grade de Tamanhos</h3>
                <div className="flex gap-4 flex-wrap bg-white/5 p-4 rounded-lg border border-white/10">
                    {GRADE_TAMANHOS.map((tamanho) => (
                        <label key={tamanho} className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={formData.gradeTamanhos.includes(tamanho)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setFormData({
                                            ...formData,
                                            gradeTamanhos: [...formData.gradeTamanhos, tamanho],
                                        });
                                    } else {
                                        setFormData({
                                            ...formData,
                                            gradeTamanhos: formData.gradeTamanhos.filter((t) => t !== tamanho),
                                        });
                                    }
                                }}
                                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
                            />
                            <span className="text-white group-hover:text-blue-400 transition-colors">{tamanho}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Responsáveis Técnicos */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    Responsáveis Técnicos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField label="Estilista">
                        <Input
                            value={formData.estilistaNome}
                            onChange={(e) =>
                                setFormData({ ...formData, estilistaNome: e.target.value })
                            }
                            placeholder="Nome do estilista"
                        />
                    </FormField>
                    <FormField label="Modelista">
                        <Input
                            value={formData.modelistaNome}
                            onChange={(e) =>
                                setFormData({ ...formData, modelistaNome: e.target.value })
                            }
                            placeholder="Nome do modelista"
                        />
                    </FormField>
                    <FormField label="Piloteiro">
                        <Input
                            value={formData.piloteiroNome}
                            onChange={(e) =>
                                setFormData({ ...formData, piloteiroNome: e.target.value })
                            }
                            placeholder="Nome do piloteiro"
                        />
                    </FormField>
                </div>
            </div>
        </div>
    );
}
