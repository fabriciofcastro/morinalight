import type { PrefichaAuditoriaRepository, PrefichaRepository } from "@morina/preficha-domain";
import { Preficha } from "@morina/preficha-domain";
import type { DomainEventBus } from "@morina/shared-kernel";
import { describe, expect, it, vi } from "vitest";
import { RejeitarPrefichaUseCase } from "../src/use-cases/reject-preficha.use-case";

describe("RejeitarPrefichaUseCase", () => {
  const orgId = "org-123";
  const produtoId = "produto-123";
  const actorId = "user-456";
  const motivo = "Produto não atende aos requisitos";

  it("deve rejeitar uma preficha pendente com sucesso", async () => {
    const preficha = Preficha.criar({
      orgId,
      produtoId,
      status: "rascunho",
      aprovadores: [],
      comentarios: [],
      criadoPor: "user-123",
      atualizadoPor: "user-123",
    });

    preficha.encaminharParaAprovacao("user-123", [actorId]);

    const prefichaRepository: PrefichaRepository = {
      salvar: vi.fn(),
      encontrarPorId: vi.fn().mockResolvedValue(preficha),
      encontrarPorProdutoId: vi.fn(),
      listarPorOrg: vi.fn(),
    };

    const auditoriaRepository: PrefichaAuditoriaRepository = {
      registrar: vi.fn(),
      listarPorPreficha: vi.fn(),
      listarFeed: vi.fn(),
    };

    const eventBus: DomainEventBus = {
      publish: vi.fn(),
    };

    const useCase = new RejeitarPrefichaUseCase({
      prefichaRepository,
      actorId,
      eventBus,
      auditoriaRepository,
    });

    const resultado = await useCase.execute({
      orgId,
      prefichaId: preficha.prefichaId,
      motivo,
    });

    expect(resultado.status).toBe("rejeitado");
    expect(resultado.aprovadores[0]!.aprovado).toBe(false);
    expect(resultado.aprovadores[0]!.comentario).toBe(motivo);
    expect(resultado.comentarios.length).toBeGreaterThan(0);
    expect(resultado.comentarios[0]!.comentario).toContain(motivo);

    expect(prefichaRepository.salvar).toHaveBeenCalledTimes(1);
    expect(auditoriaRepository.registrar).toHaveBeenCalledTimes(1);
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
  });

  it("deve lançar erro se preficha não estiver pendente", async () => {
    const preficha = Preficha.criar({
      orgId,
      produtoId,
      status: "rascunho",
      aprovadores: [],
      comentarios: [],
      criadoPor: "user-123",
      atualizadoPor: "user-123",
    });

    const prefichaRepository: PrefichaRepository = {
      salvar: vi.fn(),
      encontrarPorId: vi.fn().mockResolvedValue(preficha),
      encontrarPorProdutoId: vi.fn(),
      listarPorOrg: vi.fn(),
    };

    const useCase = new RejeitarPrefichaUseCase({
      prefichaRepository,
      actorId,
    });

    await expect(
      useCase.execute({
        orgId,
        prefichaId: preficha.prefichaId,
        motivo,
      }),
    ).rejects.toThrow("Preficha precisa estar pendente de aprovação");
  });

  it("deve lançar erro se usuário não for aprovador", async () => {
    const preficha = Preficha.criar({
      orgId,
      produtoId,
      status: "rascunho",
      aprovadores: [],
      comentarios: [],
      criadoPor: "user-123",
      atualizadoPor: "user-123",
    });

    preficha.encaminharParaAprovacao("user-123", ["user-789"]);

    const prefichaRepository: PrefichaRepository = {
      salvar: vi.fn(),
      encontrarPorId: vi.fn().mockResolvedValue(preficha),
      encontrarPorProdutoId: vi.fn(),
      listarPorOrg: vi.fn(),
    };

    const useCase = new RejeitarPrefichaUseCase({
      prefichaRepository,
      actorId,
    });

    await expect(
      useCase.execute({
        orgId,
        prefichaId: preficha.prefichaId,
        motivo,
      }),
    ).rejects.toThrow("Usuário não é aprovador desta preficha");
  });
});
