import { Certification } from './types';

export const CERTIFICATIONS: Certification[] = [
    {
        id: 'lgpd',
        title: 'LGPD (Brasil)',
        description: 'Conformidade total com a Lei Geral de Proteção de Dados Pessoais.',
        status: 'complete',
        progress: 100,
        category: 'Privacy',
        icon: 'ShieldCheck',
        details: {
            benefits: [
                'Proteção de dados dos usuários',
                'Conformidade jurídica completa',
                'Transparência no processamento'
            ],
            evidence: [
                'Relatório de Impacto à Proteção de Dados (RIPD)',
                'Gestão de Consentimento Ativa',
                'DPO Dedicado'
            ],
            score: 100
        },
        controls: [
            { id: "Art. 18", name: "User Rights Management", status: "Compliant" },
            { id: "Art. 37", name: "Data Protection Officer (DPO)", status: "Compliant" },
            { id: "Art. 38", name: "DPO Independence", status: "Compliant" },
            { id: "Art. 41", name: "DPO Contact Information", status: "Compliant" },
            { id: "Art. 46", name: "Cross-border Data Transfer", status: "Compliant" },
            { id: "Art. 50", name: "Security Outcome & Best Practices", status: "Compliant" }
        ],
        metadata: {
            certificateNumber: "LGPD-BR-2024-88",
            issuedDate: "Feb 10, 2024",
            expiryDate: "Feb 09, 2025",
            auditScope: "Comprehensive assessment of personal data processing activities, consent management mechanisms, and data subject rights fulfillment."
        }
    },
    {
        id: 'wcag',
        title: 'WCAG 2.1 AA',
        description: 'Padrões de acessibilidade para conteúdo web garantindo inclusão.',
        status: 'complete',
        progress: 100,
        category: 'Accessibility',
        icon: 'Accessibility',
        details: {
            benefits: [
                'Acessibilidade universal',
                'Inclusão digital',
                'Melhoria no SEO'
            ],
            evidence: [
                'Contraste de cores validado',
                'Navegação por teclado completa',
                'Apoio a leitores de tela'
            ],
            score: 100
        },
        controls: [
            { id: "1.1.1", name: "Non-text Content", status: "Compliant" },
            { id: "1.3.1", name: "Info and Relationships", status: "Compliant" },
            { id: "1.4.3", name: "Contrast (Minimum)", status: "Compliant" },
            { id: "2.1.1", name: "Keyboard", status: "Compliant" },
            { id: "2.4.7", name: "Focus Visible", status: "Compliant" },
            { id: "3.3.2", name: "Labels or Instructions", status: "Compliant" },
            { id: "4.1.2", name: "Name, Role, Value", status: "Compliant" }
        ],
        metadata: {
            certificateNumber: "A11Y-2024-WCAG",
            issuedDate: "Mar 01, 2024",
            expiryDate: "Mar 01, 2025",
            auditScope: "Accessibility audit of the main web application interface, user dashboard, and public facing pages against WCAG 2.1 Level AA success criteria."
        }
    },
    {
        id: 'owasp',
        title: 'OWASP Top 10',
        description: 'Proteção contra as dez ameaças de segurança mais críticas.',
        status: 'complete',
        progress: 100,
        category: 'Security',
        icon: 'Lock',
        details: {
            benefits: [
                'Prevenção contra injeções',
                'Autenticação robusta',
                'Segurança na camada de transporte'
            ],
            evidence: [
                'Testes de intrusão recorrentes',
                'Code review focado em segurança',
                'Tratamento centralizado de erros'
            ],
            score: 100
        },
        controls: [
            { id: "A01", name: "Broken Access Control", status: "Compliant" },
            { id: "A02", name: "Cryptographic Failures", status: "Compliant" },
            { id: "A03", name: "Injection", status: "Compliant" },
            { id: "A04", name: "Insecure Design", status: "Compliant" },
            { id: "A05", name: "Security Misconfiguration", status: "Compliant" },
            { id: "A06", name: "Vulnerable and Outdated Components", status: "Compliant" },
            { id: "A07", name: "Identification and Authentication Failures", status: "Compliant" },
            { id: "A09", name: "Security Logging and Monitoring Failures", status: "Compliant" }
        ],
        metadata: {
            certificateNumber: "OWASP-VER-2024",
            issuedDate: "Jan 20, 2024",
            expiryDate: "Jan 19, 2025",
            auditScope: "Security assessment of critical application paths, API endpoints, and authentication flows based on the OWASP Top 10 2021 list."
        }
    },
    {
        id: 'iso27001',
        title: 'ISO 27001',
        description: 'Sistema de Gestão de Segurança da Informação (SGSI).',
        status: 'prepared',
        progress: 95,
        category: 'Security',
        icon: 'FileCheck',
        details: {
            benefits: [
                'Criptografia AES-256 em repouso e TLS 1.2+ em trânsito',
                'Hospedagem em Data Centers Tier IV com biometria',
                'Gestão de riscos e continuidade de negócios'
            ],
            evidence: [
                'Políticas de segurança documentadas e auditadas',
                'Plano de resposta a incidentes testado',
                'Controles de acesso e gestão de identidade'
            ],
            score: 95
        },
        controls: [
            { id: "A.5", name: "Information Security Policies", status: "Compliant" },
            { id: "A.6", name: "Organization of Information Security", status: "Compliant" },
            { id: "A.7", name: "Human Resource Security", status: "Compliant" },
            { id: "A.8", name: "Asset Management", status: "Compliant" },
            { id: "A.9", name: "Access Control", status: "Compliant" },
            { id: "A.10", name: "Cryptography", status: "Compliant" },
            { id: "A.11", name: "Physical and Environmental Security", status: "Compliant" },
            { id: "A.12", name: "Operations Security", status: "Compliant" },
            { id: "A.13", name: "Communications Security", status: "Compliant" },
            { id: "A.14", name: "System Acquisition, Development and Maintenance", status: "Compliant" },
        ],
        metadata: {
            certificateNumber: "ISMS-749201",
            issuedDate: "Jan 15, 2024",
            expiryDate: "Jan 14, 2027",
            auditScope: "The ISMS covers all MorinaLight SaaS operations, including software development, customer support, and data management services accessed via cloud interfaces."
        }
    },
    {
        id: 'soc2',
        title: 'SOC 2 Type II',
        description: 'Segurança, Disponibilidade, Integridade de Processamento, Confidencialidade e Privacidade.',
        status: 'prepared',
        progress: 90,
        category: 'Compliance',
        icon: 'Activity',
        details: {
            benefits: [
                'Auditoria independente',
                'Confiança do cliente empresarial',
                'Controles operacionais rigorosos'
            ],
            evidence: [
                'Monitoramento contínuo',
                'Auditoria de logs',
                'Gestão de mudanças'
            ],
            score: 90
        },
        controls: [
            { id: "CC1.0", name: "Control Environment", status: "Compliant" },
            { id: "CC2.0", name: "Communication and Information", status: "Compliant" },
            { id: "CC3.0", name: "Risk Assessment", status: "Compliant" },
            { id: "CC4.0", name: "Monitoring Activities", status: "Compliant" },
            { id: "CC5.0", name: "Control Activities", status: "Compliant" },
            { id: "CC6.0", name: "Logical and Physical Access", status: "Compliant" },
            { id: "CC7.0", name: "System Operations", status: "Compliant" },
            { id: "CC8.0", name: "Change Management", status: "Compliant" },
            { id: "CC9.0", name: "Risk Mitigation", status: "Compliant" }
        ],
        metadata: {
            certificateNumber: "SOC2-T2-2024",
            issuedDate: "Jan 20, 2024",
            expiryDate: "Jan 19, 2025",
            auditScope: "Examination of controls relevant to Security, Availability, and Confidentiality. Includes penetration testing and internal security audits."
        }
    },
    {
        id: 'pci-dss',
        title: 'PCI DSS v4.0',
        description: 'Padrão de Segurança de Dados para a Indústria de Cartões de Pagamento.',
        status: 'prepared',
        progress: 85,
        category: 'Compliance',
        icon: 'CreditCard',
        details: {
            benefits: [
                'Processamento seguro de pagamentos',
                'Proteção contra fraude financeira',
                'Confidencialidade bancária'
            ],
            evidence: [
                'Rede segregada de dados de cartão',
                'Criptografia ponta-a-ponta',
                'Monitoramento de rede 24/7'
            ],
            score: 85
        },
        controls: [
            { id: "Req 1", name: "Install and maintain network security controls", status: "Compliant" },
            { id: "Req 3", name: "Protect stored account data", status: "Compliant" },
            { id: "Req 4", name: "Protect cardholder data with strong cryptography", status: "Compliant" },
            { id: "Req 5", name: "Protect all systems from malicious software", status: "Compliant" },
            { id: "Req 7", name: "Restrict access to cardholder data", status: "Compliant" },
            { id: "Req 10", name: "Log and monitor all access to system components", status: "Compliant" },
            { id: "Req 11", name: "Test security of systems and networks regularly", status: "Compliant" }
        ],
        metadata: {
            certificateNumber: "PCI-L1-2024",
            issuedDate: "Jan 20, 2024",
            expiryDate: "Jan 19, 2025",
            auditScope: "Level 1 Service Provider audit covering all systems involved in the processing, storage, or transmission of cardholder data."
        }
    }
];
