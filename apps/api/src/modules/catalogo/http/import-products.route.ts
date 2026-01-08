import { randomUUID } from "node:crypto";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import { getPrisma } from "../../../infra/database/prisma.service";

const importProductsSchema = z.object({
  products: z.array(
    z.object({
      sku: z.string(),
      name: z.string(),
      description: z.string().optional().nullable(),
      costPrice: z.number().optional().default(0),
      sellingPrice: z.number().optional().default(0),
      status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).default("ACTIVE"),
      unit: z.string().default("UN"),
    }),
  ),
});

const prisma = getPrisma();

export async function registerImportProductsRoute(app: FastifyInstance) {
  app.post("/products/import", async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const body = importProductsSchema.parse(request.body ?? {});

    const results = await Promise.allSettled(
      body.products.map(async (data) => {
        try {
          // Check if SKU already exists
          const existing = await prisma.produto.findFirst({
            where: { sku: data.sku },
          });
          if (existing) {
            return { sku: data.sku, success: false, error: "SKU já cadastrado" };
          }

          const product = await prisma.produto.create({
            data: {
              id: randomUUID(),
              sku: data.sku,
              name: data.name,
              description: data.description,
              costPrice: data.costPrice,
              sellingPrice: data.sellingPrice,
              status: data.status,
              unit: data.unit,
              categoryId: "default", // Categoria padrão ou placeholder
            },
          });

          return { sku: data.sku, success: true, id: product.id };
        } catch (error) {
          return {
            sku: data.sku,
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
      total: body.products.length,
      errors,
    });
  });
}
