import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../../../prisma/client";

export async function registerUpdateClienteContactRoute(app: FastifyInstance) {
  app.put("/clientes/:clienteId/contatos/:contatoId", async (request: FastifyRequest, reply: FastifyReply) => {
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
      const contatoExistente = await prisma.clienteContact.findUnique({
        where: { id: contatoId },
      });

      if (!contatoExistente || contatoExistente.clienteId !== clienteId) {
        return reply.status(404).send({ message: "Contato não encontrado" });
      }

      const body = request.body as {
        name?: string;
        email?: string | null;
        phone?: string | null;
        celular?: string | null;
        cargo?: string | null;
        departamento?: string | null;
        tipo?: string;
        isPrincipal?: boolean;
        notes?: string | null;
      };

      // Se este contato for marcado como principal, desmarcar os outros
      if (body.isPrincipal === true) {
        await prisma.clienteContact.updateMany({
          where: { clienteId, isPrincipal: true, id: { not: contatoId } },
          data: { isPrincipal: false },
        });
      }

      const contato = await prisma.clienteContact.update({
        where: { id: contatoId },
        data: {
          ...(body.name && { name: body.name.trim() }),
          ...(body.email !== undefined && { email: body.email?.trim() || null }),
          ...(body.phone !== undefined && { phone: body.phone?.trim() || null }),
          ...(body.celular !== undefined && { celular: body.celular?.trim() || null }),
          ...(body.cargo !== undefined && { cargo: body.cargo?.trim() || null }),
          ...(body.departamento !== undefined && { departamento: body.departamento?.trim() || null }),
          ...(body.tipo && { tipo: body.tipo }),
          ...(body.isPrincipal !== undefined && { isPrincipal: body.isPrincipal }),
          ...(body.notes !== undefined && { notes: body.notes?.trim() || null }),
        },
      });

      return reply.send({
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
      });
    } catch (error) {
      app.log.error(error, "Erro ao atualizar contato do cliente");
      return reply.status(500).send({ message: "Erro ao atualizar contato" });
    }
  });
}


