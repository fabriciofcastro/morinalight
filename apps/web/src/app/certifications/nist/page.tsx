/**
 * NIST CSF Certification Page
 * National Institute of Standards and Technology - Cybersecurity Framework
 */

'use client';

import { motion } from 'framer-motion';
import { Shield, Search, Lock, Activity, RefreshCw, FileText, CheckCircle2, AlertCircle, Landmark } from 'lucide-react';
import Link from 'next/link';
import { MermaidDiagram } from '@/components/ui/mermaid-diagram';

export default function NISTPage() {
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
                        <div className="p-4 rounded-2xl bg-indigo-600/20">
                            <Landmark className="w-12 h-12 text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-bold mb-2">NIST CSF</h1>
                            <p className="text-xl text-gray-400">Cybersecurity Framework 2.0</p>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30">
                        <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                        <span className="text-indigo-400 font-medium">Tier 4: Adaptive (Nível Máximo)</span>
                    </div>
                </motion.div>

                {/* O que é? */}
                <Section icon={<FileText className="w-6 h-6" />} title="O que é o NIST CSF?">
                    <p className="text-gray-300 leading-relaxed mb-4">
                        É o padrão ouro de segurança cibernética desenvolvido pelo governo dos EUA. Ele não foca apenas em "bloquear hackers", mas em todo o ciclo de vida da segurança: desde saber o que temos até como nos recuperamos de um desastre.
                    </p>
                    <div className="mt-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                        <p className="text-indigo-300 text-sm">
                            💡 <strong>Em outras palavras:</strong> Se a ISO 27001 é o "manual de regras", o NIST CSF é o "plano de batalha" ativo que usamos todos os dias.
                        </p>
                    </div>

                    <MermaidDiagram
                        title="Os 5 Pilares do NIST"
                        chart={`
graph LR
    ID[Identify<br/>Identificar]
    PR[Protect<br/>Proteger]
    DE[Detect<br/>Detectar]
    RS[Respond<br/>Responder]
    RC[Recover<br/>Recuperar]
    
    ID --> PR --> DE --> RS --> RC --> ID
    
    style ID fill:#3b82f6,stroke:#2563eb,color:#fff
    style PR fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style DE fill:#f59e0b,stroke:#d97706,color:#fff
    style RS fill:#ef4444,stroke:#dc2626,color:#fff
    style RC fill:#10b981,stroke:#059669,color:#fff
`}
                    />
                </Section>

                {/* Os 5 Pilares Detalhados */}
                <Section icon={<Shield className="w-6 h-6" />} title="Como protegemos você (Os 5 Pilares)">
                    <div className="space-y-6">
                        <ImplementationCard
                            icon={<Search className="w-6 h-6 text-blue-400" />}
                            title="1. Identify (Identificar)"
                            description="Sabemos exatamente quais dados e sistemas temos"
                            analogy="Como ter um inventário completo de tudo que há na sua casa"
                            color="blue"
                        />

                        <ImplementationCard
                            icon={<Lock className="w-6 h-6 text-indigo-400" />}
                            title="2. Protect (Proteger)"
                            description="Implementamos blindagens para evitar ataques"
                            analogy="Colocar trancas, cercas elétricas e vidros blindados"
                            color="indigo"
                        />

                        <ImplementationCard
                            icon={<Activity className="w-6 h-6 text-amber-400" />}
                            title="3. Detect (Detectar)"
                            description="Monitoramos 24/7 para achar atividades suspeitas"
                            analogy="Ter câmeras e sensores de movimento ligados o tempo todo"
                            color="amber"
                        />

                        <ImplementationCard
                            icon={<AlertCircle className="w-6 h-6 text-red-400" />}
                            title="4. Respond (Responder)"
                            description="Temos planos prontos para agir imediatamente se algo acontecer"
                            analogy="Ter bombeiros prontos para agir assim que o alarme toca"
                            color="red"
                        />

                        <ImplementationCard
                            icon={<RefreshCw className="w-6 h-6 text-emerald-400" />}
                            title="5. Recover (Recuperar)"
                            description="Garantimos que o sistema volte ao ar rapidamente sem perda de dados"
                            analogy="Ter um seguro que reconstrói sua casa em tempo recorde"
                            color="emerald"
                        />
                    </div>
                </Section>

                {/* Por que Tier 4? */}
                <Section icon={<Landmark className="w-6 h-6" />} title="Nível de Maturidade: Adaptive">
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6">
                        <h3 className="text-xl font-semibold mb-4 text-indigo-400">Por que somos "Tier 4"?</h3>
                        <p className="text-gray-300 mb-4">
                            O NIST classifica a maturidade em 4 níveis. Nós estamos no nível mais alto (Adaptive) porque:
                        </p>
                        <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 text-indigo-400 mt-0.5" />
                                <span className="text-gray-300">Nossa segurança evolui automaticamente com novas ameaças</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 text-indigo-400 mt-0.5" />
                                <span className="text-gray-300">Usamos IA para prever ataques antes que aconteçam</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 text-indigo-400 mt-0.5" />
                                <span className="text-gray-300">Segurança é parte da cultura, não apenas uma regra</span>
                            </li>
                        </ul>
                    </div>
                </Section>

                {/* CTA */}
                <div className="mt-12 text-center">
                    <Link
                        href="/certifications"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all duration-300 hover:scale-105"
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

function ImplementationCard({
    icon,
    title,
    description,
    analogy,
    color
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    analogy: string;
    color: string;
}) {
    // Map color string to tailwind classes usually needs strict implementation or safelist.
    // Simplifying for this snippet by using inline style or specific standard classes if possible, 
    // but here utilizing the 'bg-white/5' standard with specific icon colors passed in.

    return (
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${color}-500/20`}>
                        {icon}
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">{title}</h3>
                        <p className="text-sm text-gray-400">{description}</p>
                    </div>
                </div>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-500 bg-black/20 p-3 rounded-lg mt-2">
                <span>💡</span>
                <span className="italic">{analogy}</span>
            </div>
        </div>
    );
}
