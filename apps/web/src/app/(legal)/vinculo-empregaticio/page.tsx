"use client";

import { PulsingGrid } from "@/components/legal/pulsing-grid";

export default function VinculoPage() {
    return (
        <>
            <PulsingGrid />
            <div className="relative z-10 space-y-8">
                <div className="border-b border-white/10 pb-6">
                    <h1 className="text-4xl font-bold tracking-tight text-white">Termo de Inexistência de Vínculo Empregatício</h1>
                    <p className="mt-2 text-lg text-white/60">Declaração de natureza comercial e autonomia profissional</p>
                    <p className="mt-4 text-sm text-white/40">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
                </div>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">1. Objeto e Natureza Jurídica</h2>
                    <p className="leading-relaxed text-white/80">
                        Este termo tem por objetivo formalizar e esclarecer a natureza estritamente comercial e civil da relação estabelecida entre a <strong>MORINA</strong> e seus Parceiros Comerciais / Representantes Autônomos. Fica expressamente declarado que esta relação <strong>não configura vínculo empregatício</strong>, nos termos do Art. 3º da Consolidação das Leis do Trabalho (CLT).
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">2. Ausência dos Requisitos Empregatícios</h2>
                    <p className="leading-relaxed text-white/80">
                        A relação entre as partes caracteriza-se pela ausência cumulativa dos requisitos fático-jurídicos que configuram a relação de emprego:
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <h3 className="mb-2 font-bold text-white">Sem Subordinação</h3>
                            <p className="text-sm text-white/60">O Parceiro atua com total autonomia na gestão de suas atividades, métodos de venda e estratégias, sem sujeição ao poder diretivo, disciplinar ou fiscalizatório da Morina.</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <h3 className="mb-2 font-bold text-white">Sem Habitualidade Obrigatória</h3>
                            <p className="text-sm text-white/60">Não há exigência de cumprimento de jornada de trabalho, controle de ponto ou frequência mínima obrigatória, cabendo ao Parceiro definir sua própria agenda.</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <h3 className="mb-2 font-bold text-white">Sem Pessoalidade</h3>
                            <p className="text-sm text-white/60">O Parceiro poderá fazer-se substituir por prepostos ou empregados seus, devidamente registrados, para a execução das atividades, sem necessidade de atuação pessoal exclusiva.</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <h3 className="mb-2 font-bold text-white">Onerosidade Comercial</h3>
                            <p className="text-sm text-white/60">A remuneração é variável e condicionada ao êxito das vendas (comissões), típica de contratos de resultado e não de salário por tempo à disposição.</p>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">3. Responsabilidades Tributárias e Previdenciárias</h2>
                    <p className="leading-relaxed text-white/80">
                        O Parceiro Comercial declara-se ciente de que é o único responsável pelo recolhimento de todos os tributos, taxas e contribuições incidentes sobre suas atividades e receitas, incluindo, mas não se limitando a:
                    </p>
                    <ul className="list-disc space-y-2 pl-6 text-white/70">
                        <li>Imposto de Renda (IRPJ/IRPF);</li>
                        <li>Contribuição Social sobre o Lucro Líquido (CSLL);</li>
                        <li>PIS/COFINS e ISSQN;</li>
                        <li>Contribuições Previdenciárias (INSS) próprias e de seus colaboradores.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">4. Declaração de Ciência</h2>
                    <p className="leading-relaxed text-white/80">
                        Ao aceitar os termos de uso da plataforma e iniciar suas atividades, o Parceiro declara ter lido, compreendido e concordado com todas as cláusulas deste termo, reconhecendo a inexistência de qualquer vínculo trabalhista com a Morina e renunciando a qualquer reclamação futura neste sentido.
                    </p>
                </section>
            </div>
        </>
    );
}
