import type { UserRepository } from "../../../users/repositories/user.repository";
import type { SectorRepository } from "../../domain/repositories/sector-repository";
import type { SectorMembershipRepository } from "../../infra/prisma/prisma-sector-membership.repository";
import type { MemberInfo } from "./member-info";

export class ListarMembrosSetorUseCase {
  constructor(
    private readonly deps: {
      sectorMembershipRepository: SectorMembershipRepository;
      sectorRepository: SectorRepository;
      userRepository: UserRepository;
    },
  ) {}

  async execute(orgId: string, sectorId: string): Promise<MemberInfo[]> {
    // Verificar se o setor existe
    const sector = await this.deps.sectorRepository.encontrarPorId(orgId, sectorId);
    if (!sector) {
      throw new Error("Setor não encontrado");
    }

    // Listar membros
    const memberships = await this.deps.sectorMembershipRepository.listarPorSector(orgId, sectorId);

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
