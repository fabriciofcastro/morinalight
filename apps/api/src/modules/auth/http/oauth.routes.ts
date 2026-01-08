import { randomBytes } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { signToken } from "../../../core/auth/jwt-rs256.service";
import { env } from "../../../core/config/env";
import { getPrisma } from "../../../infra/database/prisma.service";
import type { OrganizationRepository } from "../../organizations/repositories/organization.repository";
import type { UserRepository } from "../../users/repositories/user.repository";
import { OAuth2Service } from "../domain/services/oidc/oauth2.service";
import type { SessionManagementService } from "../domain/services/session-management.service";

const prisma = getPrisma();

// State cache (in memory for MVP, Use Redis in Prod)
// Zero Mocks Note: For strict production usage, this should be in Redis to handle scaling.
// We are using a simple Map for now but marking it as "To Be Externalized".
const stateCache = new Map<string, { createdAt: number }>();

type OAuthDeps = {
  userRepository: UserRepository;
  organizationRepository: OrganizationRepository;
  sessionService: SessionManagementService;
};

export async function registerOAuthRoutes(app: FastifyInstance, deps: OAuthDeps) {
  const oauthService = new OAuth2Service();

  // 1. Redirect to Provider
  app.get("/auth/:provider/login", async (request, reply) => {
    const { provider } = request.params as { provider: string };

    // Generate secure state to prevent CSRF
    const state = randomBytes(16).toString("hex");
    stateCache.set(state, { createdAt: Date.now() });

    try {
      const url = oauthService.getAuthUrl(provider, state);
      return reply.redirect(url);
    } catch (error) {
      return reply.status(400).send({ message: "Provider not supported" });
    }
  });

  // 2. Callback Processing
  app.get("/auth/:provider/callback", async (request, reply) => {
    const { provider } = request.params as { provider: string };
    const { code, state } = request.query as { code: string; state: string };

    if (!code || !state) {
      return reply.status(400).send({ message: "Invalid callback parameters" });
    }

    // Validate State (CSRF)
    if (!stateCache.has(state)) {
      // TODO: Check if expired
      return reply.status(400).send({ message: "Invalid or expired state" });
    }
    stateCache.delete(state); // Consume state

    try {
      // Exchange code for profile
      const profile = await oauthService.handleCallback(provider, code);

      // Login or Register Logic
      let user = await deps.userRepository.findByEmail(profile.email);
      let isNew = false;

      if (!user) {
        // Auto-register (if business rule allows)
        // For Morina, we might want to fail if invite-only, but let's assume auto-provision for Verified Emails
        if (!profile.emailVerified) {
          return reply.status(400).send({ message: "Email not verified by provider" });
        }

        user = await deps.userRepository.create(
          {
            userId: randomBytes(12).toString("hex"), // or use profile.sub logic
            email: profile.email,
            displayName: profile.name,
            passwordHash: "", // No password for OAuth users
            status: "active",
            avatarUrl: profile.picture,
          },
          {
            ipAddress: request.ip,
            userAgent: request.headers["user-agent"],
            orgId: "system",
            actorId: "system",
          },
        );
        isNew = true;
      }

      // --- Common Login Logic (Code Duplication Reduction Needed in Phase 8) ---
      // Create Session & Tokens (Reuse logic)

      const defaultOrg = await deps.organizationRepository
        .listarPorUsuario(user.userId)
        .then((list) => list[0]?.organizationId);

      const accessToken = signToken(
        {
          sub: user.userId,
          email: user.email,
          defaultOrgId: defaultOrg ?? null,
        },
        "15m",
      );

      const refreshToken = `mrn_refresh_${randomBytes(32).toString("base64url")}`;
      // ... Save refresh token logic ...
      // ... Create session logic ...

      // Redirect to Dashboard with token in query or cookie?
      // Standard OAuth flow usually sets cookies and redirects to frontend app
      reply.setCookie("access_token", accessToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        path: "/",
      });

      return reply.redirect(`${env.FRONTEND_URL}/dashboard`);
    } catch (error) {
      app.log.error({ error }, "OAuth Callback Error");
      return reply.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  });
}
