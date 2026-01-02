/**
 * Certifications Layout
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Certificações | MorinaLight',
    description: 'Certificações enterprise-grade: LGPD, WCAG 2.1 AA, OWASP Top 10, ISO 27001, SOC 2 Type II, PCI DSS',
};

export default function CertificationsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
