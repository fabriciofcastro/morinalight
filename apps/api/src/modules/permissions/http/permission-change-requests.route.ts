import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import type { WorkflowPolicyRepository } from "../../organizational-structure/domain/repositories/workflow-policy-repository";
import type { OrganizationRepository } from "../../organizations/repositories/organization.repository";
import type { DepartmentPermissionRepository } from "../domain/repositories/department-permission-repository";
import type { PermissionAuditLogRepository } from "../domain/repositories/permission-audit-log-repository";
import type { PermissionChangeRequestRepository } from "../domain/repositories/permission-change-request-repository";
import type { PermissionRepository } from "../domain/repositories/permission-repository";
import type { PositionPermissionRepository } from "../domain/repositories/position-permission-repository";
import type { SectorPermissionRepository } from "../domain/repositories/sector-permission-repository";
import type { UserPermissionRepository } from "../domain/repositories/user-permission-repository";

type RbacApprovalPolicyConfig = {
  enabled?: boolean;
  slaMinutes?: number;
  notifyBeforeDueMinutes?: number;
  requireApprovalFor?: {
    entityTypes?: Array<"position" | "sector" | "department" | "user">;
    actions?: Array<"grant" | "deny" | "remove">;
    permissionKeyPrefixes?: string[];
    permissionIds?: string[];
  };
  approverOrgRoles?: Array<"owner" | "admin" | "manager">;
};

export async function maybeRequireApprovalForRbacChange(input: {
  workflowPolicyRepository: WorkflowPolicyRepository;
  permissionChangeRequestRepository: PermissionChangeRequestRepository;
  permissionRepository: PermissionRepository;
  orgId: string;
  actorId: string;
  entityType: "position" | "sector" | "department" | "user";
  entityId: string;
  permissionId: string;
  granted: boolean;
  reason?: string | null;
  eventBus?: DomainEventBus;
}) {
  const policy = await findActiveRbacApprovalPolicy({
    workflowPolicyRepository: input.workflowPolicyRepository,
    orgId: input.orgId,
  });
  const config = normalizeConfig(policy?.dados.config);

  // Resolve permissionKey (best-effort)
  const permission =
    (await input.permissionRepository.encontrarPorId(input.permissionId)) ??
    (await (async () => {
      const [resource, action] = input.permissionId.split(":");
      if (resource && action) {
        return input.permissionRepository.encontrarPorChave(resource, action);
      }
      return null;
    })());

  const action = input.granted ? "grant" : "deny";
  const permissionKey = permission?.permissionKey;
  const permissionId = permission?.permissionId ?? input.permissionId;

  const needs = shouldRequireApproval({
    policyConfig: config,
    entityType: input.entityType,
    action,
    permissionKey,
    permissionId,
  });

  if (!needs) {
    return { required: false as const };
  }

  const reqId = randomUUID();
  const now = new Date();
  const slaMinutes =
    typeof config.slaMinutes === "number" && config.slaMinutes > 0 ? config.slaMinutes : 60;
  const slaDueAt = new Date(now.getTime() + slaMinutes * 60_000);

  await input.permissionChangeRequestRepository.criar({
    id: reqId,
    orgId: input.orgId,
    entityType: input.entityType,
    entityId: input.entityId,
    permissionId,
    granted: input.granted,
    reason: input.reason ?? null,
    status: "pending",
    requestedBy: input.actorId,
    decidedBy: null,
    decidedAt: null,
    decisionReason: null,
    slaDueAt,
    slaNotifiedAt: null,
    slaBreachedAt: null,
    createdAt: now,
    updatedAt: now,
  });

  if (input.eventBus) {
    await input.eventBus.publish({
      name: "Permissions.PermissionChangeRequested",
      version: "v1",
      metadata: {
        eventId: randomUUID(),
        orgId: input.orgId,
        actorId: input.actorId,
        timestamp: now,
      },
      payload: {
        requestId: reqId,
        entityType: input.entityType,
        entityId: input.entityId,
        permissionId,
        permissionKey,
        granted: input.granted,
        reason: input.reason ?? null,
      },
    });

    // Notificação in-app (via mensageria)
    await input.eventBus.publish({
      name: "Notification.Created",
      version: "v1",
      metadata: {
        eventId: randomUUID(),
        orgId: input.orgId,
        actorId: input.actorId,
        timestamp: now,
      },
      payload: {
        type: "warning",
        title: "Mudança de permissão pendente",
        message: `Solicitação RBAC ${reqId} enviada para aprovação (SLA: ${slaMinutes} min).`,
        action: { label: "Abrir aprovações", url: "/admin/permissions/approvals" },
        metadata: {
          requestId: reqId,
          entityType: input.entityType,
          entityId: input.entityId,
          permissionId,
        },
      },
    });
  }

  return {
    required: true as const,
    requestId: reqId,
    permissionId,
    permissionKey,
    status: "pending" as const,
  };
}

