import { beforeAll, describe, expect, it } from "vitest";

import { createServer } from "../../src/core/server/create-server";
import { InMemoryOrganizationRepository } from "../../src/modules/organizations/infra/memory/in-memory-organization.repository";

const organizationRepository = new InMemoryOrganizationRepository();

let app: Awaited<ReturnType<typeof createServer>>;

const userId = "user-1";
const otherUserId = "user-2";

describe("Organizations HTTP", () => {
  beforeAll(async () => {
    await organizationRepository.criar({
      organizationId: "org-1",
      name: "Morina HQ",
      slug: "morina-hq",
    });
    await organizationRepository.criar({
      organizationId: "org-2",
      name: "Ateliê Beta",
      slug: "atelie-beta",
    });

    await organizationRepository.vincularUsuario("org-1", userId, "owner");
    await organizationRepository.vincularUsuario("org-2", userId, "member");
    await organizationRepository.vincularUsuario("org-2", otherUserId, "admin");

    app = await createServer({
      modules: {
        organizations: { organizationRepository },
      },
    });
  });

  it("lista organizações para o usuário autenticado", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/organizations",
      headers: {
        "x-user-id": userId,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { itens: Array<{ organizationId: string; role: string }> };
    expect(body.itens).toHaveLength(2);
    expect(body.itens.map((item) => item.organizationId)).toEqual(["org-1", "org-2"]);
  });

  it("retorna lista vazia quando usuário não pertence a nenhuma organização", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/organizations",
      headers: {
        "x-user-id": "unknown-user",
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { itens: unknown[] };
    expect(body.itens).toHaveLength(0);
  });
});
