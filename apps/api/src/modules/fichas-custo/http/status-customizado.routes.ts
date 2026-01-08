import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getPrisma } from "../../../infra/database/prisma.service";
import { PrismaStatusCustomizadoRepository } from "../infra/prisma/prisma-status-customizado.repository";

const statusCustomizadoRepository = new PrismaStatusCustomizadoRepository(getPrisma());

type StatusCustomizadoInput = {
  nome: string;
  cor: string;
  descricao?: string;
  ordem?: number;
  ativo?: boolean;
};

// Listar status customizados
export async function registerListStatusCustomizadoRoute(app: FastifyInstance) {
  app.get(
    "/organizations/:orgId/fichas-custo/status-customizados",
    async (
      request: FastifyRequest<{
        Params: { orgId: string };
        Querystring: {
          ativo?: string;
          busca?: string;
          pagina?: string;
          tamanhoPagina?: string;
          ordenacaoCampo?: "nome" | "cor" | "ordem" | "createdAt";
          ordenacaoDirecao?: "asc" | "desc";
        };
      }>,
      reply: FastifyReply,
    ) => {
      const orgId = request.params.orgId;
      const { ativo, busca, ordenacaoCampo = "ordem", ordenacaoDirecao = "asc" } = request.query;

      if (!orgId) {
        return reply.status(400).send({ message: "orgId é obrigatório" });
      }

      try {
        const where: any = {
          orgId,
          deletedAt: null,
        };

        // Filtro por ativo
        if (ativo !== undefined) {
          where.ativo = ativo === "true";
        }

        // Filtro por busca
        if (busca && busca.trim()) {
          where.OR = [
            { nome: { contains: busca.trim(), mode: "insensitive" } },
            { descricao: { contains: busca.trim(), mode: "insensitive" } },
            { cor: { contains: busca.trim(), mode: "insensitive" } },
          ];
        }

        // Ordenação
        const orderBy: any[] = [];
        if (ordenacaoCampo === "nome") {
          orderBy.push({ nome: ordenacaoDirecao });
        } else if (ordenacaoCampo === "cor") {
          orderBy.push({ cor: ordenacaoDirecao });
        } else if (ordenacaoCampo === "ordem") {
          orderBy.push({ ordem: ordenacaoDirecao });
        } else if (ordenacaoCampo === "createdAt") {
          orderBy.push({ createdAt: ordenacaoDirecao });
        }
        // Sempre adicionar ordem como fallback
        if (ordenacaoCampo !== "ordem") {
          orderBy.push({ ordem: "asc" });
        }
        orderBy.push({ nome: "asc" });

        const status = await prisma.statusCustomizadoFichaCusto.findMany({
          where,
          orderBy,
        });

        return reply.status(200).send(status);
      } catch (error) {
        app.log.error(error, "Erro ao listar status customizados");
        return reply.status(500).send({ message: "Erro ao listar status customizados" });
      }
    },
  );
}

// Criar status customizado
export async function registerCreateStatusCustomizadoRoute(app: FastifyInstance) {
  app.post(
    "/organizations/:orgId/fichas-custo/status-customizados",
    async (
      request: FastifyRequest<{
        Params: { orgId: string };
        Body: StatusCustomizadoInput;
      }>,
      reply: FastifyReply,
    ) => {
      const orgId = request.params.orgId;
      const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;

      if (!orgId) {
        return reply.status(400).send({ message: "orgId é obrigatório" });
      }

      if (!userId) {
        return reply.status(401).send({ message: "Usuário não identificado" });
      }

      try {
        const { nome, cor, descricao, ordem, ativo } = request.body;

        if (!nome || !nome.trim()) {
          return reply.status(400).send({ message: "Nome é obrigatório" });
        }

        if (!cor || !/^#[0-9A-Fa-f]{6}$/.test(cor)) {
          return reply
            .status(400)
            .send({ message: "Cor deve ser um código hexadecimal válido (ex: #3b82f6)" });
        }

        // Verificar se já existe status com mesmo nome
        const existente = await prisma.statusCustomizadoFichaCusto.findFirst({
          where: {
            orgId,
            nome: nome.trim(),
            deletedAt: null,
          },
        });

        if (existente) {
          return reply.status(400).send({ message: "Já existe um status com este nome" });
        }

        // Obter última ordem se não fornecida
        let ordemFinal = ordem;
        if (ordemFinal === undefined) {
          const ultimoStatus = await prisma.statusCustomizadoFichaCusto.findFirst({
            where: { orgId, deletedAt: null },
            orderBy: { ordem: "desc" },
          });
          ordemFinal = ultimoStatus ? ultimoStatus.ordem + 1 : 0;
        }

        const status = await prisma.statusCustomizadoFichaCusto.create({
          data: {
            orgId,
            nome: nome.trim(),
            cor,
            descricao: descricao?.trim() || null,
            ordem: ordemFinal,
            ativo: ativo ?? true,
            criadoPor: userId,
            atualizadoPor: userId,
          },
        });

        return reply.status(201).send(status);
      } catch (error) {
        app.log.error(error, "Erro ao criar status customizado");
        return reply.status(500).send({ message: "Erro ao criar status customizado" });
      }
    },
  );
}

