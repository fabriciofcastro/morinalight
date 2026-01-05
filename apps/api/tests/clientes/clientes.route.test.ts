import { beforeAll, describe, expect, it } from "vitest";
import { createServer } from "../../src/core/server/create-server";
import { InMemoryOrganizationRepository } from "../../src/modules/organizations/infra/memory/in-memory-organization.repository";
import { InMemoryClienteRepository } from "./in-memory-cliente.repository";
import { InMemoryComissaoRepository } from "./in-memory-comissao.repository";
import { InMemoryRepresentanteRepository } from "./in-memory-representante.repository";

describe("Clientes HTTP Routes", () => {
  let server: any;
  let orgId: string;
  let userId: string;
  let authHeaders: HeadersInit;

  beforeAll(async () => {
    const organizationRepository = new InMemoryOrganizationRepository();
    const clienteRepository = new InMemoryClienteRepository();
    const representanteRepository = new InMemoryRepresentanteRepository();
    const comissaoRepository = new InMemoryComissaoRepository();

    // Criar organização de teste
    const org = await organizationRepository.criar({
      organizationId: "test-org-id",
      name: "Test Org",
      slug: "test-org",
    });
    orgId = org.organizationId;

    // Criar usuário de teste
    userId = "user-123";

    authHeaders = {
      "x-org-id": orgId,
      "x-user-id": userId,
    };

    server = await createServer({
      modules: {
        organizations: {
          organizationRepository,
        },
        clientes: {
          clienteRepository,
          representanteRepository,
          comissaoRepository,
          organizationRepository,
        },
      },
    });
  });

  it("deve criar um cliente", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/clientes",
      headers: authHeaders,
      payload: {
        nome: "João Silva",
        tipo: "fisica",
        documento: "12345678901",
        email: "joao@example.com",
        telefone: "11999999999",
      },
    });

    expect(response.statusCode).toBe(201);
    const data = JSON.parse(response.body);
    expect(data.clienteId).toBeDefined();
    expect(data.nome).toBe("João Silva");
    expect(data.documento).toBe("12345678901");
    expect(data.status).toBe("ativo");
  });

  it("não deve criar cliente sem nome", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/clientes",
      headers: authHeaders,
      payload: {
        tipo: "fisica",
        documento: "12345678901",
      },
    });

    expect(response.statusCode).toBe(400);
  });

  it("deve listar clientes", async () => {
    // Criar um cliente primeiro
    const createResponse = await server.inject({
      method: "POST",
      url: "/clientes",
      headers: authHeaders,
      payload: {
        nome: "Maria Santos",
        tipo: "fisica",
        documento: "98765432100",
      },
    });
    expect(createResponse.statusCode).toBe(201);

    // Listar clientes
    const listResponse = await server.inject({
      method: "GET",
      url: "/clientes",
      headers: authHeaders,
    });

    expect(listResponse.statusCode).toBe(200);
    const data = JSON.parse(listResponse.body);
    expect(data.itens).toBeInstanceOf(Array);
    expect(data.itens.length).toBeGreaterThan(0);
  });

  it("deve atualizar um cliente", async () => {
    // Criar cliente
    const createResponse = await server.inject({
      method: "POST",
      url: "/clientes",
      headers: authHeaders,
      payload: {
        nome: "Pedro Costa",
        tipo: "fisica",
        documento: "11122233344",
      },
    });
    const cliente = JSON.parse(createResponse.body);

    // Atualizar cliente
    const updateResponse = await server.inject({
      method: "PUT",
      url: `/clientes/${cliente.clienteId}`,
      headers: authHeaders,
      payload: {
        nome: "Pedro Costa Atualizado",
        email: "pedro@example.com",
      },
    });

    expect(updateResponse.statusCode).toBe(200);
    const data = JSON.parse(updateResponse.body);
    expect(data.nome).toBe("Pedro Costa Atualizado");
    expect(data.email).toBe("pedro@example.com");
  });

  it("não deve atualizar cliente inexistente", async () => {
    const response = await server.inject({
      method: "PUT",
      url: "/clientes/cliente-inexistente",
      headers: authHeaders,
      payload: {
        nome: "Nome Atualizado",
      },
    });

    expect(response.statusCode).toBe(404);
  });

  it("deve filtrar clientes por status", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/clientes?status=ativo",
      headers: authHeaders,
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.body);
    expect(data.itens.every((c: any) => c.status === "ativo")).toBe(true);
  });

  it("deve buscar clientes por termo", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/clientes?busca=João",
      headers: authHeaders,
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.body);
    expect(data.itens.length).toBeGreaterThan(0);
  });
});
