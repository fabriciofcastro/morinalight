"use client";

import { DataStream } from "@/components/legal/data-stream";

export default function LeiRepresentantePage() {
    return (
        <>
            <DataStream />
            <div className="relative z-10 space-y-8">
                <div className="border-b border-white/10 pb-6">
                    <h1 className="text-4xl font-bold tracking-tight text-white">Lei do Representante Comercial</h1>
                    <p className="mt-2 text-lg text-white/60">Regulamentação das atividades de Representação Comercial Autônoma (Lei nº 4.886/65)</p>
                    <p className="mt-4 text-sm text-white/40">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
                </div>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">1. Disposições Gerais</h2>
                    <p className="leading-relaxed text-white/80">
                        A atividade de representação comercial autônoma na plataforma Morina é regida estritamente pela Lei nº 4.886, de 9 de dezembro de 1965, com as alterações introduzidas pela Lei nº 8.420/92. Esta legislação define os direitos e deveres das partes, garantindo transparência e segurança jurídica na relação comercial.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">2. Da Autonomia (Art. 1º)</h2>
                    <p className="leading-relaxed text-white/80">
                        Conforme estabelecido no Art. 1º da Lei, o Representante Comercial atua como pessoa jurídica ou física, sem relação de emprego, desempenhando a mediação para a realização de negócios mercantis, agenciando propostas ou pedidos, para transmiti-los aos representados, praticando ou não atos relacionados com a execução dos negócios.
                    </p>
                    <ul className="list-disc space-y-2 pl-6 text-white/70">
                        <li>Ausência de subordinação hierárquica.</li>
                        <li>Liberdade para organização de horários e roteiros.</li>
                        <li>Assunção dos riscos da própria atividade empresarial.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">3. Do Contrato de Representação (Art. 27)</h2>
                    <p className="leading-relaxed text-white/80">
                        O contrato de representação comercial, escrito ou verbal, deve conter obrigatoriamente os elementos previstos no Art. 27 da Lei, incluindo:
                    </p>
                    <ul className="list-disc space-y-2 pl-6 text-white/70">
                        <li>Condições e requisitos gerais da representação.</li>
                        <li>Indicação genérica ou específica dos produtos ou artigos objeto da representação.</li>
                        <li>Prazo certo ou indeterminado da representação.</li>
                        <li>Indicação da zona ou zonas em que será exercida a representação.</li>
                        <li>Garantia ou não, parcial ou total, ou por certo prazo, da exclusividade de zona ou setor de zona.</li>
                        <li>Retribuição e época do pagamento, pelo exercício da representação.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">4. Das Comissões (Art. 32)</h2>
                    <p className="leading-relaxed text-white/80">
                        O representante comercial adquire o direito às comissões quando do pagamento dos pedidos ou propostas. O pagamento das comissões deverá ser efetuado até o dia 15 do mês subsequente ao da liquidação da fatura, acompanhado da respectiva conta.
                    </p>
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                        <p className="text-sm text-white/60">
                            <strong>Nota:</strong> É vedada no contrato de representação comercial a inclusão de cláusulas del credere (Art. 43).
                        </p>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">5. Da Rescisão e Indenização (Art. 27, j)</h2>
                    <p className="leading-relaxed text-white/80">
                        Nos contratos por prazo indeterminado, a rescisão sem motivo justo por parte do representado obriga ao pagamento de indenização não inferior a 1/12 (um doze avos) do total da retribuição auferida durante o tempo em que exerceu a representação.
                    </p>
                </section>
            </div>
        </>
    );
}