// Atualizar status customizado
export async function registerUpdateStatusCustomizadoRoute(app: FastifyInstance) {
  app.put(
    "/organizations/:orgId/fichas-custo/status-customizados/:statusId",
    async (
      request: FastifyRequest<{
        Params: { orgId: string; statusId: string };
        Body: Partial<StatusCustomizadoInput>;
      }>,
      reply: FastifyReply,
    ) => {
      const orgId = request.params.orgId;
      const statusId = request.params.statusId;
      const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;

      if (!orgId || !statusId) {
        return reply.status(400).send({ message: "orgId e statusId são obrigatórios" });
      }

      if (!userId) {
        return reply.status(401).send({ message: "Usuário não identificado" });
      }

      try {
        // Verificar se status existe
        const statusExistente = await prisma.statusCustomizadoFichaCusto.findFirst({
          where: {
            id: statusId,
            orgId,
            deletedAt: null,
          },
        });

        if (!statusExistente) {
          return reply.status(404).send({ message: "Status customizado não encontrado" });
        }

        const { nome, cor, descricao, ordem, ativo } = request.body;

        // Validar cor se fornecida
        if (cor && !/^#[0-9A-Fa-f]{6}$/.test(cor)) {
          return reply
            .status(400)
            .send({ message: "Cor deve ser um código hexadecimal válido (ex: #3b82f6)" });
        }

        // Verificar se nome já existe (exceto o próprio status)
        if (nome && nome.trim() !== statusExistente.nome) {
          const nomeExistente = await prisma.statusCustomizadoFichaCusto.findFirst({
            where: {
              orgId,
              nome: nome.trim(),
              deletedAt: null,
              id: { not: statusId },
            },
          });

          if (nomeExistente) {
            return reply.status(400).send({ message: "Já existe um status com este nome" });
          }
        }

        const status = await prisma.statusCustomizadoFichaCusto.update({
          where: { id: statusId },
          data: {
            ...(nome && { nome: nome.trim() }),
            ...(cor && { cor }),
            ...(descricao !== undefined && { descricao: descricao?.trim() || null }),
            ...(ordem !== undefined && { ordem }),
            ...(ativo !== undefined && { ativo }),
            atualizadoPor: userId,
          },
        });

        return reply.status(200).send(status);
      } catch (error) {
        app.log.error(error, "Erro ao atualizar status customizado");
        return reply.status(500).send({ message: "Erro ao atualizar status customizado" });
      }
    },
  );
}

// Excluir status customizado (soft delete)
export async function registerDeleteStatusCustomizadoRoute(app: FastifyInstance) {
  app.delete(
    "/organizations/:orgId/fichas-custo/status-customizados/:statusId",
    async (
      request: FastifyRequest<{
        Params: { orgId: string; statusId: string };
      }>,
      reply: FastifyReply,
    ) => {
      const orgId = request.params.orgId;
      const statusId = request.params.statusId;
      const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;

      if (!orgId || !statusId) {
        return reply.status(400).send({ message: "orgId e statusId são obrigatórios" });
      }

      if (!userId) {
        return reply.status(401).send({ message: "Usuário não identificado" });
      }

      try {
        // Verificar se status existe
        const statusExistente = await prisma.statusCustomizadoFichaCusto.findFirst({
          where: {
            id: statusId,
            orgId,
            deletedAt: null,
          },
        });

        if (!statusExistente) {
          return reply.status(404).send({ message: "Status customizado não encontrado" });
        }

        // Soft delete
        await prisma.statusCustomizadoFichaCusto.update({
          where: { id: statusId },
          data: {
            deletedAt: new Date(),
            deletedBy: userId,
            ativo: false,
            atualizadoPor: userId,
          },
        });

        return reply.status(200).send({ message: "Status customizado excluído com sucesso" });
      } catch (error) {
        app.log.error(error, "Erro ao excluir status customizado");
        return reply.status(500).send({ message: "Erro ao excluir status customizado" });
      }
    },
  );
}
