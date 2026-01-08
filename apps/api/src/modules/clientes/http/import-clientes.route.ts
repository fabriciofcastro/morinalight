import { randomUUID } from "node:crypto";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import { getPrisma } from "../../../infra/database/prisma.service";

const importClientesSchema = z.object({
  clientes: z.array(
    z.object({
      name: z.string(),
      email: z.string().email().optional().nullable(),
      document: z.string().optional().nullable(),
      phone: z.string().optional().nullable(),
      type: z.enum(["PF", "PJ"]).default("PJ"),
      status: z.enum(["ACTIVE", "INACTIVE", "LEAD", "BLOCKED"]).default("ACTIVE"),
    }),
  ),
});

const prisma = getPrisma();

export async function registerImportClientesRoute(app: FastifyInstance) {
  app.post("/clientes/import", async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const orgId = request.headers["x-org-id"] as string;
    const body = importClientesSchema.parse(request.body ?? {});

    const results = await Promise.allSettled(
      body.clientes.map(async (data) => {
        try {
          // Check if document already exists in this org
          if (data.document) {
            const existing = await prisma.cliente.findFirst({
              where: { document: data.document, orgId },
            });
            if (existing) {
              return { name: data.name, success: false, error: "Documento já cadastrado" };
            }
          }

          const cliente = await prisma.cliente.create({
            data: {
              id: randomUUID(),
              orgId: orgId || "1",
              name: data.name,
              email: data.email,
              document: data.document,
              phone: data.phone,
              type: data.type,
              status: data.status,
              totalPurchases: 0,
            },
          });

          return { name: data.name, success: true, id: cliente.id };
        } catch (error) {
          return {
            name: data.name,
            success: false,
            error: error instanceof Error ? error.message : "Erro desconhecido",
          };
        }
      }),
    );

    const imported = results.filter((r) => r.status === "fulfilled" && r.value.success).length;
    const errors = results
      .map((r) =>
        r.status === "fulfilled" ? r.value : { success: false, error: "Erro ao processar" },
      )
      .filter((r) => !r.success);

    return reply.send({
      imported,
      total: body.clientes.length,
      errors,
    });
  });
}
