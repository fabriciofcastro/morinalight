import { Produto } from "@morina/catalogo-domain";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createServer } from "../../src/core/server/create-server";
import { InMemoryProdutoRepository } from "../../src/modules/catalogo/infra/memory/in-memory-produto.repository";
import { InMemoryProdutoAuditoriaRepository } from "../../src/modules/catalogo/infra/memory/in-memory-produto-auditoria.repository";
import { InMemoryCompanySettingsRepository } from "../../src/modules/company-settings/repositories/in-memory-company-settings.repository";
import { InMemoryOrganizationRepository } from "../../src/modules/organizations/infra/memory/in-memory-organization.repository";
import { InMemoryOrganizationAuditLogRepository } from "../../src/modules/organizations/infra/memory/in-memory-organization-audit-log.repository";
import { InMemoryUserInviteRepository } from "../../src/modules/organizations/infra/memory/in-memory-user-invite.repository";
import { InMemoryUserRepository } from "../../src/modules/users/infra/memory/in-memory-user.repository";

describe("Isolamento Multi-Tenant", () => {
  let app: Awaited<ReturnType<typeof createServer>>;
  let organizationRepository: InMemoryOrganizationRepository;
  let userRepository: InMemoryUserRepository;
  let inviteRepository: InMemoryUserInviteRepository;
  let auditRepository: InMemoryOrganizationAuditLogRepository;
  let produtoRepository: InMemoryProdutoRepository;
  let produtoAuditoriaRepository: InMemoryProdutoAuditoriaRepository;
  let companySettingsRepository: InMemoryCompanySettingsRepository;

  // Organização 1
  const org1Id = "org-1";
  const org1User1Id = "user-org1-1";
  const org1User2Id = "user-org1-2";

  // Organização 2
  const org2Id = "org-2";
  const org2User1Id = "user-org2-1";

  // Usuário sem organização
  const noOrgUserId = "user-no-org";

  beforeAll(async () => {
    // Inicializar repositórios
    organizationRepository = new InMemoryOrganizationRepository();
    userRepository = new InMemoryUserRepository();
    inviteRepository = new InMemoryUserInviteRepository();
    auditRepository = new InMemoryOrganizationAuditLogRepository();
    produtoRepository = new InMemoryProdutoRepository();
    produtoAuditoriaRepository = new InMemoryProdutoAuditoriaRepository();
    companySettingsRepository = new InMemoryCompanySettingsRepository();

    app = await createServer({
      modules: {
        auth: {
          organizationRepository,
          userRepository,
          inviteRepository,
          auditRepository,
        },
        organizations: {
          organizationRepository,
          userRepository,
          inviteRepository,
          auditRepository,
        },
        catalogo: {
          produtoRepository,
          auditoriaRepository: produtoAuditoriaRepository,
          organizationRepository,
        },
        company: {
          repository: companySettingsRepository,
          organizationRepository,
        },
        // Não registrar middleware JWT para permitir uso direto de x-user-id nos testes
        coreAuth: undefined,
      },
    });
  });

  beforeEach(async () => {
    // Recriar repositórios para limpar estado (mais simples que acessar propriedades privadas)
    organizationRepository = new InMemoryOrganizationRepository();
    userRepository = new InMemoryUserRepository();
    inviteRepository = new InMemoryUserInviteRepository();
    auditRepository = new InMemoryOrganizationAuditLogRepository();
    produtoRepository = new InMemoryProdutoRepository();
    produtoAuditoriaRepository = new InMemoryProdutoAuditoriaRepository();
    companySettingsRepository = new InMemoryCompanySettingsRepository();

    // Atualizar servidor com novos repositórios
    app = await createServer({
      modules: {
        auth: {
          organizationRepository,
          userRepository,
          inviteRepository,
          auditRepository,
        },
        organizations: {
          organizationRepository,
          userRepository,
          inviteRepository,
          auditRepository,
        },
        catalogo: {
          produtoRepository,
          auditoriaRepository: produtoAuditoriaRepository,
          organizationRepository,
        },
        company: {
          repository: companySettingsRepository,
          organizationRepository,
        },
        // Não registrar middleware JWT para permitir uso direto de x-user-id nos testes
        coreAuth: undefined,
      },
    });

    // Criar usuários
    userRepository.users.set(org1User1Id, {
      userId: org1User1Id,
      email: "user1@org1.com",
      displayName: "User 1 Org 1",
      avatarUrl: null,
      passwordHash: "hash",
      status: "active",
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    userRepository.users.set(org1User2Id, {
      userId: org1User2Id,
      email: "user2@org1.com",
      displayName: "User 2 Org 1",
      avatarUrl: null,
      passwordHash: "hash",
      status: "active",
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    userRepository.users.set(org2User1Id, {
      userId: org2User1Id,
      email: "user1@org2.com",
      displayName: "User 1 Org 2",
      avatarUrl: null,
      passwordHash: "hash",
      status: "active",
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    userRepository.users.set(noOrgUserId, {
      userId: noOrgUserId,
      email: "user@no-org.com",
      displayName: "User No Org",
      avatarUrl: null,
      passwordHash: "hash",
      status: "active",
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Criar organizações
    await organizationRepository.criar({
      organizationId: org1Id,
      name: "Organização 1",
      slug: "org-1",
    });

    await organizationRepository.criar({
      organizationId: org2Id,
      name: "Organização 2",
      slug: "org-2",
    });

    // Vincular usuários às organizações
    await organizationRepository.vincularUsuario(org1Id, org1User1Id, "admin");
    await organizationRepository.vincularUsuario(org1Id, org1User2Id, "member");
    await organizationRepository.vincularUsuario(org2Id, org2User1Id, "admin");

    // Criar produtos para cada organização
    const produtoOrg1 = Produto.criar({
      orgId: org1Id,
      nome: "Produto Org 1",
      criadoPor: org1User1Id,
      atualizadoPor: org1User1Id,
    });
    await produtoRepository.salvar(produtoOrg1);

    const produtoOrg2 = Produto.criar({
      orgId: org2Id,
      nome: "Produto Org 2",
      criadoPor: org2User1Id,
      atualizadoPor: org2User1Id,
    });
    await produtoRepository.salvar(produtoOrg2);
  });

  describe("Validação de Tenant", () => {
    it("bloqueia acesso quando usuário não tem membership na organização", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/organizations/${org1Id}/members`,
        headers: {
          "x-user-id": noOrgUserId,
        },
      });

      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchObject({
        message: expect.stringContaining("Sem acesso à organização"),
      });
    });

    it("bloqueia acesso quando orgId não corresponde ao tenant", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/organizations/${org2Id}/members`,
        headers: {
          "x-user-id": org1User1Id,
        },
      });

      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchObject({
        message: expect.stringContaining("Sem acesso à organização"),
      });
    });

    it("permite acesso quando usuário tem membership na organização", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/organizations/${org1Id}/members`,
        headers: {
          "x-user-id": org1User1Id,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json() as { itens: Array<{ userId: string }> };
      expect(body.itens.length).toBeGreaterThan(0);
    });

    it("bloqueia acesso quando header x-user-id está ausente", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/organizations/${org1Id}/members`,
        headers: {},
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("Isolamento de Dados - Catálogo", () => {
    it("usuário de org1 não pode acessar produtos de org2", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/catalogo/produtos",
        headers: {
          "x-user-id": org1User1Id,
          "x-org-id": org2Id,
        },
      });

      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchObject({
        message: expect.stringContaining("Sem acesso à organização"),
      });
    });

    it("usuário de org1 só vê produtos da org1", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/catalogo/produtos",
        headers: {
          "x-user-id": org1User1Id,
          "x-org-id": org1Id,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json() as { itens: Array<{ nome: string; orgId: string }> };
      expect(body.itens.length).toBe(1);
      expect(body.itens[0]?.orgId).toBe(org1Id);
      expect(body.itens[0]?.nome).toBe("Produto Org 1");
    });

    it("usuário de org1 não pode criar produto para org2", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/catalogo/produtos",
        headers: {
          "x-user-id": org1User1Id,
          "x-org-id": org2Id,
        },
        payload: {
          nome: "Produto Não Autorizado",
          descricao: "Descrição",
        },
      });

      expect(response.statusCode).toBe(403);
    });

    it("usuário de org1 não pode acessar produto específico de org2", async () => {
      // Obter produto da org2 através da listagem da org2
      const listResponse = await app.inject({
        method: "GET",
        url: "/catalogo/produtos",
        headers: {
          "x-user-id": org2User1Id,
          "x-org-id": org2Id,
        },
      });

      expect(listResponse.statusCode).toBe(200);
      const lista = listResponse.json() as { itens: Array<{ produtoId: string }> };
      const produtoId = lista.itens[0]?.produtoId;

      if (!produtoId) {
        throw new Error("Produto da org2 não encontrado");
      }

      // Tentar acessar produto da org2 com usuário da org1
      const response = await app.inject({
        method: "GET",
        url: `/catalogo/produtos/${produtoId}`,
        headers: {
          "x-user-id": org1User1Id,
          "x-org-id": org2Id,
        },
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe("Isolamento de Dados - Company Settings", () => {
    it("usuário de org1 não pode acessar configurações de org2", async () => {
      // Criar configurações para org2
      await companySettingsRepository.save(org2Id, {
        primaryColor: "#0000FF",
        themeMode: "dark",
        videoLink: "https://example.com/video",
      });

      const response = await app.inject({
        method: "GET",
        url: "/company-settings",
        headers: {
          "x-user-id": org1User1Id,
          "x-org-id": org2Id,
        },
      });

      expect(response.statusCode).toBe(403);
    });

    it("usuário de org1 só acessa configurações da org1", async () => {
      // Criar configurações para org1
      await companySettingsRepository.save(org1Id, {
        primaryColor: "#FF0000",
        themeMode: "light",
        videoLink: "https://example.com/video1",
      });

      const response = await app.inject({
        method: "GET",
        url: "/company-settings",
        headers: {
          "x-user-id": org1User1Id,
          "x-org-id": org1Id,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body).toMatchObject({
        primaryColor: "#FF0000",
        themeMode: "light",
      });
    });

    it("usuário de org1 não pode atualizar configurações de org2", async () => {
      const response = await app.inject({
        method: "PUT",
        url: "/company-settings",
        headers: {
          "x-user-id": org1User1Id,
          "x-org-id": org2Id,
        },
        payload: {
          primaryColor: "#00FF00",
        },
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe("Isolamento de Dados - Organizações", () => {
    it("usuário de org1 não pode listar membros de org2", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/organizations/${org2Id}/members`,
        headers: {
          "x-user-id": org1User1Id,
        },
      });

      expect(response.statusCode).toBe(403);
    });

    it("usuário de org1 não pode alterar membros de org2", async () => {
      const response = await app.inject({
        method: "PATCH",
        url: `/organizations/${org2Id}/members/${org2User1Id}`,
        headers: {
          "x-user-id": org1User1Id,
        },
        payload: {
          role: "manager",
        },
      });

      expect(response.statusCode).toBe(403);
    });

    it("usuário de org1 não pode criar convites para org2", async () => {
      const response = await app.inject({
        method: "POST",
        url: `/organizations/${org2Id}/invites`,
        headers: {
          "x-user-id": org1User1Id,
        },
        payload: {
          email: "newuser@example.com",
          role: "member",
        },
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe("Permissões por Role", () => {
    it("member não pode aprovar produtos (requer admin ou owner)", async () => {
      const produto = Produto.criar({
        orgId: org1Id,
        nome: "Produto para Aprovar",
        criadoPor: org1User2Id,
        atualizadoPor: org1User2Id,
      });
      produto.encaminharParaAprovacao(org1User2Id);
      await produtoRepository.salvar(produto);

      const response = await app.inject({
        method: "POST",
        url: `/catalogo/produtos/${produto.produtoId}/aprovar`,
        headers: {
          "x-user-id": org1User2Id,
          "x-org-id": org1Id,
        },
      });

      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchObject({
        message: expect.stringContaining("Sem permissão para aprovar produtos"),
      });
    });

    it("admin pode aprovar produtos", async () => {
      const produto = Produto.criar({
        orgId: org1Id,
        nome: "Produto para Aprovar",
        criadoPor: org1User1Id,
        atualizadoPor: org1User1Id,
      });
      produto.encaminharParaAprovacao(org1User1Id);
      await produtoRepository.salvar(produto);

      const response = await app.inject({
        method: "POST",
        url: `/catalogo/produtos/${produto.produtoId}/aprovar`,
        headers: {
          "x-user-id": org1User1Id,
          "x-org-id": org1Id,
        },
      });

      expect(response.statusCode).toBe(200);
    });

    it("member não pode atualizar configurações da empresa (requer admin ou owner)", async () => {
      const response = await app.inject({
        method: "PUT",
        url: "/company-settings",
        headers: {
          "x-user-id": org1User2Id,
          "x-org-id": org1Id,
        },
        payload: {
          primaryColor: "#00FF00",
        },
      });

      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchObject({
        message: expect.stringContaining("Sem permissão para atualizar configurações"),
      });
    });

    it("admin pode atualizar configurações da empresa", async () => {
      const response = await app.inject({
        method: "PUT",
        url: "/company-settings",
        headers: {
          "x-user-id": org1User1Id,
          "x-org-id": org1Id,
        },
        payload: {
          primaryColor: "#00FF00",
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body).toMatchObject({
        primaryColor: "#00FF00",
      });
    });
  });

  describe("Validação de orgId na Rota", () => {
    it("bloqueia acesso quando orgId do tenant não corresponde ao orgId da rota", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/organizations/${org2Id}/members`,
        headers: {
          "x-user-id": org1User1Id,
        },
      });

      expect(response.statusCode).toBe(403);
    });

    it("permite acesso quando orgId do tenant corresponde ao orgId da rota", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/organizations/${org1Id}/members`,
        headers: {
          "x-user-id": org1User1Id,
        },
      });

      expect(response.statusCode).toBe(200);
    });
  });
});
