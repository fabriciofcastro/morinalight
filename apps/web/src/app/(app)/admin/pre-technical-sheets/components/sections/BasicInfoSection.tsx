"use client";

import { FormField, Input, Button } from "@morina/ui";
import { Upload, X } from "lucide-react";
import { PreFichaFormData } from "../../../types";

interface BasicInfoSectionProps {
    formData: PreFichaFormData;
    setFormData: React.Dispatch<React.SetStateAction<PreFichaFormData>>;
    photoPreview: string | null;
    setPhotoPreview: (preview: string | null) => void;
    onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    uploadingPhoto: boolean;
}

export function BasicInfoSection({
    formData,
    setFormData,
    photoPreview,
    setPhotoPreview,
    onPhotoUpload,
    uploadingPhoto,
}: BasicInfoSectionProps) {
    return (
        <div className="space-y-6">
            {/* Dados Básicos */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Dados Básicos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField label="Código da Peça *">
                        <Input
                            value={formData.codigoPeca}
                            onChange={(e) => setFormData({ ...formData, codigoPeca: e.target.value })}
                            required
                            placeholder="Ex: PC-001"
                        />
                    </FormField>
                    <FormField label="Nome da Peça Piloto *">
                        <Input
                            value={formData.nomePecaPiloto}
                            onChange={(e) =>
                                setFormData({ ...formData, nomePecaPiloto: e.target.value })
                            }
                            required
                            placeholder="Ex: Camiseta Básica Masculina"
                        />
                    </FormField>
                    <FormField label="Categoria">
                        <Input
                            value={formData.categoria}
                            onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                            placeholder="Ex: Malharia"
                        />
                    </FormField>
                </div>
            </div>

            {/* Upload de Foto */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Foto da Peça Piloto *</h3>
                <div className="flex gap-4">
                    {photoPreview || formData.fotoPecaUrl ? (
                        <div className="relative group">
                            <img
                                src={photoPreview || formData.fotoPecaUrl}
                                alt="Preview da foto da peça piloto"
                                className="w-48 h-48 object-cover rounded-lg border border-white/10 shadow-lg"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        fotoPecaUrl: "",
                                        fotoPecaStorageKey: "",
                                    }));
                                    setPhotoPreview(null);
                                }}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    ) : (
                        <label className="flex h-48 w-48 cursor-pointer items-center justify-center border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 transition-all rounded-lg">
                            <div className="text-center">
                                {uploadingPhoto ? (
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2" />
                                ) : (
                                    <Upload className="w-8 h-8 mx-auto text-white/40 mb-2" />
                                )}
                                <p className="text-sm font-medium text-white/60">Upload Foto</p>
                                <p className="text-xs text-white/40">JPG, PNG, WebP</p>
                            </div>
                            <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={onPhotoUpload}
                                className="hidden"
                                disabled={uploadingPhoto}
                            />
                        </label>
                    )}
                </div>
            </div>
        </div>
    );
}
