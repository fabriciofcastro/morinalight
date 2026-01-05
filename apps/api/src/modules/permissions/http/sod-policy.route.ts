import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getSoDPolicyEngine } from "../services/sod-policy-engine.service";

export async function registerSoDPolicyRoutes(app: FastifyInstance) {
    const sodEngine = getSoDPolicyEngine();

    /**
     * GET /permissions/sod/policies
     * Lista todas as políticas SoD da organização
     */
    app.get(
        "/sod/policies",
        {
            schema: {
                tags: ["Permissions", "SoD"],
                summary: "Listar políticas SoD",
                response: {
                    200: z.object({
                        policies: z.array(
                            z.object({
                                id: z.string(),
                                name: z.string(),
                                description: z.string(),
                                conflictingPermissions: z.array(z.array(z.string())),
                                severity: z.enum(["low", "medium", "high", "critical"]),
                                active: z.boolean(),
                            }),
                        ),
                    }),
                },
            },
        },
        async (request, reply) => {
            const { orgId } = request.user;

            const policies = await app.prisma.soDPolicy.findMany({
                where: { orgId },
                orderBy: { createdAt: "desc" },
            });

            return reply.status(200).send({ policies });
        },
    );

    /**
     * POST /permissions/sod/policies
     * Cria nova política SoD
     */
    app.post(
        "/sod/policies",
        {
            schema: {
                tags: ["Permissions", "SoD"],
                summary: "Criar política SoD",
                body: z.object({
                    name: z.string(),
                    description: z.string(),
                    conflictingPermissions: z.array(z.array(z.string())),
                    severity: z.enum(["low", "medium", "high", "critical"]),
                }),
                response: {
                    201: z.object({
                        id: z.string(),
                        message: z.string(),
                    }),
                },
            },
        },
        async (request, reply) => {
            const { orgId } = request.user;
            const { name, description, conflictingPermissions, severity } = request.body;

            const policy = await app.prisma.soDPolicy.create({
                data: {
                    orgId,
                    name,
                    description,
                    conflictingPermissions,
                    severity,
                    active: true,
                },
            });

            return reply.status(201).send({
                id: policy.id,
                message: "Política criada com sucesso",
            });
        },
    );

    /**
     * DELETE /permissions/sod/policies/:id
     * Deleta política SoD
     */
    app.delete(
        "/sod/policies/:id",
        {
            schema: {
                tags: ["Permissions", "SoD"],
                summary: "Deletar política SoD",
                params: z.object({
                    id: z.string().uuid(),
                }),
            },
        },
        async (request, reply) => {
            const { orgId } = request.user;
            const { id } = request.params;

            await app.prisma.soDPolicy.deleteMany({
                where: { id, orgId },
            });

            return reply.status(200).send({ message: "Política deletada" });
        },
    );

    /**
     * PATCH /permissions/sod/policies/:id/toggle
     * Ativa/desativa política SoD
     */
    app.patch(
        "/sod/policies/:id/toggle",
        {
            schema: {
                tags: ["Permissions", "SoD"],
                summary: "Ativar/desativar política SoD",
                params: z.object({
                    id: z.string().uuid(),
                }),
                body: z.object({
                    active: z.boolean(),
                }),
            },
        },
        async (request, reply) => {
            const { orgId } = request.user;
            const { id } = request.params;
            const { active } = request.body;

            await app.prisma.soDPolicy.updateMany({
                where: { id, orgId },
                data: { active },
            });

            return reply.status(200).send({ message: "Política atualizada" });
        },
    );

    /**
     * GET /permissions/sod/violations
     * Lista violações de SoD
     */
    app.get(
        "/sod/violations",
        {
            schema: {
                tags: ["Permissions", "SoD"],
                summary: "Listar violações SoD",
                response: {
                    200: z.object({
                        violations: z.array(z.any()),
                    }),
                },
            },
        },
        async (request, reply) => {
            const { orgId } = request.user;

            const violations = await sodEngine.validateAllUsers(orgId);
            const violationArray = Array.from(violations.values()).flat();

            return reply.status(200).send({ violations: violationArray });
        },
    );

    /**
     * POST /permissions/sod/simulate
     * Simula aplicação de política SoD
     */
    app.post(
        "/sod/simulate",
        {
            schema: {
                tags: ["Permissions", "SoD"],
                summary: "Simular política SoD",
                body: z.object({
                    conflictingPermissions: z.array(z.array(z.string())),
                }),
                response: {
                    200: z.object({
                        affectedUsers: z.number(),
                        violations: z.array(z.any()),
                    }),
                },
            },
        },
        async (request, reply) => {
            const { orgId } = request.user;
            const { conflictingPermissions } = request.body;

            const result = await sodEngine.simulatePolicy(conflictingPermissions, orgId);

            return reply.status(200).send(result);
        },
    );
}
