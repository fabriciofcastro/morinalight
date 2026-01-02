import type { Meta, StoryObj } from '@storybook/react';
import { CertificateCard } from './CertificateCard';
import { Shield } from 'lucide-react';

const meta: Meta<typeof CertificateCard> = {
    title: 'Certifications/CertificateCard',
    component: CertificateCard,
    parameters: {
        layout: 'centered',
        backgrounds: {
            default: 'dark',
            values: [
                { name: 'dark', value: '#000000' },
                { name: 'light', value: '#ffffff' },
            ],
        },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CertificateCard>;

export const Complete: Story = {
    args: {
        name: 'LGPD',
        status: 'complete',
        score: 100,
        icon: <Shield className="w-8 h-8 text-emerald-400" />,
        color: '#10b981',
        description: 'Lei Geral de Proteção de Dados - Compliance total',
        benefits: [
            'Evita multas de até R$ 50 milhões',
            'Confiança de clientes',
            'Vantagem competitiva',
            'Compliance com ANPD',
        ],
        evidence: [
            'Cookie Consent Banner implementado',
            'Data Portability (JSON/CSV/XML)',
            'Right to be Forgotten',
            'Audit Trail completo',
            'Field-level Encryption (AES-256-GCM)',
        ],
        link: '/certifications/lgpd',
    },
};

export const Prepared: Story = {
    args: {
        name: 'ISO 27001',
        status: 'prepared',
        score: 95,
        icon: <Shield className="w-8 h-8 text-amber-400" />,
        color: '#f59e0b',
        description: 'Information Security Management System',
        benefits: [
            'Credibilidade internacional',
            'Requisito para enterprise',
            'Gestão de riscos formal',
            'Melhoria contínua',
        ],
        evidence: [
            'Política de Segurança documentada',
            'Análise de Riscos (ISO 27005)',
            '42/44 controles implementados',
            'BCP/DRP completo',
            'Incident Response Plan',
        ],
        link: '/certifications/iso27001',
    },
};
