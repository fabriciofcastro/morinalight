import { getPrisma } from "../../../../infra/database/prisma.service";
import { Role } from "../../domain/entities/role";
import type { RoleRepository } from "../../domain/repositories/role-repository";

const prisma = getPrisma();

function toDomain(record: {
    id: string;
    orgId: string;
    name: string;
    code: string;
    description: string | null;
    scope: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}) {
    return Role.restaurar({
        id: record.id,
        orgId: record.orgId,
        name: record.name,
        code: record.code,
        description: record.description,
        scope: record.scope,
        active: record.active,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    });
}

export class PrismaRoleRepository implements RoleRepository {
    async save(role: Role): Promise<void> {
        const dados = role.dados;

        await prisma.role.upsert({
            where: { id: role.roleId },
            create: {
                id: role.roleId,
                orgId: dados.orgId,
                name: dados.name,
                code: dados.code,
                description: dados.description,
                scope: dados.scope,
                active: dados.active,
                createdAt: dados.createdAt,
                updatedAt: dados.updatedAt,
            },
            update: {
                name: dados.name,
                code: dados.code,
                description: dados.description,
                scope: dados.scope,
                active: dados.active,
                updatedAt: dados.updatedAt,
            },
        });
    }

    async findById(id: string): Promise<Role | null> {
        const record = await prisma.role.findUnique({ where: { id } });

        if (!record) {
            return null;
        }

        return toDomain(record);
    }

    async findByOrgId(orgId: string): Promise<Role[]> {
        const records = await prisma.role.findMany({
            where: { orgId },
            orderBy: { name: "asc" },
        });

        return records.map(toDomain);
    }

    async delete(id: string): Promise<void> {
        await prisma.role.delete({
            where: { id },
        });
    }

    async addPermission(roleId: string, permissionId: string): Promise<void> {
        await prisma.rolePermission.create({
            data: {
                roleId,
                permissionId,
            },
        });
    }

    async removePermission(roleId: string, permissionId: string): Promise<void> {
        await prisma.rolePermission.deleteMany({
            where: {
                roleId,
                permissionId,
            },
        });
    }

    async getPermissions(roleId: string): Promise<string[]> {
        const rolePermissions = await prisma.rolePermission.findMany({
            where: { roleId },
            select: { permissionId: true },
        });

        return rolePermissions.map((rp) => rp.permissionId);
    }
}
