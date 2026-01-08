'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HeroSection } from '@/components/certifications/HeroSection';
import { CertificateCard } from '@/components/certifications/CertificateCard';
import { StatsSection } from '@/components/certifications/StatsSection';
import { TimelineSection } from '@/components/certifications/TimelineSection';
import { CertificationModal } from '@/components/certifications/CertificationModal';
import { Certification } from '@/components/certifications/types';
import { useScrollProgress } from '@/hooks/use-scroll-progress';

import { useCertifications } from '@/hooks/queries/use-certifications';
import { useCurrentOrganization } from '@/hooks/queries/use-organizations';
import { CertificationsFilters } from '@/components/certifications/CertificationsFilters';
import { CertificationsAnalytics } from '@/components/certifications/CertificationsAnalytics';
import { FilterValue } from '@/shared/ui/base/advanced-filter';
import { Button } from '@/shared/ui/base/button';
import { Mail, Settings } from 'lucide-react';
import { ThemeCustomizer } from '@/shared/ui/base/theme-customizer';

export const CertificationsClient = () => {
    const { data: currentOrg } = useCurrentOrganization();
    const { data: certifications, isLoading } = useCertifications(currentOrg?.id);
    const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
    const [filterValues, setFilterValues] = useState<FilterValue[]>([]);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const scrollProgress = useScrollProgress();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const certs = certifications || [];

    // Filtering logic
    const filteredCerts = certs.filter((cert: Certification) => {
        if (filterValues.length === 0) return true;

        return filterValues.every(fv => {
            if (!fv.value) return true;

            switch (fv.fieldId) {
                case 'search':
                    return cert.title.toLowerCase().includes(fv.value.toLowerCase()) ||
                        cert.description.toLowerCase().includes(fv.value.toLowerCase());
                case 'status':
                    return cert.status === fv.value;
                case 'category':
                    return cert.category === fv.value;
                case 'progress':
                    return cert.progress >= Number(fv.value);
                default:
                    return true;
            }
        });
    });

    const completedCerts = filteredCerts.filter((c: Certification) => c.status === 'complete');
    const preparedCerts = filteredCerts.filter((c: Certification) => c.status === 'prepared' || c.status === 'in-progress');

    const handleScheduleReport = async () => {
        // In a real app, show a modal or redirect
        const confirmed = window.confirm("Deseja agendar um relatório mensal para ser enviado aos administradores?");
        if (confirmed && currentOrg?.id) {
            try {
                await fetch("/api/analytics/schedules", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: `Relatório de Certificações - ${currentOrg.name}`,
                        reportType: "certifications",
                        frequency: "monthly",
                        dayOfMonth: 1,
                        timeOfDay: "09:00",
                        recipients: ["admin@morina.com"],
                        parameters: { filterValues }
                    })
                });
                alert("Agendamento criado com sucesso!");
            } catch (error) {
                console.error("Erro ao agendar:", error);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white relative">
            {/* Scroll Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-blue-500 z-[110] origin-left"
                style={{ scaleX: scrollProgress / 100 }}
            />

            <div className="fixed top-6 right-6 z-[120] flex gap-2">
                <ThemeCustomizer />
            </div>

            <HeroSection />

            <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-50">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
                    <CertificationsFilters
                        values={filterValues}
                        onValuesChange={setFilterValues}
                    />

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="bg-white/5 border-white/10 hover:bg-white/10"
                            onClick={() => setShowAnalytics(!showAnalytics)}
                        >
                            <Settings className="w-4 h-4 mr-2" />
                            {showAnalytics ? "Ocultar Analytics" : "Mostrar Analytics"}
                        </Button>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={handleScheduleReport}
                        >
                            <Mail className="w-4 h-4 mr-2" />
                            Agendar Relatório
                        </Button>
                    </div>
                </div>

                {showAnalytics && <CertificationsAnalytics certifications={certs} />}
            </div>

            <StatsSection certifications={certs} />

            {/* Completed Certifications Section */}
            <section className="py-24 px-4 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div>
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-5xl font-bold mb-4"
                        >
                            Pioneirismo em <br />
                            <span className="text-emerald-500">Conformidade</span>
                        </motion.h2>
                        <p className="text-gray-400 max-w-xl">
                            Nossa fundação é construída sobre os pilares mais rigorosos de privacidade e
                            acessibilidade globais, garantindo confiança desde o primeiro dia.
                        </p>
                    </div>

                    <div className="hidden md:grid grid-cols-2 gap-8 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-emerald-400">100%</div>
                            <div className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">Auditado</div>
                        </div>
                    </div>
                </div>

                {completedCerts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {completedCerts.map((cert: Certification, index: number) => (
                            <CertificateCard
                                key={cert.id}
                                certification={cert}
                                index={index}
                                onClick={setSelectedCert}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-500 border border-dashed border-white/10 rounded-2xl">
                        Nenhuma certificação concluída encontrada para os filtros atuais.
                    </div>
                )}
            </section>

            {/* Prepared Certifications Section */}
            <section className="py-24 px-4 max-w-7xl mx-auto bg-white/[0.01] border-y border-white/5">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div>
                        <motion.span
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 block"
                        >
                            Próximos Marcos
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-5xl font-bold mb-4"
                        >
                            Evolução <br />
                            <span className="text-blue-500">Contínua</span>
                        </motion.h2>
                        <p className="text-gray-400 max-w-xl">
                            Estamos em processo avançado de auditoria para as normas mais exigentes de
                            segurança cibernética e conformidade financeira.
                        </p>
                    </div>
                </div>

                {preparedCerts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {preparedCerts.map((cert: Certification, index: number) => (
                            <CertificateCard
                                key={cert.id}
                                certification={cert}
                                index={index}
                                onClick={setSelectedCert}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-500 border border-dashed border-white/10 rounded-2xl">
                        Nenhuma certificação em progresso encontrada para os filtros atuais.
                    </div>
                )}
            </section>

            <TimelineSection />

            {/* Final CTA Section */}
            <section className="py-24 bg-gradient-to-t from-blue-900/20 to-transparent">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold mb-8">
                        Interessado em saber <span className="text-blue-500">mais</span>?
                    </h2>
                    <p className="text-gray-400 mb-10 leading-relaxed">
                        Nossa equipe de segurança está disponível para fornecer relatórios detalhados,
                        esclarecer dúvidas sobre conformidade e realizar sessões técnicas de auditoria.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button className="px-10 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all hover:scale-105 active:scale-95">
                            Falar com Segurança
                        </button>
                    </div>
                </div>
            </section>

            <CertificationModal
                certification={selectedCert}
                onClose={() => setSelectedCert(null)}
            />

            {/* Decorative Grid Background */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
            </div>
        </div>
    );
};

