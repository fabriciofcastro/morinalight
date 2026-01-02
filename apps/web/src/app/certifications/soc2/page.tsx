/**
 * SOC 2 Type II Certification Page
 * Explaining in simple terms for non-technical users
 */

'use client';

import { motion } from 'framer-motion';
import { Server, Lock, Eye, Shield, CheckCircle2, AlertCircle, Clock, Database } from 'lucide-react';
import Link from 'next/link';
import { MermaidDiagram } from '@/components/ui/mermaid-diagram';

export default function SOC2Page() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                {/* Header */}
                <Link href="/certifications" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
                    ← Voltar para Certificações
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-4 bg-amber-500/20">
                            <Server className="w-12 h-12 text-amber-400" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-bold mb-2">SOC 2 Type II</h1>
                            <p className="text-xl text-gray-400">System and Organization Controls</p>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="text-green-400 font-medium">100% Preparado - Em Auditoria Coerente</span>
                    </div>
                </motion.div>

                {/* O que é? (Analogia simples) */}
                <Section icon={<Eye className="w-6 h-6" />} title="O que é o SOC 2 Type II?">
                    <p className="text-gray-300 leading-relaxed mb-4">
                        Imagine que o SOC 2 é como uma <strong>inspetoria independente</strong> que vem à sua casa todos os dias durante 6 meses para verificar se você:
                    </p>
                    <ul className="space-y-3">
                        <Benefit>Mantém tudo sempre limpo e organizado (não só quando sabe que vão inspecionar)</Benefit>
                        <Benefit>Segue as mesmas regras todos os dias, sem exceção</Benefit>
                        <Benefit>Tem sistemas que funcionam 24/7 sem falhar</Benefit>
                        <Benefit>Protege os dados dos visitantes o tempo todo</Benefit>
                    </ul>

                    <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20">
                        <p className="text-blue-300 text-sm">
                            💡 <strong>Em outras palavras:</strong> SOC 2 Type I = "mostramos que temos bons processos". SOC 2 Type II = "provamos que seguimos esses processos TODO DIA durante meses". É muito mais rigoroso!
                        </p>
                    </div>

                </Section>

                {/* Como Funciona? */}
                <Section icon={<Shield className="w-6 h-6" />} title="Como Funciona o Controle de Confiança?">
                    <p className="text-gray-300 leading-relaxed mb-6">
                        O SOC 2 baseia-se em 5 Pilares de Confiança (Trust Service Criteria) que devem ser monitorados
                        e comprovados diariamente.
                    </p>
                    <MermaidDiagram
                        title="Os 5 Trust Service Criteria"
                        chart={`
mindmap
  root((SOC 2<br/>Type II))
    Security
      Firewall
      IDS/IPS
      22/25 Controls
    Availability
      Uptime 99.9%
      Redundancy
      4/5 Controls
    Confidentiality
      Encryption
      Access Control
      3/3 Controls
    Processing Integrity
      Data Validation
      Error Handling
      100%
    Privacy
      LGPD Compliance
      Data Protection
      100%
`}
                    />
                </Section>

                {/* Por que é importante? */}
                <Section icon={<AlertCircle className="w-6 h-6" />} title="Por que isso é importante para você?">
                    <div className="grid md:grid-cols-2 gap-4">
                        <ImportanceCard
                            title="Auditoria Independente"
                            description="Uma empresa externa verifica TUDO - não somos nós dizendo que somos bons"
                            icon="🔍"
                        />
                        <ImportanceCard
                            title="Confiança B2B"
                            description="Empresas que usam nosso sistema podem confiar plenamente na segurança"
                            icon="🤝"
                        />
                        <ImportanceCard
                            title="Disponibilidade 24/7"
                            description="Garantimos que o sistema está sempre no ar quando você precisa"
                            icon="⏰"
                        />
                        <ImportanceCard
                            title="Proteção Contínua"
                            description="Seus dados estão protegidos todos os dias, não só às vezes"
                            icon="🛡️"
                        />
                    </div>
                </Section>

                {/* Os 5 Trust Service Criteria */}
                <Section icon={<Shield className="w-6 h-6" />} title="Os 5 Pilares que Seguimos">
                    <p className="text-gray-300 mb-6">
                        O SOC 2 avalia 5 critérios de confiança. Pense neles como 5 promessas que fazemos a você:
                    </p>

                    <div className="space-y-6">
                        <ImplementationCard
                            icon={<Lock className="w-6 h-6 text-amber-400" />}
                            title="1. Segurança (Security)"
                            description="MFA Obrigatório + Proteção Isomórfica CASL"
                            analogy="Como ter guardas controlando cada corredor e cada cofre do banco simultaneamente"
                            status="100%"
                        />

                        <ImplementationCard
                            icon={<Clock className="w-6 h-6 text-amber-400" />}
                            title="2. Disponibilidade (Availability)"
                            description="O sistema está sempre disponível quando você precisa"
                            analogy="Como uma loja que nunca fecha"
                            status="4/5 ✅"
                        />

                        <ImplementationCard
                            icon={<Eye className="w-6 h-6 text-amber-400" />}
                            title="3. Confidencialidade (Confidentiality)"
                            description="Acesso estrito e dinâmico via ACL + ABAC"
                            analogy="Como um advogado que só abre arquivos específicos se o contexto de segurança for 100% válido"
                            status="100%"
                        />

                        <ImplementationCard
                            icon={<CheckCircle2 className="w-6 h-6 text-amber-400" />}
                            title="4. Integridade de Processamento (Processing Integrity)"
                            description="Os dados são processados corretamente, sem erros"
                            analogy="Como uma calculadora que sempre dá o resultado certo"
                            status="100%"
                        />

                        <ImplementationCard
                            icon={<Shield className="w-6 h-6 text-amber-400" />}
                            title="5. Privacidade (Privacy)"
                            description="Coletamos e usamos dados apenas como prometido"
                            analogy="Como respeitar o combinado sobre o que você pode contar de uma conversa privada"
                            status="100%"
                        />
                    </div>
                </Section>

                {/* Benefícios */}
                <Section icon={<Database className="w-6 h-6" />} title="O que você ganha com isso?">
                    <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-6">
                        <h3 className="text-xl font-semibold mb-4 text-amber-400">Com SOC 2 Type II você tem garantia de:</h3>
                        <div className="grid md:grid-cols-2 gap-3">
                            <Right>✅ Sistema sempre disponível (uptime 99.9%)</Right>
                            <Right>✅ Dados processados sem erros</Right>
                            <Right>✅ Privacidade respeitada diariamente</Right>
                            <Right>✅ Segurança auditada constantemente</Right>
                            <Right>✅ Backups automáticos e testados</Right>
                            <Right>✅ Resposta rápida a incidentes</Right>
                        </div>

                        <div className="mt-6 pt-6 border-t border-amber-500/20">
                            <p className="text-sm text-gray-400">
                                <strong>Diferencial:</strong> Enquanto outras empresas apenas DIZEM que são seguras, nós PROVAMOS com auditoria independente de 6 meses.
                            </p>
                        </div>
                    </div>
                </Section>

                {/* Processo de Auditoria */}
                <Section icon={<AlertCircle className="w-6 h-6" />} title="Como funciona a auditoria?">
                    <div className="bg-blue-500/10 border border-blue-500/20 p-6">
                        <p className="text-gray-300 mb-4">
                            A auditoria SOC 2 Type II dura <strong>6-12 meses</strong> e funciona assim:
                        </p>
                        <ol className="space-y-3 text-gray-300">
                            <li className="flex gap-3">
                                <span className="text-green-400 shrink-0">✅</span>
                                <span><strong>Implementação dos controles</strong> - Instalamos todos os sistemas de segurança</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-green-400 shrink-0">✅</span>
                                <span><strong>Documentação completa</strong> - Registramos tudo que fazemos</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-yellow-400 shrink-0">🔄</span>
                                <span><strong>Período de observação (6 meses)</strong> - Auditores verificam se seguimos os processos TODO DIA</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-gray-500 shrink-0">📅</span>
                                <span><strong>Auditoria final</strong> - Auditores revisam tudo e emitem relatório</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-gray-500 shrink-0">🎯</span>
                                <span><strong>Certificação</strong> - Recebemos o relatório SOC 2 Type II oficial</span>
                            </li>
                        </ol>

                        <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20">
                            <p className="text-amber-300 text-sm">
                                ⏰ <strong>Status atual:</strong> Estamos no mês 4 do período de observação. Os auditores estão verificando nossos controles diariamente.
                            </p>
                        </div>
                    </div>
                </Section>

                {/* CTA */}
                <div className="mt-12 text-center">
                    <Link
                        href="/certifications"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white font-medium transition-all duration-300 hover:scale-105"
                    >
                        Ver Outras Certificações
                    </Link>
                </div>
            </div>
        </main>
    );
}

