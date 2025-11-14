import type { PrefichaAuditoriaRepository, PrefichaRepository } from "@morina/preficha-domain";
import { Preficha } from "@morina/preficha-domain";
import type { DomainEventBus } from "@morina/shared-kernel";
import { describe, expect, it, vi } from "vitest";
import { CriarPrefichaUseCase } from "../src/use-cases/create-preficha.use-case";

describe("CriarPrefichaUseCase", () => {
  const orgId = "org-123";
  const produtoId = "produto-123";
  const actorId = "user-123";
  const aprovadoresIds = ["user-456", "user-789"];

  it("deve criar uma preficha com sucesso", async () => {
    const prefichaRepository: PrefichaRepository = {
      salvar: vi.fn(),
      encontrarPorId: vi.fn(),
      encontrarPorProdutoId: vi.fn().mockResolvedValue(null),
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

    const useCase = new CriarPrefichaUseCase({
      prefichaRepository,
      actorId,
      eventBus,
      auditoriaRepository,
    });

    const resultado = await useCase.execute({
      orgId,
      produtoId,
      aprovadoresIds,
    });

    expect(resultado).toMatchObject({
      orgId,
      produtoId,
      status: "rascunho",
      aprovadores: expect.arrayContaining([
        expect.objectContaining({
          userId: aprovadoresIds[0],
          aprovado: false,
        }),
        expect.objectContaining({
          userId: aprovadoresIds[1],
          aprovado: false,
        }),
      ]),
      comentarios: [],
      criadoPor: actorId,
      atualizadoPor: actorId,
    });

    expect(prefichaRepository.salvar).toHaveBeenCalledTimes(1);
    expect(auditoriaRepository.registrar).toHaveBeenCalledTimes(1);
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
  });

  it("deve lançar erro se já existir uma preficha ativa para o produto", async () => {
    const prefichaExistente = Preficha.criar({
      orgId,
      produtoId,
      status: "pendente_aprovacao",
      aprovadores: [],
      comentarios: [],
      criadoPor: actorId,
      atualizadoPor: actorId,
    });

    const prefichaRepository: PrefichaRepository = {
      salvar: vi.fn(),
      encontrarPorId: vi.fn(),
      encontrarPorProdutoId: vi.fn().mockResolvedValue(prefichaExistente),
      listarPorOrg: vi.fn(),
    };

    const useCase = new CriarPrefichaUseCase({
      prefichaRepository,
      actorId,
    });

    await expect(
      useCase.execute({
        orgId,
        produtoId,
        aprovadoresIds,
      }),
    ).rejects.toThrow("Já existe uma preficha ativa para este produto");
  });

  it("deve permitir criar preficha se a existente estiver rejeitada", async () => {
    const prefichaRejeitada = Preficha.criar({
      orgId,
      produtoId,
      status: "rejeitado",
      aprovadores: [],
      comentarios: [],
      criadoPor: actorId,
      atualizadoPor: actorId,
    });

    const prefichaRepository: PrefichaRepository = {
      salvar: vi.fn(),
      encontrarPorId: vi.fn(),
      encontrarPorProdutoId: vi.fn().mockResolvedValue(prefichaRejeitada),
      listarPorOrg: vi.fn(),
    };

    const useCase = new CriarPrefichaUseCase({
      prefichaRepository,
      actorId,
    });

    const resultado = await useCase.execute({
      orgId,
      produtoId,
      aprovadoresIds,
    });

    expect(resultado).toMatchObject({
      orgId,
      produtoId,
      status: "rascunho",
    });

    expect(prefichaRepository.salvar).toHaveBeenCalledTimes(1);
  });

  it("deve validar que é necessário pelo menos um aprovador", async () => {
    const prefichaRepository: PrefichaRepository = {
      salvar: vi.fn(),
      encontrarPorId: vi.fn(),
      encontrarPorProdutoId: vi.fn().mockResolvedValue(null),
      listarPorOrg: vi.fn(),
    };

    const useCase = new CriarPrefichaUseCase({
      prefichaRepository,
      actorId,
    });

    await expect(
      useCase.execute({
        orgId,
        produtoId,
        aprovadoresIds: [],
      }),
    ).rejects.toThrow();
  });
});
