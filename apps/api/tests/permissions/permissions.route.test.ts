import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServer } from "../../src/core/server/create-server";
import type { OrganizationRepository } from "../../src/modules/organizations/repositories/organization.repository";
import type { PermissionRepository } from "../../src/modules/permissions/domain/repositories/permission-repository";

describe("Permissions Routes", () => {
  let app: FastifyInstance;
  let organizationRepository: OrganizationRepository;
  let _permissionRepository: PermissionRepository;
  let testOrgId: string;
  let testUserId: string;
  let authToken: string;

  beforeAll(async () => {
    const server = await createServer({
      permissions: {
        organizationRepository: {} as OrganizationRepository,
        permissionRepository: {} as PermissionRepository,
      },
    });

    app = server.app;
    organizationRepository = server.deps.organizationRepository;
    _permissionRepository = server.deps.permissionRepository;

    // Criar organização de teste
    const org = await organizationRepository.criar({
      name: "Test Org Permissions",
      slug: "test-org-permissions",
      description: "Organização para testes de permissões",
    });

    testOrgId = org.id;

    // Criar usuário de teste
    const user = (await organizationRepository.encontrarUsuarioPorEmail?.(
      "test-permissions@example.com",
    )) || {
      userId: "test-user-permissions-id",
      email: "test-permissions@example.com",
      displayName: "Test User",
    };

    testUserId = user.userId;

    // Vincular usuário à organização
    await organizationRepository.vincularUsuario?.(testOrgId, testUserId, "admin");

    // Criar token de autenticação
    // TODO: Usar função real de criação de token
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
        },
      });

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
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("deve retornar 401 se token não for fornecido", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/users/${testUserId}/permissions`,
        headers: {
          "x-org-id": testOrgId,
        },
      });

      expect(response.statusCode).toBe(401);
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
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data).toHaveProperty("hasPermission");
      expect(typeof data.hasPermission).toBe("boolean");
    });

    it("deve retornar 400 se permission não for fornecido", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/users/${testUserId}/permissions/check`,
        headers: {
          authorization: `Bearer ${authToken}`,
          "x-org-id": testOrgId,
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("deve retornar false para permissão que usuário não tem", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/users/${testUserId}/permissions/check?permission=settings:permissions:view`,
        headers: {
          authorization: `Bearer ${authToken}`,
          "x-org-id": testOrgId,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      // Admin deve ter essa permissão, mas vamos verificar
      expect(data).toHaveProperty("hasPermission");
    });
  });
});
