import type { FastifyRequest } from "fastify";
import type { TenantContext } from "./tenant.types";

/**
 * Extrai o orgId dos parâmetros da rota
 */
export function extractOrgIdFromParams(request: FastifyRequest): string | null {
  const params = request.params as Record<string, string | undefined>;
  return params.orgId ?? null;
}

/**
 * Extrai o orgId dos headers
 */
export function extractOrgIdFromHeaders(request: FastifyRequest): string | null {
  const headerOrgId = request.headers["x-org-id"];
  if (typeof headerOrgId === "string") {
    return headerOrgId;
  }
  return null;
}

/**
 * Extrai o orgId dos parâmetros primeiro, depois dos headers
 */
export function extractOrgIdFromParamsOrHeaders(request: FastifyRequest): string | null {
  return extractOrgIdFromParams(request) || extractOrgIdFromHeaders(request);
}

/**
 * Verifica se a requisição tem contexto de tenant
 */
export function hasTenant(request: FastifyRequest): request is FastifyRequest & {
  tenant: TenantContext;
} {
  return request.tenant !== undefined;
}

/**
 * Obtém o contexto de tenant da requisição
 * Lança erro se não houver contexto
 */
export function getTenant(request: FastifyRequest): TenantContext {
  if (!request.tenant) {
    throw new Error("Contexto de tenant não disponível na requisição");
  }
  return request.tenant;
}

/**
 * Verifica se o tenant tem uma role específica
 */
export function hasRole(request: FastifyRequest, role: string | string[]): boolean {
  if (!request.tenant) {
    return false;
  }

  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(request.tenant.role);
}

/**
 * Verifica se o tenant tem permissão de gerenciar (owner ou admin)
 */
export function canManage(request: FastifyRequest): boolean {
  return hasRole(request, ["owner", "admin"]);
}

/**
 * Verifica se o tenant é owner
 */
export function isOwner(request: FastifyRequest): boolean {
  return hasRole(request, "owner");
}
