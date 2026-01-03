import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { canManage, getTenant } from "../../../core/tenant/tenant.utils";
import type { UserRepository } from "../../users/repositories/user.repository";
import type { OrganizationRepository } from "../repositories/organization.repository";
import type { OrganizationAuditLogRepository } from "../repositories/organization-audit-log.repository";

const memberParamsSchema = z.object({
  orgId: z.string().min(1),
  userId: z.string().min(1),
});

const updateRoleBodySchema = z.object({
  role: z.enum(["owner", "admin", "manager", "member", "viewer"]),
});

type OrganizationMembersDeps = {
  organizationRepository: OrganizationRepository;
  userRepository: UserRepository;
  auditRepository: OrganizationAuditLogRepository;
};

export async function registerOrganizationMembersRoutes(
  app: FastifyInstance,
  deps: OrganizationMembersDeps,
) {
  app.get("/organizations/:orgId/members", async (request, reply) => {
    // Validar tenant (deve ser aplicado via hook ou middleware antes desta rota)
    const tenant = getTenant(request);
    const { orgId } = z.object({ orgId: z.string().min(1) }).parse(request.params);

    // Verificar se o orgId do tenant corresponde ao orgId da rota
    if (tenant.orgId !== orgId) {
      return reply.status(403).send({
        message: "Acesso negado. Você não tem permissão para acessar esta organização.",
      });
    }

    const members = await deps.organizationRepository.listarMembros?.(orgId);
    if (!members) {
      return reply
        .status(500)
        .send({ message: "Repositório de organizações não suporta listagem de membros." });
    }

    const users = await deps.userRepository.findManyByIds(members.map((member) => member.userId));
    const userMap = new Map(users.map((user) => [user.userId, user]));

    const itens = members.map((member) => {
      const user = userMap.get(member.userId);
      return {
        organizationId: member.organizationId,
        userId: member.userId,
        role: member.role,
        createdAt: member.createdAt.toISOString(),
        user: user
          ? {
              email: user.email,
              displayName: user.displayName,
              avatarUrl: user.avatarUrl,
              status: user.status,
            }
          : undefined,
      };
    });

    return reply.send({ itens });
  });

  app.patch("/organizations/:orgId/members/:userId", async (request, reply) => {
    // Validar tenant (deve ser aplicado via hook ou middleware antes desta rota)
    const tenant = getTenant(request);
    const { orgId, userId: targetUserId } = memberParamsSchema.parse(request.params);
    const body = updateRoleBodySchema.parse(request.body ?? {});

    // Verificar se o orgId do tenant corresponde ao orgId da rota
    if (tenant.orgId !== orgId) {
      return reply.status(403).send({
        message: "Acesso negado. Você não tem permissão para acessar esta organização.",
      });
    }

    // Verificar se o usuário tem permissão para gerenciar membros
    if (!canManage(request)) {
      return reply
        .status(403)
        .send({ message: "Sem permissão para alterar papéis nesta organização." });
    }

    const targetMembership = await deps.organizationRepository.encontrarMembership?.(
      orgId,
      targetUserId,
    );
    if (!targetMembership) {
      return reply.status(404).send({ message: "Membro não encontrado." });
    }

    if (targetMembership.role === body.role) {
      return reply.send({ membership: targetMembership });
    }

    const members = await deps.organizationRepository.listarMembros?.(orgId);
    if (!members) {
      return reply
        .status(500)
        .send({ message: "Repositório de organizações não suporta listagem de membros." });
    }

    const ownerCount = members.filter((member) => member.role === "owner").length;
    const isTargetOwner = targetMembership.role === "owner";
    const willRemoveOwnerRole = isTargetOwner && body.role !== "owner";

    if (willRemoveOwnerRole && ownerCount <= 1) {
      return reply
        .status(409)
        .send({ message: "Não é possível remover o último proprietário da organização." });
    }

    const updated = await deps.organizationRepository.atualizarPapel?.(
      orgId,
      targetUserId,
      body.role,
    );

    if (!updated) {
      return reply.status(500).send({ message: "Falha ao atualizar papel do membro." });
    }

    await deps.auditRepository.registrar({
      orgId,
      action: "organizacao.membro.papel_atualizado",
      actorId: tenant.userId,
      targetId: targetUserId,
      payload: {
        papelAnterior: targetMembership.role,
        novoPapel: updated.role,
      },
    });

    return reply.send({ membership: updated });
  });

  app.delete("/organizations/:orgId/members/:userId", async (request, reply) => {
    // Validar tenant (deve ser aplicado via hook ou middleware antes desta rota)
    const tenant = getTenant(request);
    const { orgId, userId: targetUserId } = memberParamsSchema.parse(request.params);

    // Verificar se o orgId do tenant corresponde ao orgId da rota
    if (tenant.orgId !== orgId) {
      return reply.status(403).send({
        message: "Acesso negado. Você não tem permissão para acessar esta organização.",
      });
    }

    // Verificar se o usuário tem permissão para gerenciar membros
    if (!canManage(request)) {
      return reply
        .status(403)
        .send({ message: "Sem permissão para remover membros desta organização." });
    }

    const targetMembership = await deps.organizationRepository.encontrarMembership?.(
      orgId,
      targetUserId,
    );
    if (!targetMembership) {
      return reply.status(404).send({ message: "Membro não encontrado." });
    }

    const members = await deps.organizationRepository.listarMembros?.(orgId);
    if (!members) {
      return reply
        .status(500)
        .send({ message: "Repositório de organizações não suporta listagem de membros." });
    }

    const ownerCount = members.filter((member) => member.role === "owner").length;
    const isTargetOwner = targetMembership.role === "owner";

    if (isTargetOwner && ownerCount <= 1) {
      return reply
        .status(409)
        .send({ message: "Não é possível remover o último proprietário da organização." });
    }

    await deps.organizationRepository.removerMembro?.(orgId, targetUserId);

    await deps.auditRepository.registrar({
      orgId,
      action: "organizacao.membro.removido",
      actorId: tenant.userId,
      targetId: targetUserId,
      payload: {
        papelAnterior: targetMembership.role,
      },
    });

    return reply.status(204).send();
  });
}
