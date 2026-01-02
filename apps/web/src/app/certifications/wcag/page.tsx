/**
 * WCAG Certification Page
 * Explaining accessibility in simple terms
 */

'use client';

import { motion } from 'framer-motion';
import { Eye, Ear, Hand, Brain, CheckCircle2, Heart } from 'lucide-react';
import Link from 'next/link';
import { MermaidDiagram } from '@/components/ui/mermaid-diagram';

export default function WCAGPage() {
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
                        <div className="p-4 rounded-2xl bg-green-500/20">
                            <Eye className="w-12 h-12 text-green-400" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-bold mb-2">WCAG 2.1 AA</h1>
                            <p className="text-xl text-gray-400">Acessibilidade Web</p>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="text-green-400 font-medium">100% Acessível</span>
                    </div>
                </motion.div>

                {/* O que é? */}
                <Section icon={<Heart className="w-6 h-6" />} title="O que é Acessibilidade Web?">
                    <p className="text-gray-300 leading-relaxed mb-4">
                        Imagine uma loja física que tem:
                    </p>
                    <ul className="space-y-3 mb-6">
                        <Benefit>Uma rampa para cadeirantes</Benefit>
                        <Benefit>Placas em Braille para pessoas cegas</Benefit>
                        <Benefit>Corredores largos para todos passarem</Benefit>
                        <Benefit>Boa iluminação para todos enxergarem</Benefit>
                    </ul>

                    <p className="text-gray-300 leading-relaxed mb-4">
                        <strong>Acessibilidade Web é a mesma coisa, mas para sites!</strong> Garantimos que <strong>TODAS as pessoas</strong> possam usar nosso sistema, independente de:
                    </p>

                    <div className="grid md:grid-cols-2 gap-4 mt-6">
                        <AccessibilityCard
                            icon={<Eye className="w-6 h-6" />}
                            title="Visão"
                            description="Pessoas cegas ou com baixa visão podem usar leitores de tela"
                        />
                        <AccessibilityCard
                            icon={<Ear className="w-6 h-6" />}
                            title="Audição"
                            description="Pessoas surdas têm legendas e alternativas visuais"
                        />
                        <AccessibilityCard
                            icon={<Hand className="w-6 h-6" />}
                            title="Mobilidade"
                            description="Pessoas que não usam mouse podem navegar pelo teclado"
                        />
                        <AccessibilityCard
                            icon={<Brain className="w-6 h-6" />}
                            title="Cognição"
                            description="Interface clara e simples para todos entenderem"
                        />
                    </div>

                </Section>

                {/* Como Funciona? */}
                <Section icon={<CheckCircle2 className="w-6 h-6" />} title="Como Funcionam os Níveis de Acessibilidade?">
                    <p className="text-gray-300 leading-relaxed mb-6">
                        A acessibilidade é medida em níveis (A, AA, AAA). Nosso compromisso é atingir e manter o nível AA,
                        que é o padrão global para sites acessíveis.
                    </p>
                    <MermaidDiagram
                        title="Níveis de Conformidade WCAG 2.1"
                        chart={`
graph LR
    A[WCAG 2.1] --> B[Nível A<br/>Básico]
    A --> C[Nível AA<br/>Intermediário]
    A --> D[Nível AAA<br/>Avançado]
    
    B --> B1[Contraste: 3:1]
    C --> C1[Contraste: 4.5:1]
    C --> C2[Navegação por Teclado]
    C --> C3[ARIA Labels]
    D --> D1[Contraste: 7:1]
    
    style C fill:#10b981,stroke:#059669,color:#fff
    style C1 fill:#10b981,stroke:#059669,color:#fff
    style C2 fill:#10b981,stroke:#059669,color:#fff
    style C3 fill:#10b981,stroke:#059669,color:#fff
`}
                    />
                </Section>

                {/* Por que é importante? */}
                <Section icon={<Heart className="w-6 h-6" />} title="Por que isso importa?">
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 mb-6">
                        <h3 className="text-xl font-semibold mb-4">Números que impressionam:</h3>
                        <div className="grid md:grid-cols-3 gap-6">
                            <Stat number="45 milhões" label="Brasileiros com alguma deficiência" />
                            <Stat number="1 em 4" label="Pessoas terão deficiência temporária na vida" />
                            <Stat number="100%" label="Pessoas se beneficiam de boa acessibilidade" />
                        </div>
                    </div>

                    <p className="text-gray-300 leading-relaxed">
                        Acessibilidade não é só para pessoas com deficiência. <strong>Todo mundo se beneficia:</strong>
                    </p>
                    <ul className="mt-4 space-y-2">
                        <Benefit>Idosos com dificuldade de visão</Benefit>
                        <Benefit>Pessoas com braço quebrado (deficiência temporária)</Benefit>
                        <Benefit>Quem está em ambiente barulhento</Benefit>
                        <Benefit>Quem usa celular sob o sol (tela difícil de ver)</Benefit>
                    </ul>
                </Section>

                {/* O que implementamos */}
                <Section icon={<CheckCircle2 className="w-6 h-6" />} title="Como tornamos tudo acessível?">
                    <div className="space-y-6">
                        <ImplementationCard
                            icon="⌨️"
                            title="Navegação por Teclado"
                            description="Tudo funciona sem precisar de mouse"
                            example="Você pode usar Tab, Enter e Setas para navegar"
                            status="100%"
                        />

                        <ImplementationCard
                            icon="🔊"
                            title="Leitor de Tela"
                            description="Pessoas cegas ouvem tudo que está na tela"
                            example="Como ter alguém lendo o jornal para você"
                            status="100%"
                        />

                        <ImplementationCard
                            icon="🎨"
                            title="Contraste de Cores"
                            description="Cores fáceis de distinguir"
                            example="Como usar caneta preta em papel branco (fácil de ler)"
                            status="100%"
                        />

                        <ImplementationCard
                            icon="📝"
                            title="Textos Alternativos"
                            description="Todas as imagens têm descrição"
                            example="Como legendas em um filme mudo"
                            status="100%"
                        />

                        <ImplementationCard
                            icon="🔍"
                            title="Zoom até 200%"
                            description="Textos aumentam sem quebrar"
                            example="Como usar lupa sem perder o contexto"
                            status="100%"
                        />
                    </div>
                </Section>

                {/* Testes realizados */}
                <Section icon={<CheckCircle2 className="w-6 h-6" />} title="Como garantimos isso?">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold mb-4">Testes Rigorosos:</h3>
                        <div className="space-y-4">
                            <TestResult
                                name="Lighthouse (Google)"
                                score="100/100"
                                description="Ferramenta do Google que testa acessibilidade"
                            />
                            <TestResult
                                name="axe-core"
                                score="0 erros"
                                description="Robô que encontra problemas de acessibilidade"
                            />
                            <TestResult
                                name="Leitores de Tela"
                                score="✅ Aprovado"
                                description="Testado com NVDA, JAWS e VoiceOver"
                            />
                            <TestResult
                                name="Navegação por Teclado"
                                score="✅ Aprovado"
                                description="Tudo funciona sem mouse"
                            />
                        </div>
                    </div>
                </Section>

                {/* Benefícios */}
                <Section icon={<Heart className="w-6 h-6" />} title="Benefícios para Todos">
                    <div className="grid md:grid-cols-2 gap-4">
                        <BenefitCard
                            emoji="❤️"
                            title="Inclusão"
                            description="45 milhões de brasileiros podem usar nosso sistema"
                        />
                        <BenefitCard
                            emoji="⚖️"
                            title="Lei"
                            description="Cumprimos a Lei Brasileira de Inclusão"
                        />
                        <BenefitCard
                            emoji="📈"
                            title="SEO"
                            description="Google favorece sites acessíveis"
                        />
                        <BenefitCard
                            emoji="😊"
                            title="Experiência"
                            description="Interface melhor para todos os usuários"
                        />
                    </div>
                </Section>

                {/* CTA */}
                <div className="mt-12 text-center">
                    <Link
                        href="/certifications"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-all duration-300 hover:scale-105"
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

function AccessibilityCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                    {icon}
                </div>
                <h3 className="font-semibold">{title}</h3>
            </div>
            <p className="text-sm text-gray-400">{description}</p>
        </div>
    );
}

function Stat({ number, label }: { number: string; label: string }) {
    return (
        <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">{number}</div>
            <div className="text-sm text-gray-400">{label}</div>
        </div>
    );
}

function ImplementationCard({
    icon,
    title,
    description,
    example,
    status
}: {
    icon: string;
    title: string;
    description: string;
    example: string;
    status: string;
}) {
    return (
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="text-3xl">{icon}</div>
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
                    💭 {example}
                </p>
            </div>
        </div>
    );
}

function TestResult({ name, score, description }: { name: string; score: string; description: string }) {
    return (
        <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
            <div>
                <div className="font-medium">{name}</div>
                <div className="text-sm text-gray-400">{description}</div>
            </div>
            <div className="text-green-400 font-bold">{score}</div>
        </div>
    );
}

function BenefitCard({ emoji, title, description }: { emoji: string; title: string; description: string }) {
    return (
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <div className="text-3xl mb-2">{emoji}</div>
            <h3 className="font-semibold mb-1">{title}</h3>
            <p className="text-sm text-gray-400">{description}</p>
        </div>
    );
}
