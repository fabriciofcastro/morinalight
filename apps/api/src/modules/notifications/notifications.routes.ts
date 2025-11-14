import {
  ListarAuditoriaFeedUseCase,
  listarAuditoriaFeedInputSchema,
} from "@morina/catalogo-application";
import type { ProdutoAuditoriaRepository, ProdutoRepository } from "@morina/catalogo-domain";
import { ListarPrefichaAuditoriaFeedUseCase } from "@morina/preficha-application";
import type { PrefichaAuditoriaRepository, PrefichaRepository } from "@morina/preficha-domain";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import type { OrganizationAuditLogRepository } from "../organizations/repositories/organization-audit-log.repository";

const headersSchema = z.object({
  "x-org-id": z.string().min(1),
});

type NotificationsDeps = {
  produtoRepository: ProdutoRepository;
  auditoriaRepository: ProdutoAuditoriaRepository;
  organizationAuditRepository: OrganizationAuditLogRepository;
  prefichaRepository?: PrefichaRepository;
  prefichaAuditoriaRepository?: PrefichaAuditoriaRepository;
};

export async function registerNotificationsRoutes(app: FastifyInstance, deps: NotificationsDeps) {
  const querySchema = z.object({
    acao: listarAuditoriaFeedInputSchema.shape.acao.optional(),
    cursor: z.string().optional(),
    limite: z.coerce.number().int().min(1).max(50).optional(),
    inicio: z.coerce.date().optional(),
    fim: z.coerce.date().optional(),
  });

  app.get("/notifications/feed", async (request, reply) => {
    const { "x-org-id": orgId } = headersSchema.parse(request.headers);
    const query = querySchema.parse(request.query ?? {});

    const cursorInfo = decodeCombinedCursor(query.cursor);

    const useCase = new ListarAuditoriaFeedUseCase({
      auditoriaRepository: deps.auditoriaRepository,
      produtoRepository: deps.produtoRepository,
    });

    const produtoFeed = await useCase.execute({
      orgId,
      acao: query.acao,
      cursor: cursorInfo.product ?? undefined,
      limite: query.limite,
      inicio: query.inicio,
      fim: query.fim,
    });

    const organizacaoFeed = await deps.organizationAuditRepository.listar(orgId, {
      acao: query.acao,
      cursor: cursorInfo.organization ?? undefined,
      limite: query.limite,
      inicio: query.inicio,
      fim: query.fim,
    });

    // Buscar feed de prefichas se repositórios estiverem disponíveis
    let prefichaFeed: { itens: Array<unknown>; proximoCursor: string | null } | null = null;
    if (deps.prefichaRepository && deps.prefichaAuditoriaRepository) {
      const prefichaUseCase = new ListarPrefichaAuditoriaFeedUseCase({
        prefichaRepository: deps.prefichaRepository,
        prefichaAuditoriaRepository: deps.prefichaAuditoriaRepository,
      });

      prefichaFeed = await prefichaUseCase.execute({
        orgId,
        acao: query.acao,
        cursor: cursorInfo.preficha ?? undefined,
        limite: query.limite,
        inicio: query.inicio,
        fim: query.fim,
      });
    }

    const itens = [
      ...produtoFeed.itens.map((item) => ({
        id: item.id,
        tipo: item.acao,
        criadoEm: item.criadoEm,
        actorId: item.actorId,
        payload: item.payload,
        produto: item.produto
          ? {
              id: item.produto.produtoId,
              nome: item.produto.nome,
              status: item.produto.status,
            }
          : null,
        preficha: null,
      })),
      ...organizacaoFeed.itens.map((item) => ({
        id: item.id,
        tipo: item.action,
        criadoEm: item.createdAt,
        actorId: item.actorId,
        payload: {
          ...(item.payload ?? {}),
          targetId: item.targetId ?? undefined,
          origem: "organizacao",
        },
        produto: null,
        preficha: null,
      })),
      ...(prefichaFeed?.itens.map(
        (item: {
          id: string;
          acao: string;
          criadoEm: Date;
          actorId: string;
          payload: unknown;
          preficha: { prefichaId: string; produtoId: string; status: string } | null;
        }) => ({
          id: item.id,
          tipo: item.acao,
          criadoEm: item.criadoEm,
          actorId: item.actorId,
          payload: item.payload,
          produto: null,
          preficha: item.preficha
            ? {
                prefichaId: item.preficha.prefichaId,
                produtoId: item.preficha.produtoId,
                status: item.preficha.status,
              }
            : null,
        }),
      ) ?? []),
    ]
      .sort((a, b) => {
        const diff = b.criadoEm.getTime() - a.criadoEm.getTime();
        if (diff !== 0) return diff;
        return b.id.localeCompare(a.id);
      })
      .slice(0, query.limite ?? 20);

    const proximoCursor = encodeCombinedCursor({
      product: produtoFeed.proximoCursor ?? null,
      organization: organizacaoFeed.proximoCursor ?? null,
      preficha: prefichaFeed?.proximoCursor ?? null,
    });

    return reply.send({
      itens,
      proximoCursor,
    });
  });
}

type CombinedCursor = {
  product?: string | null;
  organization?: string | null;
  preficha?: string | null;
};

function decodeCombinedCursor(cursor?: string | null): CombinedCursor {
  if (!cursor) return {};

  try {
    const raw = Buffer.from(cursor, "base64url").toString("utf-8");
    const parsed = JSON.parse(raw) as CombinedCursor;
    return {
      product: parsed.product ?? null,
      organization: parsed.organization ?? null,
      preficha: parsed.preficha ?? null,
    };
  } catch {
    return { product: cursor };
  }
}

function encodeCombinedCursor(cursor: CombinedCursor): string | null {
  if (!cursor.product && !cursor.organization && !cursor.preficha) {
    return null;
  }

  const data = JSON.stringify({
    product: cursor.product ?? null,
    organization: cursor.organization ?? null,
    preficha: cursor.preficha ?? null,
  });
  return Buffer.from(data).toString("base64url");
}
