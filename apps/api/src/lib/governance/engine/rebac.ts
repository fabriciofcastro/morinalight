import { getPrisma } from "../../../infra/database/prisma.service";

const prisma = getPrisma();

/**
 * Serviço ReBAC para validar relacionamentos e propriedade (Ownership)
 */
export class ReBACModule {
  /**
   * Verifica se o usuário é proprietário do recurso ou tem um relacionamento direto
   */
  static async checkOwnership(
    userId: string,
    resourceType: string,
    resourceId: string,
  ): Promise<boolean> {
    try {
      switch (resourceType.toLowerCase()) {
        case "product": {
          const product = await prisma.product.findUnique({
            where: { id: resourceId },
            select: { createdBy: true },
          });
          return product?.createdBy === userId;
        }

        case "user":
          // Um usuário é dono de seus próprios dados
          return userId === resourceId;

        case "organization": {
          // Check if user is an ADMIN in the organization
          const membership = await prisma.organizationMembership.findFirst({
            where: {
              userId,
              organizationId: resourceId,
              role: "admin", // Simplified ReBAC logic
            },
          });
          return !!membership;
        }

        default:
          return false;
      }
    } catch (error) {
      console.error(`[ReBAC] Error checking ownership for ${resourceType}:${resourceId}`, error);
      return false;
    }
  }
}