function normalizeConfig(config: unknown): RbacApprovalPolicyConfig {
  if (!config || typeof config !== "object") return {};
  return config as RbacApprovalPolicyConfig;
}

async function findActiveRbacApprovalPolicy(opts: {
  workflowPolicyRepository: WorkflowPolicyRepository;
  orgId: string;
}) {
  const policies = await opts.workflowPolicyRepository.findAll({ orgId: opts.orgId, active: true });
  return (
    policies.find((p) => p.dados.module === "RBAC" && p.dados.flowType === "PERMISSION_CHANGE") ??
    null
  );
}

function shouldRequireApproval(input: {
  policyConfig: RbacApprovalPolicyConfig;
  entityType: "position" | "sector" | "department" | "user";
  action: "grant" | "deny" | "remove";
  permissionKey?: string;
  permissionId: string;
}) {
  if (!input.policyConfig.enabled) return false;
  const rule = input.policyConfig.requireApprovalFor;
  if (!rule) return false;
  if (
    rule.entityTypes &&
    rule.entityTypes.length > 0 &&
    !rule.entityTypes.includes(input.entityType)
  ) {
    return false;
  }
  if (rule.actions && rule.actions.length > 0 && !rule.actions.includes(input.action)) {
    return false;
  }
  if (
    rule.permissionIds &&
    rule.permissionIds.length > 0 &&
    rule.permissionIds.includes(input.permissionId)
  ) {
    return true;
  }
  if (rule.permissionKeyPrefixes && rule.permissionKeyPrefixes.length > 0 && input.permissionKey) {
    const permissionKey = input.permissionKey;
    return rule.permissionKeyPrefixes.some((p) => permissionKey.startsWith(p));
  }
  // Default: if enabled but no match rules, do not require approval.
  return false;
}

async function assertCanDecide(opts: {
  organizationRepository: OrganizationRepository;
  orgId: string;
  actorId: string;
  policyConfig: RbacApprovalPolicyConfig;
}) {
  const membership = await opts.organizationRepository.encontrarMembership?.(
    opts.orgId,
    opts.actorId,
  );
  if (!membership) throw new Error("Usuário não pertence à organização");

  const allowed = opts.policyConfig.approverOrgRoles ?? ["owner", "admin"];
  if (!allowed.includes(membership.role as (typeof allowed)[number])) {
    throw new Error("Sem permissão para aprovar/rejeitar");
  }
}

