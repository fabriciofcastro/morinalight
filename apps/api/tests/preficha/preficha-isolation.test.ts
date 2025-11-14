import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServer } from "../../src/core/server/create-server";
import { getPrisma } from "../../src/infra/database/prisma.service";

describe("Preficha - Isolamento Multi-tenant", () => {
  let app: FastifyInstance;
  const orgId1 = "org-preficha-test-1";
  const orgId2 = "org-preficha-test-2";
  const userId1 = "user-preficha-test-1";
  const userId2 = "user-preficha-test-2";
  let produtoId1 = "produto-preficha-test-1";
  let produtoId2 = "produto-preficha-test-2";
  let prefichaId1: string;
  let prefichaId2: string;

  beforeAll(async () => {
    app = await createServer();
    await app.ready();

    // Criar produtos de teste
    const produto1Response = await app.inject({
      method: "POST",
      url: "/catalogo/produtos",
      headers: {
        "x-org-id": orgId1,
        "x-user-id": userId1,
      },
      payload: {
        nome: "Produto Teste 1",
        descricao: "Descrição do produto 1",
      },
    });
    expect(produto1Response.statusCode).toBe(201);
    const produto1 = JSON.parse(produto1Response.body);
    produtoId1 = produto1.produtoId;

    const produto2Response = await app.inject({
      method: "POST",
      url: "/catalogo/produtos",
      headers: {
        "x-org-id": orgId2,
        "x-user-id": userId2,
      },
      payload: {
        nome: "Produto Teste 2",
        descricao: "Descrição do produto 2",
      },
    });
    expect(produto2Response.statusCode).toBe(201);
    const produto2 = JSON.parse(produto2Response.body);
    produtoId2 = produto2.produtoId;
  });

  afterAll(async () => {
    const prisma = getPrisma();

    // Limpar dados de teste
    await prisma.prefichaComentario.deleteMany({
      where: {
        preficha: {
          orgId: { in: [orgId1, orgId2] },
        },
      },
    });
    await prisma.prefichaAprovador.deleteMany({
      where: {
        preficha: {
          orgId: { in: [orgId1, orgId2] },
        },
      },
    });
    await prisma.prefichaAuditLog.deleteMany({
      where: {
        orgId: { in: [orgId1, orgId2] },
      },
    });
    await prisma.preficha.deleteMany({
      where: {
        orgId: { in: [orgId1, orgId2] },
      },
    });
    await prisma.product.deleteMany({
      where: {
        orgId: { in: [orgId1, orgId2] },
      },
    });

    await app.close();
  });

  it("deve criar prefichas isoladas por organização", async () => {
    // Criar preficha para org1
    const response1 = await app.inject({
      method: "POST",
      url: "/preficha",
      headers: {
        "x-org-id": orgId1,
        "x-user-id": userId1,
      },
      payload: {
        produtoId: produtoId1,
        aprovadoresIds: [userId1],
      },
    });
    expect(response1.statusCode).toBe(201);
    const preficha1 = JSON.parse(response1.body);
    prefichaId1 = preficha1.prefichaId;
    expect(preficha1.orgId).toBe(orgId1);
    expect(preficha1.produtoId).toBe(produtoId1);

    // Criar preficha para org2
    const response2 = await app.inject({
      method: "POST",
      url: "/preficha",
      headers: {
        "x-org-id": orgId2,
        "x-user-id": userId2,
      },
      payload: {
        produtoId: produtoId2,
        aprovadoresIds: [userId2],
      },
    });
    expect(response2.statusCode).toBe(201);
    const preficha2 = JSON.parse(response2.body);
    prefichaId2 = preficha2.prefichaId;
    expect(preficha2.orgId).toBe(orgId2);
    expect(preficha2.produtoId).toBe(produtoId2);
  });

  it("deve listar apenas prefichas da organização do tenant", async () => {
    // Listar prefichas da org1
    const response1 = await app.inject({
      method: "GET",
      url: "/preficha",
      headers: {
        "x-org-id": orgId1,
        "x-user-id": userId1,
      },
    });
    expect(response1.statusCode).toBe(200);
    const lista1 = JSON.parse(response1.body);
    expect(lista1.itens).toHaveLength(1);
    expect(lista1.itens[0].prefichaId).toBe(prefichaId1);
    expect(lista1.itens[0].orgId).toBe(orgId1);

    // Listar prefichas da org2
    const response2 = await app.inject({
      method: "GET",
      url: "/preficha",
      headers: {
        "x-org-id": orgId2,
        "x-user-id": userId2,
      },
    });
    expect(response2.statusCode).toBe(200);
    const lista2 = JSON.parse(response2.body);
    expect(lista2.itens).toHaveLength(1);
    expect(lista2.itens[0].prefichaId).toBe(prefichaId2);
    expect(lista2.itens[0].orgId).toBe(orgId2);
  });

  it("não deve permitir acessar preficha de outra organização", async () => {
    // Tentar acessar preficha da org1 usando headers da org2
    const response = await app.inject({
      method: "GET",
      url: `/preficha/${prefichaId1}`,
      headers: {
        "x-org-id": orgId2,
        "x-user-id": userId2,
      },
    });
    expect(response.statusCode).toBe(404);
  });

  it("deve permitir aprovar preficha apenas se for aprovador", async () => {
    // Encaminhar preficha para aprovação
    await app.inject({
      method: "POST",
      url: `/preficha/${prefichaId1}/encaminhar`,
      headers: {
        "x-org-id": orgId1,
        "x-user-id": userId1,
      },
      payload: {
        produtoId: produtoId1,
        aprovadoresIds: [userId1],
      },
    });

    // Aprovar preficha
    const response = await app.inject({
      method: "POST",
      url: `/preficha/${prefichaId1}/aprovar`,
      headers: {
        "x-org-id": orgId1,
        "x-user-id": userId1,
      },
      payload: {
        comentario: "Aprovado!",
      },
    });
    expect(response.statusCode).toBe(200);
    const preficha = JSON.parse(response.body);
    expect(preficha.status).toBe("aprovado");
    expect(preficha.aprovadores[0].aprovado).toBe(true);
  });
});
