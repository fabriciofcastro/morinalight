"use client";

import { WavePattern } from "@/components/legal/wave-pattern";

export default function CookiesPage() {
    return (
        <>
            <WavePattern />
            <div className="relative z-10 space-y-8">
                <div className="border-b border-white/10 pb-6">
                    <h1 className="text-4xl font-bold tracking-tight text-white">Política de Cookies</h1>
                    <p className="mt-2 text-lg text-white/60">Como utilizamos cookies e tecnologias similares</p>
                    <p className="mt-4 text-sm text-white/40">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
                </div>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">1. O que são Cookies?</h2>
                    <p className="leading-relaxed text-white/80">
                        Cookies são pequenos arquivos de texto armazenados no seu dispositivo quando você visita um site. Eles nos ajudam a melhorar sua experiência, lembrar suas preferências e entender como você usa nosso sistema.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">2. Tipos de Cookies que Utilizamos</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <h3 className="mb-2 font-bold text-white">Cookies Essenciais</h3>
                            <p className="text-sm text-white/60">Necessários para o funcionamento básico do sistema, como autenticação e segurança.</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <h3 className="mb-2 font-bold text-white">Cookies de Desempenho</h3>
                            <p className="text-sm text-white/60">Coletam informações sobre como você usa o sistema para melhorar o desempenho.</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <h3 className="mb-2 font-bold text-white">Cookies de Funcionalidade</h3>
                            <p className="text-sm text-white/60">Lembram suas preferências e configurações personalizadas.</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <h3 className="mb-2 font-bold text-white">Cookies de Segurança</h3>
                            <p className="text-sm text-white/60">Protegem contra atividades fraudulentas e garantem a segurança da sua sessão.</p>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">3. Gerenciamento de Cookies</h2>
                    <p className="leading-relaxed text-white/80">
                        Você pode controlar e gerenciar cookies através das configurações do seu navegador. No entanto, desabilitar cookies essenciais pode afetar a funcionalidade do sistema.
                    </p>
                </section>
            </div>
        </>
    );
}
