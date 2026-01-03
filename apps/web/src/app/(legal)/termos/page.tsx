"use client";

import { HexagonGrid } from "@/components/legal/hexagon-grid";

export default function TermosPage() {
    return (
        <>
            <HexagonGrid />
            <div className="relative z-10 space-y-8">
                <div className="border-b border-white/10 pb-6">
                    <h1 className="text-4xl font-bold tracking-tight text-white">Termos de Uso</h1>
                    <p className="mt-2 text-lg text-white/60">Condições gerais de uso da plataforma Morina</p>
                    <p className="mt-4 text-sm text-white/40">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
                </div>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">1. Aceitação dos Termos</h2>
                    <p className="leading-relaxed text-white/80">
                        Ao acessar e utilizar o sistema Morina, você concorda em cumprir estes Termos de Uso e todas as leis e regulamentos aplicáveis. Se você não concorda com algum destes termos, está proibido de usar ou acessar este sistema.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">2. Uso do Sistema</h2>
                    <p className="leading-relaxed text-white/80">
                        O sistema é destinado exclusivamente para uso corporativo interno. Você concorda em:
                    </p>
                    <ul className="list-disc space-y-2 pl-6 text-white/70">
                        <li>Não compartilhar suas credenciais de acesso com terceiros</li>
                        <li>Não utilizar o sistema para fins ilegais ou não autorizados</li>
                        <li>Manter a confidencialidade das informações acessadas</li>
                        <li>Notificar imediatamente qualquer uso não autorizado de sua conta</li>
                        <li>Respeitar os direitos de propriedade intelectual</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">3. Propriedade Intelectual</h2>
                    <p className="leading-relaxed text-white/80">
                        Todo o conteúdo, design, código-fonte e funcionalidades do sistema são propriedade exclusiva da Morina e estão protegidos por leis de direitos autorais, marcas registradas e outras leis de propriedade intelectual.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">4. Limitação de Responsabilidade</h2>
                    <p className="leading-relaxed text-white/80">
                        A Morina não se responsabiliza por:
                    </p>
                    <ul className="list-disc space-y-2 pl-6 text-white/70">
                        <li>Danos diretos ou indiretos resultantes do uso indevido do sistema</li>
                        <li>Indisponibilidade temporária do serviço por manutenção ou falhas técnicas</li>
                        <li>Perda de dados causada por ações do usuário</li>
                        <li>Decisões tomadas com base nas informações do sistema</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">5. Modificações</h2>
                    <p className="leading-relaxed text-white/80">
                        Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação. O uso continuado do sistema após as modificações constitui aceitação dos novos termos.
                    </p>
                </section>
            </div>
        </>
    );
}
