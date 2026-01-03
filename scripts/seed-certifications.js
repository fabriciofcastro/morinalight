const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const CERTIFICATIONS = [
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
                'Gestão de riscos estruturada',
                'Continuidade de negócios',
                'Vantagem competitiva global'
            ],
            evidence: [
                'Políticas de segurança documentadas',
                'Plano de resposta a incidentes',
                'Controles de acesso implementados'
            ],
            score: 95
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
        }
    }
];

async function main() {
    console.log('Seeding certifications...');

    for (const cert of CERTIFICATIONS) {
        await prisma.certification.upsert({
            where: { id: cert.id },
            update: {
                title: cert.title,
                description: cert.description,
                category: cert.category,
                icon: cert.icon,
                benefits: cert.details?.benefits || [],
                evidence: cert.details?.evidence || [],
                baseScore: cert.details?.score || 0,
                isActive: true,
            },
            create: {
                id: cert.id,
                title: cert.title,
                description: cert.description,
                category: cert.category,
                icon: cert.icon,
                benefits: cert.details?.benefits || [],
                evidence: cert.details?.evidence || [],
                baseScore: cert.details?.score || 0,
                isActive: true,
            }
        });
        console.log(`✓ Seeded certification: ${cert.title}`);
    }

    console.log('\n✅ Seed completed successfully.');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding certifications:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
