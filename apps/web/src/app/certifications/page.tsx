/**
 * Certifications Page - Main page
 */

import { Shield, Eye, Lock, FileCheck, Server, CreditCard, Rocket as RocketIcon, Globe, Landmark } from 'lucide-react';
import { AnimatedBackground } from './components/AnimatedBackground';
import { HeroSection } from './components/HeroSection';
import { CertificateCard } from './components/CertificateCard';
import { TimelineSection } from './components/TimelineSection';

export default function CertificationsPage() {
    return (
        <main className="relative min-h-screen text-white bg-black selection:bg-cyan-500/30">
            {/* Animated Background Global */}
            <div className="fixed inset-0 z-0">
                <AnimatedBackground />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            </div>

            {/* Hero Section */}
            <HeroSection />

            {/* Main Content Dashboard */}
            <div className="relative z-10 flex flex-col gap-32 pb-32">

                {/* Completed Certifications Sector */}
                <section className="container mx-auto px-4">
                    <div className="flex items-end gap-4 mb-16 border-b border-white/10 pb-6">
                        <div className="h-full w-2 bg-emerald-500 rounded-full" />
                        <div>
                            <h2 className="text-sm font-mono text-emerald-500 uppercase tracking-widest mb-1">Setor 01</h2>
                            <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight">Certificações Ativas</h3>
                        </div>
                        <div className="ml-auto hidden md:block text-right">
                            <div className="text-2xl font-mono font-bold text-white">100%</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider">Taxa de Compliance</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* ... Existing Cards ... */}

                        <CertificateCard
                            name="LGPD"
                            status="complete"
                            score={100}
                            icon={<Shield className="w-8 h-8 text-emerald-400" />}
                            color="#10b981"
                            description="Lei Geral de Proteção de Dados - Compliance total"
                            benefits={[
                                'Evita multas de até R$ 50 milhões',
                                'Confiança de clientes',
                                'Vantagem competitiva',
                                'Compliance com ANPD',
                            ]}
                            evidence={[
                                'Consentimento Granular de Cookies',
                                'Portabilidade de Dados (Padrão ANPD)',
                                'Direito ao Esquecimento Automático',
                                'Audit Trail de Decisões de Acesso',
                                'Controle de Acesso por Atributos (ABAC)',
                            ]}
                            link="/certifications/lgpd"
                        />

                        <CertificateCard
                            name="GDPR"
                            status="complete"
                            score={100}
                            icon={<Globe className="w-8 h-8 text-emerald-400" />}
                            color="#10b981"
                            description="General Data Protection Regulation - EU Compliance"
                            benefits={[
                                'Acesso ao mercado Europeu',
                                'Multas evitadas de até €20M',
                                'Privacidade global',
                                'Confiança internacional',
                            ]}
                            evidence={[
                                'Cross-border Data Transfers',
                                'Explicit Consent Granularity',
                                'Right to Restriction (Art. 18)',
                                'Privacy by Design Architecture',
                                'DPO Dashboard Integration',
                            ]}
                            link="/certifications/gdpr"
                        />

                        <CertificateCard
                            name="NIST CSF"
                            status="complete"
                            score={100}
                            icon={<Landmark className="w-8 h-8 text-indigo-400" />}
                            color="#6366f1"
                            description="Cybersecurity Framework 2.0 - Tier 4 Adaptive"
                            benefits={[
                                'Segurança de nível governamental (EUA)',
                                'Proteção ativa (não apenas passiva)',
                                'Resiliência contra desastres',
                                'Melhoria contínua via IA',
                            ]}
                            evidence={[
                                'Identify: Gestão de Ativos em Tempo Real',
                                'Protect: Zero Trust via CASL + PBAC',
                                'Detect: Monitoramento Ativo Sentry',
                                'Respond: Restrições de Acesso (TBAC)',
                                'Recover: Backup Imutável e DRP',
                            ]}
                            link="/certifications/nist"
                        />

                        <CertificateCard
                            name="WCAG 2.1 AA"
                            status="complete"
                            score={100}
                            icon={<Eye className="w-8 h-8 text-emerald-400" />}
                            color="#10b981"
                            description="Acessibilidade Web - Inclusão total"
                            benefits={[
                                'Inclusão de pessoas com deficiência',
                                'Compliance legal',
                                'SEO melhorado',
                                'UX superior',
                            ]}
                            evidence={[
                                'axe-core: 0 violações',
                                'Lighthouse Accessibility: 100/100',
                                'Keyboard Navigation: 100%',
                                'ARIA Labels: 100%',
                                'Color Contrast: 4.5:1',
                            ]}
                            link="/certifications/wcag"
                        />

                        <CertificateCard
                            name="OWASP Top 10"
                            status="complete"
                            score={100}
                            icon={<Lock className="w-8 h-8 text-emerald-400" />}
                            color="#10b981"
                            description="Segurança de Aplicações - Proteção total"
                            benefits={[
                                'Proteção contra ataques',
                                'Dados seguros',
                                'Confiança de clientes',
                                'Compliance de segurança',
                            ]}
                            evidence={[
                                'A01: Controle de Acesso CASL + ABAC',
                                'A02: Criptografia Homomórfica (Dados Críticos)',
                                'A03: Injeção: Prisma + Validação Zod',
                                'A07: MFA + Context Validation (AUBAC)',
                                '10/10 Vulnerabilidades Blindadas',
                            ]}
                            link="/certifications/owasp"
                        />
                    </div>
                </section>

                {/* Prepared Certifications Sector */}
                <section className="container mx-auto px-4 relative">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-amber-500/5 to-transparent -z-10 pointer-events-none" />

                    <div className="flex items-end gap-4 mb-16 border-b border-white/10 pb-6">
                        <div className="h-full w-2 bg-amber-500 rounded-full" />
                        <div>
                            <h2 className="text-sm font-mono text-amber-500 uppercase tracking-widest mb-1">Setor 02</h2>
                            <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight">Pipeline de Auditoria</h3>
                        </div>
                        <div className="ml-auto hidden md:block text-right">
                            <div className="text-2xl font-mono font-bold text-white">Pendente</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider">Status da Auditoria</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <CertificateCard
                            name="ISO 27001"
                            status="prepared"
                            score={95}
                            icon={<FileCheck className="w-8 h-8 text-amber-400" />}
                            color="#f59e0b"
                            description="Information Security Management System"
                            benefits={[
                                'Credibilidade internacional',
                                'Requisito para enterprise',
                                'Gestão de riscos formal',
                                'Melhoria contínua',
                            ]}
                            evidence={[
                                'Políticas de Segurança Isomórficas',
                                'Unified Policy Engine (Compliance Core)',
                                'Restrição Temporal Inteligente (TBAC)',
                                'ACL Granular por Objeto',
                                'Plano de Resposta a Incidentes (IRP)',
                            ]}
                            link="/certifications/iso27001"
                        />

                        <CertificateCard
                            name="SOC 2 Type II"
                            status="prepared"
                            score={90}
                            icon={<Server className="w-8 h-8 text-amber-400" />}
                            color="#f59e0b"
                            description="System and Organization Controls"
                            benefits={[
                                'Confiança de clientes B2B',
                                'Requisito para SaaS',
                                'Auditoria independente',
                                'Diferencial competitivo',
                            ]}
                            evidence={[
                                'Security: MFA + IP Restriction',
                                'Availability: Multi-region DRP',
                                'Confidentiality: Context-Aware ACLs',
                                'Isomorfismo de Políticas de Acesso',
                                'Logs de Auditoria Centralizados',
                            ]}
                            link="/certifications/soc2"
                        />

                        <CertificateCard
                            name="PCI DSS"
                            status="prepared"
                            score={85}
                            icon={<CreditCard className="w-8 h-8 text-amber-400" />}
                            color="#f59e0b"
                            description="Payment Card Industry Data Security"
                            benefits={[
                                'Processar pagamentos com cartão',
                                'Proteção de dados de pagamento',
                                'Compliance obrigatório',
                                'Redução de fraudes',
                            ]}
                            evidence={[
                                'Criptografia de Dados de Pagamento',
                                'MFA Mandatório para Operadores',
                                'ACL: Acesso Estrito por Transação',
                                'TBAC: Janelas de Operação Seguras',
                                'Monitoramento de Acesso Full-stack',
                            ]}
                            link="/certifications/pci-dss"
                        />
                    </div>
                </section>

                {/* Launch Station / Footer Section */}
                {/* Launch Station / Footer Section */}
                <section className="relative py-32 px-4 overflow-hidden">
                    <div className="max-w-4xl mx-auto text-center relative z-10">
                        {/* Launch Pad Visuals */}
                        <div className="mb-12 relative flex justify-center">
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_20px_rgba(6,182,212,0.5)]" />

                            {/* Rocket Animation */}
                            <div className="relative animate-[float_4s_ease-in-out_infinite] hover:cursor-pointer transition-transform hover:scale-110">
                                <RocketIcon className="w-32 h-32 text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] transform -rotate-45" />
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-4 h-24 bg-gradient-to-t from-transparent via-orange-500 to-yellow-300 blur-sm opacity-80 animate-pulse origin-top" />
                            </div>
                        </div>

                        <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tighter cursor-default px-4">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient break-words">
                                ESTAÇÃO DE LANÇAMENTO
                            </span>
                        </h2>
                        <p className="text-base sm:text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed cursor-default px-4">
                            Todos os sistemas de segurança estão <span className="text-green-400 font-mono">OPERACIONAIS</span>.
                            <br />
                            Pronto para decolar em missão crítica.
                        </p>

                        <div className="flex flex-wrap justify-center gap-6">
                            <a
                                href="/docs"
                                className="group relative px-10 py-5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 text-white font-mono uppercase tracking-widest transition-all hover:scale-105 cursor-pointer overflow-hidden"
                            >
                                <span className="relative z-10">Documentação</span>
                                <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            </a>

                            <a
                                href="/contact"
                                className="group relative px-10 py-5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-mono uppercase tracking-widest shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 hover:shadow-indigo-500/50 cursor-pointer overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Falar com Suporte <RocketIcon className="w-4 h-4 animate-pulse" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
