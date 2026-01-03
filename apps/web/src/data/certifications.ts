import { Share2, Eye, Shield, Lock, Server, CreditCard, FileText, CheckCircle, Activity, Globe } from 'lucide-react';

export interface CertificationDetails {
    description: string;
    benefits: string[];
    evidence: string[];
    nextSteps?: string[];
}

export interface Certification {
    id: string;
    name: string;
    shortName: string;
    status: 'complete' | 'prepared';
    score: number;
    iconName: string; // Lucide icon name
    color: string;
    gradient: string;
    details: CertificationDetails;
    completedDate?: string;
    targetDate?: string;
    category: 'compliance' | 'security' | 'accessibility';
}

export const CERTIFICATIONS: Certification[] = [
    // COMPLETE CERTIFICATIONS
    {
        id: 'lgpd',
        name: 'LGPD - Lei Geral de Proteção de Dados',
        shortName: 'LGPD',
        status: 'complete',
        score: 100,
        iconName: 'Shield',
        color: '#10b981', // emerald-500
        gradient: 'from-emerald-400 to-teal-500',
        category: 'compliance',
        details: {
            description: 'Conformidade total com a Lei Geral de Proteção de Dados (Lei 13.709/2018), garantindo privacidade e direitos dos titulares.',
            benefits: [
                'Proteção contra multas de até R$ 50 milhões',
                'Confiança e transparência com clientes',
                'Vantagem competitiva no mercado',
                'Compliance total com a ANPD'
            ],
            evidence: [
                'Banner de consentimento de cookies granular',
                'Portabilidade de dados (JSON/CSV/XML)',
                'Direito ao esquecimento implementado',
                'Audit trail completo de dados pessoais',
                'Criptografia nível de campo (AES-256-GCM)'
            ]
        },
        completedDate: '2024-12-31'
    },
    {
        id: 'wcag',
        name: 'WCAG 2.1 AA - Web Content Accessibility Guidelines',
        shortName: 'WCAG 2.1',
        status: 'complete',
        score: 100,
        iconName: 'Eye',
        color: '#3b82f6', // blue-500
        gradient: 'from-blue-400 to-indigo-500',
        category: 'accessibility',
        details: {
            description: 'Adesão total às diretrizes de acessibilidade web, garantindo inclusão para pessoas com deficiência e melhor SEO.',
            benefits: [
                'Inclusão digital total',
                'Melhor ranking em SEO',
                'Compliance legal (LBI)',
                'Melhor experiência de usuário para todos'
            ],
            evidence: [
                'Zero violações no axe-core',
                'Navegação por teclado 100% funcional',
                'Labels ARIA em todos os elementos interativos',
                'Contraste de cores mínimo de 4.5:1',
                'HTML semântico e estruturado'
            ]
        },
        completedDate: '2024-12-31'
    },
    {
        id: 'owasp',
        name: 'OWASP Top 10 - Security Standards',
        shortName: 'OWASP',
        status: 'complete',
        score: 100,
        iconName: 'Lock',
        color: '#8b5cf6', // violet-500
        gradient: 'from-violet-400 to-purple-500',
        category: 'security',
        details: {
            description: 'Proteção contra as 10 vulnerabilidades de segurança mais críticas em aplicações web segundo a OWASP Foundation.',
            benefits: [
                'Proteção robusta contra ataques comuns',
                'Segurança de dados sensíveis',
                'Confiança para clientes enterprise',
                'Ciclo de desenvolvimento seguro (SDL)'
            ],
            evidence: [
                'RBAC/ABAC (Broken Access Control mitigado)',
                'AES-256-GCM (Cryptographic Failures mitigado)',
                'Prisma ORM (Injection mitigado)',
                'MFA + JWT (Authentication Failures mitigado)',
                'Logging estruturado e monitoramento'
            ]
        },
        completedDate: '2024-12-31'
    },

    // PREPARED CERTIFICATIONS
    {
        id: 'iso27001',
        name: 'ISO 27001 - Information Security Management',
        shortName: 'ISO 27001',
        status: 'prepared',
        score: 95,
        iconName: 'Globe',
        color: '#f59e0b', // amber-500
        gradient: 'from-amber-400 to-orange-500',
        category: 'security',
        details: {
            description: 'Padrão internacional para gestão de segurança da informação. Infraestrutura técnica pronta, aguardando auditoria formal.',
            benefits: [
                'Reconhecimento internacional',
                'Gestão de riscos estruturada',
                'Requisito para grandes contratos',
                'Melhoria contínua de segurança'
            ],
            evidence: [
                'Controles de acesso rigorosos',
                'Criptografia de dados em repouso e trânsito',
                'Gestão de incidentes definhada',
                'Plano de continuidade de negócios (BCP)',
                'Backup e recuperação testados'
            ],
            nextSteps: [
                'Contratar auditoria externa',
                'Formalizar ISMS documental',
                'Realizar auditorias internas'
            ]
        },
        targetDate: '2025-06-30'
    },
    {
        id: 'soc2',
        name: 'SOC 2 Type II - Security, Availability & Confidentiality',
        shortName: 'SOC 2',
        status: 'prepared',
        score: 90,
        iconName: 'Server',
        color: '#ec4899', // pink-500
        gradient: 'from-pink-400 to-rose-500',
        category: 'security',
        details: {
            description: 'Auditoria de controles de serviços focada em segurança, disponibilidade e confidencialidade. Preparado para período de observação.',
            benefits: [
                'Confiança para clientes SaaS B2B',
                'Comprovação de processos operacionais',
                'Diferencial competitivo em enterprise',
                'Redução de questionários de segurança'
            ],
            evidence: [
                'Monitoramento 24/7',
                'Gestão de mudanças controlada',
                'Onboarding/Offboarding seguros',
                'Análise de vulnerabilidades',
                'Políticas de segurança da informação'
            ],
            nextSteps: [
                'Iniciar período de observação (6 meses)',
                'Contratar firma de auditoria (CPA)',
                'Coletar evidências contínuas'
            ]
        },
        targetDate: '2025-09-30'
    },
    {
        id: 'pci',
        name: 'PCI DSS - Payment Card Industry Data Security Standard',
        shortName: 'PCI DSS',
        status: 'prepared',
        score: 85,
        iconName: 'CreditCard',
        color: '#ef4444', // red-500
        gradient: 'from-red-400 to-red-600',
        category: 'compliance',
        details: {
            description: 'Padrão de segurança para processamento de cartões de crédito. Preparado para conformidade níveis SAQ-A ou SAQ-D.',
            benefits: [
                'Segurança em transações financeiras',
                'Proteção contra fraudes',
                'Confiança do consumidor',
                'Evita penalidades das bandeiras'
            ],
            evidence: [
                'Criptografia de dados de titular',
                'Monitoramento e rastreamento de acesso',
                'Segurança de rede (Firewall/WAF)',
                'Políticas de segurança da informação',
                'Desenvolvimento seguro (OWASP)'
            ],
            nextSteps: [
                'Definir escopo (Gateway vs Processamento direto)',
                'Realizar scan de vulnerabilidades (ASV)',
                'Preencher questionário de autoavaliação (SAQ)'
            ]
        },
        targetDate: '2025-12-31'
    }
];
