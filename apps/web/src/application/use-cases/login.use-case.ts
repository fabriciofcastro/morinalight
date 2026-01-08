import { LoginDTO } from "@/application/dto";
import { IAuthService, ILogger } from "@/application/ports";
import { AuthUser } from "@/application/ports/auth-service.port";
import { Credentials } from "@/domain/value-objects";
import { Err, Result } from "@/shared/kernel/types";

export class LoginUseCase {
  constructor(
    private readonly authService: IAuthService,
    private readonly logger: ILogger
  ) {}

  async execute(dto: LoginDTO): Promise<Result<AuthUser>> {
    try {
      this.logger.info("Attempting login", { email: dto.email });

      const credentials = Credentials.create(dto.email, dto.password);
      
      const result = await this.authService.login(credentials, dto.remember);

      if (result.success) {
        this.logger.info("Login successful", { userId: result.value.id });
      } else {
        this.logger.warn("Login failed", { email: dto.email, error: result.error });
      }

      return result;

    } catch (error: any) {
      this.logger.error("Login unexpected error", error);
      return Err(new Error(error.message));
    }
  }
}
