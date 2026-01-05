import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { AuditPermissionAnomaliesUseCase } from "../application/use-cases/audit-permission-anomalies.use-case";
import { FixPermissionAnomaliesUseCase } from "../application/use-cases/fix-permission-anomalies.use-case";
import type { PermissionAuditLogRepository } from "../domain/repositories/permission-audit-log-repository";

type Dependencies = {
    auditLogRepository: PermissionAuditLogRepository;
};

export async function registerPermissionAuditRoute(
    app: FastifyInstance,
    deps: Dependencies,
) {
    /**
     * POST /permissions/audit/run
     * Executa auditoria completa de permissões
     */
    app.post(
        "/audit/run",
        {
            schema: {
                tags: ["Permissions", "Audit"],
                summary: "Executar auditoria de permissões",
                description:
                    "Executa uma auditoria completa do sistema de permissões para identificar anomalias",
                body: z.object({
                    filters: z
                        .object({
                            includeOrphaned: z.boolean().optional(),
                            includeConflicts: z.boolean().optional(),
                            includeExcessive: z.boolean().optional(),
                            includeHierarchy: z.boolean().optional(),
                            includeAuditGaps: z.boolean().optional(),
                            includeObsolete: z.boolean().optional(),
                            includeSoD: z.boolean().optional(),
                            minSeverity: z.enum(["low", "medium", "high", "critical"]).optional(),
                            entityType: z
                                .enum(["user", "position", "sector", "department", "subdepartment"])
                                .optional(),
                            entityId: z.string().uuid().optional(),
                        })
                        .optional(),
                }),
                response: {
                    200: z.object({
                        id: z.string().uuid(),
                        orgId: z.string().uuid(),
                        timestamp: z.string().datetime(),
                        executedBy: z.string().uuid(),
                        summary: z.object({
                            totalPermissions: z.number(),
                            totalUsers: z.number(),
                            totalPositions: z.number(),
                            totalSectors: z.number(),
                            totalDepartments: z.number(),
                            anomaliesFound: z.number(),
                            conformityScore: z.number(),
                            criticalIssues: z.number(),
                            highSeverityIssues: z.number(),
                            mediumSeverityIssues: z.number(),
                            lowSeverityIssues: z.number(),
                        }),
                        orphanedPermissions: z.array(z.any()),
                        conflicts: z.array(z.any()),
                        excessivePermissions: z.array(z.any()),
                        hierarchyIssues: z.array(z.any()),
                        auditGaps: z.array(z.any()),
                        obsoletePermissions: z.array(z.any()),
                        sodViolations: z.array(z.any()),
                        recommendations: z.array(z.string()),
                    }),
                },
            },
        },
        async (request, reply) => {
            const { orgId, userId } = request.user;

            const useCase = new AuditPermissionAnomaliesUseCase({
                prisma: app.prisma,
            });

            const report = await useCase.execute({
                orgId,
                actorId: userId,
                filters: request.body.filters || {},
            });

            return reply.status(200).send({
                ...report,
                timestamp: report.timestamp.toISOString(),
            });
        },
    );

    /**
     * POST /permissions/audit/fix
     * Aplica correções automáticas nas anomalias
     */
    app.post(
        "/audit/fix",
        {
            schema: {
                tags: ["Permissions", "Audit"],
                summary: "Corrigir anomalias de permissões",
                description:
                    "Aplica correções automáticas nas anomalias identificadas pela auditoria",
                body: z.object({
                    options: z.object({
                        removeOrphaned: z.boolean().optional().default(false),
                        resolveConflicts: z.boolean().optional().default(false),
                        removeExcessive: z.boolean().optional().default(false),
                        fixHierarchy: z.boolean().optional().default(false),
                        backfillAudit: z.boolean().optional().default(false),
                        archiveObsolete: z.boolean().optional().default(false),
                        dryRun: z.boolean().optional().default(true),
                    }),
                    anomalies: z.object({
                        orphaned: z.array(z.any()).optional().default([]),
                        conflicts: z.array(z.any()).optional().default([]),
                        excessive: z.array(z.any()).optional().default([]),
                        hierarchy: z.array(z.any()).optional().default([]),
                        gaps: z.array(z.any()).optional().default([]),
                        obsolete: z.array(z.any()).optional().default([]),
                    }),
                }),
                response: {
                    200: z.object({
                        success: z.boolean(),
                        itemsFixed: z.number(),
                        errors: z.array(z.string()),
                        warnings: z.array(z.string()),
                        changes: z.array(
                            z.object({
                                type: z.string(),
                                entityId: z.string(),
                                permissionId: z.string(),
                                action: z.string(),
                                timestamp: z.string().datetime(),
                            }),
                        ),
                    }),
                },
            },
        },
        async (request, reply) => {
            const { orgId, userId } = request.user;

            const useCase = new FixPermissionAnomaliesUseCase({
                prisma: app.prisma,
                auditLogRepository: deps.auditLogRepository,
            });

            const result = await useCase.execute({
                orgId,
                actorId: userId,
                options: request.body.options,
                anomalies: request.body.anomalies,
            });

            return reply.status(200).send({
                ...result,
                changes: result.changes.map((c) => ({
                    ...c,
                    timestamp: c.timestamp.toISOString(),
                })),
            });
        },
    );

    /**
     * GET /permissions/audit/summary
     * Retorna resumo rápido da conformidade
     */
    app.get(
        "/audit/summary",
        {
            schema: {
                tags: ["Permissions", "Audit"],
                summary: "Resumo de conformidade",
                description:
                    "Retorna um resumo rápido do estado de conformidade das permissões",
                response: {
                    200: z.object({
                        conformityScore: z.number(),
                        totalAnomalies: z.number(),
                        criticalIssues: z.number(),
                        lastAudit: z.string().datetime().nullable(),
                        status: z.enum(["excellent", "good", "warning", "critical"]),
                    }),
                },
            },
        },
        async (request, reply) => {
            const { orgId, userId } = request.user;

            // Executar auditoria rápida (apenas contagens)
            const useCase = new AuditPermissionAnomaliesUseCase({
                prisma: app.prisma,
            });

            const report = await useCase.execute({
                orgId,
                actorId: userId,
                filters: {},
            });

            let status: "excellent" | "good" | "warning" | "critical";
            if (report.summary.conformityScore >= 95) {
                status = "excellent";
            } else if (report.summary.conformityScore >= 80) {
                status = "good";
            } else if (report.summary.conformityScore >= 60) {
                status = "warning";
            } else {
                status = "critical";
            }

            return reply.status(200).send({
                conformityScore: report.summary.conformityScore,
                status,
                anomaliesFound: report.summary.anomaliesFound,
                criticalIssues: report.summary.criticalIssues,
            });
        },
    );
}

