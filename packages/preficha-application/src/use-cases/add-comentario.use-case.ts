import { randomUUID } from "node:crypto";
import type { PrefichaAuditoriaRepository, PrefichaRepository } from "@morina/preficha-domain";
import { PrefichaAuditoria } from "@morina/preficha-domain";
import type { DomainEventBus } from "@morina/shared-kernel";

import { adicionarComentarioInputSchema, prefichaViewSchema } from "../schemas/preficha";

type Dependencies = {
  prefichaRepository: PrefichaRepository;
  actorId: string;
  eventBus?: DomainEventBus;
  auditoriaRepository?: PrefichaAuditoriaRepository;
};

export class AdicionarComentarioUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = adicionarComentarioInputSchema.parse(rawInput);

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

    preficha.adicionarComentario(this.deps.actorId, input.comentario);

    await this.deps.prefichaRepository.salvar(preficha);

    if (this.deps.auditoriaRepository) {
      await this.deps.auditoriaRepository.registrar(
        new PrefichaAuditoria({
          id: randomUUID(),
          prefichaId: preficha.prefichaId,
          orgId: preficha.dados.orgId,
          acao: "comentario_adicionado",
          actorId: this.deps.actorId,
          payload: {
            comentario: input.comentario,
          },
          criadoEm: new Date(),
        }),
      );
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
