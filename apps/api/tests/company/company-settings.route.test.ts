import { beforeAll, describe, expect, it } from "vitest";

import { createServer } from "../../src/core/server/create-server";
import { DEFAULT_COMPANY_SETTINGS } from "../../src/modules/company-settings/company-settings.schema";
import { InMemoryCompanySettingsRepository } from "../../src/modules/company-settings/repositories/in-memory-company-settings.repository";

describe("Company Settings Routes", () => {
  let app: Awaited<ReturnType<typeof createServer>>;
  const repository = new InMemoryCompanySettingsRepository();
  const orgId = "org-test";

  beforeAll(async () => {
    app = await createServer({
      modules: {
        company: {
          repository,
        },
      },
    });
  });

  it("retorna valores padrão quando não existem dados persistidos", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/company-settings",
      headers: {
        "x-org-id": orgId,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(DEFAULT_COMPANY_SETTINGS);
  });

  it("persiste e retorna configurações personalizadas", async () => {
    const updateResponse = await app.inject({
      method: "PUT",
      url: "/company-settings",
      headers: {
        "x-org-id": orgId,
      },
      payload: {
        primaryColor: "#FF0000",
        themeMode: "dark",
        videoLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
    });

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.json()).toMatchObject({
      primaryColor: "#FF0000",
      themeMode: "dark",
      videoLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    });

    const fetchResponse = await app.inject({
      method: "GET",
      url: "/company-settings",
      headers: {
        "x-org-id": orgId,
      },
    });

    expect(fetchResponse.statusCode).toBe(200);
    expect(fetchResponse.json()).toMatchObject({
      primaryColor: "#FF0000",
      themeMode: "dark",
      videoLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    });
  });
});
