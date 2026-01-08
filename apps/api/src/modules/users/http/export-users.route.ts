import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import { getPrisma } from "../../../infra/database/prisma.service";

const querySchema = z.object({
  format: z.enum(["csv", "json", "xlsx"]).default("csv"),
  status: z.enum(["pending", "active", "suspended"]).optional(),
});

const prisma = getPrisma();

export async function registerExportUsersRoute(app: FastifyInstance) {
  app.post("/users/export", async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const query = querySchema.parse(request.query ?? {});

    // Buscar usuários
    const where: any = {};
    if (query.status) {
      where.status = query.status;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        displayName: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (query.format === "json") {
      return reply
        .header("Content-Type", "application/json")
        .header(
          "Content-Disposition",
          `attachment; filename="usuarios_${new Date().toISOString().split("T")[0]}.json"`,
        )
        .send(JSON.stringify(users, null, 2));
    }

    if (query.format === "csv") {
      const headers = ["ID", "Email", "Nome", "Status", "Último Login", "Data de Criação"];
      const rows = users.map((user) => [
        user.id,
        user.email,
        user.displayName || "",
        user.status,
        user.lastLoginAt ? user.lastLoginAt.toISOString() : "",
        user.createdAt.toISOString(),
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
          `attachment; filename="usuarios_${new Date().toISOString().split("T")[0]}.csv"`,
        )
        .send(csvContent);
    }

    // Para xlsx, retornar JSON por enquanto (implementar biblioteca xlsx se necessário)
    return reply.send({
      message: "Formato xlsx será implementado em breve. Use CSV ou JSON.",
      format: query.format,
      users,
    });
  });
}
