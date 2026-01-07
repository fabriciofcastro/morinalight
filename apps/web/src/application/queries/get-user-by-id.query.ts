import { isSome } from '@/shared/kernel/types';
import type { UserResponseDTO } from '../dto';
import type { IUserRepository } from '../ports';

/**
 * Get User By ID Query
 * 
 * Query para buscar usuário por ID.
 * Separado de use-cases (CQRS pattern).
 * 
 * Queries são read-only, não modificam estado.
 */

export class GetUserByIdQuery {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<UserResponseDTO | null> {
    const user = await this.userRepository.findById(userId);

    if (!isSome(user)) {
      return null;
    }

    return {
      id: user.id,
      email: user.email.getValue(),
      name: user.name,
      role: user.role.getValue(),
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
