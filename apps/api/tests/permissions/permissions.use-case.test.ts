import { beforeEach, describe, expect, it } from "vitest";
import type { OrganizationRepository } from "../../src/modules/organizations/repositories/organization.repository";
import { ListarUserPermissionsUseCase } from "../../src/modules/permissions/application/use-cases/listar-user-permissions.use-case";
import { VerificarPermissionUseCase } from "../../src/modules/permissions/application/use-cases/verificar-permission.use-case";
import type { PermissionRepository } from "../../src/modules/permissions/domain/repositories/permission-repository";

describe("Permissions Use Cases", () => {
  let permissionRepository: PermissionRepository;
  let organizationRepository: OrganizationRepository;

  beforeEach(() => {
    // Mock repositories
    permissionRepository = {
      salvar: async () => {},
      encontrarPorId: async () => null,
      encontrarPorChave: async () => null,
      listar: async () => [],
      encontrarPorIds: async () => [],
    } as PermissionRepository;

    organizationRepository = {
      encontrarMembership: async (orgId: string, userId: string) => {
        if (userId === "admin-user") {
          return {
            userId,
            orgId,
            role: "admin",
            createdAt: new Date(),
          };
        }
        if (userId === "member-user") {
          return {
            userId,
            orgId,
            role: "member",
            createdAt: new Date(),
          };
        }
        return undefined;
      },
    } as unknown as OrganizationRepository;
  });

  describe("ListarUserPermissionsUseCase", () => {
    it("deve listar permissões do usuário admin", async () => {
      const useCase = new ListarUserPermissionsUseCase({
        permissionRepository,
        organizationRepository,
      });

      const resultado = await useCase.execute({
        orgId: "test-org",
        userId: "admin-user",
      });

      expect(resultado).toHaveProperty("permissions");
      expect(resultado).toHaveProperty("role", "admin");
      expect(Array.isArray(resultado.permissions)).toBe(true);
      expect(resultado.permissions.length).toBeGreaterThan(0);
    });

    it("deve listar permissões do usuário member (menos permissões)", async () => {
      const useCase = new ListarUserPermissionsUseCase({
        permissionRepository,
        organizationRepository,
      });

      const resultado = await useCase.execute({
        orgId: "test-org",
        userId: "member-user",
      });

      expect(resultado).toHaveProperty("permissions");
      expect(resultado).toHaveProperty("role", "member");
      expect(Array.isArray(resultado.permissions)).toBe(true);
    });

    it("deve retornar array vazio se usuário não for membro", async () => {
      const useCase = new ListarUserPermissionsUseCase({
        permissionRepository,
        organizationRepository,
      });

      const resultado = await useCase.execute({
        orgId: "test-org",
        userId: "non-member-user",
      });

      expect(resultado.permissions).toEqual([]);
      expect(resultado.role).toBeNull();
    });
  });

  describe("VerificarPermissionUseCase", () => {
    it("deve verificar permissão corretamente para admin", async () => {
      const useCase = new VerificarPermissionUseCase({
        permissionRepository,
        organizationRepository,
      });

      const resultado = await useCase.execute({
        orgId: "test-org",
        userId: "admin-user",
        permission: "products:view",
      });

      expect(resultado).toHaveProperty("hasPermission");
      expect(resultado.hasPermission).toBe(true);
    });

    it("deve verificar permissão corretamente para member", async () => {
      const useCase = new VerificarPermissionUseCase({
        permissionRepository,
        organizationRepository,
      });

      const resultado = await useCase.execute({
        orgId: "test-org",
        userId: "member-user",
        permission: "products:view",
      });

      expect(resultado).toHaveProperty("hasPermission");
      expect(resultado.hasPermission).toBe(true);
    });

    it("deve retornar false para permissão que member não tem", async () => {
      const useCase = new VerificarPermissionUseCase({
        permissionRepository,
        organizationRepository,
      });

      const resultado = await useCase.execute({
        orgId: "test-org",
        userId: "member-user",
        permission: "settings:permissions:view",
      });

      expect(resultado).toHaveProperty("hasPermission");
      expect(resultado.hasPermission).toBe(false);
    });

    it("deve retornar false se usuário não for membro", async () => {
      const useCase = new VerificarPermissionUseCase({
        permissionRepository,
        organizationRepository,
      });

      const resultado = await useCase.execute({
        orgId: "test-org",
        userId: "non-member-user",
        permission: "products:view",
      });

      expect(resultado).toHaveProperty("hasPermission");
      expect(resultado.hasPermission).toBe(false);
      expect(resultado.reason).toContain("não é membro");
    });

    it("deve validar formato de permissão", async () => {
      const useCase = new VerificarPermissionUseCase({
        permissionRepository,
        organizationRepository,
      });

      const resultado = await useCase.execute({
        orgId: "test-org",
        userId: "admin-user",
        permission: "invalid-format",
      });

      expect(resultado).toHaveProperty("hasPermission");
      expect(resultado.hasPermission).toBe(false);
      expect(resultado.reason).toContain("Formato inválido");
    });
  });
});
