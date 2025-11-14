#!/usr/bin/env tsx

import { config } from "dotenv";
config({ path: ".env" });

const API_URL = process.env.API_URL || "http://localhost:3333";

async function main() {
  console.log("🔍 Testando Sistema de Permissões\n");
  console.log("=".repeat(60));

  // Test 1: Health Check
  console.log("\n1️⃣  Health Check");
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    if (data.status === "ok") {
      console.log("   ✅ Servidor respondendo corretamente");
    }
  } catch (error) {
    console.log("   ❌ Erro:", error);
    return;
  }

  // Test 2: Tentar fazer login (pode não ter usuário)
  console.log("\n2️⃣  Autenticação");
  let token: string | null = null;
  let userId: string | null = null;
  let orgId: string | null = null;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@example.com",
        password: "admin123",
      }),
    });

    if (response.ok) {
      const data = await response.json();
      token = data.token;
      userId = data.user?.userId;
      orgId = data.organization?.organizationId || data.organizations?.[0]?.organizationId;
      console.log("   ✅ Login bem-sucedido");
      console.log(`   📋 User ID: ${userId}`);
      console.log(`   📋 Org ID: ${orgId}`);
    } else {
      const error = await response.json();
      console.log(`   ⚠️  Login falhou: ${error.message || "Usuário não encontrado"}`);
      console.log("   💡 Dica: Execute 'pnpm create-admin' para criar um usuário de teste");
    }
  } catch (error) {
    console.log("   ❌ Erro ao fazer login:", error);
  }

  // Test 3: Testar rotas de permissões (se tiver token)
  if (token && userId && orgId) {
    console.log("\n3️⃣  Rotas de Permissões");
    
    const headers = {
      "Authorization": `Bearer ${token}`,
      "x-org-id": orgId,
      "Content-Type": "application/json",
    };

    // 3.1: Listar permissões
    console.log("\n   📋 GET /users/:userId/permissions");
    try {
      const response = await fetch(`${API_URL}/users/${userId}/permissions`, { headers });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`      ✅ Status: ${response.status}`);
        console.log(`      📊 Role: ${data.role || "N/A"}`);
        console.log(`      📊 Total de permissões: ${data.permissions?.length || 0}`);
        
        if (data.permissions && data.permissions.length > 0) {
          console.log(`      🔑 Primeiras 3 permissões:`);
          data.permissions.slice(0, 3).forEach((p: any) => {
            console.log(`         - ${p.permissionKey || p.permissionId}`);
          });
        }
      } else {
        const error = await response.json();
        console.log(`      ❌ Status: ${response.status}`);
        console.log(`      ❌ Erro: ${error.message || JSON.stringify(error)}`);
      }
    } catch (error) {
      console.log(`      ❌ Erro: ${error}`);
    }

    // 3.2: Verificar permissões específicas
    console.log("\n   🔍 GET /users/:userId/permissions/check");
    const permissionsToCheck = [
      "dashboard:view",
      "products:view",
      "products:create",
      "settings:permissions:view",
    ];

    for (const permission of permissionsToCheck) {
      try {
        const response = await fetch(
          `${API_URL}/users/${userId}/permissions/check?permission=${encodeURIComponent(permission)}`,
          { headers }
        );

        if (response.ok) {
          const data = await response.json();
          const icon = data.hasPermission ? "✅" : "❌";
          console.log(`      ${icon} ${permission}: ${data.hasPermission ? "TEM" : "NÃO TEM"}`);
          if (data.reason) {
            console.log(`         Motivo: ${data.reason}`);
          }
        } else {
          const error = await response.json();
          console.log(`      ❌ ${permission}: Erro ${response.status} - ${error.message || JSON.stringify(error)}`);
        }
      } catch (error) {
        console.log(`      ❌ ${permission}: Erro - ${error}`);
      }
    }
  } else {
    console.log("\n3️⃣  Rotas de Permissões");
    console.log("   ⚠️  Pulado - Token não disponível");
    console.log("   💡 Crie um usuário com 'pnpm create-admin' para testar");
  }

  // Test 4: Testar outras rotas sem autenticação
  console.log("\n4️⃣  Outras Rotas (sem autenticação)");
  
  const routes = [
    { name: "Catálogo", path: "/catalogo/produtos", method: "GET" },
    { name: "Clientes", path: "/clientes", method: "GET" },
    { name: "Organizações", path: "/organizations", method: "GET" },
  ];

  for (const route of routes) {
    try {
      const response = await fetch(`${API_URL}${route.path}`, {
        method: route.method,
        headers: {
          "x-org-id": "test-org",
          "x-user-id": "test-user",
        },
      });

      // Aceitar 200, 401, 403 como válidos (rota existe)
      if ([200, 401, 403].includes(response.status)) {
        console.log(`   ✅ ${route.name}: Rota acessível (${response.status})`);
      } else {
        console.log(`   ⚠️  ${route.name}: Status ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ ${route.name}: Erro - ${error}`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ Testes concluídos!\n");
}

main().catch(console.error);

