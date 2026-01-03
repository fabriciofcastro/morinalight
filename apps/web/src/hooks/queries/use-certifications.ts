/**
 * Certifications Query Hooks
 * 
 * Hooks do TanStack Query para gerenciar estado de certificações
 */

import { useQuery } from "@tanstack/react-query";
import { queryKeys, queryConfigs } from "@/lib/query/client";

export interface Certification {
    id: string;
    title: string;
    description: string;
    category: string;
    icon: string;
    benefits: string[];
    evidence: string[];
    baseScore: number;
    status: 'complete' | 'in-progress' | 'prepared' | 'pending';
    progress: number;
    score: number;
}

/**
 * Hook para listar certificações (com status da organização se orgId for fornecido)
 */
export function useCertifications(orgId?: string) {
    return useQuery({
        queryKey: ['certifications', orgId],
        queryFn: async () => {
            if (orgId) {
                const response = await fetch(`/api/organizations/${orgId}/certifications`);
                if (!response.ok) throw new Error("Failed to fetch organization certifications");
                const data = await response.json();

                // Normalizar dados do join OrganizationCertification + Certification
                return data.map((item: any) => ({
                    ...item.certification,
                    status: item.status,
                    progress: item.progress,
                    score: item.score,
                    benefits: item.certification.benefits || [],
                    evidence: item.certification.evidence || [],
                }));
            } else {
                const response = await fetch('/api/certifications');
                if (!response.ok) throw new Error("Failed to fetch certifications");
                const data = await response.json();

                // Normalizar dados globais
                return data.map((item: any) => ({
                    ...item,
                    status: 'pending',
                    progress: 0,
                    score: 0,
                    benefits: item.benefits || [],
                    evidence: item.evidence || [],
                }));
            }
        },
        ...queryConfigs.static,
    });
}
