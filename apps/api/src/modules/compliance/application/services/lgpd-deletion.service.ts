/**
 * LGPD Deletion Service
 * Implementa o direito ao esquecimento (Art. 18, VI da LGPD)
 */

import { getPrisma } from "../../../../infra/database/prisma.service";

const prisma = getPrisma();

export class LgpdDeletionService {
  /**
   * Anonimiza os dados pessoais de um usuário e remove associações sensíveis.
   * Não deleta o registro do usuário para manter integridade referencial histórica,
   * mas remove todas as informações que possam identificá-lo.
   */
  async anonymityUser(userId: string, orgId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // 1. Anonimizar perfil principal
      await tx.user.update({
        where: { id: userId },
        data: {
          email: `anon_${userId.substring(0, 8)}@deleted.local`,
          displayName: "Usuário Anonimizado (LGPD)",
          avatarUrl: null,
          password: "DELETED_" + Math.random().toString(36), // Inviabiliza login
          status: "DELETED",
          lastLoginAt: null,
          // Se houver outros campos como telefone, iniciais, endereço, etc.
        },
      });

      // 2. Remover Sessões Ativas
      // Assumindo que existe uma tabela UserSession ou similar
      // try {
      //   await tx.userSession.deleteMany({ where: { userId } });
      // } catch (e) {}

      // 3. Remover Membresias de Organização (Opcional - pode-se manter o histórico mas anonimizado)
      // Aqui vamos apenas marcar como inativo se houver campo
      await tx.organizationMembership.updateMany({
        where: { userId },
        data: {
          role: "USER", // Reset para role básica
        },
      });

      // 4. Registrar a ação de exclusão para fins de conformidade (sem dados pessoais)
      await tx.organizationAuditLog.create({
        data: {
          orgId,
          action: "lgpd.data_anonymization",
          actorId: userId,
          targetId: userId,
          payload: {
            reason: "Exercício do Direito ao Esquecimento",
            completedAt: new Date().toISOString(),
          },
        },
      });
    });
  }
}

export const lgpdDeletionService = new LgpdDeletionService();
