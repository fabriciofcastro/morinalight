"use client";

import { CircuitBoard } from "@/components/legal/circuit-board";

export default function PrivacidadePage() {
    return (
        <>
            <CircuitBoard />
            <div className="relative z-10 space-y-8">
                <div className="border-b border-white/10 pb-6">
                    <h1 className="text-4xl font-bold tracking-tight text-white">Política de Privacidade</h1>
                    <p className="mt-2 text-lg text-white/60">Como protegemos suas informações pessoais</p>
                    <p className="mt-4 text-sm text-white/40">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
                </div>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">1. Compromisso com a Privacidade</h2>
                    <p className="leading-relaxed text-white/80">
                        Respeitamos sua privacidade e nos comprometemos a proteger suas informações pessoais. Esta política explica nossas práticas de coleta, uso e proteção de dados.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">2. Informações que Coletamos</h2>
                    <p className="leading-relaxed text-white/80">
                        Coletamos diferentes tipos de informações:
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <h3 className="mb-2 font-bold text-white">Dados Fornecidos</h3>
                            <p className="text-sm text-white/60">Informações que você nos fornece diretamente ao criar uma conta ou usar nossos serviços.</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <h3 className="mb-2 font-bold text-white">Dados Coletados Automaticamente</h3>
                            <p className="text-sm text-white/60">Logs de acesso, endereço IP, tipo de navegador e dados de uso do sistema.</p>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">3. Compartilhamento de Informações</h2>
                    <p className="leading-relaxed text-white/80">
                        Não vendemos suas informações pessoais. Compartilhamos dados apenas:
                    </p>
                    <ul className="list-disc space-y-2 pl-6 text-white/70">
                        <li>Com prestadores de serviços essenciais (hospedagem, processamento de pagamentos)</li>
                        <li>Quando exigido por lei ou ordem judicial</li>
                        <li>Para proteger nossos direitos legais</li>
                        <li>Com seu consentimento explícito</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">4. Segurança</h2>
                    <p className="leading-relaxed text-white/80">
                        Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados contra acesso não autorizado, alteração, divulgação ou destruição.
                    </p>
                </section>
            </div>
        </>
    );
}
