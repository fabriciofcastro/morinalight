import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createServer } from "../../src/core/server/create-server";
import { InMemoryOrganizationAuditLogRepository } from "../../src/modules/organizations/infra/memory/in-memory-organization-audit-log.repository";
import { InMemoryOrganizationRepository } from "../../src/modules/organizations/infra/memory/in-memory-organization.repository";
import { InMemoryUserInviteRepository } from "../../src/modules/organizations/infra/memory/in-memory-user-invite.repository";
import { InMemoryUserRepository } from "../../src/modules/users/infra/memory/in-memory-user.repository";

let app: Awaited<ReturnType<typeof createServer>>;
const organizationRepository = new InMemoryOrganizationRepository();
const userRepository = new InMemoryUserRepository();
const inviteRepository = new InMemoryUserInviteRepository();
const auditRepository = new InMemoryOrganizationAuditLogRepository();

const ownerId = "user-owner";
const adminId = "user-admin";
const memberId = "user-member";
const orgId = "org-123";

describe("Organizations Members HTTP", () => {
  beforeAll(async () => {
    app = await createServer({
      modules: {
        auth: {
          organizationRepository,
          userRepository,
          inviteRepository,
          auditRepository,
        },
        organizations: {
          organizationRepository,
          userRepository,
          inviteRepository,
          auditRepository,
        },
      },
    });
  });

  beforeEach(async () => {
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

    userRepository.users.set(adminId, {
      userId: adminId,
      email: "admin@example.com",
      displayName: "Admin",
      avatarUrl: null,
      passwordHash: "hash",
      status: "active",
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    userRepository.users.set(memberId, {
      userId: memberId,
      email: "member@example.com",
      displayName: "Member",
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
    await organizationRepository.vincularUsuario(orgId, adminId, "admin");
    await organizationRepository.vincularUsuario(orgId, memberId, "member");
  });

  it("lista membros da organização com dados do usuário", async () => {
    const response = await app.inject({
      method: "GET",
      url: `/organizations/${orgId}/members`,
      headers: { "x-user-id": memberId },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as {
      itens: Array<{ userId: string; role: string; user?: { email: string | null } }>;
    };
    expect(body.itens).toHaveLength(3);
    expect(body.itens.find((item) => item.userId === ownerId)?.role).toBe("owner");
    expect(body.itens.find((item) => item.userId === ownerId)?.user?.email).toBe(
      "owner@example.com",
    );
  });

  it("permite alterar papel de membro quando há permissão", async () => {
    const response = await app.inject({
      method: "PATCH",
      url: `/organizations/${orgId}/members/${memberId}`,
      headers: { "x-user-id": ownerId },
      payload: {
        role: "manager",
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { membership: { userId: string; role: string } };
    expect(body.membership.role).toBe("manager");
    expect(auditRepository.registros.at(-1)).toMatchObject({
      action: "organizacao.membro.papel_atualizado",
      actorId: ownerId,
      targetId: memberId,
    });
  });

  it("impede remover último proprietário ao alterar o papel", async () => {
    const response = await app.inject({
      method: "PATCH",
      url: `/organizations/${orgId}/members/${ownerId}`,
      headers: { "x-user-id": ownerId },
      payload: {
        role: "manager",
      },
    });

    expect(response.statusCode).toBe(409);
  });

  it("remove membro quando há permissão", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: `/organizations/${orgId}/members/${memberId}`,
      headers: { "x-user-id": ownerId },
    });

    expect(response.statusCode).toBe(204);
    expect(auditRepository.registros.at(-1)).toMatchObject({
      action: "organizacao.membro.removido",
      actorId: ownerId,
      targetId: memberId,
    });
  });

  it("impede remover último proprietário", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: `/organizations/${orgId}/members/${ownerId}`,
      headers: { "x-user-id": ownerId },
    });

    expect(response.statusCode).toBe(409);
  });

  it("bloqueia alterações quando membro não possui privilégio", async () => {
    const response = await app.inject({
      method: "PATCH",
      url: `/organizations/${orgId}/members/${adminId}`,
      headers: { "x-user-id": memberId },
      payload: {
        role: "manager",
      },
    });

    expect(response.statusCode).toBe(403);
  });
});

