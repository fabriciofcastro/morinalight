import type { Role } from "../entities/role";

export interface RoleRepository {
  save(role: Role): Promise<void>;
  findById(id: string): Promise<Role | null>;
  findByOrgId(orgId: string): Promise<Role[]>;
  delete(id: string): Promise<void>;
  addPermission(roleId: string, permissionId: string): Promise<void>;
  removePermission(roleId: string, permissionId: string): Promise<void>;
  getPermissions(roleId: string): Promise<string[]>; // Returns permission IDs
}
