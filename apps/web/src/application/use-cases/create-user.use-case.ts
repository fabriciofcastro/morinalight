import { UserEntity } from '@/domain/entities';
import { BusinessRuleError, ValidationError } from '@/domain/errors';
import { UserCreatedEvent } from '@/domain/events';
import { UserRegistrationPolicy } from '@/domain/policies';
import { Email } from '@/domain/value-objects';
import { Err, Ok, Result } from '@/shared/kernel/types';
import { isSome } from '@/shared/kernel/types/option';
import { generateUUID } from '@/shared/kernel/utils';

import { PerformanceMonitor } from '@/shared/kernel/utils/performance-monitor';
import { createUserSchema } from '../contracts';
import type { CreateUserDTO, UserResponseDTO } from '../dto';
import type { IEventBus, ILogger, IUserRepository } from '../ports';

/**
 * Create User Use Case
 */
export class CreateUserUseCase {
  private readonly performanceMonitor: PerformanceMonitor;

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly eventBus: IEventBus,
    private readonly logger: ILogger
  ) {
    this.performanceMonitor = new PerformanceMonitor(logger);
  }

  async execute(dto: CreateUserDTO): Promise<Result<UserResponseDTO>> {
    return this.performanceMonitor.measure(
      'CreateUserUseCase',
      async () => {
        try {
          const validation = createUserSchema.safeParse(dto);
          if (!validation.success) {
            const firstIssue = validation.error.issues[0];
            return Err(new ValidationError(`${firstIssue?.path.join('.')}: ${firstIssue?.message}`));
          }

          const emailResult = Email.create(dto.email);
          if (!emailResult) {
            return Err(new ValidationError('Email inválido'));
          }

          const existingUser = await this.userRepository.findByEmail(emailResult);
          if (isSome(existingUser)) return Err(new BusinessRuleError('Email já está em uso'));

          if (!UserRegistrationPolicy.canRegister(emailResult)) {
            return Err(new BusinessRuleError(`Email domain ${emailResult.getDomain()} is not allowed for registration`));
          }

          const user = UserEntity.create({
            id: generateUUID(),
            name: dto.name,
            email: emailResult.getValue(),
            password: dto.password || '',
            role: dto.role,
          });

          await this.userRepository.save(user);

          const event = new UserCreatedEvent(
            user.id,
            user.email.getValue(),
            user.name,
            user.role.getValue()
          );
          await this.eventBus.publish(event);

          this.logger.info('User created successfully', { userId: user.id });

          return Ok({
            id: user.id,
            name: user.name,
            email: user.email.getValue(),
            role: user.role.getValue() as any,
            isActive: user.isActive,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
          });
        } catch (error) {
          const actualError = error instanceof Error ? error : new Error(String(error));
          this.logger.error('Failed to create user', actualError);
          return Err(new Error(actualError.message));
        }
      },
      { email: dto.email, role: dto.role }
    );
  }
}
