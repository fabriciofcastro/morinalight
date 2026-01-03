import { describe, expect, it } from "vitest";

import { companySettingsSchema, DEFAULT_COMPANY_SETTINGS } from "./company-settings";

describe("companySettingsSchema", () => {
  it("normaliza strings vazias para undefined", () => {
    const parsed = companySettingsSchema.parse({
      logoUrl: "",
      primaryColor: "",
      secondaryColor: "",
      themeMode: "auto",
      videoLink: "",
    });

    expect(parsed).toEqual({
      logoUrl: undefined,
      primaryColor: undefined,
      secondaryColor: undefined,
      themeMode: "auto",
      videoLink: undefined,
    });
  });

  it("aceita cores hexadecimais válidas", () => {
    const parsed = companySettingsSchema.parse({
      primaryColor: "#123abc",
      secondaryColor: "#FFF",
    });

    expect(parsed.primaryColor).toBe("#123abc");
    expect(parsed.secondaryColor).toBe("#FFF");
  });

  it("lança erro para cores inválidas", () => {
    expect(() =>
      companySettingsSchema.parse({
        primaryColor: "azul",
      }),
    ).toThrowError(/hexadecimal/);
  });

  it("expõe defaults globais", () => {
    expect(DEFAULT_COMPANY_SETTINGS.primaryColor).toBe("#2855FF");
    expect(DEFAULT_COMPANY_SETTINGS.themeMode).toBe("auto");
  });
});
