import type { UserResponseDTO } from '../dto';
import type { IUserRepository } from '../ports';

/**
 * List Users Query
 * 
 * Query para listar todos os usuários.
 */

export class ListUsersQuery {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<UserResponseDTO[]> {
    const users = await this.userRepository.findAll();

    return users.map((user) => ({
      id: user.id,
      email: user.email.getValue(),
      name: user.name,
      role: user.role.getValue(),
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }));
  }
}
