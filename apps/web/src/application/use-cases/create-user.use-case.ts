import { UserEntity } from '@/domain/entities';
import { BusinessRuleError, ValidationError } from '@/domain/errors';
import { UserCreatedEvent } from '@/domain/events';
import { UserRegistrationPolicy } from '@/domain/policies';
import { Email } from '@/domain/value-objects';
import { Err, Ok, Result } from '@/shared/kernel/types';
import { generateUUID } from '@/shared/kernel/utils';

import { createUserSchema } from '../contracts';
import type { CreateUserDTO, UserResponseDTO } from '../dto';
import type { IEventBus, ILogger, IUserRepository } from '../ports';

/**
 * Create User Use Case
 * 
 * Caso de uso para criação de usuário.
 * Orquestra domain entities, policies e ports.
 * 
 * Responsabilidades:
 * 1. Validar entrada (Zod schema)
 * 2. Aplicar regras de negócio (policies)
 * 3. Criar entidade de domínio
 * 4. Persistir via repository
 * 5. Publicar evento de domínio
 * 6. Retornar DTO de resposta
 */

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly eventBus: IEventBus,
    private readonly logger: ILogger
  ) {}

  async execute(dto: CreateUserDTO): Promise<Result<UserResponseDTO>> {
    try {
      // 1. Validação de entrada com Zod
      const validation = createUserSchema.safeParse(dto);
      if (!validation.success) {
        const firstIssue = validation.error.issues[0];
        const message = firstIssue?.message || validation.error.message;
        const path = firstIssue?.path.join('.') || 'body';
        return Err(new ValidationError(message, path, dto));
      }

      const validatedData = validation.data;

      // 2. Criar value objects
      const email = Email.create(validatedData.email);

      // 3. Aplicar políticas de negócio
      UserRegistrationPolicy.validateRegistration(email);

      // 4. Verificar unicidade do email
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        return Err(
          new BusinessRuleError(
            'A user with this email already exists',
            'email_already_exists'
          )
        );
      }

      // 5. Criar entidade de domínio
      const user = UserEntity.create({
        id: generateUUID(),
        email: validatedData.email,
        name: validatedData.name,
        role: validatedData.role,
      });

      // 6. Persistir
      await this.userRepository.save(user);

      // 7. Publicar evento de domínio
      const event = new UserCreatedEvent(
        user.id,
        user.email.getValue(),
        user.name,
        user.role.getValue()
      );
      await this.eventBus.publish(event);

      // 8. Log de sucesso
      this.logger.info('User created successfully', {
        userId: user.id,
        email: user.email.getValue(),
      });

      // 9. Retornar DTO de resposta
      const response: UserResponseDTO = {
        id: user.id,
        email: user.email.getValue(),
        name: user.name,
        role: user.role.getValue(),
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };

      return Ok(response);
    } catch (error) {
      // Log de erro
      this.logger.error('Failed to create user', error as Error, { dto });

      // Retornar erro
      if (error instanceof ValidationError || error instanceof BusinessRuleError) {
        return Err(error);
      }

      return Err(error as Error);
    }
  }
}
