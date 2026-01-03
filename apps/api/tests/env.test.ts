import { describe, expect, it } from "vitest";

import { EnvSchema } from "../src/core/config/env";

describe("EnvSchema", () => {
  it("usa valores padrão quando variáveis não estão definidas", () => {
    const parsed = EnvSchema.parse({});

    expect(parsed.API_PORT).toBe(3333);
    expect(parsed.API_HOST).toBe("0.0.0.0");
    expect(parsed.LOG_LEVEL).toBe("info");
  });
});
