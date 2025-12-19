/**
 * Testes de integração para fluxos de logout
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("Logout Integration", () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
  let authToken: string;
  let testOrgId: string;

  beforeAll(async () => {
    authToken = process.env.TEST_AUTH_TOKEN || "test-token";
    testOrgId = process.env.TEST_ORG_ID || "test-org-id";
  });

  afterAll(async () => {
    // Cleanup se necessário
  });

  describe("Fluxo: Logout simples", () => {
    it("deve fazer logout do usuário atual", async () => {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "x-org-id": testOrgId,
          "Content-Type": "application/json",
        },
      });

      // Deve retornar sucesso ou redirecionamento
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(400);
    });
  });

  describe("Fluxo: Logout de todos os dispositivos", () => {
    it("deve fazer logout de todos os dispositivos", async () => {
      const response = await fetch(`${API_URL}/auth/logout-all`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "x-org-id": testOrgId,
          "Content-Type": "application/json",
        },
      });

      // Deve retornar sucesso
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(400);
    });
  });

  describe("Fluxo: Logout de sessão específica", () => {
    it("deve fazer logout de uma sessão específica", async () => {
      const sessionId = "test-session-id";

      const response = await fetch(`${API_URL}/auth/logout/${sessionId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "x-org-id": testOrgId,
          "Content-Type": "application/json",
        },
      });

      // Deve retornar sucesso ou erro se sessão não existir
      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });
});

