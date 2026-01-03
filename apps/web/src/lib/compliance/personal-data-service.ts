
import { getPrismaClient } from "@/lib/prisma";
import { logger } from "@/lib/observability";

export interface PersonalDataReport {
    userId: string;
    generatedAt: Date;
    data: {
        profile: any;
        sessions: any[];
        securityAlerts: any[];
    };
}

export class PersonalDataService {
    /**
     * Gera um relatório completo de dados pessoais (Direito à Portabilidade)
     */
    async generateReport(userId: string): Promise<PersonalDataReport | null> {
        const prisma = await getPrismaClient();
        if (!prisma) return null;

        try {
            // 1. Profile Data
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    displayName: true,
                    email: true,
                    createdAt: true,
                    updatedAt: true,
                    lastLoginAt: true,
                }
            });

            if (!user) return null;

            // 2. Security Alerts
            const alerts = await prisma.securityAlert.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 50
            });

            return {
                userId,
                generatedAt: new Date(),
                data: {
                    profile: user,
                    sessions: [], // TODO: Implement session storage tracking if added later
                    securityAlerts: alerts
                }
            };
        } catch (error) {
            logger.error(`Failed to generate personal data report for ${userId}`, error as Error);
            throw error;
        }
    }

    /**
     * Anonimiza os dados do usuário (Direito ao Esquecimento)
     * Mantém o ID para integridade referencial, mas remove PII.
     */
    async anonymizeUser(userId: string): Promise<boolean> {
        const prisma = await getPrismaClient();
        if (!prisma) return false;

        try {
            // Transaction to ensure atomicity
            await prisma.$transaction(async (tx) => {
                const timestamp = Date.now();
                const anonymousEmail = `deleted_${userId}_${timestamp}@anon.morinalight.com`;

                // 1. Anonymize User Record
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        displayName: "Anonymized User",
                        email: anonymousEmail,
                        passwordHash: "DELETED",
                        // Clear optional fields if they existed in your schema
                        // Assuming basic schema for now
                    }
                });
            });

            logger.info(`User ${userId} successfully anonymized`);
            return true;

        } catch (error) {
            logger.error(`Failed to anonymize user ${userId}`, error as Error);
            throw error;
        }
    }
}

export const personalDataService = new PersonalDataService();
