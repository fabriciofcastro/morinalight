// Deprecated in favor of CustomAuthService
export class DeprecatedNextAuthService {}

import { AuthUser, IAuthService } from "@/application/ports"; // Import from barrel
import { Credentials } from "@/domain/value-objects";
import { Err, Ok, Result } from "@/shared/kernel/types";
import { signIn, signOut } from "next-auth/react"; // Assuming client-side adapter for now as UseCases might be called from Client Actions wrapper
// NOTE: If this adapter is used on Server Side, we should use 'auth' from '@/auth' or similar.
// A true Clean Arch adapter for Auth usually wraps the specific strategy. 
// For "LoginUseCase" running on Server (Server Actions), we might use 'signIn' from 'next-auth' (v5) or `auth` helper.
// Since User flow involves redirects, often Login is initiated on Client.
// BUT, if we want `LoginUseCase` to be the entry point, it must handle the env.
// Let's assume this implementation might be swapped or used in Server Action context if `signIn` works there (it does in NextAuth v5).

// For simplicity in this migration, let's implement a stub/mock or client-wrapper if the app is client-heavy for auth.
// Given instructions: "Infrastructure: NextAuthAdapter".

export class NextAuthService implements IAuthService {
  async login(credentials: Credentials, remember?: boolean): Promise<Result<AuthUser>> {
    try {
      // In a real server action, signIn throws a redirect error on success, or returns error on failure if redirect: false.
      // We will assume `redirect: false` to get result back to UseCase.
      const result = await signIn("credentials", {
        email: credentials.email.getValue(),
        password: credentials.password,
        redirect: false
      });

      if (result?.error) {
        return Err(new Error(result.error));
      }

      if (result?.ok) {
         // We might need to fetch the session user to return AuthUser
         // Or just return a minimal user since detailed user comes from session
         return Ok({ id: 'current', email: credentials.email.getValue(), name: 'User', role: 'user' });
      }
      
      return Err(new Error("Login failed"));

    } catch (error: any) {
      return Err(error);
    }
  }

  async logout(): Promise<Result<void>> {
    await signOut({ redirect: false });
    return Ok(undefined);
  }

  async getCurrentUser(): Promise<Result<AuthUser>> {
    // This would typically check server session
    return Err(new Error("Not implemented in this adapter variant"));
  }
}
