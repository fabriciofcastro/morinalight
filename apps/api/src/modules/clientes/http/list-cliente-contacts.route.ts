import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../../../prisma/client";

export async function registerListClienteContactsRoute(app: FastifyInstance) {
  app.get("/clientes/:clienteId/contatos", async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.headers["x-org-id"] as string;
    const { clienteId } = request.params as { clienteId: string };

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

      const contatos = await prisma.clienteContact.findMany({
        where: { clienteId },
        orderBy: [
          { isPrincipal: "desc" },
          { createdAt: "asc" },
        ],
      });

      return reply.send({
        contatos: contatos.map((contato) => ({
          id: contato.id,
          clienteId: contato.clienteId,
          name: contato.name,
          email: contato.email || null,
          phone: contato.phone || null,
          celular: contato.celular || null,
          cargo: contato.cargo || null,
          departamento: contato.departamento || null,
          tipo: contato.tipo,
          isPrincipal: contato.isPrincipal,
          notes: contato.notes || null,
          createdAt: contato.createdAt,
          updatedAt: contato.updatedAt,
        })),
      });
    } catch (error) {
      app.log.error(error, "Erro ao listar contatos do cliente");
      return reply.status(500).send({ message: "Erro ao listar contatos" });
    }
  });
}


