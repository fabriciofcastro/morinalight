import type { PermissionRepository } from "../../domain/repositories/permission-repository";
import type { RoleRepository } from "../../domain/repositories/role-repository";
import { permissionViewSchema } from "../schemas/permission.schema";
import type { PermissionMatrixResponse } from "../schemas/permission-matrix.schema";

type Dependencies = {
  permissionRepository: PermissionRepository;
  roleRepository?: RoleRepository;
};

type ExecuteParams = {
  page?: number;
  limit?: number;
};

type PaginatedMatrixResponse = PermissionMatrixResponse & {
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
};

export class GetPermissionMatrixUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(params: ExecuteParams = {}): Promise<PaginatedMatrixResponse> {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const allPermissions = await this.deps.permissionRepository.listar();
    const total = allPermissions.length;
    const paginatedPermissions = allPermissions.slice(skip, skip + limit);

    const staticRoles = ["owner", "admin", "manager", "member", "viewer"];

    const rolePermissionsMap: Record<string, string[]> = {
      owner: [
        "dashboard:view",
        "products:view",
        "products:create",
        "products:edit",
        "products:delete",
        "catalog:view",
        "clients:view",
        "clients:create",
        "clients:edit",
        "clients:delete",
        "representatives:view",
        "representatives:create",
        "commissions:view",
        "commissions:pay",
        "suppliers:view",
        "suppliers:create",
        "sales:view",
        "reports:view",
        "settings:view",
        "settings:company:view",
        "settings:team:view",
        "settings:permissions:view",
      ],
      admin: [
        "dashboard:view",
        "products:view",
        "products:create",
        "products:edit",
        "products:delete",
        "catalog:view",
        "clients:view",
        "clients:create",
        "clients:edit",
        "representatives:view",
        "representatives:create",
        "commissions:view",
        "commissions:pay",
        "suppliers:view",
        "suppliers:create",
        "sales:view",
        "reports:view",
        "settings:view",
        "settings:company:view",
        "settings:team:view",
      ],
      manager: [
        "dashboard:view",
        "products:view",
        "products:create",
        "products:edit",
        "catalog:view",
        "clients:view",
        "clients:create",
        "clients:edit",
        "representatives:view",
        "representatives:create",
        "commissions:view",
        "suppliers:view",
        "suppliers:create",
        "sales:view",
        "reports:view",
      ],
      member: [
        "dashboard:view",
        "products:view",
        "catalog:view",
        "clients:view",
        "representatives:view",
        "commissions:view",
        "suppliers:view",
        "sales:view",
      ],
      viewer: [
        "dashboard:view",
        "products:view",
        "catalog:view",
        "clients:view",
        "representatives:view",
        "commissions:view",
        "suppliers:view",
      ],
    };

    const matrixPositions = paginatedPermissions.map((p) => {
      const rolesMap: Record<string, boolean> = {};

      staticRoles.forEach((role) => {
        const rolePerms = rolePermissionsMap[role] || [];
        rolesMap[role] = rolePerms.includes(p.permissionKey);
      });

      return {
        ...permissionViewSchema.parse({
          permissionId: p.permissionId,
          name: p.dados.name,
          description: p.dados.description,
          module: p.dados.module,
          category: p.dados.category,
          resource: p.dados.resource,
          action: p.dados.action,
          createdAt: p.dados.createdAt,
          updatedAt: p.dados.updatedAt,
        }),
        roles: rolesMap,
      };
    });

    return {
      roles: staticRoles,
      permissions: matrixPositions,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    };
  }
}
