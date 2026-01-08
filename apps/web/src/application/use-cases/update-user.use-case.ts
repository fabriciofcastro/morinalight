import { UpdateUserDTO } from "@/application/dto";
import { IEventBus, ILogger, IUserRepository } from "@/application/ports";
import { UserEntity } from "@/domain/entities";
import { BusinessRuleError } from "@/domain/errors";
import { Err, Ok, Result, isNone } from "@/shared/kernel/types";

export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly eventBus: IEventBus,
    private readonly logger: ILogger
  ) {}

  async execute(dto: UpdateUserDTO): Promise<Result<void>> {
    try {
      this.logger.info("Updating user", { userId: dto.id });

      const userOption = await this.userRepository.findById(dto.id);

      if (isNone(userOption)) {
        return Err(new BusinessRuleError(`User with ID ${dto.id} not found`));
      }

      let user = userOption as UserEntity;
      
      // Update logic handled by Entity or manually here if simple setter
      // Since UserEntity is immutable-ish (clone), we re-create or use methods.
      // UserEntity doesn't have explicit 'update' method for all fields yet, likely need to use create/factory or setters if available.
      // Looking at UserEntity (viewed earlier), it has 'create'.
      
      // Validated user entity

      if (dto.name) {
        user = user.updateProfile(dto.name);
      }
      
      if (dto.email) {
        user = user.changeEmail(dto.email);
      }

      if (dto.role) {
        user = user.changeRole(dto.role);
      }

      if (dto.isActive !== undefined) {
        user = dto.isActive ? user.activate() : user.deactivate();
      }

      await this.userRepository.save(user);

      this.logger.info("User updated successfully", { userId: dto.id });

      return Ok(undefined);

    } catch (error: any) {
      this.logger.error("Failed to update user", error);
      return Err(new BusinessRuleError(error.message));
    }
  }
}
