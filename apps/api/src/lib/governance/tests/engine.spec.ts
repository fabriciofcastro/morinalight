import { faker } from "@faker-js/faker";
import { describe, expect, it } from "vitest";
import { IntegrityService } from "../../../modules/audit/integrity.service";
import { AccessEngine } from "../engine/core";
import type { AccessContext } from "../types/context.types";
import { GovernancePolicySchema } from "../types/policy.types";

describe("Governance Engine - Stress & Logic Tests", () => {
  // 1. Mock Policy
  const mockPolicy = {
    meta: {
      system: "TestSys",
      version: "1.0",
      timezone: "UTC",
      audit_retention_days: 365,
      immutable: true,
    },
    working_hours: {
      default: { days: ["MON", "TUE", "WED", "THU", "FRI"], start: "09:00", end: "17:00" },
      tolerance_minutes: 0,
    },
    roles: {
      ADMIN: { allowed_screens: ["*"] },
      USER: { allowed_screens: ["HOME"] },
      ATTACKER: { allowed_screens: [] }, // Role inválida simulada
    },
    policies: [], // ABAC vazio para simplicidade inicial
    pbac: { active_policies: [], policy_versioning: { enabled: false, decision_log: false } },
    aubac: {
      risk_scoring: { outside_hours_access: { weight: 10 }, foreign_ip_access: { weight: 50 } },
      thresholds: {
        medium_risk: { score: 20, action: "AUDIT" },
        high_risk: { score: 60, action: "BLOCK" },
      },
    },
  };

  // Validar a Policy Mock antes de começar
  GovernancePolicySchema.parse(mockPolicy);

  it("should BLOCK access for unknown roles (Fail-close)", () => {
    const context: AccessContext = {
      userId: faker.string.uuid(),
      role: "HACKER_ROLE", // Não existe
      screen: "ANY",
      action: "VIEW",
      timestamp: new Date(),
      ip: faker.internet.ipv4(),
    };

    const result = AccessEngine.evaluateAccess(context, mockPolicy as any, {
      outsideHoursCount: 0,
      foreignIpCount: 0,
    });
    expect(result.decision).toBe("DENY");
    expect(result.reasons).toContain("RBAC_VIOLATION");
  });

  it("should FLAG outside hours access (TBAC)", () => {
    // Domingo
    const sunday = new Date("2023-12-24T12:00:00Z"); // Certifique-se que é Domingo

    // Simplificação: apenas mockar o dia no test se precisar, mas aqui vamos confiar no Date real se o TBAC usar getDay()
    // O mockPolicy diz MON-FRI.
    // Vamos usar a função do TBAC isolada ou criar data específica.

    const context: AccessContext = {
      userId: faker.string.uuid(),
      role: "ADMIN",
      screen: "HOME",
      action: "VIEW",
      timestamp: new Date("2023-12-31T12:00:00Z"), // Domingo
      ip: faker.internet.ipv4(),
    };

    const result = AccessEngine.evaluateAccess(context, mockPolicy as any, {
      outsideHoursCount: 0,
      foreignIpCount: 0,
    });
    // ADMIN passa no RBAC, mas TBAC pega
    expect(result.reasons).toContain("OUTSIDE_HOURS");
  });

  it("should CHAING HASH correctly (Integrity)", () => {
    const event1 = {
      previousHash: undefined,
      timestamp: new Date(),
      userId: "user1",
      ip: "1.1.1.1",
      decision: "ALLOW",
      resource: "A",
      action: "VIEW",
    };

    const hash1 = IntegrityService.calculateHash(event1);

    const event2 = {
      previousHash: hash1, // Link
      timestamp: new Date(),
      userId: "user2",
      ip: "2.2.2.2",
      decision: "DENY",
      resource: "B",
      action: "EDIT",
    };

    const hash2 = IntegrityService.calculateHash(event2);

    expect(hash1).not.toBe(hash2);
    expect(IntegrityService.verifyChain([event1, event2])).toBe(true);
  });

  it("should DETECT BROKEN CHAIN (Integrity)", () => {
    const event1 = {
      previousHash: undefined,
      timestamp: new Date(),
      userId: "u1",
      ip: "1.1.1.1",
      decision: "A",
      resource: "R",
      action: "V",
    };
    const hash1 = IntegrityService.calculateHash(event1);

    const event2 = {
      previousHash: hash1,
      timestamp: new Date(),
      userId: "u2",
      ip: "2.2.2.2",
      decision: "D",
      resource: "R",
      action: "E",
    };

    // Adulteração! Mudando o evento 1 retrospectivamente
    event1.decision = "DENY"; // Era ALLOW

    // A cadeia agora deve falhar porque o hash recalculado do ev1 não bate com o previousHash do ev2
    expect(IntegrityService.verifyChain([event1, event2])).toBe(false);
  });
});
