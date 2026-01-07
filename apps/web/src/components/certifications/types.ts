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
    controls?: {
        id: string;
        name: string;
        status: 'Compliant' | 'Pending' | 'Not Applicable';
    }[];
    metadata?: {
        certificateNumber?: string;
        issuedDate?: string;
        expiryDate?: string;
        auditScope?: string;
    };
}

