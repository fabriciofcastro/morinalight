import type { FastifyInstance } from "fastify";

import { canManage, getTenant } from "../../core/tenant/tenant.utils";
import {
  type CompanySettings,
  companySettingsSchema,
  DEFAULT_COMPANY_SETTINGS,
} from "./company-settings.schema";
import type { CompanySettingsRepository } from "./repositories/company-settings.repository";

export async function registerCompanySettingsRoutes(
  app: FastifyInstance,
  repository: CompanySettingsRepository,
) {
  app.get("/company-settings", async (request, reply) => {
    // Tentar obter tenant, mas não falhar se não houver (para desenvolvimento)
    let orgId: string | null = null;
    
    try {
      const tenant = getTenant(request);
      orgId = tenant.orgId;
    } catch {
      // Se não houver tenant, tentar obter do header ou usar default
      orgId = request.headers["x-org-id"] as string | null;
      
      if (!orgId) {
        // Em desenvolvimento, retornar configurações padrão
        if (process.env.NODE_ENV === "development") {
          return reply.send(mergeWithDefaults(null));
        }
        
        return reply.status(400).send({
          message: "x-org-id é obrigatório",
        });
      }
    }

    const stored = await repository.find(orgId);
    const response = mergeWithDefaults(stored);

    return reply.send(response);
  });

  app.put("/company-settings", async (request, reply) => {
    // Tentar obter tenant, mas não falhar se não houver (para desenvolvimento)
    let orgId: string | null = null;
    let hasPermission = false;
    
    try {
      const tenant = getTenant(request);
      orgId = tenant.orgId;
      hasPermission = canManage(request);
    } catch {
      // Se não houver tenant, tentar obter do header
      orgId = request.headers["x-org-id"] as string | null;
      
      if (!orgId) {
        return reply.status(400).send({
          message: "x-org-id é obrigatório",
        });
      }
      
      // Em desenvolvimento, permitir sem verificação de permissão
      hasPermission = process.env.NODE_ENV === "development";
    }

    // Atualização requer permissão de gerenciamento (admin ou owner)
    if (!hasPermission) {
      return reply.status(403).send({
        message: "Sem permissão para atualizar configurações. Requer role de admin ou owner",
      });
    }

    const result = companySettingsSchema.partial().safeParse(request.body ?? {});

    if (!result.success) {
      return reply.status(400).send({
        message: "Não foi possível validar as configurações da empresa.",
        errors: result.error.format(),
      });
    }

    const body = result.data;

    const current = await repository.find(orgId);
    const merged: CompanySettings = {
      ...DEFAULT_COMPANY_SETTINGS,
      ...current,
      ...body,
    };

    await repository.save(orgId, merged);

    return reply.send(merged);
  });
}

function mergeWithDefaults(settings: CompanySettings | null | undefined): CompanySettings {
  return {
    ...DEFAULT_COMPANY_SETTINGS,
    ...(settings ?? {}),
  };
}
