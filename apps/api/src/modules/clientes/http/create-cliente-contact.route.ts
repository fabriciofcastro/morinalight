import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../../../prisma/client";

export async function registerCreateClienteContactRoute(app: FastifyInstance) {
  app.post("/clientes/:clienteId/contatos", async (request: FastifyRequest, reply: FastifyReply) => {
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

      const body = request.body as {
        name: string;
        email?: string | null;
        phone?: string | null;
        celular?: string | null;
        cargo?: string | null;
        departamento?: string | null;
        tipo?: string;
        isPrincipal?: boolean;
        notes?: string | null;
      };

      if (!body.name || body.name.trim().length === 0) {
        return reply.status(400).send({ message: "Nome do contato é obrigatório" });
      }

      // Se este contato for marcado como principal, desmarcar os outros
      if (body.isPrincipal) {
        await prisma.clienteContact.updateMany({
          where: { clienteId, isPrincipal: true },
          data: { isPrincipal: false },
        });
      }

      const contato = await prisma.clienteContact.create({
        data: {
          clienteId,
          name: body.name.trim(),
          email: body.email?.trim() || null,
          phone: body.phone?.trim() || null,
          celular: body.celular?.trim() || null,
          cargo: body.cargo?.trim() || null,
          departamento: body.departamento?.trim() || null,
          tipo: body.tipo || "geral",
          isPrincipal: body.isPrincipal ?? false,
          notes: body.notes?.trim() || null,
        },
      });

      return reply.status(201).send({
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
      app.log.error(error, "Erro ao criar contato do cliente");
      return reply.status(500).send({ message: "Erro ao criar contato" });
    }
  });
}


