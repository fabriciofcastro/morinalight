import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../../../prisma/client";

export async function registerListClienteTagsRoute(app: FastifyInstance) {
  app.get("/clientes/tags", async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.headers["x-org-id"] as string;

    if (!orgId) {
      return reply.status(400).send({ message: "x-org-id é obrigatório" });
    }

    try {
      const tags = await prisma.clienteTag.findMany({
        where: { orgId },
        orderBy: { name: "asc" },
      });

      return reply.send({
        tags: tags.map((tag) => ({
          id: tag.id,
          name: tag.name,
          color: tag.color || null,
        })),
      });
    } catch (error) {
      app.log.error(error, "Erro ao listar tags de clientes");
      return reply.status(500).send({ message: "Erro ao listar tags" });
    }
  });
}


