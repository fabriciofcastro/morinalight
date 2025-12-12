import type { PrefichaAuditoriaRepository, PrefichaRepository } from "@morina/preficha-domain";
import type { DomainEventBus } from "@morina/shared-kernel";
type Dependencies = {
  prefichaRepository: PrefichaRepository;
  actorId: string;
  eventBus?: DomainEventBus;
  auditoriaRepository?: PrefichaAuditoriaRepository;
};
export declare class RejeitarPrefichaUseCase {
  private readonly deps;
  constructor(deps: Dependencies);
  execute(rawInput: unknown): Promise<{
    status: "rascunho" | "pendente_aprovacao" | "aprovado" | "rejeitado";
    orgId: string;
    criadoEm: Date;
    atualizadoEm: Date;
    criadoPor: string;
    atualizadoPor: string;
    produtoId: string;
    aprovadores: {
      userId: string;
      aprovado: boolean;
      aprovadoEm: Date | null;
      comentario: string | null;
    }[];
    comentarios: {
      userId: string;
      id: string;
      criadoEm: Date;
      comentario: string;
    }[];
    prefichaId: string;
  }>;
}