async function applyApprovedChange(opts: {
  orgId: string;
  actorId: string;
  entityType: "position" | "sector" | "department" | "user";
  entityId: string;
  permissionId: string;
  granted: boolean;
  reason: string | null;
  // deps
  positionPermissionRepository?: PositionPermissionRepository;
  sectorPermissionRepository?: SectorPermissionRepository;
  departmentPermissionRepository?: DepartmentPermissionRepository;
  userPermissionRepository?: UserPermissionRepository;
  auditLogRepository?: PermissionAuditLogRepository;
  permissionRepository: PermissionRepository;
  eventBus?: DomainEventBus;
}) {
  const permission = await opts.permissionRepository.encontrarPorId(opts.permissionId);
  const permissionKey = permission?.permissionKey;

  const now = new Date();
  const action = opts.granted ? "granted" : "denied";

  if (opts.entityType === "position") {
    if (!opts.positionPermissionRepository)
      throw new Error("positionPermissionRepository não configurado");
    const existente = await opts.positionPermissionRepository.encontrarPorPositionEPermission(
      opts.orgId,
      opts.entityId,
      opts.permissionId,
    );
    await opts.positionPermissionRepository.salvar({
      id: existente?.id ?? randomUUID(),
      orgId: opts.orgId,
      positionId: opts.entityId,
      permissionId: opts.permissionId,
      granted: opts.granted,
      createdAt: existente?.createdAt ?? now,
      updatedAt: now,
      createdBy: existente?.createdBy ?? opts.actorId,
      updatedBy: opts.actorId,
    });
    if (opts.auditLogRepository) {
      await opts.auditLogRepository.registrar({
        id: randomUUID(),
        orgId: opts.orgId,
        entityType: "position",
        entityId: opts.entityId,
        permissionId: opts.permissionId,
        action,
        granted: opts.granted,
        previousValue: existente?.granted ?? null,
        actorId: opts.actorId,
        reason: opts.reason,
        metadata: { permissionKey },
        createdAt: now,
      });
    }
    if (opts.eventBus) {
      await opts.eventBus.publish({
        name: "Permissions.PositionPermissionChanged",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: opts.orgId,
          actorId: opts.actorId,
          timestamp: now,
        },
        payload: {
          entityType: "position",
          entityId: opts.entityId,
          permissionId: opts.permissionId,
          permissionKey,
          granted: opts.granted,
          reason: opts.reason,
        },
      });
    }
    return;
  }

  if (opts.entityType === "sector") {
    if (!opts.sectorPermissionRepository)
      throw new Error("sectorPermissionRepository não configurado");
    const existente = await opts.sectorPermissionRepository.encontrarPorSectorEPermission(
      opts.orgId,
      opts.entityId,
      opts.permissionId,
    );
    await opts.sectorPermissionRepository.salvar({
      id: existente?.id ?? randomUUID(),
      orgId: opts.orgId,
      sectorId: opts.entityId,
      permissionId: opts.permissionId,
      granted: opts.granted,
      createdAt: existente?.createdAt ?? now,
      updatedAt: now,
      createdBy: existente?.createdBy ?? opts.actorId,
      updatedBy: opts.actorId,
    });
    if (opts.auditLogRepository) {
      await opts.auditLogRepository.registrar({
        id: randomUUID(),
        orgId: opts.orgId,
        entityType: "sector",
        entityId: opts.entityId,
        permissionId: opts.permissionId,
        action,
        granted: opts.granted,
        previousValue: existente?.granted ?? null,
        actorId: opts.actorId,
        reason: opts.reason,
        metadata: { permissionKey },
        createdAt: now,
      });
    }
    if (opts.eventBus) {
      await opts.eventBus.publish({
        name: "Permissions.SectorPermissionChanged",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: opts.orgId,
          actorId: opts.actorId,
          timestamp: now,
        },
        payload: {
          entityType: "sector",
          entityId: opts.entityId,
          permissionId: opts.permissionId,
          permissionKey,
          granted: opts.granted,
          reason: opts.reason,
        },
      });
    }
    return;
  }

  if (opts.entityType === "department") {
    if (!opts.departmentPermissionRepository)
      throw new Error("departmentPermissionRepository não configurado");
    const existente = await opts.departmentPermissionRepository.encontrarPorDepartmentEPermission(
      opts.orgId,
      opts.entityId,
      opts.permissionId,
    );
    await opts.departmentPermissionRepository.salvar({
      id: existente?.id ?? randomUUID(),
      orgId: opts.orgId,
      departmentId: opts.entityId,
      permissionId: opts.permissionId,
      granted: opts.granted,
      createdAt: existente?.createdAt ?? now,
      updatedAt: now,
      createdBy: existente?.createdBy ?? opts.actorId,
      updatedBy: opts.actorId,
    });
    if (opts.auditLogRepository) {
      await opts.auditLogRepository.registrar({
        id: randomUUID(),
        orgId: opts.orgId,
        entityType: "department",
        entityId: opts.entityId,
        permissionId: opts.permissionId,
        action,
        granted: opts.granted,
        previousValue: existente?.granted ?? null,
        actorId: opts.actorId,
        reason: opts.reason,
        metadata: { permissionKey },
        createdAt: now,
      });
    }
    if (opts.eventBus) {
      await opts.eventBus.publish({
        name: "Permissions.DepartmentPermissionChanged",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: opts.orgId,
          actorId: opts.actorId,
          timestamp: now,
        },
        payload: {
          entityType: "department",
          entityId: opts.entityId,
          permissionId: opts.permissionId,
          permissionKey,
          granted: opts.granted,
          reason: opts.reason,
        },
      });
    }
    return;
  }

  if (opts.entityType === "user") {
    if (!opts.userPermissionRepository) throw new Error("userPermissionRepository não configurado");
    const existente = await opts.userPermissionRepository.encontrarPorUserEPermission(
      opts.orgId,
      opts.entityId,
      opts.permissionId,
    );
    await opts.userPermissionRepository.salvar({
      id: existente?.id ?? randomUUID(),
      orgId: opts.orgId,
      userId: opts.entityId,
      permissionId: opts.permissionId,
      granted: opts.granted,
      reason: opts.reason,
      createdAt: existente?.createdAt ?? now,
      updatedAt: now,
      createdBy: existente?.createdBy ?? opts.actorId,
      updatedBy: opts.actorId,
    });
    if (opts.auditLogRepository) {
      await opts.auditLogRepository.registrar({
        id: randomUUID(),
        orgId: opts.orgId,
        entityType: "user",
        entityId: opts.entityId,
        permissionId: opts.permissionId,
        action,
        granted: opts.granted,
        previousValue: existente?.granted ?? null,
        actorId: opts.actorId,
        reason: opts.reason,
        metadata: { permissionKey },
        createdAt: now,
      });
    }
    if (opts.eventBus) {
      await opts.eventBus.publish({
        name: "Permissions.UserPermissionChanged",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: opts.orgId,
          actorId: opts.actorId,
          timestamp: now,
        },
        payload: {
          entityType: "user",
          entityId: opts.entityId,
          permissionId: opts.permissionId,
          permissionKey,
          granted: opts.granted,
          reason: opts.reason,
        },
      });
    }
    return;
  }
}

