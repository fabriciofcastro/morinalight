export type CertificationStatus = 'complete' | 'in-progress' | 'prepared';

export interface Certification {
    id: string;
    title: string;
    description: string;
    status: CertificationStatus;
    progress: number;
    category: 'Security' | 'Privacy' | 'Accessibility' | 'Compliance';
    icon: string;
    details: {
        benefits: string[];
        evidence: string[];
        score?: number;
    };
}
