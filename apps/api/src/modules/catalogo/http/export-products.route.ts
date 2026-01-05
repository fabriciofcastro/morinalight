import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { getPrisma } from "../../../infra/database/prisma.service";
import { requireAuth } from "../../../core/auth/jwt.middleware";

const querySchema = z.object({
    format: z.enum(["csv", "json", "xlsx"]).default("csv"),
    status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
});

const prisma = getPrisma();

export async function registerExportProductsRoute(app: FastifyInstance) {
    app.get("/products/export", async (request: FastifyRequest, reply: FastifyReply) => {
        await requireAuth()(request, reply);
        if (reply.sent) return;

        if (!request.auth) {
            return reply.status(401).send({
                message: "Autenticação necessária",
                code: "UNAUTHORIZED",
            });
        }

        const query = querySchema.parse(request.query ?? {});

        // Buscar produtos
        const where: any = {};
        if (query.status) {
            where.status = query.status;
        }

        const products = await prisma.produto.findMany({
            where,
            select: {
                id: true,
                sku: true,
                name: true,
                description: true,
                costPrice: true,
                sellingPrice: true,
                status: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        });

        if (query.format === "json") {
            return reply
                .header("Content-Type", "application/json")
                .header("Content-Disposition", `attachment; filename="produtos_${new Date().toISOString().split("T")[0]}.json"`)
                .send(JSON.stringify(products, null, 2));
        }

        if (query.format === "csv") {
            const headers = ["ID", "SKU", "Nome", "Descrição", "Preço Custo", "Preço Venda", "Status", "Data de Criação"];
            const rows = products.map((p) => [
                p.id,
                p.sku,
                p.name,
                p.description || "",
                p.costPrice,
                p.sellingPrice,
                p.status,
                p.createdAt.toISOString(),
            ]);

            const csvContent = [
                headers.join(","),
                ...rows.map((row) =>
                    row
                        .map((cell) => {
                            const str = String(cell);
                            if (str.includes(",") || str.includes('"') || str.includes("\n")) {
                                return `"${str.replace(/"/g, '""')}"`;
                            }
                            return str;
                        })
                        .join(","),
                ),
            ].join("\n");

            return reply
                .header("Content-Type", "text/csv; charset=utf-8")
                .header("Content-Disposition", `attachment; filename="produtos_${new Date().toISOString().split("T")[0]}.csv"`)
                .send(csvContent);
        }

        return reply.send({
            message: "Formato xlsx será implementado em breve. Use CSV ou JSON.",
            format: query.format,
            products,
        });
    });
}
