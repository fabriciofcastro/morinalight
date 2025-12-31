"use client";

import { Shield } from "lucide-react";
import { SectionShell } from "../shared/section-shell";
import { DigitalCertificateUpload } from "../DigitalCertificateUpload";

interface CertificateTabProps {
    formData: any;
    setFormData: (data: any) => void;
}

export function CertificateTab({ formData, setFormData }: CertificateTabProps) {
    return (
        <SectionShell active={true}>
            <h2 className="text-2xl font-bold text-white/90 mb-6 flex items-center gap-2">
                <Shield className="h-6 w-6 text-[hsl(var(--primary))]" />
                Certificação Digital
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <DigitalCertificateUpload
                        value={formData.certificate}
                        onChange={(data) => {
                            setFormData({
                                ...formData,
                                certificate: data || {}, // Handle null by setting empty object or null
                            });
                        }}
                    />
                </div>

                <div className="space-y-6">
                    <div className="p-6 rounded-xl border-2 border-dashed border-yellow-500/30 bg-yellow-500/5 relative overflow-hidden">
                        <div className="flex items-start gap-4 mb-6 relative z-10">
                            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                                <AlertTriangle className="h-6 w-6 text-yellow-500" />
                            </div>
                            <div>
                                <h4 className="font-bold text-yellow-500 text-lg">Não Configurado</h4>
                                <p className="text-sm text-yellow-200/70 leading-relaxed mt-1">
                                    Configure um certificado válido para habilitar a emissão de notas fiscais.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SectionShell>
    );
}
