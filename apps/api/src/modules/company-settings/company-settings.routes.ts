import type { FastifyInstance } from "fastify";

import { canManage, getTenant } from "../../core/tenant/tenant.utils";
import { prisma } from "../../infra/prisma/client";
import {
  getChangedFields,
  logCompanySettingsChange,
  FIELD_LABELS,
} from "./audit-logger";
import {
  type CompanySettings,
  companySettingsSchema,
  DEFAULT_COMPANY_SETTINGS,
} from "./company-settings.schema";
import type { CompanySettingsRepository } from "./repositories/company-settings.repository";
import { governanceService } from "../governance/governance.service";

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

  app.put("/company-settings", {
    config: {
      governance: {
        screen: "COMPANY_SETTINGS",
        action: "EDIT"
      }
    }
  }, async (request, reply) => {
    // Tentar obter tenant, mas não falhar se não houver (para desenvolvimento)
    let orgId: string | null = null;
    let hasPermission = false;
    let actorId = "unknown";
    let actorName = "Unknown User";

    try {
      const tenant = getTenant(request);
      orgId = tenant.orgId;
      hasPermission = canManage(request);

      // Tentar obter informações do usuário
      if ((request as any).user) {
        actorId = (request as any).user.userId || (request as any).user.id;
        actorName = (request as any).user.displayName || (request as any).user.email;
      }
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

    // Capturar estado anterior para auditoria
    const current = await repository.find(orgId);

    // Check for Approval Workflow
    const approvalWorkflow = await governanceService.checkApprovalNeeded(orgId, "COMPANY_SETTINGS", body, current);

    const isDraft = (request.query as any)?.draft === 'true';

    if (approvalWorkflow) {
      // Create Request
      const status = isDraft ? 'DRAFT' : 'PENDING';
      const req = await governanceService.createRequest(orgId, actorId, approvalWorkflow.id, body, status);

      return reply.status(202).send({
        message: isDraft ? "Rascunho salvo com sucesso" : "Alteração enviada para aprovação",
        requestId: req.id,
        status: isDraft ? "DRAFT_SAVED" : "PENDING_APPROVAL"
      });
    }

    const merged: CompanySettings = {
      ...DEFAULT_COMPANY_SETTINGS,
      ...current,
      ...body,
    };

    await repository.save(orgId, merged);

    // Registrar alterações no audit log
    if (current) {
      const changes = getChangedFields(current, body);

      const ipAddress = request.ip || request.headers["x-real-ip"] as string || request.headers["x-forwarded-for"] as string;
      const userAgent = request.headers["user-agent"];

      for (const change of changes) {
        await logCompanySettingsChange(prisma, {
          orgId,
          action: "update",
          entity: "company_settings",
          fieldName: change.fieldName,
          fieldLabel: FIELD_LABELS[change.fieldName] || change.fieldName,
          oldValue: change.oldValue,
          newValue: change.newValue,
          actorId,
          actorName,
          ipAddress,
          userAgent,
        });
      }
    } else {
      // Criação inicial
      await logCompanySettingsChange(prisma, {
        orgId,
        action: "create",
        entity: "company_settings",
        oldValue: null,
        newValue: body,
        actorId,
        actorName,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"],
      });
    }

    return reply.send(merged);
  });
}

function mergeWithDefaults(settings: CompanySettings | null | undefined): CompanySettings {
  return {
    ...DEFAULT_COMPANY_SETTINGS,
    ...(settings ?? {}),
  };
}

