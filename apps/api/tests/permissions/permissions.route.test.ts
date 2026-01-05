import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServer } from "../../src/core/server/create-server";
import { InMemoryOrganizationRepository } from "../../src/modules/organizations/infra/memory/in-memory-organization.repository";
import type { PermissionRepository } from "../../src/modules/permissions/domain/repositories/permission-repository";
import { InMemoryUserRepository } from "../../src/modules/users/infra/memory/in-memory-user.repository";

describe("Permissions Routes", () => {
  let app: FastifyInstance;
  let organizationRepository: InMemoryOrganizationRepository;
  let userRepository: InMemoryUserRepository;
  let permissionRepository: PermissionRepository;
  let testOrgId: string;
  let testUserId: string;
  let authToken: string;

  beforeAll(async () => {
    organizationRepository = new InMemoryOrganizationRepository();
    userRepository = new InMemoryUserRepository();

    permissionRepository = {
      salvar: async () => { },
      encontrarPorId: async () => null,
      encontrarPorChave: async () => null,
      listar: async () => [],
      encontrarPorIds: async () => [],
      deletar: async () => { },
      listarSecurityPolicies: async () => [],
      listarAclEntries: async () => [],
    } as unknown as PermissionRepository;

    app = await createServer({
      modules: {
        organizations: { organizationRepository, userRepository },
        permissions: { permissionRepository, organizationRepository },
      },
    });

    // Criar organização de teste
    const org = await organizationRepository.criar({
      organizationId: "test-org-permissions-id",
      name: "Test Org Permissions",
      slug: "test-org-permissions",
    });

    testOrgId = org.organizationId;

    // Criar usuário de teste
    const user = await userRepository.create({
      userId: "test-user-permissions-id",
      email: "test-permissions@example.com",
      passwordHash: "test-hash",
      displayName: "Test User",
    });

    testUserId = user.userId;

    // Vincular usuário à organização
    await organizationRepository.vincularUsuario(testOrgId, testUserId, "admin");

    // Criar token de autenticação simulado (o middleware de teste deve aceitar)
    // Nota: Dependendo de como o requireAuth está implementado, pode ser necessário um token real ou x-user-id header
    authToken = "test-token";
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe("GET /users/:userId/permissions", () => {
    it("deve retornar permissões do usuário", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/users/${testUserId}/permissions`,
        headers: {
          authorization: `Bearer ${authToken}`,
          "x-org-id": testOrgId,
          "x-user-id": testUserId, // Supondo que o middleware de teste use isso
        },
      });

      // Se o auth falhar por ser mock, o status pode ser 401. 
      // Mas o objetivo aqui é corrigir os erros de compilação primeiro.
      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data).toHaveProperty("permissions");
      expect(data).toHaveProperty("role");
      expect(Array.isArray(data.permissions)).toBe(true);
    });

    it("deve retornar 400 se x-org-id não for fornecido", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/users/${testUserId}/permissions`,
        headers: {
          authorization: `Bearer ${authToken}`,
          "x-user-id": testUserId,
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("GET /users/:userId/permissions/check", () => {
    it("deve verificar se usuário tem permissão específica", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/users/${testUserId}/permissions/check?permission=products:view`,
        headers: {
          authorization: `Bearer ${authToken}`,
          "x-org-id": testOrgId,
          "x-user-id": testUserId,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data).toHaveProperty("hasPermission");
      expect(typeof data.hasPermission).toBe("boolean");
    });
  });
});
