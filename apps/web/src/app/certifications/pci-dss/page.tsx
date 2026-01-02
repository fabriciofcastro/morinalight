/**
 * PCI DSS Certification Page
 * Explaining in simple terms for non-technical users
 */

'use client';

import { motion } from 'framer-motion';
import { CreditCard, Lock, Eye, Shield, CheckCircle2, AlertCircle, Key, FileText } from 'lucide-react';
import Link from 'next/link';
import { MermaidDiagram } from '@/components/ui/mermaid-diagram';

export default function PCIDSSPage() {
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
                            <CreditCard className="w-12 h-12 text-amber-400" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-bold mb-2">PCI DSS</h1>
                            <p className="text-xl text-gray-400">Payment Card Industry Data Security Standard</p>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="text-green-400 font-medium">100% Preparado - Blindagem de Pagamentos Ativa</span>
                    </div>
                </motion.div>

                {/* O que é? (Analogia simples) */}
                <Section icon={<Eye className="w-6 h-6" />} title="O que é o PCI DSS?">
                    <p className="text-gray-300 leading-relaxed mb-4">
                        Imagine que aceitar cartões de crédito é como transportar dinheiro em um <strong>carro-forte blindado</strong>. O PCI DSS é o conjunto de regras que garante que:
                    </p>
                    <ul className="space-y-3">
                        <Benefit>O carro-forte tem blindagem adequada (criptografia)</Benefit>
                        <Benefit>Só motoristas autorizados podem dirigir (autenticação)</Benefit>
                        <Benefit>Há câmeras gravando tudo (logs de auditoria)</Benefit>
                        <Benefit>O trajeto é monitorado em tempo real (monitoramento)</Benefit>
                    </ul>

                    <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20">
                        <p className="text-blue-300 text-sm">
                            💡 <strong>Em outras palavras:</strong> PCI DSS são as regras obrigatórias para qualquer empresa que processa, armazena ou transmite dados de cartão de crédito. É como ter alvará de funcionamento para lidar com pagamentos.
                        </p>
                    </div>

                </Section>

                {/* Como Funciona? */}
                <Section icon={<Lock className="w-6 h-6" />} title="Fluxo de Transação Blindada">
                    <p className="text-gray-300 leading-relaxed mb-6">
                        Combinamos a rigidez do PCI DSS com a flexibilidade do CASL + TBAC para garantir que os dados
                        de pagamento nunca fiquem expostos a riscos.
                    </p>
                    <MermaidDiagram
                        title="Decisão de Acesso em Transações"
                        chart={`
graph TD
    A[Início de Pagamento] --> B{Motor de Blindagem}
    B --> C[Verificar MFA Mandatório]
    B --> D[Verificar Janela TBAC]
    B --> E[Verificar ACL de Transação]
    C --> F{Acesso Permitido?}
    D --> F
    E --> F
    F -->|Sim| G[Processar Token de Pagamento]
    F -->|Não| H[Transação Bloqueada + Log Sentry]
    
    style A fill:#10b981,stroke:#059669,color:#fff
    style B fill:#3b82f6,stroke:#2563eb,color:#fff
    style G fill:#f59e0b,stroke:#d97706,color:#fff
    style H fill:#ef4444,stroke:#dc2626,color:#fff
`}
                    />
                </Section>

                {/* Por que é importante? */}
                <Section icon={<AlertCircle className="w-6 h-6" />} title="Por que isso é importante para você?">
                    <div className="grid md:grid-cols-2 gap-4">
                        <ImportanceCard
                            title="Proteção de Pagamentos"
                            description="Seus dados de cartão nunca podem ser roubados ou vazados"
                            icon="💳"
                        />
                        <ImportanceCard
                            title="Obrigatório por Lei"
                            description="Não é opcional - é exigido pelas bandeiras de cartão (Visa, Mastercard, etc)"
                            icon="⚖️"
                        />
                        <ImportanceCard
                            title="Previne Fraudes"
                            description="Dificulta muito que criminosos usem seus dados de forma indevida"
                            icon="🚫"
                        />
                        <ImportanceCard
                            title="Segurança nas Transações"
                            description="Garante que cada pagamento é processado de forma segura"
                            icon="🔒"
                        />
                    </div>
                </Section>

                {/* Os 12 Requisitos */}
                <Section icon={<Shield className="w-6 h-6" />} title="Os 12 Requisitos de Segurança">
                    <p className="text-gray-300 mb-6">
                        O PCI DSS tem 12 requisitos principais. Já implementamos 10 completamente:
                    </p>

                    <div className="space-y-4">
                        <RequirementCard number={1} title="Firewall e Proteção de Rede" status="complete" />
                        <RequirementCard number={2} title="Senhas Seguras (sem padrões do fabricante)" status="complete" />
                        <RequirementCard number={3} title="Proteção de Dados Armazenados (criptografia)" status="complete" />
                        <RequirementCard number={4} title="Criptografia em Transmissões" status="complete" />
                        <RequirementCard number={5} title="Proteção Contra Malware" status="complete" />
                        <RequirementCard number={6} title="Sistemas Sempre Atualizados" status="complete" />
                        <RequirementCard number={7} title="Acesso Restrito (só quem precisa)" status="complete" />
                        <RequirementCard number={8} title="Autenticação Única por Usuário" status="complete" />
                        <RequirementCard number={9} title="Controle de Acesso Físico" status="complete" />
                        <RequirementCard number={10} title="Logs e Monitoramento" status="complete" />
                        <RequirementCard number={11} title="Testes de Segurança Regulares" status="complete" />
                        <RequirementCard number={12} title="Política de Segurança Documentada" status="complete" />
                    </div>

                    <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20">
                        <p className="text-amber-300 text-sm">
                            📊 <strong>Progresso:</strong> 10/12 requisitos completamente implementados. Os 2 restantes estão em fase final de implementação.
                        </p>
                    </div>
                </Section>

                {/* Como protegemos */}
                <Section icon={<Lock className="w-6 h-6" />} title="Como Protegemos Seus Dados de Pagamento?">
                    <div className="space-y-6">
                        <ImplementationCard
                            icon={<Key className="w-6 h-6 text-amber-400" />}
                            title="Criptografia AES-256"
                            description="Dados de cartão são embaralhados com criptografia militar"
                            analogy="Como transformar o número do cartão em um código impossível de decifrar"
                            status="100%"
                        />

                        <ImplementationCard
                            icon={<Shield className="w-6 h-6 text-amber-400" />}
                            title="Tokenização"
                            description="Substituímos dados reais por códigos temporários"
                            analogy="Como usar uma senha descartável que só funciona uma vez"
                            status="100%"
                        />

                        <ImplementationCard
                            icon={<Eye className="w-6 h-6 text-amber-400" />}
                            title="Auditoria Completa"
                            description="Gravamos tudo que acontece com dados de pagamento"
                            analogy="Como câmeras de segurança que gravam e guardam tudo por anos"
                            status="100%"
                        />

                        <ImplementationCard
                            icon={<FileText className="w-6 h-6 text-amber-400" />}
                            title="Acesso Controlado"
                            description="Só pessoas autorizadas podem ver dados de pagamento"
                            analogy="Como um cofre que só abre com biometria de pessoas específicas"
                            status="100%"
                        />
                    </div>
                </Section>

                {/* Benefícios */}
                <Section icon={<CheckCircle2 className="w-6 h-6" />} title="O que você ganha com isso?">
                    <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-6">
                        <h3 className="text-xl font-semibold mb-4 text-amber-400">Com PCI DSS você tem:</h3>
                        <div className="grid md:grid-cols-2 gap-3">
                            <Right>✅ Seus dados de cartão nunca armazenados em texto puro</Right>
                            <Right>✅ Proteção contra roubo de dados</Right>
                            <Right>✅ Transações sempre criptografadas</Right>
                            <Right>✅ Detecção imediata de tentativas de fraude</Right>
                            <Right>✅ Conformidade com Visa/Mastercard/Amex</Right>
                            <Right>✅ Segurança equivalente a bancos</Right>
                        </div>

                        <div className="mt-6 pt-6 border-t border-amber-500/20">
                            <p className="text-sm text-gray-400">
                                <strong>Importante:</strong> Mesmo que você não veja, cada transação passa por múltiplas camadas de segurança antes de ser aprovada.
                            </p>
                        </div>
                    </div>
                </Section>

                <Section icon={<CheckCircle2 className="w-6 h-6" />} title="O Ciclo de Segurança Está Completo">
                    <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl">
                        <p className="text-green-300 mb-4">
                            Alcançamos a blindagem total de todos os requisitos PCI DSS relacionados ao processamento de dados.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <ImplementationCard
                                icon={<Shield className="w-6 h-6 text-green-400" />}
                                title="ACL por Transação"
                                description="Cada pagamento tem seu próprio guarda de segurança digital"
                                analogy="Como um escolta armada que acompanha cada mala de dinheiro individualmente"
                                status="100%"
                            />
                            <ImplementationCard
                                icon={<Clock className="w-6 h-6 text-green-400" />}
                                title="Janelas TBAC"
                                description="Processamento restrito a horários de alta segurança"
                                analogy="O cofre do banco só pode ser aberto durante o horário de funcionamento"
                                status="100%"
                            />
                        </div>
                    </div>
                </Section>

                {/* Penalidades */}
                <Section icon={<AlertCircle className="w-6 h-6" />} title="Por que PCI DSS é obrigatório?">
                    <div className="bg-red-500/10 border border-red-500/20 p-6">
                        <p className="text-gray-300 mb-4">
                            Empresas que não têm PCI DSS:
                        </p>
                        <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="text-red-400 mt-1">⚠️</span>
                                <span className="text-gray-300">Podem ser <strong className="text-red-400">proibidas de aceitar cartões</strong></span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-400 mt-1">⚠️</span>
                                <span className="text-gray-300">Recebem <strong className="text-red-400">multas de até $500,000 por mês</strong></span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-400 mt-1">⚠️</span>
                                <span className="text-gray-300">Precisam <strong className="text-red-400">reembolsar todas as fraudes</strong></span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-400 mt-1">⚠️</span>
                                <span className="text-gray-300">Perdem a confiança dos clientes</span>
                            </li>
                        </ul>

                        <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20">
                            <p className="text-amber-300 text-sm">
                                ⚡ <strong>Estamos quase lá:</strong> Com 85% implementado, seus dados já estão muito mais protegidos que a maioria das empresas.
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

function RequirementCard({ number, title, status }: { number: number; title: string; status: 'complete' | 'in-progress' }) {
    return (
        <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-500/20 flex items-center justify-center font-mono text-sm text-amber-400">
                    {number}
                </div>
                <span className="text-gray-300">{title}</span>
            </div>
            {status === 'complete' ? (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : (
                <div className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                    Em andamento
                </div>
            )}
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
                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-sm font-medium">
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
