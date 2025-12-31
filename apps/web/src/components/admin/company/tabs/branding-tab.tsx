"use client";

import { Palette } from "lucide-react";
import { SectionShell } from "../shared/section-shell";
import { AdvancedLogoUpload } from "../AdvancedLogoUpload";

interface BrandingTabProps {
    formData: any;
    setFormData: (data: any) => void;
}

export function BrandingTab({ formData, setFormData }: BrandingTabProps) {
    return (
        <SectionShell active={true}>
            <h2 className="text-2xl font-bold text-white/90 mb-6 flex items-center gap-2">
                <Palette className="h-6 w-6 text-[hsl(var(--primary))]" />
                Theme Engine & Personalização
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Logo Upload */}
                <div className="md:col-span-2 space-y-4">
                    <AdvancedLogoUpload
                        label="Identidade Visual (Logo)"
                        description="Faça upload do logo da sua empresa. Recomendamos uma imagem quadrada (proporção 1:1) em formato PNG ou SVG transparente."
                        value={formData.branding?.logo}
                        onChange={(value) => {
                            setFormData({
                                ...formData,
                                branding: { ...formData.branding, logo: value },
                            });
                        }}
                        maxSize={2 * 1024 * 1024} // 2MB
                        aspectRatio={{ min: 0.8, max: 1.2 }}
                    />
                </div>

                <div className="space-y-4 md:col-span-2">
                    <h3 className="text-lg font-semibold text-white/80">Temas Pré-configurados</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {[
                            {
                                name: "Empresarial Azul",
                                accent: "#1E40AF",
                                neutral: "#475569",
                                surface: "#FFFFFF",
                            },
                            {
                                name: "Criativo Roxo",
                                accent: "#7C3AED",
                                neutral: "#6B7280",
                                surface: "#FFFFFF",
                            },
                            {
                                name: "Clean Minimalista",
                                accent: "#6B7280",
                                neutral: "#94A3B8",
                                surface: "#F8FAFC",
                            },
                            {
                                name: "Vibrante Laranja",
                                accent: "#EA580C",
                                neutral: "#78716C",
                                surface: "#FFFBEB",
                            },
                            {
                                name: "Natureza Verde",
                                accent: "#059669",
                                neutral: "#6B7280",
                                surface: "#F0FDF4",
                            },
                            {
                                name: "Cyberpunk Neon",
                                accent: "#0ea5e9",
                                neutral: "#0f172a",
                                surface: "#020617",
                            },
                        ].map((preset) => (
                            <button
                                key={preset.name}
                                type="button"
                                onClick={() => {
                                    setFormData({
                                        ...formData,
                                        branding: {
                                            ...formData.branding,
                                            theme: "custom",
                                            accentColor: preset.accent,
                                        },
                                    });
                                }}
                                className="group relative p-4 rounded-xl border border-white/10 hover:border-[hsl(var(--primary))] transition-all bg-white/5 hover:bg-white/10 text-left overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center gap-2 mb-2">
                                    <div
                                        className="w-4 h-4 rounded-full shadow-sm"
                                        style={{ backgroundColor: preset.accent }}
                                    />
                                    <div
                                        className="w-4 h-4 rounded-full shadow-sm"
                                        style={{ backgroundColor: preset.neutral }}
                                    />
                                    <div
                                        className="w-4 h-4 rounded-full shadow-sm border border-white/20"
                                        style={{ backgroundColor: preset.surface }}
                                    />
                                </div>
                                <span className="text-xs font-medium text-white/70 group-hover:text-white transition-colors block truncate">
                                    {preset.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Controles Finos */}
                <div className="space-y-6">
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-white">Tipografia</h3>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                Preview
                            </span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <label className="text-white/70">Escala da Fonte</label>
                                <span className="text-white font-mono">1.0x</span>
                            </div>
                            <input
                                type="range"
                                min="0.8"
                                max="1.25"
                                step="0.05"
                                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[hsl(var(--primary))]"
                            />
                            <p className="text-xs text-white/50">
                                0.8 (Compacto) • 1.0 (Padrão) • 1.25 (Acessibilidade)
                            </p>
                        </div>

                        <FuturisticSelect
                            label="Fonte Principal"
                            value={formData.branding?.font || "inter"}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    branding: { ...formData.branding, font: e.target.value },
                                })
                            }
                        >
                            <option value="inter" className="bg-[#09090b]">
                                Inter (Padrão)
                            </option>
                            <option value="roboto" className="bg-[#09090b]">
                                Roboto
                            </option>
                            <option value="poppins" className="bg-[#09090b]">
                                Poppins
                            </option>
                        </FuturisticSelect>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
                        <h3 className="font-semibold text-white mb-2">Modo & Densidade</h3>

                        <FuturisticSelect
                            label="Modo de Contraste"
                            value={formData.branding?.contrastMode || "normal"}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    branding: { ...formData.branding, contrastMode: e.target.value },
                                })
                            }
                        >
                            <option value="normal" className="bg-[#09090b]">
                                Normal (Padrão)
                            </option>
                            <option value="high" className="bg-[#09090b]">
                                Alto Contraste (WCAG AAA)
                            </option>
                            <option value="sepia" className="bg-[#09090b]">
                                Sepia (Conforto Visual)
                            </option>
                        </FuturisticSelect>

                        <FuturisticSelect
                            label="Densidade de Interface"
                            value={formData.branding?.density || "comfortable"}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    branding: { ...formData.branding, density: e.target.value },
                                })
                            }
                        >
                            <option value="compact" className="bg-[#09090b]">
                                Compacto (Mais dados)
                            </option>
                            <option value="comfortable" className="bg-[#09090b]">
                                Confortável (Padrão)
                            </option>
                            <option value="spacious" className="bg-[#09090b]">
                                Espaçoso (Legibilidade)
                            </option>
                        </FuturisticSelect>
                    </div>
                </div>
            </div>
        </SectionShell>
    );
}
