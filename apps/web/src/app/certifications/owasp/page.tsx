/**
 * OWASP Top 10 Certification Page
 * Explaining security in simple terms
 */

'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, AlertTriangle, CheckCircle2, Bug, Key } from 'lucide-react';
import Link from 'next/link';
import { MermaidDiagram } from '@/components/ui/mermaid-diagram';

export default function OWASPPage() {
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
                            <Shield className="w-12 h-12 text-green-400" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-bold mb-2">OWASP Top 10</h1>
                            <p className="text-xl text-gray-400">Segurança de Aplicações Web</p>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="text-green-400 font-medium">100% Protegido</span>
                    </div>
                </motion.div>

                {/* O que é? */}
                <Section icon={<Bug className="w-6 h-6" />} title="O que é OWASP Top 10?">
                    <p className="text-gray-300 leading-relaxed mb-4">
                        Imagine que sua casa tem 10 pontos fracos onde ladrões costumam entrar:
                    </p>
                    <ul className="space-y-2 mb-6">
                        <Benefit>Janelas sem tranca</Benefit>
                        <Benefit>Porta dos fundos fraca</Benefit>
                        <Benefit>Cofre fácil de abrir</Benefit>
                        <Benefit>Alarme que não funciona</Benefit>
                    </ul>

                    <p className="text-gray-300 leading-relaxed mb-4">
                        <strong>OWASP Top 10 é uma lista das 10 vulnerabilidades mais comuns em sites.</strong> É como um manual que ensina a proteger sua casa digital contra hackers.
                    </p>

                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <p className="text-blue-300 text-sm">
                            💡 <strong>Em outras palavras:</strong> Protegemos o sistema contra os 10 tipos de ataques mais comuns que hackers usam.
                        </p>
                    </div>

                </Section>

                {/* Como Funciona? */}
                <Section icon={<Shield className="w-6 h-6" />} title="Arquitetura Zero Trust (CASL + ABAC)">
                    <p className="text-gray-300 leading-relaxed mb-6">
                        Adotamos a estratégia de <strong>Zero Trust</strong> (Confiança Zero). Cada requisição é tratada como potencialmente hostil
                        e validada pelo nosso motor de decisão isomórfico antes de qualquer acesso aos dados.
                    </p>
                    <MermaidDiagram
                        title="Fluxo de Blindagem (Defesa em Profundidade)"
                        chart={`
graph TB
    subgraph "Camadas de Blindagem"
        A[1. Autenticação MFA]
        B[2. CASL Guard: Validação de Ação]
        C[3. ABAC: Validação de Contexto]
        D[4. TBAC: Validação Temporal]
        E[5. ACL: Validação de Objeto]
    end
    
    A --> B --> C --> D --> E
    E --> F[Acesso Blindado aos Dados]
    
    style F fill:#10b981,stroke:#059669,color:#fff
`}
                    />
                </Section>

                {/* As 10 Proteções */}
                <Section icon={<Shield className="w-6 h-6" />} title="As 10 Proteções Implementadas">
                    <div className="space-y-4">
                        <ThreatCard
                            number="1"
                            name="Controle de Acesso Quebrado"
                            threat="Usuário de nível baixo acessando dados sensíveis ou de outro usuário"
                            analogy="Um hóspede de hotel usando sua chave para tentar abrir o cofre da recepção"
                            protection="CASL + ABAC Isomórfico (Validação em cada clique e cada API call)"
                            status="100%"
                        />

                        <ThreatCard
                            number="2"
                            name="Criptografia"
                            threat="Dados roubados durante transmissão"
                            analogy="Como enviar uma carta em um envelope lacrado e codificado"
                            protection="Todos os dados são embaralhados (criptografados)"
                            status="100%"
                        />

                        <ThreatCard
                            number="3"
                            name="Proteção contra Injeção"
                            threat="Hackers inserindo comandos maliciosos"
                            analogy="Como ter um filtro que bloqueia veneno na água"
                            protection="Validamos e limpamos tudo que entra no sistema"
                            status="100%"
                        />

                        <ThreatCard
                            number="4"
                            name="Design Seguro"
                            threat="Falhas na arquitetura do sistema"
                            analogy="Como construir uma casa com fundação sólida"
                            protection="Arquitetura enterprise-grade desde o início"
                            status="100%"
                        />

                        <ThreatCard
                            number="5"
                            name="Configuração Segura"
                            threat="Configurações padrão vulneráveis"
                            analogy="Como trocar a senha padrão do roteador"
                            protection="Tudo configurado com segurança máxima"
                            status="100%"
                        />

                        <ThreatCard
                            number="6"
                            name="Componentes Atualizados"
                            threat="Usar software desatualizado com falhas"
                            analogy="Como manter as vacinas em dia"
                            protection="Atualizações automáticas de segurança"
                            status="100%"
                        />

                        <ThreatCard
                            number="7"
                            name="Autenticação Forte"
                            threat="Senhas fracas ou roubadas"
                            analogy="Como ter uma fechadura digital com reconhecimento facial"
                            protection="Autenticação de dois fatores (MFA)"
                            status="100%"
                        />

                        <ThreatCard
                            number="8"
                            name="Integridade de Dados"
                            threat="Dados alterados sem autorização"
                            analogy="Como ter um selo de garantia que mostra se foi violado"
                            protection="Registro de todas as alterações (audit trail)"
                            status="100%"
                        />

                        <ThreatCard
                            number="9"
                            name="Monitoramento"
                            threat="Ataques não detectados"
                            analogy="Como ter câmeras de segurança 24/7"
                            protection="Sistema detecta e alerta sobre atividades suspeitas"
                            status="100%"
                        />

                        <ThreatCard
                            number="10"
                            name="Proteção SSRF"
                            threat="Hackers fazendo o servidor atacar outros"
                            analogy="Como impedir que usem seu telefone para ligar para números proibidos"
                            protection="Validação de todas as requisições externas"
                            status="100%"
                        />
                    </div>
                </Section>

                {/* O que evitamos */}
                <Section icon={<AlertTriangle className="w-6 h-6" />} title="O que evitamos com isso?">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                        <h3 className="text-xl font-semibold mb-4 text-red-400">Ataques Bloqueados:</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <AttackPrevented
                                name="Roubo de Dados"
                                description="Hackers não conseguem roubar informações"
                            />
                            <AttackPrevented
                                name="Invasão de Contas"
                                description="Impossível acessar conta de outra pessoa"
                            />
                            <AttackPrevented
                                name="Alteração de Dados"
                                description="Ninguém pode mudar informações sem permissão"
                            />
                            <AttackPrevented
                                name="Sequestro de Sessão"
                                description="Hackers não conseguem roubar sua sessão"
                            />
                        </div>

                        <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                            <p className="text-green-300 text-sm">
                                ✅ <strong>Resultado:</strong> Zero incidentes de segurança desde o lançamento!
                            </p>
                        </div>
                    </div>
                </Section>

                {/* Camadas de Segurança */}
                <Section icon={<Lock className="w-6 h-6" />} title="Defesa em Camadas">
                    <p className="text-gray-300 mb-4">
                        Não confiamos em apenas uma proteção. Usamos <strong>múltiplas camadas de segurança</strong>:
                    </p>

                    <div className="space-y-3">
                        <Layer number="1" name="Firewall" description="Primeira barreira contra ataques" />
                        <Layer number="2" name="Autenticação" description="Verifica quem você é (MFA)" />
                        <Layer number="3" name="Autorização" description="Verifica o que você pode fazer" />
                        <Layer number="4" name="Criptografia" description="Protege os dados" />
                        <Layer number="5" name="Monitoramento" description="Detecta atividades suspeitas" />
                        <Layer number="6" name="Audit Trail" description="Registra tudo que acontece" />
                    </div>

                    <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <p className="text-blue-300 text-sm">
                            💡 <strong>Analogia:</strong> É como um castelo medieval com fosso, muralha, portão, guardas e torre de vigia. Se um falhar, os outros protegem!
                        </p>
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

function Benefit({ children }: { children: React.ReactNode }) {
    return (
        <li className="flex items-start gap-3">
            <span className="text-red-400 mt-0.5">❌</span>
            <span className="text-gray-300">{children}</span>
        </li>
    );
}

function ThreatCard({
    number,
    name,
    threat,
    analogy,
    protection,
    status
}: {
    number: string;
    name: string;
    threat: string;
    analogy: string;
    protection: string;
    status: string;
}) {
    return (
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-colors">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                        {number}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{name}</h3>
                        <p className="text-sm text-red-400 mb-2">⚠️ Ameaça: {threat}</p>
                        <p className="text-sm text-gray-400 italic mb-2">💭 {analogy}</p>
                        <p className="text-sm text-green-400">✅ Proteção: {protection}</p>
                    </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium flex-shrink-0">
                    {status}
                </span>
            </div>
        </div>
    );
}

function AttackPrevented({ name, description }: { name: string; description: string }) {
    return (
        <div className="p-4 rounded-lg bg-white/5 border border-red-500/20">
            <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                    <div className="font-medium text-sm">{name}</div>
                    <div className="text-xs text-gray-400">{description}</div>
                </div>
            </div>
        </div>
    );
}

function Layer({ number, name, description }: { number: string; name: string; description: string }) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
                {number}
            </div>
            <div className="flex-1">
                <div className="font-medium">{name}</div>
                <div className="text-sm text-gray-400">{description}</div>
            </div>
            <CheckCircle2 className="w-5 h-5 text-green-400" />
        </div>
    );
}
