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
    const adminId = "00000000-0000-0000-0000-000000000001";
    const memberId = "00000000-0000-0000-0000-000000000002";

    permissionRepository = {
      salvar: async () => { },
      encontrarPorId: async () => null,
      encontrarPorChave: async () => null,
      listar: async () => [],
      encontrarPorIds: async (ids: string[]) => {
        return ids.map((id) => ({
          permissionId: id,
          permissionKey: id,
          dados: {
            name: `Permission ${id}`,
            description: "Mock desc",
            module: "mock",
            category: "mock",
            resource: id.split(":")[0] || "mock",
            action: id.split(":")[1] || "mock",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        }));
      },
      deletar: async () => { },
      listarSecurityPolicies: async () => [],
      listarAclEntries: async () => [],
    } as unknown as PermissionRepository;

    organizationRepository = {
      encontrarMembership: async (orgId: string, userId: string) => {
        if (userId === adminId) {
          return {
            userId,
            organizationId: orgId,
            role: "admin",
            createdAt: new Date(),
          };
        }
        if (userId === memberId) {
          return {
            userId,
            organizationId: orgId,
            role: "member",
            createdAt: new Date(),
          };
        }
        return undefined;
      },
    } as unknown as OrganizationRepository;
  });

  describe("ListarUserPermissionsUseCase", () => {
    const adminId = "00000000-0000-0000-0000-000000000001";
    const memberId = "00000000-0000-0000-0000-000000000002";
    const nonMemberId = "00000000-0000-0000-0000-000000000099";

    it("deve listar permissões do usuário admin", async () => {
      const useCase = new ListarUserPermissionsUseCase({
        permissionRepository,
        organizationRepository,
      });

      const resultado = await useCase.execute({
        orgId: "test-org",
        userId: adminId,
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
        userId: memberId,
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
        userId: nonMemberId,
      });

      expect(resultado.permissions).toEqual([]);
      expect(resultado.role).toBeNull();
    });
  });

  describe("VerificarPermissionUseCase", () => {
    const adminId = "00000000-0000-0000-0000-000000000001";
    const memberId = "00000000-0000-0000-0000-000000000002";
    const nonMemberId = "00000000-0000-0000-0000-000000000099";

    it("deve verificar permissão corretamente para admin", async () => {
      const useCase = new VerificarPermissionUseCase({
        permissionRepository,
        organizationRepository,
      });

      const resultado = await useCase.execute({
        orgId: "test-org",
        userId: adminId,
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
        userId: memberId,
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
        userId: memberId,
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
        userId: nonMemberId,
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
        userId: adminId,
        permission: "invalid-format",
      });

      expect(resultado).toHaveProperty("hasPermission");
      expect(resultado.hasPermission).toBe(false);
      expect(resultado.reason).toContain("Formato");
    });
  });
});
