import { randomUUID } from "node:crypto";
import type { PrefichaAuditoriaRepository, PrefichaRepository } from "@morina/preficha-domain";
import { Preficha, PrefichaAuditoria } from "@morina/preficha-domain";
import type { DomainEventBus } from "@morina/shared-kernel";

import { criarPrefichaInputSchema, prefichaViewSchema } from "../schemas/preficha";

type Dependencies = {
  prefichaRepository: PrefichaRepository;
  actorId: string;
  eventBus?: DomainEventBus;
  auditoriaRepository?: PrefichaAuditoriaRepository;
};

export class CriarPrefichaUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = criarPrefichaInputSchema.parse(rawInput);

    // Verificar se já existe uma preficha para este produto
    const prefichaExistente = await this.deps.prefichaRepository.encontrarPorProdutoId(
      input.orgId,
      input.produtoId,
    );
    if (prefichaExistente && prefichaExistente.dados.status !== "rejeitado") {
      throw new Error("Já existe uma preficha ativa para este produto");
    }

    const preficha = Preficha.criar({
      orgId: input.orgId,
      produtoId: input.produtoId,
      aprovadores: input.aprovadoresIds.map((userId: string) => ({
        userId,
        aprovado: false,
        aprovadoEm: null,
        comentario: null,
      })),
      criadoPor: this.deps.actorId,
      atualizadoPor: this.deps.actorId,
    });

    await this.deps.prefichaRepository.salvar(preficha);

    if (this.deps.auditoriaRepository) {
      await this.deps.auditoriaRepository.registrar(
        new PrefichaAuditoria({
          id: randomUUID(),
          prefichaId: preficha.prefichaId,
          orgId: preficha.dados.orgId,
          acao: "preficha_criada",
          actorId: this.deps.actorId,
          payload: {
            produtoId: preficha.dados.produtoId,
            aprovadoresIds: input.aprovadoresIds,
          },
          criadoEm: new Date(),
        }),
      );
    }

    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "Preficha.Criada",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: preficha.dados.orgId,
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          prefichaId: preficha.prefichaId,
          produtoId: preficha.dados.produtoId,
          status: preficha.dados.status,
        },
      });
    }

    return prefichaViewSchema.parse({
      prefichaId: preficha.prefichaId,
      orgId: preficha.dados.orgId,
      produtoId: preficha.dados.produtoId,
      status: preficha.dados.status,
      aprovadores: preficha.dados.aprovadores,
      comentarios: preficha.dados.comentarios,
      criadoPor: preficha.dados.criadoPor,
      atualizadoPor: preficha.dados.atualizadoPor,
      criadoEm: preficha.dados.criadoEm,
      atualizadoEm: preficha.dados.atualizadoEm,
    });
  }
}