// Helper Components
function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/5">
                    {icon}
                </div>
                <h2 className="text-3xl font-bold">{title}</h2>
            </div>
            {children}
        </motion.section>
    );
}

function Benefit({ children }: { children: React.ReactNode }) {
    return (
        <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <span className="text-gray-300">{children}</span>
        </li>
    );
}

function ImportanceCard({ title, description, icon }: { title: string; description: string; icon: string }) {
    return (
        <div className="p-4 bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
            <div className="text-3xl mb-2">{icon}</div>
            <h3 className="font-semibold mb-1">{title}</h3>
            <p className="text-sm text-gray-400">{description}</p>
        </div>
    );
}

function ImplementationCard({
    icon,
    title,
    description,
    analogy,
    status
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    analogy: string;
    status: string;
}) {
    return (
        <div className="p-6 bg-white/5 border border-white/10">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20">
                        {icon}
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">{title}</h3>
                        <p className="text-sm text-gray-400">{description}</p>
                    </div>
                </div>
                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-sm font-medium whitespace-nowrap">
                    {status}
                </span>
            </div>
            <div className="pl-14">
                <p className="text-sm text-gray-500 italic">
                    💭 {analogy}
                </p>
            </div>
        </div>
    );
}

function Right({ children }: { children: React.ReactNode }) {
    return (
        <div className="text-sm text-gray-300">
            {children}
        </div>
    );
}
