"use client";

import { ParticleField } from "@/components/legal/particle-field";

export default function AntiFraudePage() {
    return (
        <>
            <ParticleField />
            <div className="relative z-10 space-y-8">
                <div className="border-b border-white/10 pb-6">
                    <h1 className="text-4xl font-bold tracking-tight text-white">Política Antifraude</h1>
                    <p className="mt-2 text-lg text-white/60">Medidas de prevenção e combate a fraudes</p>
                    <p className="mt-4 text-sm text-white/40">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
                </div>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">1. Compromisso Antifraude</h2>
                    <p className="leading-relaxed text-white/80">
                        A Morina mantém uma política de tolerância zero com fraudes. Implementamos controles rigorosos para detectar, prevenir e combater qualquer atividade fraudulenta em nossa plataforma.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">2. Medidas de Segurança</h2>
                    <p className="leading-relaxed text-white/80">
                        Implementamos múltiplas camadas de segurança:
                    </p>
                    <ul className="list-disc space-y-2 pl-6 text-white/70">
                        <li>Monitoramento contínuo de transações e acessos</li>
                        <li>Análise comportamental de usuários</li>
                        <li>Autenticação multifator (MFA)</li>
                        <li>Criptografia end-to-end</li>
                        <li>Auditoria de todas as operações críticas</li>
                        <li>Alertas automáticos para atividades suspeitas</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">3. Detecção de Fraudes</h2>
                    <p className="leading-relaxed text-white/80">
                        Utilizamos tecnologias avançadas para identificar padrões suspeitos:
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <h3 className="mb-2 font-bold text-white">Machine Learning</h3>
                            <p className="text-sm text-white/60">Algoritmos que aprendem padrões normais e detectam anomalias automaticamente.</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <h3 className="mb-2 font-bold text-white">Análise em Tempo Real</h3>
                            <p className="text-sm text-white/60">Monitoramento instantâneo de todas as transações e operações.</p>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">4. Reporte de Suspeitas</h2>
                    <p className="leading-relaxed text-white/80">
                        Se você identificar qualquer atividade suspeita, entre em contato imediatamente:
                    </p>
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                        <p className="text-sm text-white/70">
                            <strong>Email:</strong> seguranca@morina.com.br<br />
                            <strong>Telefone:</strong> 0800-XXX-XXXX (24h)<br />
                            <strong>Canal Confidencial:</strong> Disponível no sistema
                        </p>
                    </div>
                </section>
            </div>
        </>
    );
}
