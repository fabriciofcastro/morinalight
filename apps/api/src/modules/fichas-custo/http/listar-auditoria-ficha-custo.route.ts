import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { FichaCustoRepository } from "../../domain/repositories/ficha-custo.repository";

const querySchema = z.object({
  pagina: z.coerce.number().int().positive().default(1),
  tamanhoPagina: z.coerce.number().int().positive().max(100).default(20),
  acao: z.string().optional(),
  actorId: z.string().uuid().optional(),
  dataInicio: z.coerce.date().optional(),
  dataFim: z.coerce.date().optional(),
});

type Dependencies = {
  fichaCustoRepository: FichaCustoRepository;
};

export async function registerListarAuditoriaFichaCustoRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.get(
    "/organizations/:orgId/fichas-custo/:fichaCustoId/auditoria",
    async (request: FastifyRequest, reply: FastifyReply) => {
      await requireAuth()(request, reply);
      if (reply.sent) return;

      if (!request.auth) {
        return reply.status(401).send({
          message: "Autenticação necessária",
          code: "UNAUTHORIZED",
        });
      }

      const { orgId, fichaCustoId } = z
        .object({
          orgId: z.string().uuid(),
          fichaCustoId: z.string().uuid(),
        })
        .parse(request.params);

      const query = querySchema.parse(request.query ?? {});

      // Verificar se a ficha existe
      const ficha = await deps.fichaCustoRepository.buscarPorId(fichaCustoId, orgId);
      if (!ficha) {
        return reply.status(404).send({
          message: "Ficha de custo não encontrada",
        });
      }

      // TODO: Implementar busca de auditoria no repositório quando disponível
      // Por enquanto, retornar estrutura básica
      return reply.send({
        itens: [],
        totalItens: 0,
        pagina: query.pagina,
        tamanhoPagina: query.tamanhoPagina,
        totalPaginas: 0,
        mensagem: "Consulta de auditoria - em desenvolvimento. Use os eventos de domínio publicados.",
      });
    },
  );
}

