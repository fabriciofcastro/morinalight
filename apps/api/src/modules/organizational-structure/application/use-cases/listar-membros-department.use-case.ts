import type { UserRepository } from "../../../users/repositories/user.repository";
import type {
  DepartmentMembershipRepository,
} from "../../infra/prisma/prisma-department-membership.repository";
import type { DepartmentRepository } from "../../domain/repositories/department-repository";
import type { MemberInfo } from "./listar-membros-unidade.use-case";

export class ListarMembrosDepartamentoUseCase {
  constructor(
    private readonly deps: {
      departmentMembershipRepository: DepartmentMembershipRepository;
      departmentRepository: DepartmentRepository;
      userRepository: UserRepository;
    },
  ) {}

  async execute(orgId: string, departmentId: string): Promise<MemberInfo[]> {
    // Verificar se o departamento existe
    const department = await this.deps.departmentRepository.encontrarPorId(orgId, departmentId);
    if (!department) {
      throw new Error("Departamento não encontrado");
    }

    // Listar membros
    const memberships = await this.deps.departmentMembershipRepository.listarPorDepartment(
      orgId,
      departmentId,
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
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          status: user.status,
        },
      };
    });
  }
}

