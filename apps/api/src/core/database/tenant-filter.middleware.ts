/**
 * Prisma Middleware para Filtro Automático por Tenant
 * Garante isolamento de dados multi-tenant em todas as queries
 */

import type { PrismaClient } from "@prisma/client";

// Modelos que requerem filtro por orgId
const TENANT_MODELS = [
  "User",
  "Product",
  "Notification",
  "Department",
  "Sector",
  "Position",
  "FichaCusto",
  "PreFichaTecnica",
  "Cliente",
  "Representante",
  "Venda",
  "Comissao",
  "Permission",
  "Role",
  "UserPermission",
  "PositionPermission",
  "SectorPermission",
  "DepartmentPermission",
] as const;

// Contexto de tenant (será definido por middleware HTTP)
let currentTenantOrgId: string | null = null;

/**
 * Define o orgId do tenant atual (chamado pelo middleware HTTP)
 */
export function setTenantContext(orgId: string | null): void {
  currentTenantOrgId = orgId;
}

/**
 * Obtém o orgId do tenant atual
 */
export function getTenantContext(): string | null {
  return currentTenantOrgId;
}

/**
 * Registra middleware do Prisma para filtro automático por tenant
 */
export function registerTenantFilterMiddleware(prisma: PrismaClient): void {
  prisma.$use(async (params, next) => {
    // Se não houver contexto de tenant, não filtrar
    if (!currentTenantOrgId) {
      return next(params);
    }


    // Verificar se o modelo requer filtro por tenant
    if (!params.model || !TENANT_MODELS.includes(params.model as (typeof TENANT_MODELS)[number])) {
      return next(params);
    }

    // interface para tipar os args que sabemos que existem nos modelos TENANT_MODELS
    interface TenantAwareArgs {
      where?: { orgId?: string };
      data?: { orgId?: string };
    }

    const tenantArgs = params.args as TenantAwareArgs;

    // Adicionar filtro orgId automaticamente
    if (
      params.action === "findUnique" ||
      params.action === "findFirst" ||
      params.action === "findMany"
    ) {
      if (!params.args.where) {
        params.args.where = {};
      }

      // Adicionar orgId ao where
      if (tenantArgs.where) {
          tenantArgs.where.orgId = currentTenantOrgId;
      }
    }

    // Para create, update, delete, também validar orgId
    if (params.action === "create") {
      if (params.args.data && typeof params.args.data === "object") {
        // Garantir que orgId está definido
        if (tenantArgs.data) {
             tenantArgs.data.orgId = currentTenantOrgId;
        }
      }
    }

    if (params.action === "update" || params.action === "updateMany") {
      if (!params.args.where) {
        params.args.where = {};
      }
      // Adicionar orgId ao where para garantir que só atualiza recursos do tenant
      if (tenantArgs.where) {
          tenantArgs.where.orgId = currentTenantOrgId;
      }
    }

    if (params.action === "delete" || params.action === "deleteMany") {
      if (!params.args.where) {
        params.args.where = {};
      }
      // Adicionar orgId ao where para garantir que só deleta recursos do tenant
      if (tenantArgs.where) {
          tenantArgs.where.orgId = currentTenantOrgId;
      }
    }

    return next(params);
  });
}
