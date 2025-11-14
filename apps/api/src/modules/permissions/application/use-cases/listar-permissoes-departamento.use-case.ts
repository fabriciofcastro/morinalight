import type { DepartmentPermissionRepository } from "../../domain/repositories/department-permission-repository";
import type { DepartmentRepository } from "../../../organizational-structure/domain/repositories/department-repository";
import type { PermissionRepository } from "../../domain/repositories/permission-repository";
import { z } from "zod";

const listarPermissoesDepartamentoInputSchema = z.object({
  orgId: z.string().uuid(),
  departmentId: z.string().uuid(),
});

type Dependencies = {
  departmentPermissionRepository: DepartmentPermissionRepository;
  departmentRepository: DepartmentRepository;
  permissionRepository: PermissionRepository;
};

export class ListarPermissoesDepartamentoUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = listarPermissoesDepartamentoInputSchema.parse(rawInput);

    // Verificar se o departamento existe
    const department = await this.deps.departmentRepository.encontrarPorId(
      input.orgId,
      input.departmentId,
    );

    if (!department) {
      throw new Error("Departamento não encontrado");
    }

    // Buscar permissões do departamento
    const departmentPermissions =
      await this.deps.departmentPermissionRepository.listarPorDepartment(
        input.orgId,
        input.departmentId,
      );

    // Buscar detalhes das permissões
    const permissionIds = departmentPermissions.map((dp) => dp.permissionId);
    const permissions = await Promise.all(
      permissionIds.map(async (permissionId) => {
        let permission = await this.deps.permissionRepository.encontrarPorId(permissionId);
        if (!permission) {
          // Tentar buscar por chave (resource:action)
          const [resource, action] = permissionId.split(":");
          if (resource && action) {
            permission = await this.deps.permissionRepository.encontrarPorChave(resource, action);
          }
        }
        return permission;
      }),
    );

    // Combinar permissões com dados do departamento
    return departmentPermissions.map((dp, index) => {
      const permission = permissions[index];
      return {
        id: dp.id,
        departmentId: dp.departmentId,
        permissionId: dp.permissionId,
        permissionKey: permission?.permissionKey || dp.permissionId,
        permissionName: permission?.dados.name || dp.permissionId,
        granted: dp.granted,
        createdAt: dp.createdAt,
        updatedAt: dp.updatedAt,
      };
    });
  }
}

