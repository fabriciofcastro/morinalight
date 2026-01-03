import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createServer } from "../../src/core/server/create-server";
import { InMemoryOrganizationRepository } from "../../src/modules/organizations/infra/memory/in-memory-organization.repository";
import { InMemoryOrganizationAuditLogRepository } from "../../src/modules/organizations/infra/memory/in-memory-organization-audit-log.repository";
import { InMemoryUserInviteRepository } from "../../src/modules/organizations/infra/memory/in-memory-user-invite.repository";
import { InMemoryUserRepository } from "../../src/modules/users/infra/memory/in-memory-user.repository";

let app: Awaited<ReturnType<typeof createServer>>;
const organizationRepository = new InMemoryOrganizationRepository();
const inviteRepository = new InMemoryUserInviteRepository();
const userRepository = new InMemoryUserRepository();
const auditRepository = new InMemoryOrganizationAuditLogRepository();

const ownerId = "user-owner";
const orgId = "org-123";

describe("Organizations Invites HTTP", () => {
  beforeAll(async () => {
    app = await createServer({
      modules: {
        auth: {
          organizationRepository,
          inviteRepository,
          userRepository,
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

  beforeEach(async () => {
    inviteRepository.clear();
    organizationRepository.organizations.length = 0;
    organizationRepository.memberships.length = 0;
    userRepository.users.clear();
    auditRepository.clear();

    userRepository.users.set(ownerId, {
      userId: ownerId,
      email: "owner@example.com",
      displayName: "Owner",
      avatarUrl: null,
      passwordHash: "hash",
      status: "active",
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await organizationRepository.criar({
      organizationId: orgId,
      name: "Org Test",
      slug: "org-test",
    });
    await organizationRepository.vincularUsuario(orgId, ownerId, "owner");
  });

  it("cria convite para novo membro", async () => {
    const response = await app.inject({
      method: "POST",
      url: `/organizations/${orgId}/invites`,
      headers: { "x-user-id": ownerId },
      payload: {
        email: "guest@example.com",
        role: "member",
        expiresInDays: 10,
      },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json() as { invite: { email: string; status: string } };
    expect(body.invite.email).toBe("guest@example.com");
    expect(body.invite.status).toBe("pending");
    expect(auditRepository.registros.at(-1)).toMatchObject({
      action: "organizacao.convite.criado",
      actorId: ownerId,
    });
  });

  it("impede convite por usuário sem privilégio", async () => {
    const viewerId = "user-viewer";
    userRepository.users.set(viewerId, {
      userId: viewerId,
      email: "viewer@example.com",
      displayName: "Viewer",
      avatarUrl: null,
      passwordHash: "hash",
      status: "active",
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await organizationRepository.vincularUsuario(orgId, viewerId, "viewer");

    const response = await app.inject({
      method: "POST",
      url: `/organizations/${orgId}/invites`,
      headers: { "x-user-id": viewerId },
      payload: {
        email: "guest@example.com",
      },
    });

    expect(response.statusCode).toBe(403);
  });

  it("lista convites pendentes da organização", async () => {
    await app.inject({
      method: "POST",
      url: `/organizations/${orgId}/invites`,
      headers: { "x-user-id": ownerId },
      payload: {
        email: "guest@example.com",
      },
    });

    const response = await app.inject({
      method: "GET",
      url: `/organizations/${orgId}/invites`,
      headers: { "x-user-id": ownerId },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { itens: Array<{ email: string; status: string }> };
    expect(body.itens).toHaveLength(1);
    expect(body.itens[0].email).toBe("guest@example.com");
  });

  it("cancela convite pendente", async () => {
    const creation = await app.inject({
      method: "POST",
      url: `/organizations/${orgId}/invites`,
      headers: { "x-user-id": ownerId },
      payload: {
        email: "guest@example.com",
      },
    });

    const invite = (creation.json() as { invite: { inviteId: string } }).invite;

    const response = await app.inject({
      method: "DELETE",
      url: `/organizations/${orgId}/invites/${invite.inviteId}`,
      headers: { "x-user-id": ownerId },
    });

    expect(response.statusCode).toBe(204);

    const list = await app.inject({
      method: "GET",
      url: `/organizations/${orgId}/invites?status=pending`,
      headers: { "x-user-id": ownerId },
    });
    const body = list.json() as { itens: Array<{ status: string }> };
    expect(body.itens).toHaveLength(0);
    expect(auditRepository.registros.at(-1)).toMatchObject({
      action: "organizacao.convite.cancelado",
      actorId: ownerId,
    });
  });

  it("evita convites duplicados para o mesmo email", async () => {
    await app.inject({
      method: "POST",
      url: `/organizations/${orgId}/invites`,
      headers: { "x-user-id": ownerId },
      payload: {
        email: "guest@example.com",
      },
    });

    const response = await app.inject({
      method: "POST",
      url: `/organizations/${orgId}/invites`,
      headers: { "x-user-id": ownerId },
      payload: {
        email: "guest@example.com",
      },
    });

    expect(response.statusCode).toBe(409);
  });
});
