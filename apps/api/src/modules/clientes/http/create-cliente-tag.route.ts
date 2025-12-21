import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../../../prisma/client";

export async function registerCreateClienteTagRoute(app: FastifyInstance) {
  app.post("/clientes/tags", async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.headers["x-org-id"] as string;
    const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;

    if (!orgId) {
      return reply.status(400).send({ message: "x-org-id é obrigatório" });
    }

    try {
      const body = request.body as { name: string; color?: string };

      if (!body.name || body.name.trim().length === 0) {
        return reply.status(400).send({ message: "Nome da tag é obrigatório" });
      }

      // Verificar se já existe
      const existing = await prisma.clienteTag.findUnique({
        where: {
          orgId_name: {
            orgId,
            name: body.name.trim(),
          },
        },
      });

      if (existing) {
        return reply.status(409).send({
          message: "Tag já existe",
          tag: {
            id: existing.id,
            name: existing.name,
            color: existing.color || null,
          },
        });
      }

      const tag = await prisma.clienteTag.create({
        data: {
          orgId,
          name: body.name.trim(),
          color: body.color || null,
        },
      });

      return reply.status(201).send({
        id: tag.id,
        name: tag.name,
        color: tag.color || null,
      });
    } catch (error) {
      app.log.error(error, "Erro ao criar tag de cliente");
      return reply.status(500).send({ message: "Erro ao criar tag" });
    }
  });
}


