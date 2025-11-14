import { describe, expect, it, beforeEach } from "vitest";
import { CriarRepresentanteUseCase } from "../../src/modules/clientes/application/use-cases/criar-representante.use-case";
import type {
  ClienteRepository,
  RepresentanteRepository,
} from "../../src/modules/clientes/domain/repositories";
import { Cliente } from "../../src/modules/clientes/domain/entities/cliente";
import { Representante } from "../../src/modules/clientes/domain/entities/representante";

// Repositórios in-memory para testes
class InMemoryClienteRepository implements ClienteRepository {
  private readonly items = new Map<string, Cliente>();

  async salvar(cliente: Cliente) {
    this.items.set(cliente.clienteId, cliente);
  }

  async encontrarPorId(orgId: string, clienteId: string) {
    const cliente = this.items.get(clienteId);
    if (!cliente || cliente.dados.orgId !== orgId) return null;
    return cliente;
  }

  async encontrarPorDocumento() {
    return null;
  }

  async listarPorOrg() {
    return { itens: [], proximoCursor: undefined };
  }

  async contarPorOrg() {
    return 0;
  }
}

class InMemoryRepresentanteRepository implements RepresentanteRepository {
  private readonly items = new Map<string, Representante>();
  private readonly byClienteId = new Map<string, Representante>();

  async salvar(representante: Representante) {
    this.items.set(representante.representanteId, representante);
    this.byClienteId.set(representante.dados.clienteId, representante);
  }

  async encontrarPorId(orgId: string, representanteId: string) {
    const representante = this.items.get(representanteId);
    if (!representante || representante.dados.orgId !== orgId) return null;
    return representante;
  }

  async encontrarPorClienteId(orgId: string, clienteId: string) {
    const representante = this.byClienteId.get(clienteId);
    if (!representante || representante.dados.orgId !== orgId) return null;
    return representante;
  }

  async listarPorOrg() {
    return { itens: [], proximoCursor: undefined };
  }
}

describe("CriarRepresentanteUseCase", () => {
  let clienteRepository: InMemoryClienteRepository;
  let representanteRepository: InMemoryRepresentanteRepository;
  let useCase: CriarRepresentanteUseCase;

  beforeEach(() => {
    clienteRepository = new InMemoryClienteRepository();
    representanteRepository = new InMemoryRepresentanteRepository();
    useCase = new CriarRepresentanteUseCase({
      clienteRepository,
      representanteRepository,
      actorId: "user-123",
    });
  });

  it("deve criar um representante vinculado a um cliente", async () => {
    // Primeiro criar o cliente
    const cliente = Cliente.criar(
      {
        orgId: "org-123",
        nome: "João Silva",
        tipo: "fisica",
        documento: "12345678901",
        createdBy: "user-123",
        updatedBy: "user-123",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      "cliente-123",
    );
    await clienteRepository.salvar(cliente);

    const input = {
      orgId: "org-123",
      clienteId: "cliente-123",
      nome: "Carlos Representante",
      documento: "98765432100",
      percentualComissao: 5.5,
    };

    const resultado = await useCase.execute(input);

    expect(resultado.representanteId).toBeDefined();
    expect(resultado.clienteId).toBe("cliente-123");
    expect(resultado.percentualComissao).toBe(5.5);
    expect(resultado.status).toBe("ativo");

    const representanteSalvo = await representanteRepository.encontrarPorId(
      "org-123",
      resultado.representanteId,
    );
    expect(representanteSalvo).toBeDefined();
  });

  it("não deve criar representante para cliente inexistente", async () => {
    const input = {
      orgId: "org-123",
      clienteId: "cliente-inexistente",
      nome: "Carlos Representante",
      documento: "98765432100",
      percentualComissao: 5.5,
    };

    await expect(useCase.execute(input)).rejects.toThrow("não encontrado");
  });

  it("não deve permitir criar dois representantes para o mesmo cliente", async () => {
    const cliente = Cliente.criar(
      {
        orgId: "org-123",
        nome: "João Silva",
        tipo: "fisica",
        documento: "12345678901",
        createdBy: "user-123",
        updatedBy: "user-123",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      "cliente-123",
    );
    await clienteRepository.salvar(cliente);

    const input = {
      orgId: "org-123",
      clienteId: "cliente-123",
      nome: "Carlos Representante",
      documento: "98765432100",
      percentualComissao: 5.5,
    };

    await useCase.execute(input);

    // Tentar criar outro representante para o mesmo cliente
    await expect(useCase.execute(input)).rejects.toThrow("já possui");
  });
});

