#!/usr/bin/env tsx

import { config } from "dotenv";

config({ path: ".env" });

const API_URL = process.env.API_URL || "http://localhost:3333";

async function testHealth() {
  console.log("🏥 Testando Health Check...");
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();

    if (response.ok && data.status === "ok") {
      console.log("✅ Health Check: OK");
      return true;
    } else {
      console.log("❌ Health Check: FALHOU", data);
      return false;
    }
  } catch (error) {
    console.error("❌ Health Check: ERRO", error);
    return false;
  }
}

async function testAuth() {
  console.log("\n🔐 Testando Autenticação...");
  try {
    // Tentar fazer login
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@example.com",
        password: "admin123",
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.token) {
        console.log("✅ Login: OK - Token recebido");
        return data.token;
      }
    } else {
      const _error = await response.json();
      console.log("⚠️  Login: Usuário não encontrado ou senha incorreta");
      console.log("   (Isso é normal se não houver usuário criado)");
    }
  } catch (error) {
    console.error("❌ Login: ERRO", error);
  }

  return null;
}

async function testPermissions(token: string, userId: string, orgId: string) {
  console.log("\n🔑 Testando Rotas de Permissões...");

  const headers = {
    Authorization: `Bearer ${token}`,
    "x-org-id": orgId,
    "Content-Type": "application/json",
  };

  // Test 1: Listar permissões do usuário
  console.log("\n1️⃣  Testando GET /users/:userId/permissions");
  try {
    const response = await fetch(`${API_URL}/users/${userId}/permissions`, {
      headers,
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Listar Permissões: OK");
      console.log(`   Role: ${data.role || "N/A"}`);
      console.log(`   Permissões: ${data.permissions?.length || 0}`);
      if (data.permissions && data.permissions.length > 0) {
        console.log(`   Primeira permissão: ${data.permissions[0].permissionKey || "N/A"}`);
      }
    } else {
      const error = await response.json();
      console.log("❌ Listar Permissões: FALHOU", response.status, error);
    }
  } catch (error) {
    console.error("❌ Listar Permissões: ERRO", error);
  }

  // Test 2: Verificar permissão específica
  console.log("\n2️⃣  Testando GET /users/:userId/permissions/check");
  const permissionsToTest = ["products:view", "dashboard:view", "settings:permissions:view"];

  for (const permission of permissionsToTest) {
    try {
      const response = await fetch(
        `${API_URL}/users/${userId}/permissions/check?permission=${encodeURIComponent(permission)}`,
        { headers },
      );

      if (response.ok) {
        const data = await response.json();
        const icon = data.hasPermission ? "✅" : "❌";
        console.log(`   ${icon} ${permission}: ${data.hasPermission ? "TEM" : "NÃO TEM"}`);
      } else {
        const error = await response.json();
        console.log(`   ❌ ${permission}: ERRO ${response.status}`, error);
      }
    } catch (error) {
      console.error(`   ❌ ${permission}: ERRO`, error);
    }
  }
}

async function testModules() {
  console.log("\n📦 Verificando Módulos...");

  const modules = [
    { name: "Catálogo", path: "/catalogo/produtos" },
    { name: "Clientes", path: "/clientes" },
    { name: "Organizações", path: "/organizations" },
  ];

  for (const module of modules) {
    try {
      const response = await fetch(`${API_URL}${module.path}`, {
        method: "GET",
        headers: {
          "x-org-id": "test-org",
          "x-user-id": "test-user",
        },
      });

      // Aceitar 401/403 (normal sem autenticação) ou 200
      if (response.status === 200 || response.status === 401 || response.status === 403) {
        console.log(`✅ ${module.name}: Rota acessível (${response.status})`);
      } else {
        console.log(`⚠️  ${module.name}: Status inesperado (${response.status})`);
      }
    } catch (error) {
      console.error(`❌ ${module.name}: ERRO`, error);
    }
  }
}

async function main() {
  console.log("🚀 Iniciando Validação do Sistema\n");
  console.log("=".repeat(50));

  // 1. Health Check
  const healthOk = await testHealth();
  if (!healthOk) {
    console.log("\n❌ Sistema não está respondendo. Verifique se o servidor está rodando.");
    process.exit(1);
  }

  // 2. Testar módulos básicos
  await testModules();

  // 3. Tentar autenticação
  const token = await testAuth();

  // 4. Se tiver token, testar permissões
  if (token) {
    // Extrair userId e orgId do token (precisa implementar parse do JWT)
    // Por enquanto, usar valores de teste
    const userId = "user-123"; // TODO: Extrair do token
    const orgId = "org-123"; // TODO: Extrair do token

    await testPermissions(token, userId, orgId);
  } else {
    console.log("\n⚠️  Não foi possível obter token. Pulando testes de permissões.");
    console.log("   Para testar permissões, crie um usuário:");
    console.log("   cd apps/api && pnpm create-admin");
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log("✅ Validação concluída!");
}

main().catch(console.error);
