import { getPrisma } from "../../../infra/database/prisma.service";

const prisma = getPrisma();

export type UserFeatures = {
    userId: string;
    permissionCount: number;
    roleCount: number;
    uniqueModules: number;
    hasAdminPermissions: boolean;
    hasCriticalPermissions: boolean;
    permissionChangeFrequency: number; // mudanças nos últimos 30 dias
    lastActivityDays: number;
    accessPatternScore: number; // 0-1
    sodViolations: number;
    avgPermissionsPerRole: number;
};

export type AnomalyPrediction = {
    userId: string;
    isAnomaly: boolean;
    anomalyScore: number; // 0-1 (quanto maior, mais anômalo)
    confidence: number; // 0-1
    reasons: string[];
    features: UserFeatures;
};

export class MLFeatureExtractor {
    async extractUserFeatures(userId: string, orgId: string): Promise<UserFeatures> {
        try {
            // Buscar permissões do usuário
            const userRoles = await prisma.userRole.findMany({
                where: {
                    userId,
                    role: { orgId },
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

            const roleCount = userRoles.length;
            const allPermissions = new Set<string>();
            const modules = new Set<string>();

            for (const userRole of userRoles) {
                for (const rolePermission of userRole.role.permissions) {
                    const permKey = rolePermission.permission.key;
                    allPermissions.add(permKey);

                    // Extrair módulo (primeira parte antes do ponto)
                    const module = permKey.split(".")[0];
                    modules.add(module);
                }
            }

            const permissionCount = allPermissions.size;
            const uniqueModules = modules.size;

            // Verificar permissões críticas
            const criticalKeywords = ["admin", "delete", "approve", "execute", "deploy"];
            const hasCriticalPermissions = Array.from(allPermissions).some((perm) =>
                criticalKeywords.some((keyword) => perm.toLowerCase().includes(keyword))
            );

            const hasAdminPermissions = Array.from(allPermissions).some((perm) =>
                perm.toLowerCase().includes("admin")
            );

            // Calcular frequência de mudanças (últimos 30 dias)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const recentChanges = await prisma.auditEvent.count({
                where: {
                    userId,
                    action: { in: ["PERMISSION_GRANTED", "PERMISSION_REVOKED", "ROLE_ASSIGNED"] },
                    timestamp: { gte: thirtyDaysAgo },
                },
            });

            // Última atividade
            const lastActivity = await prisma.auditEvent.findFirst({
                where: { userId },
                orderBy: { timestamp: "desc" },
            });

            const lastActivityDays = lastActivity
                ? Math.floor((Date.now() - lastActivity.timestamp.getTime()) / (1000 * 60 * 60 * 24))
                : 999;

            // Access pattern score (simplificado)
            const accessPatternScore = this.calculateAccessPatternScore(
                permissionCount,
                roleCount,
                uniqueModules
            );

            // SoD violations (placeholder - seria integrado com SoDPolicyEngine)
            const sodViolations = 0;

            // Média de permissões por role
            const avgPermissionsPerRole = roleCount > 0 ? permissionCount / roleCount : 0;

            return {
                userId,
                permissionCount,
                roleCount,
                uniqueModules,
                hasAdminPermissions,
                hasCriticalPermissions,
                permissionChangeFrequency: recentChanges,
                lastActivityDays,
                accessPatternScore,
                sodViolations,
                avgPermissionsPerRole,
            };
        } catch (error) {
            console.error("Error extracting user features:", error);
            throw error;
        }
    }

    async extractAllUsersFeatures(orgId: string): Promise<UserFeatures[]> {
        try {
            const users = await prisma.user.findMany({
                where: {
                    organizations: {
                        some: { id: orgId },
                    },
                },
                select: { id: true },
            });

            const features: UserFeatures[] = [];

            for (const user of users) {
                const userFeatures = await this.extractUserFeatures(user.id, orgId);
                features.push(userFeatures);
            }

            return features;
        } catch (error) {
            console.error("Error extracting all users features:", error);
            return [];
        }
    }

    private calculateAccessPatternScore(
        permissionCount: number,
        roleCount: number,
        uniqueModules: number
    ): number {
        // Heurística simples: usuários normais têm 1-3 roles, 5-20 permissões, 2-5 módulos
        const roleScore = Math.min(roleCount / 3, 1);
        const permScore = Math.min(permissionCount / 20, 1);
        const moduleScore = Math.min(uniqueModules / 5, 1);

        return (roleScore + permScore + moduleScore) / 3;
    }

    normalizeFeatures(features: UserFeatures): number[] {
        // Normalizar features para 0-1
        return [
            Math.min(features.permissionCount / 50, 1),
            Math.min(features.roleCount / 5, 1),
            Math.min(features.uniqueModules / 10, 1),
            features.hasAdminPermissions ? 1 : 0,
            features.hasCriticalPermissions ? 1 : 0,
            Math.min(features.permissionChangeFrequency / 10, 1),
            Math.min(features.lastActivityDays / 90, 1),
            features.accessPatternScore,
            Math.min(features.sodViolations / 3, 1),
            Math.min(features.avgPermissionsPerRole / 10, 1),
        ];
    }
}

// Singleton
let featureExtractorInstance: MLFeatureExtractor | null = null;

export function getMLFeatureExtractor(): MLFeatureExtractor {
    if (!featureExtractorInstance) {
        featureExtractorInstance = new MLFeatureExtractor();
    }
    return featureExtractorInstance;
}
