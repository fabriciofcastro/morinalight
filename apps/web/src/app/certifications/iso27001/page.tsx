/**
 * ISO 27001 Certification Page
 * Explaining in simple terms for non-technical users
 */

'use client';

import { motion } from 'framer-motion';
import { FileCheck, Lock, Eye, Shield, CheckCircle2, AlertCircle, FileText, Users } from 'lucide-react';
import Link from 'next/link';
import { MermaidDiagram } from '@/components/ui/mermaid-diagram';
import { AnimatedBackground } from '../components/AnimatedBackground';

export default function ISO27001Page() {
    return (
        <main className="min-h-screen relative text-white overflow-hidden">
            {/* Animated Background */}
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
                        <div className="p-4 bg-amber-500/20">
                            <FileCheck className="w-12 h-12 text-amber-400" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-bold mb-2">ISO 27001</h1>
                            <p className="text-xl text-gray-400">Information Security Management System</p>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="text-green-400 font-medium">100% Preparado - Pronto para Auditoria</span>
                    </div>
                </motion.div>

                {/* O que é? (Analogia simples) */}
                <Section icon={<Eye className="w-6 h-6" />} title="O que é a ISO 27001?">
                    <p className="text-gray-300 leading-relaxed mb-4">
                        Imagine que sua empresa é como um <strong>banco super seguro</strong>. A ISO 27001 é como um <strong>certificado de qualidade</strong> que prova que:
                    </p>
                    <ul className="space-y-3">
                        <Benefit>Seguimos as melhores práticas mundiais de segurança</Benefit>
                        <Benefit>Temos processos documentados para proteger informações</Benefit>
                        <Benefit>Fazemos auditorias regulares de segurança</Benefit>
                        <Benefit>Temos planos de contingência para emergências</Benefit>
                    </ul>

                    <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20">
                        <p className="text-blue-300 text-sm">
                            💡 <strong>Em outras palavras:</strong> É como ter um selo de "restaurante aprovado pela vigilância sanitária", mas para segurança da informação. Mostra que não improvisamos - seguimos padrões internacionais.
                        </p>
                    </div>

                </Section>

                {/* Motor de Políticas */}
                <Section icon={<Lock className="w-6 h-6" />} title="Unified Policy Engine (SGSI Digital)">
                    <p className="text-gray-300 leading-relaxed mb-6">
                        O coração técnico da nossa conformidade ISO 27001 é o <strong>Unified Policy Engine</strong>.
                        Este motor automatiza a aplicação de políticas de segurança em tempo real, eliminando o erro humano.
                    </p>
                    <MermaidDiagram
                        title="Governança de Acesso Isomórfica"
                        chart={`
graph TD
    A[Política ISO 27001] --> B[Compilador de Políticas]
    B --> C[Unified Policy Engine]
    C --> D[PBAC: Regras de Negócio]
    C --> E[TBAC: Janelas Horárias]
    C --> F[ACL: Controle por Objeto]
    D --> G{Decisão de Acesso}
    E --> G
    F --> G
    G -->|Permitir| H[Acesso Concedido]
    G -->|Bloquear| I[Acesso Negado + Sentry Alert]
    
    style A fill:#f59e0b,stroke:#d97706,color:#fff
    style C fill:#3b82f6,stroke:#2563eb,color:#fff
    style G fill:#10b981,stroke:#059669,color:#fff
`}
                    />
                </Section>

                {/* Por que é importante? */}
                <Section icon={<AlertCircle className="w-6 h-6" />} title="Por que isso é importante para você?">
                    <div className="grid md:grid-cols-2 gap-4">
                        <ImportanceCard
                            title="Confiança Internacional"
                            description="Clientes do mundo todo reconhecem este padrão como sinônimo de excelência"
                            icon="🌍"
                        />
                        <ImportanceCard
                            title="Processos Transparentes"
                            description="Tudo está documentado - você sabe exatamente como protegemos seus dados"
                            icon="📋"
                        />
                        <ImportanceCard
                            title="Melhoria Contínua"
                            description="Estamos sempre melhorando nossa segurança, não ficamos parados"
                            icon="📈"
                        />
                        <ImportanceCard
                            title="Gestão de Riscos"
                            description="Identificamos e prevenimos problemas antes que aconteçam"
                            icon="🎯"
                        />
                    </div>
                </Section>

                {/* O que implementamos */}
                <Section icon={<CheckCircle2 className="w-6 h-6" />} title="O que fizemos para conquistar isso?">
                    <div className="space-y-6">
                        <ImplementationCard
                            icon={<Lock className="w-6 h-6 text-amber-400" />}
                            title="Controle de Acesso 'Blindado' (A09)"
                            description="Implementamos CASL com ABAC para garantir acesso granular"
                            analogy="Cada porta no banco exige biometria, cargo e horário correto para abrir"
                            status="100%"
                        />

                        <ImplementationCard
                            icon={<Shield className="w-6 h-6 text-amber-400" />}
                            title="Políticas Isomórficas"
                            description="A mesma lógica de segurança roda no seu navegador e no servidor"
                            analogy="O segurança que te acompanha na rua é o mesmo que vigia sua casa por dentro"
                            status="100%"
                        />

                        <ImplementationCard
                            icon={<Eye className="w-6 h-6 text-amber-400" />}
                            title="Monitoramento Contínuo (A12)"
                            description="Integração Total com Sentry para detecção de anomalias"
                            analogy="Câmeras de segurança com inteligência artificial monitorando 24/7"
                            status="100%"
                        />

                        <ImplementationCard
                            icon={<Users className="w-6 h-6 text-amber-400" />}
                            title="Restrição Temporal (TBAC)"
                            description="Acesso negado fora de janelas operacionais seguras"
                            analogy="O sistema tranca as janelas automaticamente ao pôr do sol"
                            status="100%"
                        />
                    </div>
                </Section>

                {/* Benefícios */}
                <Section icon={<Shield className="w-6 h-6" />} title="O que você ganha com isso?">
                    <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20 p-6">
                        <h3 className="text-xl font-semibold mb-4 text-amber-400">Com a ISO 27001:</h3>
                        <div className="grid md:grid-cols-2 gap-3">
                            <Right>✅ Seus dados estão protegidos por padrões mundiais</Right>
                            <Right>✅ Processos auditados constantemente</Right>
                            <Right>✅ Resposta rápida a incidentes</Right>
                            <Right>✅ Proteção contra ataques cibernéticos</Right>
                            <Right>✅ Backup e recuperação garantidos</Right>
                            <Right>✅ Conformidade com leis internacionais</Right>
                        </div>

                        <div className="mt-6 pt-6 border-t border-amber-500/20">
                            <p className="text-sm text-gray-400">
                                <strong>Status atual:</strong> Estamos finalizando os últimos 2 controles e aguardando auditoria externa. A certificação oficial deve sair em breve!
                            </p>
                        </div>
                    </div>
                </Section>

                {/* Por que ainda não certificado */}
                <Section icon={<AlertCircle className="w-6 h-6" />} title="Por que ainda não temos o certificado oficial?">
                    <div className="bg-blue-500/10 border border-blue-500/20 p-6">
                        <p className="text-gray-300 mb-4">
                            A ISO 27001 requer <strong>auditoria independente</strong> por uma empresa certificadora internacional. O processo é assim:
                        </p>
                        <ol className="space-y-2 list-decimal list-inside text-gray-300">
                            <li>Implementar todos os controles ✅ <span className="text-green-400">(95% concluído)</span></li>
                            <li>Documentar tudo ✅ <span className="text-green-400">(100% concluído)</span></li>
                            <li>Contratar empresa certificadora 🔄 <span className="text-yellow-400">(Em andamento)</span></li>
                            <li>Passar por auditoria externa 📅 <span className="text-gray-500">(Agendado)</span></li>
                            <li>Receber certificado 🎯 <span className="text-gray-500">(Próximos meses)</span></li>
                        </ol>

                        <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20">
                            <p className="text-amber-300 text-sm">
                                ⚡ <strong>Importante:</strong> Mesmo sem o certificado oficial, já implementamos TODOS os requisitos de segurança. A auditoria é apenas para validação formal.
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
