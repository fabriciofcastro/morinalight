/**
 * GDPR Certification Page
 * Explaining in simple terms for non-technical users
 */

'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Download, Trash2, CheckCircle2, AlertCircle, Globe } from 'lucide-react';
import Link from 'next/link';
import { MermaidDiagram } from '@/components/ui/mermaid-diagram';
import { AnimatedBackground } from '../components/AnimatedBackground';

export default function GDPRPage() {
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
                        <div className="p-4 rounded-2xl bg-blue-600/20">
                            <Globe className="w-12 h-12 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-bold mb-2">GDPR</h1>
                            <p className="text-xl text-gray-400">General Data Protection Regulation (União Europeia)</p>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/30">
                        <CheckCircle2 className="w-5 h-5 text-blue-400" />
                        <span className="text-blue-400 font-medium">100% Compliant</span>
                    </div>
                </motion.div>

                {/* O que é? (Analogia simples) */}
                <Section icon={<Eye className="w-6 h-6" />} title="O que é a GDPR?">
                    <p className="text-gray-300 leading-relaxed mb-4">
                        É a lei de privacidade mais rigorosa do mundo, criada na Europa. Se a LGPD protege os brasileiros, a GDPR protege todos os dados de cidadãos europeus que processamos.
                    </p>
                    <ul className="space-y-3">
                        <Benefit>Proteção de dados a nível internacional</Benefit>
                        <Benefit>Regras rígidas para transferir dados para fora da Europa</Benefit>
                        <Benefit>Consentimento explícito e granular (nada de "caixas pré-marcadas")</Benefit>
                        <Benefit>Direito de saber exatamente onde seus dados estão no mundo</Benefit>
                    </ul>

                    <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <p className="text-blue-300 text-sm">
                            💡 <strong>Em outras palavras:</strong> Garantimos o mesmo nível de segurança de um banco suíço para seus dados, não importa onde você esteja.
                        </p>
                    </div>

                </Section>

                {/* Como Funciona? */}
                <Section icon={<CheckCircle2 className="w-6 h-6" />} title="Como Funciona a Proteção GDPR?">
                    <p className="text-gray-300 leading-relaxed mb-6">
                        O processo de proteção de dados segue um fluxo rigoroso desde o momento em que o usuário interage
                        com nossa aplicação até o armazenamento seguro nos servidores.
                    </p>
                    <MermaidDiagram
                        title="Fluxo de Transferência Internacional de Dados"
                        chart={`
graph LR
    EU[Usuário na Europa] -->|Dados| App[Nossa Aplicação]
    App -->|Processamento| Server[Servidores Seguros]
    Server -->|Backup Criptografado| Cloud[Storage]
    
    subgraph "Zona de Conformidade GDPR"
    App
    Server
    Cloud
    end
    
    style EU fill:#3b82f6,stroke:#2563eb,color:#fff
    style App fill:#10b981,stroke:#059669,color:#fff
    style Server fill:#10b981,stroke:#059669,color:#fff
`}
                    />
                </Section>

                {/* Por que é importante? */}
                <Section icon={<AlertCircle className="w-6 h-6" />} title="Por que isso é importante?">
                    <div className="grid md:grid-cols-2 gap-4">
                        <ImportanceCard
                            title="Privacidade Global"
                            description="Seus dados estão seguros mesmo em transações internacionais"
                            icon="🌍"
                        />
                        <ImportanceCard
                            title="Transparência Total"
                            description="Nada de letras miúdas ou termos escondidos"
                            icon="📄"
                        />
                        <ImportanceCard
                            title="Controle Absoluto"
                            description="Você é o dono dos dados, nós somos apenas os guardiões"
                            icon="👑"
                        />
                        <ImportanceCard
                            title="Segurança Máxima"
                            description="Padrões de segurança de nível governamental europeu"
                            icon="🛡️"
                        />
                    </div>
                </Section>

                {/* O que implementamos */}
                <Section icon={<CheckCircle2 className="w-6 h-6" />} title="O que fizemos?">
                    <div className="space-y-6">
                        <ImplementationCard
                            icon={<Lock className="w-6 h-6 text-blue-400" />}
                            title="Privacy by Design"
                            description="A privacidade já nasce embutida em cada nova função do sistema"
                            analogy="Como construir uma casa já com cofres e alarmes nas paredes, não instalados depois"
                            status="100%"
                        />

                        <ImplementationCard
                            icon={<Download className="w-6 h-6 text-blue-400" />}
                            title="Data Portability (GDPR Art. 20)"
                            description="Exporte seus dados em formato legível por máquina (JSON/XML)"
                            analogy="Como poder mudar de banco levando todo seu histórico num clique"
                            status="100%"
                        />

                        <ImplementationCard
                            icon={<Trash2 className="w-6 h-6 text-blue-400" />}
                            title="Right to be Forgotten (GDPR Art. 17)"
                            description="Exclusão permanente de dados quando solicitado"
                            analogy="Como queimar o arquivo físico permanentemente"
                            status="100%"
                        />
                    </div>
                </Section>

                {/* Seus direitos */}
                <Section icon={<Shield className="w-6 h-6" />} title="Seus Direitos (GDPR)">
                    <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl p-6">
                        <h3 className="text-xl font-semibold mb-4 text-blue-400">Você tem direito a:</h3>
                        <div className="grid md:grid-cols-2 gap-3">
                            <Right>✅ Acesso aos dados (Art. 15)</Right>
                            <Right>✅ Retificação (Art. 16)</Right>
                            <Right>✅ Apagamento (Art. 17)</Right>
                            <Right>✅ Restrição de processamento (Art. 18)</Right>
                            <Right>✅ Portabilidade (Art. 20)</Right>
                            <Right>✅ Oposição (Art. 21)</Right>
                        </div>

                        <div className="mt-6 pt-6 border-t border-blue-500/20">
                            <p className="text-sm text-gray-400">
                                <strong>Data Protection Officer (DPO):</strong> Entre em contato via{' '}
                                <a href="mailto:dpo@morinalight.com" className="text-blue-400 hover:underline">
                                    dpo@morinalight.com
                                </a>
                            </p>
                        </div>
                    </div>
                </Section>

                {/* Penalidades evitadas */}
                <Section icon={<AlertCircle className="w-6 h-6" />} title="Consequências do não-compliance">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                        <p className="text-gray-300 mb-4">
                            Violações da GDPR são gravíssimas:
                        </p>
                        <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="text-red-400 mt-1">⚠️</span>
                                <span className="text-gray-300">Multas de até <strong className="text-red-400">€ 20 Milhões</strong></span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-400 mt-1">⚠️</span>
                                <span className="text-gray-300">4% do faturamento global anual</span>
                            </li>
                        </ul>

                        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                            <p className="text-blue-300 text-sm">
                                ✅ <strong>Fique tranquilo:</strong> Seguimos rigorosamente a GDPR para proteger você e sua empresa.
                            </p>
                        </div>
                    </div>
                </Section>

                {/* CTA */}
                <div className="mt-12 text-center">
                    <Link
                        href="/certifications"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all duration-300 hover:scale-105"
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
            <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
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
                    <div className="p-2 rounded-lg bg-blue-500/20">
                        {icon}
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">{title}</h3>
                        <p className="text-sm text-gray-400">{description}</p>
                    </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium">
                    {status}
                </span>
            </div>
            <p className="text-gray-300 mb-2">{description}</p>
            <div className="flex items-start gap-2 text-sm text-gray-500 bg-black/20 p-3 rounded-lg">
                <span>💡</span>
                <span className="italic">{analogy}</span>
            </div>
        </div>
    );
}

function Right({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-gray-300">
            {children}
        </div>
    );
}
