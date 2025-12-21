import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../../../prisma/client";

export async function registerUpdateClienteTagsRoute(app: FastifyInstance) {
  app.put("/clientes/:clienteId/tags", async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.headers["x-org-id"] as string;
    const { clienteId } = request.params as { clienteId: string };

    if (!orgId) {
      return reply.status(400).send({ message: "x-org-id é obrigatório" });
    }

    try {
      const body = request.body as { tagIds: string[] };

      // Verificar se o cliente existe
      const cliente = await prisma.cliente.findUnique({
        where: { id: clienteId },
      });

      if (!cliente || cliente.orgId !== orgId) {
        return reply.status(404).send({ message: "Cliente não encontrado" });
      }

      // Remover todas as tags atuais
      await prisma.clienteTagRelation.deleteMany({
        where: { clienteId },
      });

      // Adicionar novas tags
      if (body.tagIds && body.tagIds.length > 0) {
        // Verificar se todas as tags pertencem à organização
        const tags = await prisma.clienteTag.findMany({
          where: {
            id: { in: body.tagIds },
            orgId,
          },
        });

        if (tags.length !== body.tagIds.length) {
          return reply.status(400).send({ message: "Uma ou mais tags não foram encontradas" });
        }

        await prisma.clienteTagRelation.createMany({
          data: body.tagIds.map((tagId) => ({
            clienteId,
            tagId,
          })),
        });
      }

      // Retornar tags atualizadas
      const tagsAtualizadas = await prisma.clienteTagRelation.findMany({
        where: { clienteId },
        include: {
          tag: true,
        },
      });

      return reply.send({
        tags: tagsAtualizadas.map((rel) => ({
          id: rel.tag.id,
          name: rel.tag.name,
          color: rel.tag.color || null,
        })),
      });
    } catch (error) {
      app.log.error(error, "Erro ao atualizar tags do cliente");
      return reply.status(500).send({ message: "Erro ao atualizar tags" });
    }
  });
}


