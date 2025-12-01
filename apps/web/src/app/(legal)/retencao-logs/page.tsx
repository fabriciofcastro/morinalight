"use client";

import { ScanLines } from "@/components/legal/scan-lines";

export default function RetencaoLogsPage() {
    return (
        <>
            <ScanLines />
            <div className="relative z-10 space-y-8">
                <div className="border-b border-white/10 pb-6">
                    <h1 className="text-4xl font-bold tracking-tight text-white">Política de Retenção de Logs</h1>
                    <p className="mt-2 text-lg text-white/60">Armazenamento e gestão de registros de auditoria</p>
                    <p className="mt-4 text-sm text-white/40">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
                </div>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">1. Objetivo</h2>
                    <p className="leading-relaxed text-white/80">
                        Esta política estabelece os procedimentos para coleta, armazenamento, retenção e descarte de logs do sistema Morina, em conformidade com a legislação vigente e melhores práticas de segurança da informação.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">2. Tipos de Logs Coletados</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <h3 className="mb-2 font-bold text-white">Logs de Acesso</h3>
                            <p className="text-sm text-white/60">Registros de login, logout, IP de origem, data/hora e dispositivo utilizado.</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <h3 className="mb-2 font-bold text-white">Logs de Transações</h3>
                            <p className="text-sm text-white/60">Operações financeiras, cálculos de comissões e movimentações de dados.</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <h3 className="mb-2 font-bold text-white">Logs de Segurança</h3>
                            <p className="text-sm text-white/60">Tentativas de acesso não autorizado, alterações de permissões e eventos críticos.</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <h3 className="mb-2 font-bold text-white">Logs de Auditoria</h3>
                            <p className="text-sm text-white/60">Modificações de dados, configurações do sistema e ações administrativas.</p>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">3. Períodos de Retenção</h2>
                    <p className="leading-relaxed text-white/80">
                        Os logs são retidos pelos seguintes períodos:
                    </p>
                    <ul className="list-disc space-y-2 pl-6 text-white/70">
                        <li><strong>Logs de Acesso:</strong> 12 meses</li>
                        <li><strong>Logs de Transações:</strong> 60 meses (conforme legislação fiscal)</li>
                        <li><strong>Logs de Segurança:</strong> 24 meses</li>
                        <li><strong>Logs de Auditoria:</strong> 60 meses</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">4. Armazenamento e Segurança</h2>
                    <p className="leading-relaxed text-white/80">
                        Todos os logs são:
                    </p>
                    <ul className="list-disc space-y-2 pl-6 text-white/70">
                        <li>Armazenados em formato criptografado</li>
                        <li>Protegidos contra alteração e exclusão não autorizada</li>
                        <li>Mantidos em infraestrutura redundante com backup</li>
                        <li>Acessíveis apenas por pessoal autorizado</li>
                        <li>Monitorados continuamente para detecção de anomalias</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">5. Descarte de Logs</h2>
                    <p className="leading-relaxed text-white/80">
                        Após o período de retenção, os logs são descartados de forma segura através de:
                    </p>
                    <ul className="list-disc space-y-2 pl-6 text-white/70">
                        <li>Exclusão criptográfica irreversível</li>
                        <li>Destruição física de mídias quando aplicável</li>
                        <li>Certificação de descarte conforme normas ISO 27001</li>
                    </ul>
                </section>
            </div>
        </>
    );
}
