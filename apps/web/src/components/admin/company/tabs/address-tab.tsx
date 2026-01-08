"use client";

import { Loader2, MapPin } from "lucide-react";
import { useCallback, useState } from "react";
import { FuturisticInput } from "@/shared/ui/base/futuristic-ui";
import { buscarEnderecoPorCep, formatarCep } from "@/shared/kernel/utils/viacep";
import { SectionShell } from "../shared/section-shell";

interface AddressTabProps {
    formData: any;
    setFormData: (data: any) => void;
    errors?: Record<string, string>;
}

export function AddressTab({ formData, setFormData }: AddressTabProps) {
    const [buscandoCep, setBuscandoCep] = useState(false);

    // Buscar CEP
    const buscarPorCep = useCallback(async (cep: string) => {
        const cepLimpo = cep.replace(/[^\d]/g, "");
        if (cepLimpo.length !== 8) return;

        setBuscandoCep(true);
        try {
            const resultado = await buscarEnderecoPorCep(cepLimpo);
            if (resultado) {
                setFormData((prev: any) => ({
                    ...prev,
                    address: {
                        ...prev.address,
                        street: resultado.logradouro || prev.address?.street,
                        neighborhood: resultado.bairro || prev.address?.neighborhood,
                        city: resultado.cidade || prev.address?.city,
                        state: resultado.estado || prev.address?.state,
                    },
                }));
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
        } finally {
            setBuscandoCep(false);
        }
    }, [setFormData]);

    return (
        <SectionShell active={true}>
            <h2 className="text-2xl font-bold text-white/90 mb-6 flex items-center gap-2">
                <MapPin className="h-6 w-6 text-[hsl(var(--accent))]" />
                Endereço
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-2 items-end">
                    <div className="flex-1">
                        <FuturisticInput
                            label="CEP"
                            value={formData.address?.zipCode || ""}
                            onChange={(e) => {
                                const formatted = formatarCep(e.target.value);
                                setFormData({
                                    ...formData,
                                    address: { ...formData.address, zipCode: formatted },
                                });
                                if (formatted.replace(/[^\d]/g, "").length === 8) {
                                    buscarPorCep(formatted);
                                }
                            }}
                            placeholder="00000-000"
                            maxLength={9}
                        />
                    </div>
                    {buscandoCep && <Loader2 className="mb-4 h-6 w-6 animate-spin text-white/50" />}
                </div>

                <FuturisticInput
                    label="Logradouro"
                    value={formData.address?.street || ""}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            address: { ...formData.address, street: e.target.value },
                        })
                    }
                    placeholder="Rua, Avenida..."
                />

                <FuturisticInput
                    label="Número"
                    value={formData.address?.number || ""}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            address: { ...formData.address, number: e.target.value },
                        })
                    }
                    placeholder="123"
                />

                <FuturisticInput
                    label="Bairro"
                    value={formData.address?.neighborhood || ""}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            address: { ...formData.address, neighborhood: e.target.value },
                        })
                    }
                    placeholder="Centro"
                />

                <FuturisticInput
                    label="Cidade"
                    value={formData.address?.city || ""}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            address: { ...formData.address, city: e.target.value },
                        })
                    }
                    placeholder="São Paulo"
                />

                <FuturisticInput
                    label="UF"
                    value={formData.address?.state || ""}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            address: { ...formData.address, state: e.target.value.toUpperCase() },
                        })
                    }
                    placeholder="SP"
                    maxLength={2}
                />
            </div>
        </SectionShell>
    );
}
