import type { FastifyInstance } from "fastify";
import { z } from "zod";

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
    // Validar tenant (deve ser aplicado via hook ou middleware antes desta rota)
    const tenant = getTenant(request);

    const stored = await repository.find(tenant.orgId);
    const response = mergeWithDefaults(stored);

    return reply.send(response);
  });

  app.put("/company-settings", async (request, reply) => {
    // Validar tenant (deve ser aplicado via hook ou middleware antes desta rota)
    const tenant = getTenant(request);

    // Atualização requer permissão de gerenciamento (admin ou owner)
    if (!canManage(request)) {
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

    const current = await repository.find(tenant.orgId);
    const merged: CompanySettings = {
      ...DEFAULT_COMPANY_SETTINGS,
      ...current,
      ...body,
    };

    await repository.save(tenant.orgId, merged);

    return reply.send(merged);
  });
}

function mergeWithDefaults(settings: CompanySettings | null | undefined): CompanySettings {
  return {
    ...DEFAULT_COMPANY_SETTINGS,
    ...(settings ?? {}),
  };
}
