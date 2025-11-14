import type {
  PermissionFiltro,
  PermissionRepository,
} from "../../domain/repositories/permission-repository";
import { Permission } from "../../domain/entities/permission";
import { getPrisma } from "../../../../infra/database/prisma.service";

const prisma = getPrisma();

function toDomain(record: {
  id: string;
  name: string;
  description: string | null;
  module: string;
  category: string;
  resource: string;
  action: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return Permission.restaurar({
    id: record.id,
    name: record.name,
    description: record.description,
    module: record.module,
    category: record.category,
    resource: record.resource,
    action: record.action,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

export class PrismaPermissionRepository implements PermissionRepository {
  async salvar(permission: Permission) {
    const dados = permission.dados;

    // Por enquanto, usar tabela mockada
    // TODO: Implementar quando a tabela Permission for criada no Prisma
    await prisma.$executeRawUnsafe(`
      INSERT INTO "Permission" (id, name, description, module, category, resource, action, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (resource, action) DO UPDATE
      SET name = EXCLUDED.name,
          description = EXCLUDED.description,
          module = EXCLUDED.module,
          category = EXCLUDED.category,
          "updatedAt" = EXCLUDED."updatedAt"
    `,
      dados.id,
      dados.name,
      dados.description,
      dados.module,
      dados.category,
      dados.resource,
      dados.action,
      dados.createdAt,
      dados.updatedAt,
    );
  }

  async encontrarPorId(permissionId: string) {
    try {
      const record = await prisma.$queryRawUnsafe<Array<{
        id: string;
        name: string;
        description: string | null;
        module: string;
        category: string;
        resource: string;
        action: string;
        createdAt: Date;
        updatedAt: Date;
      }>>(
        `SELECT * FROM "Permission" WHERE id = $1`,
        permissionId,
      );

      if (!record || record.length === 0) {
        return null;
      }

      return toDomain(record[0]);
    } catch (error) {
      // Se a tabela não existir, retornar null
      return null;
    }
  }

  async encontrarPorChave(resource: string, action: string) {
    try {
      const record = await prisma.$queryRawUnsafe<Array<{
        id: string;
        name: string;
        description: string | null;
        module: string;
        category: string;
        resource: string;
        action: string;
        createdAt: Date;
        updatedAt: Date;
      }>>(
        `SELECT * FROM "Permission" WHERE resource = $1 AND action = $2`,
        resource,
        action,
      );

      if (!record || record.length === 0) {
        return null;
      }

      return toDomain(record[0]);
    } catch (error) {
      return null;
    }
  }

  async listar(filtro?: PermissionFiltro) {
    try {
      let query = `SELECT * FROM "Permission" WHERE 1=1`;
      const params: unknown[] = [];
      let paramIndex = 1;

      if (filtro?.module) {
        query += ` AND module = $${paramIndex++}`;
        params.push(filtro.module);
      }

      if (filtro?.category) {
        query += ` AND category = $${paramIndex++}`;
        params.push(filtro.category);
      }

      if (filtro?.resource) {
        query += ` AND resource = $${paramIndex++}`;
        params.push(filtro.resource);
      }

      if (filtro?.busca) {
        query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex++})`;
        params.push(`%${filtro.busca}%`);
      }

      query += ` ORDER BY module, category, name`;

      const records = await prisma.$queryRawUnsafe<Array<{
        id: string;
        name: string;
        description: string | null;
        module: string;
        category: string;
        resource: string;
        action: string;
        createdAt: Date;
        updatedAt: Date;
      }>>(query, ...params);

      return records.map(toDomain);
    } catch (error) {
      return [];
    }
  }

  async encontrarPorIds(ids: string[]): Promise<Permission[]> {
    if (ids.length === 0) {
      return [];
    }

    try {
      // Para cada ID, tentar buscar por chave (resource:action) primeiro
      // Se não encontrar, retornar permissão mockada baseada no ID
      const permissions: Permission[] = [];
      
      for (const id of ids) {
        // Tentar parsear como "resource:action"
        const parts = id.split(":");
        if (parts.length === 2) {
          const [resource, action] = parts;
          const permission = await this.encontrarPorChave(resource, action);
          if (permission) {
            permissions.push(permission);
          } else {
            // Criar permissão mockada baseada no padrão
            permissions.push(
              Permission.criar({
                id: `${resource}:${action}`,
                name: `${resource}:${action}`,
                description: null,
                module: "Sistema",
                category: "Acesso",
                resource,
                action,
              }),
            );
          }
        }
      }

      return permissions;
    } catch (error) {
      console.error("Erro ao buscar permissões por IDs:", error);
      return [];
    }
  }
}

