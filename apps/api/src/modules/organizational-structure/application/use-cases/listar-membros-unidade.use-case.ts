import type { UserRepository } from "../../../users/repositories/user.repository";
import type {
  UnitMembershipRepository,
} from "../../infra/prisma/prisma-unit-membership.repository";
import type { OrganizationalUnitRepository } from "../../domain/repositories/organizational-unit-repository";

type Dependencies = {
  unitMembershipRepository: UnitMembershipRepository;
  organizationalUnitRepository: OrganizationalUnitRepository;
  userRepository: UserRepository;
};

export type MemberInfo = {
  membershipId: string;
  userId: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
    status: string;
  };
};

export class ListarMembrosUnidadeUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(orgId: string, unitId: string): Promise<MemberInfo[]> {
    // Verificar se a unidade existe
    const unit = await this.deps.organizationalUnitRepository.encontrarPorId(orgId, unitId);
    if (!unit) {
      throw new Error("Unidade organizacional não encontrada");
    }

    // Listar membros
    const memberships = await this.deps.unitMembershipRepository.listarPorUnit(orgId, unitId);

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

