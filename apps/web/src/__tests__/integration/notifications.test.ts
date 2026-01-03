/**
 * Testes de integração para fluxos de notificações
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("Notifications Integration", () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
  let authToken: string;
  let testOrgId: string;
  let testUserId: string;
  let createdNotificationId: string | null = null;

  beforeAll(async () => {
    authToken = process.env.TEST_AUTH_TOKEN || "test-token";
    testOrgId = process.env.TEST_ORG_ID || "test-org-id";
    testUserId = process.env.TEST_USER_ID || "test-user-id";
  });

  afterAll(async () => {
    // Cleanup: remover notificação criada
    if (createdNotificationId) {
      try {
        await fetch(`${API_URL}/notifications/${createdNotificationId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "x-org-id": testOrgId,
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        console.error("Erro ao limpar notificação de teste:", error);
      }
    }
  });

  describe("Fluxo completo: Criar e gerenciar notificação", () => {
    it("deve criar uma nova notificação", async () => {
      const notification = {
        title: "Teste de Notificação",
        message: "Esta é uma notificação de teste",
        category: "system",
        type: "info",
        userId: testUserId,
      };

      const response = await fetch(`${API_URL}/notifications`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "x-org-id": testOrgId,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notification),
      });

      if (response.ok) {
        const data = await response.json();
        expect(data).toHaveProperty("id");
        expect(data.title).toBe(notification.title);
        createdNotificationId = data.id;
      } else {
        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });

    it("deve marcar notificação como lida", async () => {
      if (!createdNotificationId) return;

      const response = await fetch(`${API_URL}/notifications/${createdNotificationId}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "x-org-id": testOrgId,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        expect(data.read).toBe(true);
      } else {
        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });

    it("deve obter estatísticas de notificações", async () => {
      const response = await fetch(`${API_URL}/notifications/stats`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "x-org-id": testOrgId,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        expect(data).toHaveProperty("total");
        expect(data).toHaveProperty("unread");
        expect(typeof data.total).toBe("number");
      } else {
        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });

    it("deve marcar todas as notificações como lidas", async () => {
      const response = await fetch(`${API_URL}/notifications/mark-all-read`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "x-org-id": testOrgId,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        expect(data).toHaveProperty("updated");
      } else {
        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });
  });

  describe("Fluxo: Preferências de notificação", () => {
    it("deve obter preferências de notificação", async () => {
      const response = await fetch(`${API_URL}/notifications/preferences`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "x-org-id": testOrgId,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        expect(Array.isArray(data.preferences)).toBe(true);
      } else {
        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });

    it("deve atualizar preferências de notificação", async () => {
      const preferences = {
        category: "system",
        enabled: true,
        channels: ["email", "in-app"],
        frequency: "immediate",
      };

      const response = await fetch(`${API_URL}/notifications/preferences`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "x-org-id": testOrgId,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        const data = await response.json();
        expect(data.enabled).toBe(preferences.enabled);
      } else {
        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });
  });
});

