import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../../../prisma/client";

export async function registerDeleteClienteContactRoute(app: FastifyInstance) {
  app.delete("/clientes/:clienteId/contatos/:contatoId", async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.headers["x-org-id"] as string;
    const { clienteId, contatoId } = request.params as { clienteId: string; contatoId: string };

    if (!orgId) {
      return reply.status(400).send({ message: "x-org-id é obrigatório" });
    }

    try {
      // Verificar se o cliente existe e pertence à organização
      const cliente = await prisma.cliente.findUnique({
        where: { id: clienteId },
      });

      if (!cliente || cliente.orgId !== orgId) {
        return reply.status(404).send({ message: "Cliente não encontrado" });
      }

      // Verificar se o contato existe
      const contato = await prisma.clienteContact.findUnique({
        where: { id: contatoId },
      });

      if (!contato || contato.clienteId !== clienteId) {
        return reply.status(404).send({ message: "Contato não encontrado" });
      }

      await prisma.clienteContact.delete({
        where: { id: contatoId },
      });

      return reply.status(204).send();
    } catch (error) {
      app.log.error(error, "Erro ao deletar contato do cliente");
      return reply.status(500).send({ message: "Erro ao deletar contato" });
    }
  });
}


