/**
 * LGPD Certification Page
 * Explaining in simple terms for non-technical users
 */

'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Download, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { MermaidDiagram } from '@/components/ui/mermaid-diagram';
import { AnimatedBackground } from '../components/AnimatedBackground';

export default function LGPDPage() {
    return (
        <main className="min-h-screen relative text-white overflow-hidden">
            <div className="fixed inset-0 z-0">
                <AnimatedBackground />
                <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]" />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-16 max-w-4xl">
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
                        <div className="p-4 rounded-2xl bg-green-500/20">
                            <Shield className="w-12 h-12 text-green-400" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-bold mb-2">LGPD</h1>
                            <p className="text-xl text-gray-400">Lei Geral de Proteção de Dados</p>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="text-green-400 font-medium">100% Compliant</span>
                    </div>
                </motion.div>

                {/* O que é? (Analogia simples) */}
                <Section icon={<Eye className="w-6 h-6" />} title="O que é a LGPD?">
                    <p className="text-gray-300 leading-relaxed mb-4">
                        Imagine que seus dados pessoais são como as chaves da sua casa. A LGPD é como um <strong>conjunto de regras</strong> que garante que:
                    </p>
                    <ul className="space-y-3">
                        <Benefit>Ninguém pode pegar suas chaves sem sua permissão</Benefit>
                        <Benefit>Você pode ver quem tem cópias das suas chaves</Benefit>
                        <Benefit>Você pode pedir suas chaves de volta a qualquer momento</Benefit>
                        <Benefit>As empresas precisam guardar suas chaves em um cofre seguro</Benefit>
                    </ul>

                    <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <p className="text-blue-300 text-sm">
                            💡 <strong>Em outras palavras:</strong> A LGPD protege suas informações pessoais (nome, CPF, email, telefone) e garante que você tenha controle sobre elas.
                        </p>
                    </div>

                </Section>

                {/* Como Funciona? */}
                <Section icon={<Shield className="w-6 h-6" />} title="Proteção de Dados via ABAC">
                    <p className="text-gray-300 leading-relaxed mb-6">
                        Utilizamos <strong>Controle de Acesso Baseado em Atributos (ABAC)</strong>. Isso significa que o acesso aos seus dados
                        não é fixo, mas decidido em tempo real com base no contexto (quem está acessando, de onde, quando e por que).
                    </p>
                    <MermaidDiagram
                        title="Decisão de Acesso Inteligente (CASL + ABAC)"
                        chart={`
graph TD
    A[Requisição de Dados] --> B{Motor de Políticas}
    B --> C[Verificar Atributos do Usuário]
    B --> D[Verificar Contexto Temporal]
    B --> E[Verificar Propriedade do Dado]
    C --> F{Acesso Permitido?}
    D --> F
    E --> F
    F -->|Sim| G[Dados Descriptografados]
    F -->|Não| H[Acesso Negado + Log de Auditoria]
    
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
                            title="Sua Privacidade"
                            description="Suas informações não serão vendidas ou compartilhadas sem sua autorização"
                            icon="🔒"
                        />
                        <ImportanceCard
                            title="Seu Controle"
                            description="Você decide o que fazemos com seus dados e pode mudar de ideia quando quiser"
                            icon="🎮"
                        />
                        <ImportanceCard
                            title="Sua Segurança"
                            description="Seus dados ficam protegidos como dinheiro em um banco"
                            icon="🛡️"
                        />
                        <ImportanceCard
                            title="Seus Direitos"
                            description="Você pode ver, corrigir ou apagar suas informações a qualquer momento"
                            icon="⚖️"
                        />
                    </div>

                    <MermaidDiagram
                        title="Processo de Direito ao Esquecimento"
                        chart={`
sequenceDiagram
    participant U as Usuário
    participant S as Sistema
    participant DB as Banco de Dados
    participant A as Audit Log
    
    U->>S: Solicita exclusão de dados
    S->>A: Registra solicitação
    S->>DB: Anonimiza dados pessoais
    DB-->>S: Confirma anonimização
    S->>A: Registra conclusão
    S-->>U: Confirma exclusão
    
    Note over DB: Dados mantidos para<br/>compliance fiscal (7 anos)
`}
                    />
                </Section>

                {/* O que implementamos */}
                <Section icon={<CheckCircle2 className="w-6 h-6" />} title="O que fizemos para proteger você?">
                    <div className="space-y-6">
                        <ImplementationCard
                            icon={<Lock className="w-6 h-6 text-green-400" />}
                            title="Blindagem via CASL"
                            description="Toda ação no sistema é validada por um guarda de segurança digital"
                            analogy="Como ter um segurança pessoal que confere sua identidade em cada porta que você tenta abrir"
                            status="100%"
                        />

                        <ImplementationCard
                            icon={<Shield className="w-6 h-6 text-green-400" />}
                            title="Políticas Dinâmicas (PBAC)"
                            description="Regras de acesso inteligentes que mudam conforme a necessidade"
                            analogy="O cofre só abre se for dia de semana e se você for o gerente responsável"
                            status="100%"
                        />

                        <ImplementationCard
                            icon={<Eye className="w-6 h-6 text-green-400" />}
                            title="Transparência (Audit Trail)"
                            description="Registramos cada acesso aos seus dados sensíveis"
                            analogy="Como um livro de visitas onde todos que olham seus dados precisam assinar"
                            status="100%"
                        />

                        <ImplementationCard
                            icon={<Trash2 className="w-6 h-6 text-green-400" />}
                            title="Direito ao Esquecimento"
                            description="Você pode pedir para apagarmos seus dados a qualquer momento"
                            analogy="Como apertar um botão que remove sua existência dos nossos arquivos"
                            status="100%"
                        />
                    </div>
                </Section>

                {/* Seus direitos */}
                <Section icon={<Shield className="w-6 h-6" />} title="Seus Direitos Garantidos">
                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6">
                        <h3 className="text-xl font-semibold mb-4 text-green-400">Você pode:</h3>
                        <div className="grid md:grid-cols-2 gap-3">
                            <Right>✅ Ver todos os seus dados que temos</Right>
                            <Right>✅ Corrigir informações erradas</Right>
                            <Right>✅ Baixar seus dados</Right>
                            <Right>✅ Apagar sua conta e dados</Right>
                            <Right>✅ Saber com quem compartilhamos</Right>
                            <Right>✅ Retirar seu consentimento</Right>
                        </div>

                        <div className="mt-6 pt-6 border-t border-green-500/20">
                            <p className="text-sm text-gray-400">
                                <strong>Como exercer seus direitos:</strong> Entre em contato conosco pelo email{' '}
                                <a href="mailto:privacidade@morinalight.com" className="text-green-400 hover:underline">
                                    privacidade@morinalight.com
                                </a>
                                {' '}e responderemos em até 24 horas.
                            </p>
                        </div>
                    </div>
                </Section>

                {/* Penalidades evitadas */}
                <Section icon={<AlertCircle className="w-6 h-6" />} title="O que evitamos com isso?">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                        <p className="text-gray-300 mb-4">
                            Empresas que não respeitam a LGPD podem receber:
                        </p>
                        <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="text-red-400 mt-1">⚠️</span>
                                <span className="text-gray-300">Multas de até <strong className="text-red-400">R$ 50 milhões</strong></span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-400 mt-1">⚠️</span>
                                <span className="text-gray-300">Bloqueio do sistema</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-400 mt-1">⚠️</span>
                                <span className="text-gray-300">Perda de confiança dos clientes</span>
                            </li>
                        </ul>

                        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                            <p className="text-green-300 text-sm">
                                ✅ <strong>Boa notícia:</strong> Estamos 100% em conformidade, então você está totalmente protegido!
                            </p>
                        </div>
                    </div>
                </Section>

                {/* CTA */}
                <div className="mt-12 text-center">
                    <Link
                        href="/certifications"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-medium transition-all duration-300 hover:scale-105"
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
                <div className="p-2 rounded-lg bg-white/5">
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
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-gray-300">{children}</span>
        </li>
    );
}

function ImportanceCard({ title, description, icon }: { title: string; description: string; icon: string }) {
    return (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
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
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/20">
                        {icon}
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">{title}</h3>
                        <p className="text-sm text-gray-400">{description}</p>
                    </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
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
