"use client";

import { MatrixRain } from "@/components/legal/matrix-rain";

export default function LGPDPage() {
    return (
        <>
            <MatrixRain />
            <div className="relative z-10 space-y-8">
                <div className="border-b border-white/10 pb-6">
                    <h1 className="text-4xl font-bold tracking-tight text-white">Lei Geral de Proteção de Dados</h1>
                    <p className="mt-2 text-lg text-white/60">Regulamentação LGPD (Lei nº 13.709/2018)</p>
                    <p className="mt-4 text-sm text-white/40">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
                </div>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">1. Introdução</h2>
                    <p className="leading-relaxed text-white/80">
                        A Morina está comprometida com a proteção dos seus dados pessoais e com o cumprimento da Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Esta política descreve como coletamos, usamos, armazenamos e protegemos suas informações.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">2. Coleta de Dados</h2>
                    <p className="leading-relaxed text-white/80">
                        Coletamos apenas os dados estritamente necessários para a prestação dos nossos serviços, incluindo:
                    </p>
                    <ul className="list-disc space-y-2 pl-6 text-white/70">
                        <li>Dados de identificação (Nome, CPF, RG)</li>
                        <li>Dados de contato (E-mail, Telefone)</li>
                        <li>Dados profissionais (Cargo, Departamento)</li>
                        <li>Dados de acesso (IP, navegador, dispositivo)</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">3. Finalidade do Tratamento</h2>
                    <p className="leading-relaxed text-white/80">
                        Seus dados são utilizados para:
                    </p>
                    <ul className="list-disc space-y-2 pl-6 text-white/70">
                        <li>Gestão de acesso ao sistema e autenticação</li>
                        <li>Processamento de comissões e pagamentos</li>
                        <li>Auditoria e segurança da informação</li>
                        <li>Cumprimento de obrigações legais e regulatórias</li>
                        <li>Melhoria contínua dos nossos serviços</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">4. Seus Direitos</h2>
                    <p className="leading-relaxed text-white/80">
                        De acordo com a LGPD, você tem direito a:
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <h3 className="mb-2 font-bold text-white">Confirmação e Acesso</h3>
                            <p className="text-sm text-white/60">Confirmar a existência de tratamento e acessar seus dados pessoais.</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <h3 className="mb-2 font-bold text-white">Correção</h3>
                            <p className="text-sm text-white/60">Corrigir dados incompletos, inexatos ou desatualizados.</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <h3 className="mb-2 font-bold text-white">Anonimização ou Eliminação</h3>
                            <p className="text-sm text-white/60">Solicitar a anonimização ou eliminação de dados desnecessários ou excessivos.</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <h3 className="mb-2 font-bold text-white">Portabilidade</h3>
                            <p className="text-sm text-white/60">Solicitar a portabilidade dos dados a outro fornecedor de serviço.</p>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">5. Segurança</h2>
                    <p className="leading-relaxed text-white/80">
                        Implementamos medidas técnicas e organizacionais robustas para proteger seus dados:
                    </p>
                    <ul className="list-disc space-y-2 pl-6 text-white/70">
                        <li>Criptografia de dados em trânsito e em repouso</li>
                        <li>Controle de acesso baseado em funções (RBAC)</li>
                        <li>Monitoramento contínuo de segurança</li>
                        <li>Backups regulares e plano de recuperação de desastres</li>
                        <li>Treinamento regular da equipe em segurança da informação</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[hsl(var(--primary))]">6. Contato</h2>
                    <p className="leading-relaxed text-white/80">
                        Para exercer seus direitos ou tirar dúvidas sobre o tratamento de dados pessoais, entre em contato com nosso Encarregado de Dados (DPO):
                    </p>
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                        <p className="text-sm text-white/70">
                            <strong>Email:</strong> dpo@morina.com.br<br />
                            <strong>Telefone:</strong> (11) 0000-0000<br />
                            <strong>Horário:</strong> Segunda a Sexta, 9h às 18h
                        </p>
                    </div>
                </section>
            </div>
        </>
    );
}
