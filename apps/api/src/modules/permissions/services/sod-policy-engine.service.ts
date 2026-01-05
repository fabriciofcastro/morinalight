import { getPrisma } from "../../../infra/database/prisma.service";
import type { SoDPolicy, SoDViolation } from "../domain/models/sod-policy.model";

const prisma = getPrisma();

export class SoDPolicyEngine {
    async validateUser(userId: string, orgId: string): Promise<SoDViolation[]> {
        try {
            // Buscar políticas ativas da organização
            const policies = await prisma.soDPolicy.findMany({
                where: {
                    orgId,
                    active: true,
                },
            });

            if (policies.length === 0) {
                return [];
            }

            // Buscar permissões efetivas do usuário
            const userPermissions = await this.getUserPermissions(userId, orgId);

            // Verificar violações
            const violations: SoDViolation[] = [];

            for (const policy of policies) {
                const policyViolations = this.checkPolicyViolations(
                    policy as any,
                    userId,
                    userPermissions
                );
                violations.push(...policyViolations);
            }

            return violations;
        } catch (error) {
            console.error("Error validating user SoD:", error);
            return [];
        }
    }

    async validateAllUsers(orgId: string): Promise<Map<string, SoDViolation[]>> {
        try {
            // Buscar todos os usuários da organização
            const users = await prisma.user.findMany({
                where: {
                    organizations: {
                        some: {
                            id: orgId,
                        },
                    },
                },
                select: {
                    id: true,
                    email: true,
                },
            });

            const violationsByUser = new Map<string, SoDViolation[]>();

            for (const user of users) {
                const violations = await this.validateUser(user.id, orgId);
                if (violations.length > 0) {
                    violationsByUser.set(user.id, violations);
                }
            }

            return violationsByUser;
        } catch (error) {
            console.error("Error validating all users SoD:", error);
            return new Map();
        }
    }

    private async getUserPermissions(userId: string, orgId: string): Promise<string[]> {
        try {
            // Buscar permissões através de roles
            const userRoles = await prisma.userRole.findMany({
                where: {
                    userId,
                    role: {
                        orgId,
                    },
                },
                include: {
                    role: {
                        include: {
                            permissions: {
                                include: {
                                    permission: true,
                                },
                            },
                        },
                    },
                },
            });

            const permissions = new Set<string>();

            for (const userRole of userRoles) {
                for (const rolePermission of userRole.role.permissions) {
                    permissions.add(rolePermission.permission.key);
                }
            }

            return Array.from(permissions);
        } catch (error) {
            console.error("Error getting user permissions:", error);
            return [];
        }
    }

    private checkPolicyViolations(
        policy: SoDPolicy,
        userId: string,
        userPermissions: string[]
    ): SoDViolation[] {
        const violations: SoDViolation[] = [];
        const conflictingGroups = policy.conflictingPermissions as string[][];

        for (const conflictGroup of conflictingGroups) {
            // Verificar se o usuário tem TODAS as permissões do grupo conflitante
            const hasAllConflicting = conflictGroup.every((perm) =>
                userPermissions.includes(perm)
            );

            if (hasAllConflicting) {
                violations.push({
                    policyId: policy.id,
                    policyName: policy.name,
                    userId,
                    userEmail: "", // Será preenchido posteriormente
                    conflictingPermissions: conflictGroup,
                    severity: policy.severity,
                    detectedAt: new Date(),
                });
            }
        }

        return violations;
    }

    async applyPolicy(policyId: string, orgId: string): Promise<SoDViolation[]> {
        try {
            const policy = await prisma.soDPolicy.findUnique({
                where: { id: policyId },
            });

            if (!policy || policy.orgId !== orgId) {
                throw new Error("POLICY_NOT_FOUND");
            }

            // Ativar política
            await prisma.soDPolicy.update({
                where: { id: policyId },
                data: { active: true },
            });

            // Validar todos os usuários com a nova política
            const violations = await this.validateAllUsers(orgId);

            // Converter Map para array
            const allViolations: SoDViolation[] = [];
            for (const [userId, userViolations] of violations.entries()) {
                allViolations.push(...userViolations);
            }

            return allViolations;
        } catch (error) {
            console.error("Error applying policy:", error);
            throw error;
        }
    }

    async simulatePolicy(
        conflictingPermissions: string[][],
        orgId: string
    ): Promise<{ affectedUsers: number; violations: SoDViolation[] }> {
        try {
            // Criar política temporária (não salva no banco)
            const tempPolicy: SoDPolicy = {
                id: "temp",
                orgId,
                name: "Simulação",
                description: "Política temporária para simulação",
                conflictingPermissions,
                severity: "medium",
                active: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Buscar todos os usuários
            const users = await prisma.user.findMany({
                where: {
                    organizations: {
                        some: { id: orgId },
                    },
                },
                select: { id: true, email: true },
            });

            const violations: SoDViolation[] = [];

            for (const user of users) {
                const userPermissions = await this.getUserPermissions(user.id, orgId);
                const userViolations = this.checkPolicyViolations(
                    tempPolicy,
                    user.id,
                    userPermissions
                );

                // Adicionar email do usuário
                for (const violation of userViolations) {
                    violation.userEmail = user.email;
                }

                violations.push(...userViolations);
            }

            return {
                affectedUsers: new Set(violations.map((v) => v.userId)).size,
                violations,
            };
        } catch (error) {
            console.error("Error simulating policy:", error);
            return { affectedUsers: 0, violations: [] };
        }
    }
}

// Singleton instance
let sodPolicyEngineInstance: SoDPolicyEngine | null = null;

export function getSoDPolicyEngine(): SoDPolicyEngine {
    if (!sodPolicyEngineInstance) {
        sodPolicyEngineInstance = new SoDPolicyEngine();
    }
    return sodPolicyEngineInstance;
}
