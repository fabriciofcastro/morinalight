import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createServer } from "../../src/core/server/create-server";
import { InMemoryOrganizationRepository } from "../../src/modules/organizations/infra/memory/in-memory-organization.repository";
import { InMemoryOrganizationAuditLogRepository } from "../../src/modules/organizations/infra/memory/in-memory-organization-audit-log.repository";
import { InMemoryUserInviteRepository } from "../../src/modules/organizations/infra/memory/in-memory-user-invite.repository";
import { InMemoryUserRepository } from "../../src/modules/users/infra/memory/in-memory-user.repository";

let app: Awaited<ReturnType<typeof createServer>>;
const userRepository = new InMemoryUserRepository();
const organizationRepository = new InMemoryOrganizationRepository();
const inviteRepository = new InMemoryUserInviteRepository();
const auditRepository = new InMemoryOrganizationAuditLogRepository();

describe("Auth HTTP", () => {
  beforeAll(async () => {
    app = await createServer({
      modules: {
        auth: {
          userRepository,
          organizationRepository,
          inviteRepository,
          auditRepository,
        },
        organizations: {
          organizationRepository,
          inviteRepository,
          userRepository,
          auditRepository,
        },
      },
    });
  });

  beforeEach(() => {
    userRepository.users.clear();
    organizationRepository.organizations.length = 0;
    organizationRepository.memberships.length = 0;
    inviteRepository.clear();
    auditRepository.clear();
  });

  it("cadastra um usuário criando nova organização", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: "owner@example.com",
        password: "strong-password",
        displayName: "Owner User",
        organizationName: "Morina HQ",
      },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json() as {
      token: string;
      user: { userId: string; email: string };
      organization: { organizationId: string; role: string };
      organizations: Array<{ organizationId: string }>;
    };

    expect(body.token).toBeTruthy();
    expect(body.organization.role).toBe("owner");
    expect(body.organizations).toHaveLength(1);
    expect(auditRepository.registros.at(-1)).toMatchObject({
      action: "organizacao.membro.criado",
      actorId: body.user.userId,
    });
  });

  it("não permite cadastrar email duplicado", async () => {
    await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: "dup@example.com",
        password: "strong-password",
        displayName: "First User",
        organizationName: "Org One",
      },
    });

    const response = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: "dup@example.com",
        password: "another-password",
        displayName: "Second User",
        organizationName: "Org Two",
      },
    });

    expect(response.statusCode).toBe(409);
  });

  it("aceita convite existente e associa à organização", async () => {
    const inviterId = "inviter-1";
    userRepository.users.set(inviterId, {
      userId: inviterId,
      email: "inviter@example.com",
      displayName: "Inviter",
      avatarUrl: null,
      passwordHash: "hash",
      status: "active",
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await organizationRepository.criar({
      organizationId: "org-123",
      name: "Org Invite",
      slug: "org-invite",
    });
    await organizationRepository.vincularUsuario?.("org-123", inviterId, "owner");

    const invite = await inviteRepository.create({
      inviteId: "invite-1",
      organizationId: "org-123",
      email: "guest@example.com",
      role: "member",
      token: "invite-token-1234567890",
      invitedById: inviterId,
    });

    const response = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: "guest@example.com",
        password: "strong-password",
        displayName: "Guest User",
        inviteToken: invite.token,
      },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json() as {
      organization: { role: string };
      user: { userId: string };
    };
    expect(body.organization.role).toBe("member");
    const actions = auditRepository.registros.map((registro) => registro.action);
    expect(actions).toContain("organizacao.convite.aceito");
    expect(actions).toContain("organizacao.membro.convite_aceito");
  });

  it("realiza login com credenciais válidas", async () => {
    await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: "login@example.com",
        password: "strong-password",
        displayName: "Login User",
        organizationName: "Org Login",
      },
    });

    const initialAuditCount = auditRepository.registros.length;

    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: "login@example.com",
        password: "strong-password",
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as {
      token: string;
      user: { userId: string; email: string; displayName: string };
      organizations: unknown[];
    };
    expect(body.token).toBeTruthy();
    expect(body.organizations.length).toBeGreaterThan(0);

    // Verificar que a auditoria foi registrada
    expect(auditRepository.registros.length).toBeGreaterThan(initialAuditCount);
    const loginAudit = auditRepository.registros.find(
      (r) => r.action === "auth.login.sucesso" && r.actorId === body.user.userId,
    );
    expect(loginAudit).toBeDefined();
    expect(loginAudit?.payload).toMatchObject({
      email: "login@example.com",
      displayName: "Login User",
    });
  });

  it("bloqueia login com senha incorreta", async () => {
    await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: "wrongpass@example.com",
        password: "valid-password",
        displayName: "Wrong Pass",
        organizationName: "Org Wrong",
      },
    });

    const initialAuditCount = auditRepository.registros.length;

    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: "wrongpass@example.com",
        password: "invalidpw",
      },
    });

    expect(response.statusCode).toBe(401);

    // Verificar que a tentativa falha foi registrada
    expect(auditRepository.registros.length).toBeGreaterThan(initialAuditCount);
    const failedAudit = auditRepository.registros.find(
      (r) => r.action === "auth.login.tentativa_falha",
    );
    expect(failedAudit).toBeDefined();
    expect(failedAudit?.payload).toMatchObject({
      email: "wrongpass@example.com",
      reason: "senha_invalida",
    });
  });
});
