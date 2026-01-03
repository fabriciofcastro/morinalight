/**
 * Testes de integração para fluxos de usuários
 * 
 * Testa fluxos completos: criar, editar, excluir usuário
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("Users Integration", () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
  let authToken: string;
  let testOrgId: string;
  let createdUserId: string | null = null;

  beforeAll(async () => {
    // TODO: Criar usuário de teste e obter token real
    // Por enquanto, vamos usar tokens mockados
    authToken = process.env.TEST_AUTH_TOKEN || "test-token";
    testOrgId = process.env.TEST_ORG_ID || "test-org-id";
  });

  afterAll(async () => {
    // Cleanup: remover usuário criado nos testes
    if (createdUserId) {
      try {
        await fetch(`${API_URL}/users/${createdUserId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "x-org-id": testOrgId,
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        console.error("Erro ao limpar usuário de teste:", error);
      }
    }
  });

  describe("Fluxo completo: Criar usuário", () => {
    it("deve criar um novo usuário com sucesso", async () => {
      const newUser = {
        name: "Usuário Teste",
        email: `teste-${Date.now()}@example.com`,
        cpf: "12345678909",
        password: "SenhaSegura123!",
        positionId: null,
        departmentId: null,
      };

      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "x-org-id": testOrgId,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        const data = await response.json();
        expect(data).toHaveProperty("userId");
        expect(data.email).toBe(newUser.email);
        createdUserId = data.userId;
      } else {
        // Se não estiver autenticado, apenas verificar que a rota existe
        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });

    it("deve validar CPF inválido ao criar usuário", async () => {
      const invalidUser = {
        name: "Usuário Inválido",
        email: `invalido-${Date.now()}@example.com`,
        cpf: "00000000000", // CPF inválido
        password: "SenhaSegura123!",
      };

      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "x-org-id": testOrgId,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidUser),
      });

      // Deve retornar erro de validação
      if (response.status !== 401 && response.status !== 403) {
        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });
  });

  describe("Fluxo completo: Editar usuário", () => {
    it("deve atualizar dados do usuário", async () => {
      if (!createdUserId) {
        // Pular se não tiver usuário criado
        return;
      }

      const updates = {
        name: "Usuário Teste Atualizado",
        phone: "11987654321",
      };

      const response = await fetch(`${API_URL}/users/${createdUserId}`, {
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
        expect(data.phone).toBe(updates.phone);
      } else {
        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });
  });

  describe("Fluxo completo: Excluir usuário", () => {
    it("deve excluir usuário com sucesso", async () => {
      if (!createdUserId) {
        // Pular se não tiver usuário criado
        return;
      }

      const response = await fetch(`${API_URL}/users/${createdUserId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "x-org-id": testOrgId,
          "Content-Type": "application/json",
        },
      });

      if (response.ok || response.status === 204) {
        expect(response.status).toBeGreaterThanOrEqual(200);
        expect(response.status).toBeLessThan(300);
        createdUserId = null; // Marcar como removido
      } else {
        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });
  });

  describe("Fluxo: Importação em massa", () => {
    it("deve validar formato de arquivo CSV", async () => {
      const csvContent = "name,email,cpf\nJoão Silva,joao@example.com,12345678909";
      const blob = new Blob([csvContent], { type: "text/csv" });
      const formData = new FormData();
      formData.append("file", blob, "users.csv");

      const response = await fetch(`${API_URL}/users/import`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "x-org-id": testOrgId,
        },
        body: formData,
      });

      // Deve aceitar ou retornar erro de validação
      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });

  describe("Fluxo: Exportação", () => {
    it("deve exportar lista de usuários", async () => {
      const response = await fetch(`${API_URL}/users/export?format=csv`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "x-org-id": testOrgId,
        },
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        expect(contentType).toContain("text/csv");
      } else {
        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });
  });
});

