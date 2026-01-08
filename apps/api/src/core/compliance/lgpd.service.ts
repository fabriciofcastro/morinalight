/**
 * LGPD Compliance Service
 * Implementa direitos do titular de dados conforme LGPD
 */

import { getPrisma } from "../../infra/database/prisma.service";

const prisma = getPrisma();

/**
 * Direito ao Esquecimento (Art. 18, VI da LGPD)
 * Anonimiza dados pessoais do usuário
 */
export async function deleteUserData(userId: string, orgId: string): Promise<void> {
  // Anonimizar dados pessoais do usuário
  await prisma.user.update({
    where: { id: userId },
    data: {
      email: `deleted_${userId}@deleted.local`,
      displayName: "Usuário Deletado",
      // Manter estrutura mas remover dados identificáveis
      avatarUrl: null,
    },
  });

  // Registrar ação de exclusão
  await prisma.organizationAuditLog.create({
    data: {
      orgId,
      action: "lgpd.data_deletion",
      actorId: userId,
      targetId: userId,
      payload: {
        reason: "Direito ao esquecimento (LGPD)",
        timestamp: new Date().toISOString(),
      },
    },
  });
}

/**
 * Portabilidade de Dados (Art. 18, V da LGPD)
 * Exporta todos os dados do usuário em formato estruturado
 */
export async function exportUserData(
  userId: string,
  orgId: string,
): Promise<{
  user: unknown;
  organizations: unknown[];
  activities: unknown[];
  notifications: unknown[];
  permissions: unknown[];
}> {
  const [user, memberships, auditLogs, notifications, userPermissions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    }),
    prisma.organizationMembership.findMany({
      where: { userId },
      include: { organization: true },
    }),
    prisma.organizationAuditLog.findMany({
      where: { actorId: userId, orgId },
      take: 1000, // Limitar para não exportar tudo
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.findMany({
      where: { userId },
      take: 1000,
      orderBy: { createdAt: "desc" },
    }),
    prisma.userPermission.findMany({
      where: { userId, orgId },
      include: { permission: true },
    }),
  ]);

  return {
    user,
    organizations: memberships.map((m) => ({
      organizationId: m.organizationId,
      organizationName: m.organization.name,
      role: m.role,
      joinedAt: m.createdAt,
    })),
    activities: auditLogs,
    notifications: notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      read: n.read,
      createdAt: n.createdAt,
    })),
    permissions: userPermissions.map((up) => ({
      permissionId: up.permissionId,
      permissionKey: up.permission.key,
      granted: up.granted,
      createdAt: up.createdAt,
    })),
  };
}

/**
 * Registro de Consentimento (Art. 7 da LGPD)
 */
export async function recordConsent(
  userId: string,
  orgId: string,
  purpose: string,
  granted: boolean,
): Promise<void> {
  await prisma.organizationAuditLog.create({
    data: {
      orgId,
      action: "lgpd.consent",
      actorId: userId,
      payload: {
        purpose,
        granted,
        timestamp: new Date().toISOString(),
      },
    },
  });
}

/**
 * Revogação de Consentimento
 */
export async function revokeConsent(userId: string, orgId: string, purpose: string): Promise<void> {
  await recordConsent(userId, orgId, purpose, false);
}
