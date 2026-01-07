import type { PrefichaAuditoriaRepository, PrefichaRepository } from "@morina/preficha-domain";
import { Preficha } from "@morina/preficha-domain";
import type { DomainEventBus } from "@morina/shared-kernel";
import { describe, expect, it, vi } from "vitest";
import { AprovarPrefichaUseCase } from "../src/use-cases/approve-preficha.use-case";

describe("AprovarPrefichaUseCase", () => {
  const orgId = "org-123";
  const produtoId = "produto-123";
  const actorId = "user-456";
  const aprovadoresIds = [actorId, "user-789"];

  it("deve aprovar uma preficha pendente com sucesso", async () => {
    const preficha = Preficha.criar({
      orgId,
      produtoId,
      status: "rascunho",
      aprovadores: [],
      comentarios: [],
      criadoPor: "user-123",
      atualizadoPor: "user-123",
    });

    preficha.encaminharParaAprovacao("user-123", aprovadoresIds);

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

    const useCase = new AprovarPrefichaUseCase({
      prefichaRepository,
      actorId,
      eventBus,
      auditoriaRepository,
    });

    const resultado = await useCase.execute({
      orgId,
      prefichaId: preficha.prefichaId,
      comentario: "Aprovado!",
    });

    expect(resultado.status).toBe("pendente_aprovacao");
    expect(resultado.aprovadores).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userId: actorId,
          aprovado: true,
        }),
      ]),
    );

    expect(prefichaRepository.salvar).toHaveBeenCalledTimes(1);
    expect(auditoriaRepository.registrar).toHaveBeenCalledTimes(1);
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
  });

  it("deve marcar preficha como aprovada quando todos aprovarem", async () => {
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

    const useCase = new AprovarPrefichaUseCase({
      prefichaRepository,
      actorId,
    });

    const resultado = await useCase.execute({
      orgId,
      prefichaId: preficha.prefichaId,
    });

    expect(resultado.status).toBe("aprovado");
    expect(resultado.aprovadores[0]!.aprovado).toBe(true);
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

    const useCase = new AprovarPrefichaUseCase({
      prefichaRepository,
      actorId,
    });

    await expect(
      useCase.execute({
        orgId,
        prefichaId: preficha.prefichaId,
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

    const useCase = new AprovarPrefichaUseCase({
      prefichaRepository,
      actorId,
    });

    await expect(
      useCase.execute({
        orgId,
        prefichaId: preficha.prefichaId,
      }),
    ).rejects.toThrow("Usuário não é aprovador desta preficha");
  });
});
