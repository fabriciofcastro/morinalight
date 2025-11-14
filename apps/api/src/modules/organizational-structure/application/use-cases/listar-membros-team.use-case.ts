import type { UserRepository } from "../../../users/repositories/user.repository";
import type { TeamRepository } from "../../domain/repositories/team-repository";
import type { TeamMembershipRepository } from "../../infra/prisma/prisma-team-membership.repository";
import type { MemberInfo } from "./listar-membros-unidade.use-case";

export class ListarMembrosTeamUseCase {
  constructor(
    private readonly deps: {
      teamMembershipRepository: TeamMembershipRepository;
      teamRepository: TeamRepository;
      userRepository: UserRepository;
    },
  ) {}

  async execute(orgId: string, teamId: string): Promise<MemberInfo[]> {
    // Verificar se o time existe
    const team = await this.deps.teamRepository.encontrarPorId(orgId, teamId);
    if (!team) {
      throw new Error("Time não encontrado");
    }

    // Listar membros
    const memberships = await this.deps.teamMembershipRepository.listarPorTeam(orgId, teamId);

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
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          status: user.status,
        },
      };
    });
  }
}
