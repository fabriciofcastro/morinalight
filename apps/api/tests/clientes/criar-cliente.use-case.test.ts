import { describe, expect, it, beforeEach } from "vitest";
import { CriarClienteUseCase } from "../../src/modules/clientes/application/use-cases/criar-cliente.use-case";
import type { ClienteRepository } from "../../src/modules/clientes/domain/repositories/cliente-repository";
import { Cliente } from "../../src/modules/clientes/domain/entities/cliente";

// Repositório in-memory para testes
class InMemoryClienteRepository implements ClienteRepository {
  private readonly items = new Map<string, Cliente>();
  private readonly byDocumento = new Map<string, Cliente>();

  async salvar(cliente: Cliente) {
    this.items.set(cliente.clienteId, cliente);
    this.byDocumento.set(cliente.dados.documento, cliente);
  }

  async encontrarPorId(orgId: string, clienteId: string) {
    const cliente = this.items.get(clienteId);
    if (!cliente || cliente.dados.orgId !== orgId) return null;
    return cliente;
  }

  async encontrarPorDocumento(orgId: string, documento: string) {
    const cliente = this.byDocumento.get(documento);
    if (!cliente || cliente.dados.orgId !== orgId) return null;
    return cliente;
  }

  async listarPorOrg(orgId: string) {
    const itens = Array.from(this.items.values()).filter(
      (c) => c.dados.orgId === orgId,
    );
    return { itens, proximoCursor: undefined };
  }

  async contarPorOrg(orgId: string) {
    return Array.from(this.items.values()).filter(
      (c) => c.dados.orgId === orgId,
    ).length;
  }
}

describe("CriarClienteUseCase", () => {
  let repository: InMemoryClienteRepository;
  let useCase: CriarClienteUseCase;

  beforeEach(() => {
    repository = new InMemoryClienteRepository();
    useCase = new CriarClienteUseCase({
      clienteRepository: repository,
      actorId: "user-123",
    });
  });

  it("deve criar um cliente com sucesso", async () => {
    const input = {
      orgId: "org-123",
      nome: "João Silva",
      tipo: "fisica" as const,
      documento: "12345678901",
      email: "joao@example.com",
      telefone: "11999999999",
    };

    const resultado = await useCase.execute(input);

    expect(resultado.clienteId).toBeDefined();
    expect(resultado.nome).toBe("João Silva");
    expect(resultado.documento).toBe("12345678901");
    expect(resultado.status).toBe("ativo");

    const clienteSalvo = await repository.encontrarPorId(
      "org-123",
      resultado.clienteId,
    );
    expect(clienteSalvo).toBeDefined();
  });

  it("não deve criar cliente com documento duplicado", async () => {
    const input = {
      orgId: "org-123",
      nome: "João Silva",
      tipo: "fisica" as const,
      documento: "12345678901",
    };

    await useCase.execute(input);

    await expect(useCase.execute(input)).rejects.toThrow("já existe");
  });

  it("deve criar cliente pessoa jurídica", async () => {
    const input = {
      orgId: "org-123",
      nome: "Empresa XYZ",
      razaoSocial: "XYZ Ltda",
      tipo: "juridica" as const,
      documento: "12345678000190",
    };

    const resultado = await useCase.execute(input);

    expect(resultado.tipo).toBe("juridica");
    expect(resultado.razaoSocial).toBe("XYZ Ltda");
  });
});

