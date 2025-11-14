import { randomUUID } from "node:crypto";
import type { PrefichaAuditoriaRepository, PrefichaRepository } from "@morina/preficha-domain";
import { PrefichaAuditoria } from "@morina/preficha-domain";
import type { DomainEventBus } from "@morina/shared-kernel";

import { criarPrefichaInputSchema, prefichaViewSchema } from "../schemas/preficha";

type Dependencies = {
  prefichaRepository: PrefichaRepository;
  actorId: string;
  eventBus?: DomainEventBus;
  auditoriaRepository?: PrefichaAuditoriaRepository;
};

export class EncaminharPrefichaUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = criarPrefichaInputSchema.parse(rawInput);

    const preficha = await this.deps.prefichaRepository.encontrarPorProdutoId(
      input.orgId,
      input.produtoId,
    );
    if (!preficha) {
      throw new Error("Preficha não encontrada");
    }

    if (preficha.dados.orgId !== input.orgId) {
      throw new Error("Preficha não pertence à organização");
    }

    preficha.encaminharParaAprovacao(this.deps.actorId, input.aprovadoresIds);

    await this.deps.prefichaRepository.salvar(preficha);

    if (this.deps.auditoriaRepository) {
      await this.deps.auditoriaRepository.registrar(
        new PrefichaAuditoria({
          id: randomUUID(),
          prefichaId: preficha.prefichaId,
          orgId: preficha.dados.orgId,
          acao: "preficha_encaminhada",
          actorId: this.deps.actorId,
          payload: {
            aprovadoresIds: input.aprovadoresIds,
          },
          criadoEm: new Date(),
        }),
      );
    }

    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "Preficha.Encaminhada",
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
          aprovadoresIds: input.aprovadoresIds,
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


