import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import { getPrisma } from "../../../infra/database/prisma.service";

const querySchema = z.object({
  format: z.enum(["csv", "json", "xlsx"]).default("csv"),
  status: z.enum(["ACTIVE", "INACTIVE", "LEAD", "BLOCKED"]).optional(),
});

const prisma = getPrisma();

export async function registerExportClientesRoute(app: FastifyInstance) {
  app.get("/clientes/export", async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const query = querySchema.parse(request.query ?? {});
    const orgId = request.headers["x-org-id"] as string;

    // Buscar clientes
    const where: any = {
      orgId: orgId || undefined,
    };
    if (query.status) {
      where.status = query.status;
    }

    const clientes = await prisma.cliente.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        document: true,
        status: true,
        type: true,
        city: true,
        state: true,
        creditLimit: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (query.format === "json") {
      return reply
        .header("Content-Type", "application/json")
        .header(
          "Content-Disposition",
          `attachment; filename="clientes_${new Date().toISOString().split("T")[0]}.json"`,
        )
        .send(JSON.stringify(clientes, null, 2));
    }

    if (query.format === "csv") {
      const headers = [
        "ID",
        "Nome",
        "Email",
        "Telefone",
        "Documento",
        "Status",
        "Tipo",
        "Cidade",
        "UF",
        "Limite de Crédito",
        "Data de Criação",
      ];
      const rows = clientes.map((c) => [
        c.id,
        c.name,
        c.email || "",
        c.phone || "",
        c.document || "",
        c.status,
        c.type,
        c.city || "",
        c.state || "",
        c.creditLimit || 0,
        c.createdAt.toISOString(),
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
        .header(
          "Content-Disposition",
          `attachment; filename="clientes_${new Date().toISOString().split("T")[0]}.csv"`,
        )
        .send(csvContent);
    }

    return reply.send({
      message: "Formato xlsx será implementado em breve. Use CSV ou JSON.",
      format: query.format,
      clientes,
    });
  });
}
