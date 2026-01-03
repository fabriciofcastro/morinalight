import { beforeAll, describe, expect, it } from "vitest";

import { createServer } from "../../src/core/server/create-server";
import type { CompanySettings } from "../../src/modules/company-settings/company-settings.schema";
import {
  companySettingsSchema,
  DEFAULT_COMPANY_SETTINGS,
} from "../../src/modules/company-settings/company-settings.schema";
import { InMemoryCompanySettingsRepository } from "../../src/modules/company-settings/repositories/in-memory-company-settings.repository";

describe("Contracto de /company-settings", () => {
  const orgId = "contract-org";
  let app: Awaited<ReturnType<typeof createServer>>;
  const repository = new InMemoryCompanySettingsRepository();

  beforeAll(async () => {
    app = await createServer({
      modules: {
        company: {
          repository,
        },
      },
    });
  });

  it("retorna payload compatível com o schema quando não existem dados", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/company-settings",
      headers: {
        "x-org-id": orgId,
      },
    });

    expect(response.statusCode).toBe(200);
    const payload = response.json() as CompanySettings;
    expect(() => companySettingsSchema.parse(payload)).not.toThrow();
    expect(payload).toMatchObject(DEFAULT_COMPANY_SETTINGS);
  });

  it("rejeita payload inválido com detalhe de validação", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/company-settings",
      headers: {
        "x-org-id": orgId,
      },
      payload: {
        primaryColor: "azul", // inválido
      },
    });

    expect(response.statusCode).toBe(400);
    const body = response.json() as { message: string; errors: unknown };
    expect(body.message).toContain("Não foi possível validar");
    expect(body.errors).toBeTruthy();
  });

  it("persiste e normaliza payload válido mantendo compatibilidade", async () => {
    const payload = {
      logoUrl: "https://cdn.morina.ai/logo.svg",
      primaryColor: "#112233",
      secondaryColor: "#445566",
      themeMode: "dark",
      videoLink: "https://player.vimeo.com/video/123456",
    } satisfies CompanySettings;

    const putResponse = await app.inject({
      method: "PUT",
      url: "/company-settings",
      headers: {
        "x-org-id": orgId,
      },
      payload,
    });

    expect(putResponse.statusCode).toBe(200);
    const persisted = putResponse.json() as CompanySettings;
    expect(() => companySettingsSchema.parse(persisted)).not.toThrow();
    expect(persisted).toMatchObject(payload);

    const getResponse = await app.inject({
      method: "GET",
      url: "/company-settings",
      headers: {
        "x-org-id": orgId,
      },
    });

    expect(getResponse.statusCode).toBe(200);
    const fetched = getResponse.json() as CompanySettings;
    expect(fetched).toMatchObject(payload);
  });
});
