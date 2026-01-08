import { IAuthService, ILogger } from "@/application/ports";
import { Err, Result } from "@/shared/kernel/types";

export class LogoutUseCase {
  constructor(
    private readonly authService: IAuthService,
    private readonly logger: ILogger
  ) {}

  async execute(): Promise<Result<void>> {
    try {
      this.logger.info("Attempting logout");

      const result = await this.authService.logout();

      if (result.success) {
        this.logger.info("Logout successful");
      } else {
        this.logger.warn("Logout failed", { error: result.error });
      }

      return result;

    } catch (error: any) {
      this.logger.error("Logout unexpected error", error);
      return Err(new Error(error.message));
    }
  }
}
