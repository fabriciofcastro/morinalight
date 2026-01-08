import { AuthUser, IAuthService } from "@/application/ports/auth-service.port";
import { Credentials } from "@/domain/value-objects";
import { authApi } from "@/lib/api/auth";
import { Err, Ok, Result } from "@/shared/kernel/types";

export class CustomAuthService implements IAuthService {
  async login(credentials: Credentials, remember?: boolean): Promise<Result<AuthUser>> {
    try {
      const response = await authApi.login({
        email: credentials.email.getValue(),
        password: credentials.password!,
        remember
      });

      // Mapear resposta para AuthUser
      const user: AuthUser = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.displayName,
        role: response.user.role,
        requiresTwoFactor: response.requiresTwoFactor,
        mustChangePassword: response.user.mustChangePassword,
        organizations: response.organizations
      };

      return Ok(user);

    } catch (error: any) {
      //authApi throws error, we catch it
      const message = error.response?.data?.message || error.message || "Login failed";
      return Err(new Error(message));
    }
  }

  async logout(): Promise<Result<void>> {
    try {
      await authApi.logout();
      return Ok(undefined);
    } catch (error: any) {
      return Err(new Error(error.message));
    }
  }

  async getCurrentUser(): Promise<Result<AuthUser>> {
    try {
      const userResponse = await authApi.getCurrentUser();
      if (!userResponse) return Err(new Error("No user session"));
      
      const user: AuthUser = {
        id: userResponse.id,
        email: userResponse.email,
        name: userResponse.displayName,
        role: userResponse.role
      };

      return Ok(user);
    } catch (error: any) {
      return Err(new Error(error.message));
    }
  }
} // End of CustomAuthService
