import type { UserRepository } from "../../../users/repositories/user.repository";
import type { PositionRepository } from "../../domain/repositories/position-repository";
import type { PositionMembershipRepository } from "../../infra/prisma/prisma-position-membership.repository";
import type { MemberInfo } from "./member-info";

export class ListarMembrosCargoUseCase {
  constructor(
    private readonly deps: {
      positionMembershipRepository: PositionMembershipRepository;
      positionRepository: PositionRepository;
      userRepository: UserRepository;
    },
  ) {}

  async execute(orgId: string, positionId: string): Promise<MemberInfo[]> {
    // Verificar se o cargo existe
    const position = await this.deps.positionRepository.encontrarPorId(orgId, positionId);
    if (!position) {
      throw new Error("Cargo não encontrado");
    }

    // Listar membros
    const memberships = await this.deps.positionMembershipRepository.listarPorPosition(
      orgId,
      positionId,
    );

    if (memberships.length === 0) {
      return [];
    }

    // Buscar informações dos usuários
    const userIds = memberships.map((m) => m.userId);
    const users = await this.deps.userRepository.findManyByIds(userIds);
    const userMap = new Map(users.map((user) => [user.userId, user]));

    // Combinar informações
    return memberships.map((membership) => {
      const user = userMap.get(membership.userId);
      if (!user) {
        throw new Error(`Usuário ${membership.userId} não encontrado`);
      }

      return {
        membershipId: membership.id,
        userId: membership.userId,
        role: membership.role,
        createdAt: membership.createdAt,
        updatedAt: membership.updatedAt,
        user: {
          email: user.email,
          displayName: user.displayName ?? null,
          avatarUrl: user.avatarUrl ?? null,
          status: user.status,
        },
      };
    });
  }
}
