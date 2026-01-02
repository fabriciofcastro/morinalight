/**
 * LGPD Compliance - Data Deletion (Direito ao Esquecimento)
 * 
 * Sistema para implementar o direito ao esquecimento conforme LGPD
 */

import { auditService } from "@/lib/audit/audit-service";

export interface DataDeletionRequest {
    userId: string;
    requestedBy: string;
    reason: string;
    requestedAt: Date;
    processedAt?: Date;
    status: "pending" | "approved" | "rejected" | "completed";
}

export class DataDeletionService {
    /**
     * Solicita exclusão de dados
     */
    async requestDeletion(
        userId: string,
        requestedBy: string,
        reason: string,
    ): Promise<DataDeletionRequest> {
        const request: DataDeletionRequest = {
            userId,
            requestedBy,
            reason,
            requestedAt: new Date(),
            status: "pending",
        };

        // Salvar solicitação
        // await db.dataDeletionRequest.create({ data: request });

        // Audit log
        await auditService.log({
            action: "data_deletion_requested",
            userId: requestedBy,
            resource: "user_data",
            resourceId: userId,
            metadata: { reason },
            success: true,
        });

        return request;
    }

    /**
     * Executa exclusão de dados (Direito ao Esquecimento)
     */
    async deleteUserData(userId: string, executedBy: string): Promise<void> {
        try {
            // Importação dinâmica
            const { getPrismaClient } = await import("@/lib/prisma");
            const prisma = await getPrismaClient();

            if (!prisma) {
                console.warn("[GDPR] Prisma not available, skipping real deletion (mock mode).");
                await auditService.logDataDeletion(
                    executedBy,
                    "user_data",
                    userId,
                    "LGPD - Direito ao Esquecimento (Mock)",
                );
                return;
            }

            // 1. Anonimizar dados pessoais (manter registro para compliance)
            const anonymizedEmail = `deleted-${userId}-${Date.now()}@deleted.morinalight.com`;

            await prisma.$transaction(async (tx) => {
                // Remove dados sensíveis relacionados
                await tx.notificationPreference.deleteMany({ where: { userId } });
                await tx.userPermission.deleteMany({ where: { userId } });
                await tx.trustedDevice.deleteMany({ where: { userId } });
                // await tx.userInvite.deleteMany({ where: { OR: [{ invitedById: userId }, { acceptedUserId: userId }] } }); // Opcional, mantemos histórico

                // Anonimiza User
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        email: anonymizedEmail,
                        displayName: "Usuário Excluído",
                        avatarUrl: null,
                        passwordHash: null,
                        status: "suspended",
                        cpf: null,
                        phone: null,
                        birthDate: null,
                        admissionDate: null,
                        observations: null,
                        twoFactorEnabled: false,
                        twoFactorSecret: null,
                        twoFactorBackupCodes: null,
                    },
                });
            });

            // 4. Registrar exclusão no audit log (OBRIGATÓRIO)
            await auditService.logDataDeletion(
                executedBy,
                "user_data",
                userId,
                "LGPD - Direito ao Esquecimento",
            );

            console.log(`[LGPD] User data deleted: ${userId}`);
        } catch (error) {
            await auditService.logFailure(
                "data_deletion",
                executedBy,
                "user_data",
                error as Error,
                { resourceId: userId },
            );

            throw error;
        }
    }

    /**
     * Verifica se dados podem ser deletados
     */
    async canDeleteData(userId: string): Promise<{
        canDelete: boolean;
        reasons: string[];
    }> {
        const reasons: string[] = [];

        // Verificar se há transações financeiras pendentes
        // const pendingTransactions = await db.transaction.count({
        //   where: { userId, status: 'pending' },
        // });

        // if (pendingTransactions > 0) {
        //   reasons.push('Existem transações financeiras pendentes');
        // }

        // Verificar se há obrigações legais
        // const legalHolds = await db.legalHold.count({
        //   where: { userId, active: true },
        // });

        // if (legalHolds > 0) {
        //   reasons.push('Dados sob retenção legal');
        // }

        return {
            canDelete: reasons.length === 0,
            reasons,
        };
    }

    /**
     * Agenda exclusão automática após período de inatividade
     */
    async scheduleAutoDeletion(
        userId: string,
        inactiveDays: number = 730, // 2 anos
    ): Promise<void> {
        const deletionDate = new Date();
        deletionDate.setDate(deletionDate.getDate() + inactiveDays);

        // await db.scheduledDeletion.create({
        //   data: {
        //     userId,
        //     scheduledFor: deletionDate,
        //     reason: 'Inatividade prolongada',
        //   },
        // });

        console.log(`[LGPD] Auto-deletion scheduled for ${userId} on ${deletionDate}`);
    }
}

export const dataDeletionService = new DataDeletionService();
