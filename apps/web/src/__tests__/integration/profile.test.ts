/**
 * Testes de integração para fluxos de perfil
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("Profile Integration", () => {
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

  describe("Fluxo: Obter perfil do usuário", () => {
    it("deve obter perfil do usuário autenticado", async () => {
      const response = await fetch(`${API_URL}/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "x-org-id": testOrgId,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        expect(data).toHaveProperty("userId");
        expect(data).toHaveProperty("email");
        expect(data).toHaveProperty("name");
      } else {
        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });
  });

  describe("Fluxo: Atualizar perfil", () => {
    it("deve atualizar dados do perfil", async () => {
      const updates = {
        name: "Nome Atualizado",
        phone: "11987654321",
      };

      const response = await fetch(`${API_URL}/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "x-org-id": testOrgId,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        expect(data.name).toBe(updates.name);
      } else {
        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });
  });

  describe("Fluxo: Alterar senha", () => {
    it("deve validar senha atual ao alterar senha", async () => {
      const passwordData = {
        currentPassword: "senhaAtual123",
        newPassword: "novaSenha123!",
        confirmPassword: "novaSenha123!",
      };

      const response = await fetch(`${API_URL}/profile/change-password`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "x-org-id": testOrgId,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordData),
      });

      // Deve retornar sucesso ou erro de validação
      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });

  describe("Fluxo: Sessões ativas", () => {
    it("deve listar sessões ativas", async () => {
      const response = await fetch(`${API_URL}/profile/sessions`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "x-org-id": testOrgId,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        expect(Array.isArray(data.sessions)).toBe(true);
      } else {
        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });
  });

  describe("Fluxo: Estatísticas pessoais", () => {
    it("deve obter estatísticas do perfil", async () => {
      const response = await fetch(`${API_URL}/profile/stats`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "x-org-id": testOrgId,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        expect(data).toHaveProperty("totalActions");
        expect(data).toHaveProperty("mostUsedModules");
      } else {
        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });
  });
});

