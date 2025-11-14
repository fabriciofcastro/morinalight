import { randomUUID } from "node:crypto";
import type { PrefichaAuditoriaRepository, PrefichaRepository } from "@morina/preficha-domain";
import { PrefichaAuditoria } from "@morina/preficha-domain";
import type { DomainEventBus } from "@morina/shared-kernel";

import { prefichaViewSchema, rejeitarPrefichaInputSchema } from "../schemas/preficha";

type Dependencies = {
  prefichaRepository: PrefichaRepository;
  actorId: string;
  eventBus?: DomainEventBus;
  auditoriaRepository?: PrefichaAuditoriaRepository;
};

export class RejeitarPrefichaUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = rejeitarPrefichaInputSchema.parse(rawInput);

    const preficha = await this.deps.prefichaRepository.encontrarPorId(
      input.orgId,
      input.prefichaId,
    );
    if (!preficha) {
      throw new Error("Preficha não encontrada");
    }

    if (preficha.dados.orgId !== input.orgId) {
      throw new Error("Preficha não pertence à organização");
    }

    preficha.rejeitar(this.deps.actorId, input.motivo);

    await this.deps.prefichaRepository.salvar(preficha);

    if (this.deps.auditoriaRepository) {
      await this.deps.auditoriaRepository.registrar(
        new PrefichaAuditoria({
          id: randomUUID(),
          prefichaId: preficha.prefichaId,
          orgId: preficha.dados.orgId,
          acao: "preficha_rejeitada",
          actorId: this.deps.actorId,
          payload: {
            motivo: input.motivo,
          },
          criadoEm: new Date(),
        }),
      );
    }

    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "Preficha.Rejeitada",
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
          motivo: input.motivo,
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