type Dependencies = {
  permissionRepository: PermissionRepository;
  organizationRepository: OrganizationRepository;
  workflowPolicyRepository: WorkflowPolicyRepository;
  permissionChangeRequestRepository: PermissionChangeRequestRepository;
  positionPermissionRepository?: PositionPermissionRepository;
  sectorPermissionRepository?: SectorPermissionRepository;
  departmentPermissionRepository?: DepartmentPermissionRepository;
  userPermissionRepository?: UserPermissionRepository;
  auditLogRepository?: PermissionAuditLogRepository;
  eventBus?: DomainEventBus;
};

export async function registerPermissionChangeRequestsRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.post(
    "/permissions/change-requests/sweep-sla",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const orgId = request.headers["x-org-id"] as string;
      const actorId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;
      if (!orgId) return reply.status(400).send({ message: "x-org-id é obrigatório" });
      if (!actorId) return reply.status(400).send({ message: "Usuário não identificado" });

      const policy = await findActiveRbacApprovalPolicy({
        workflowPolicyRepository: deps.workflowPolicyRepository,
        orgId,
      });
      const config = normalizeConfig(policy?.dados.config);
      const notifyBefore =
        typeof config.notifyBeforeDueMinutes === "number" && config.notifyBeforeDueMinutes > 0
          ? config.notifyBeforeDueMinutes
          : 10;

      const page = await deps.permissionChangeRequestRepository.listar(orgId, {
        status: "pending",
        limite: 50,
      });
      const now = new Date();

      let notified = 0;
      let breached = 0;

      for (const r of page.itens) {
        if (!r.slaDueAt) continue;

        const msLeft = r.slaDueAt.getTime() - now.getTime();
        const isBreached = msLeft <= 0;
        const isNear = msLeft > 0 && msLeft <= notifyBefore * 60_000;

        if (isBreached && !r.slaBreachedAt) {
          r.slaBreachedAt = now;
          r.updatedAt = now;
          await deps.permissionChangeRequestRepository.salvar(r);
          breached += 1;

          if (deps.eventBus) {
            await deps.eventBus.publish({
              name: "Notification.Created",
              version: "v1",
              metadata: { eventId: randomUUID(), orgId, actorId, timestamp: now },
              payload: {
                type: "error",
                title: "SLA estourado (RBAC)",
                message: `Request ${r.id} está atrasado e ainda pendente.`,
                action: { label: "Abrir aprovações", url: "/admin/permissions/approvals" },
                metadata: { requestId: r.id, slaDueAt: r.slaDueAt.toISOString() },
              },
            });
          }
          continue;
        }

        if (isNear && !r.slaNotifiedAt) {
          r.slaNotifiedAt = now;
          r.updatedAt = now;
          await deps.permissionChangeRequestRepository.salvar(r);
          notified += 1;

          if (deps.eventBus) {
            await deps.eventBus.publish({
              name: "Notification.Created",
              version: "v1",
              metadata: { eventId: randomUUID(), orgId, actorId, timestamp: now },
              payload: {
                type: "warning",
                title: "SLA próximo do limite (RBAC)",
                message: `Request ${r.id} vence em ~${Math.ceil(msLeft / 60_000)} min.`,
                action: { label: "Abrir aprovações", url: "/admin/permissions/approvals" },
                metadata: { requestId: r.id, slaDueAt: r.slaDueAt.toISOString() },
              },
            });
          }
        }
      }

      return reply.status(200).send({ success: true, notified, breached });
    },
  );

  app.get("/permissions/change-requests", async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.headers["x-org-id"] as string;
    const actorId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;
    if (!orgId) return reply.status(400).send({ message: "x-org-id é obrigatório" });
    if (!actorId) return reply.status(400).send({ message: "Usuário não identificado" });

    const query = z
      .object({
        status: z.enum(["pending", "approved", "rejected", "cancelled"]).optional(),
        entityType: z.enum(["position", "sector", "department", "user"]).optional(),
        entityId: z.string().optional(),
        permissionId: z.string().optional(),
        requestedBy: z.string().optional(),
        cursor: z.string().optional(),
        limite: z.coerce.number().int().min(1).max(50).optional(),
      })
      .parse((request.query ?? {}) as unknown);

    const page = await deps.permissionChangeRequestRepository.listar(orgId, {
      ...query,
      limite: query.limite,
    });
    return reply.status(200).send(page);
  });

  app.post(
    "/permissions/change-requests/:id/approve",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const orgId = request.headers["x-org-id"] as string;
      const actorId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;
      if (!orgId) return reply.status(400).send({ message: "x-org-id é obrigatório" });
      if (!actorId) return reply.status(400).send({ message: "Usuário não identificado" });

      const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
      const body = z.object({ decisionReason: z.string().optional() }).parse(request.body ?? {});

      const policy = await findActiveRbacApprovalPolicy({
        workflowPolicyRepository: deps.workflowPolicyRepository,
        orgId,
      });
      const config = normalizeConfig(policy?.dados.config);
      await assertCanDecide({
        organizationRepository: deps.organizationRepository,
        orgId,
        actorId,
        policyConfig: config,
      });

      const req = await deps.permissionChangeRequestRepository.encontrarPorId(orgId, id);
      if (!req) return reply.status(404).send({ message: "Request não encontrado" });
      if (req.status !== "pending")
        return reply.status(409).send({ message: "Request não está pendente" });
      if (req.granted === null)
        return reply.status(400).send({ message: "Tipo de mudança não suportado" });

      await applyApprovedChange({
        orgId,
        actorId,
        entityType: req.entityType,
        entityId: req.entityId,
        permissionId: req.permissionId,
        granted: req.granted,
        reason: req.reason,
        positionPermissionRepository: deps.positionPermissionRepository,
        sectorPermissionRepository: deps.sectorPermissionRepository,
        departmentPermissionRepository: deps.departmentPermissionRepository,
        userPermissionRepository: deps.userPermissionRepository,
        auditLogRepository: deps.auditLogRepository,
        permissionRepository: deps.permissionRepository,
        eventBus: deps.eventBus,
      });

      const updated = {
        ...req,
        status: "approved" as const,
        decidedBy: actorId,
        decidedAt: new Date(),
        decisionReason: body.decisionReason ?? null,
        updatedAt: new Date(),
      };
      await deps.permissionChangeRequestRepository.salvar(updated);

      if (deps.eventBus) {
        await deps.eventBus.publish({
          name: "Permissions.PermissionChangeRequestApproved",
          version: "v1",
          metadata: { eventId: randomUUID(), orgId, actorId, timestamp: new Date() },
          payload: {
            requestId: updated.id,
            entityType: updated.entityType,
            entityId: updated.entityId,
          },
        });

        await deps.eventBus.publish({
          name: "Notification.Created",
          version: "v1",
          metadata: { eventId: randomUUID(), orgId, actorId, timestamp: new Date() },
          payload: {
            type: "success",
            title: "Mudança RBAC aprovada",
            message: `Request ${updated.id} foi aprovado e aplicado.`,
            action: { label: "Abrir Matriz", url: "/admin/permissions/matrix" },
            metadata: { requestId: updated.id },
          },
        });
      }

      return reply
        .status(200)
        .send({ success: true, requestId: updated.id, status: updated.status });
    },
  );

  app.post(
    "/permissions/change-requests/:id/reject",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const orgId = request.headers["x-org-id"] as string;
      const actorId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;
      if (!orgId) return reply.status(400).send({ message: "x-org-id é obrigatório" });
      if (!actorId) return reply.status(400).send({ message: "Usuário não identificado" });

      const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
      const body = z.object({ decisionReason: z.string().optional() }).parse(request.body ?? {});

      const policy = await findActiveRbacApprovalPolicy({
        workflowPolicyRepository: deps.workflowPolicyRepository,
        orgId,
      });
      const config = normalizeConfig(policy?.dados.config);
      await assertCanDecide({
        organizationRepository: deps.organizationRepository,
        orgId,
        actorId,
        policyConfig: config,
      });

      const req = await deps.permissionChangeRequestRepository.encontrarPorId(orgId, id);
      if (!req) return reply.status(404).send({ message: "Request não encontrado" });
      if (req.status !== "pending")
        return reply.status(409).send({ message: "Request não está pendente" });

      const updated = {
        ...req,
        status: "rejected" as const,
        decidedBy: actorId,
        decidedAt: new Date(),
        decisionReason: body.decisionReason ?? null,
        updatedAt: new Date(),
      };
      await deps.permissionChangeRequestRepository.salvar(updated);

      if (deps.eventBus) {
        await deps.eventBus.publish({
          name: "Permissions.PermissionChangeRequestRejected",
          version: "v1",
          metadata: { eventId: randomUUID(), orgId, actorId, timestamp: new Date() },
          payload: {
            requestId: updated.id,
            entityType: updated.entityType,
            entityId: updated.entityId,
          },
        });

        await deps.eventBus.publish({
          name: "Notification.Created",
          version: "v1",
          metadata: { eventId: randomUUID(), orgId, actorId, timestamp: new Date() },
          payload: {
            type: "error",
            title: "Mudança RBAC rejeitada",
            message: `Request ${updated.id} foi rejeitado.`,
            action: { label: "Ver fila", url: "/admin/permissions/approvals" },
            metadata: { requestId: updated.id },
          },
        });
      }

      return reply
        .status(200)
        .send({ success: true, requestId: updated.id, status: updated.status });
    },
  );

  app.post(
    "/permissions/change-requests/:id/cancel",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const orgId = request.headers["x-org-id"] as string;
      const actorId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;
      if (!orgId) return reply.status(400).send({ message: "x-org-id é obrigatório" });
      if (!actorId) return reply.status(400).send({ message: "Usuário não identificado" });

      const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
      const body = z.object({ decisionReason: z.string().optional() }).parse(request.body ?? {});

      const req = await deps.permissionChangeRequestRepository.encontrarPorId(orgId, id);
      if (!req) return reply.status(404).send({ message: "Request não encontrado" });
      if (req.status !== "pending")
        return reply.status(409).send({ message: "Request não está pendente" });
      if (req.requestedBy !== actorId)
        return reply.status(403).send({ message: "Só o solicitante pode cancelar" });

      const updated = {
        ...req,
        status: "cancelled" as const,
        decidedBy: actorId,
        decidedAt: new Date(),
        decisionReason: body.decisionReason ?? null,
        updatedAt: new Date(),
      };
      await deps.permissionChangeRequestRepository.salvar(updated);

      if (deps.eventBus) {
        await deps.eventBus.publish({
          name: "Permissions.PermissionChangeRequestCancelled",
          version: "v1",
          metadata: { eventId: randomUUID(), orgId, actorId, timestamp: new Date() },
          payload: {
            requestId: updated.id,
            entityType: updated.entityType,
            entityId: updated.entityId,
          },
        });

        await deps.eventBus.publish({
          name: "Notification.Created",
          version: "v1",
          metadata: { eventId: randomUUID(), orgId, actorId, timestamp: new Date() },
          payload: {
            type: "info",
            title: "Mudança RBAC cancelada",
            message: `Request ${updated.id} foi cancelado pelo solicitante.`,
            action: { label: "Ver fila", url: "/admin/permissions/approvals" },
            metadata: { requestId: updated.id },
          },
        });
      }

      return reply
        .status(200)
        .send({ success: true, requestId: updated.id, status: updated.status });
    },
  );
}
