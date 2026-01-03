import React from 'react';
import { PageBackground } from '@/components/layout/PageBackground';
import { CertificationManagement } from '@/components/admin/certifications/certification-management';

export const metadata = {
    title: 'Gestão de Certificações - MorinaLight',
    description: 'Administração de conformidade e certificações corporativas.',
};

export default function AdminCertificationsPage() {
    return (
        <PageBackground>
            <div className="p-8">
                <CertificationManagement />
            </div>
        </PageBackground>
    );
}
