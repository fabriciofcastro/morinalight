#!/usr/bin/env ts-node
/**
 * Script de login direto para bypass temporário
 * Uso: pnpm tsx apps/web/quick-login.ts
 */

const email = "admin@morina.com";
const password = "Admin@123";
const apiUrl = "http://localhost:3333";

async function login() {
    try {
        console.log("🔐 Tentando fazer login...");
        console.log(`📧 Email: ${email}`);

        const response = await fetch(`${apiUrl}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        console.log(`📊 Status: ${response.status}`);

        const data = await response.json();

        if (!response.ok) {
            console.error("❌ Erro:", data);
            process.exit(1);
        }

        console.log("✅ Login bem-sucedido!");
        console.log("\n📋 Dados do usuário:");
        console.log(JSON.stringify(data.user, null, 2));

        console.log("\n🔑 Token de acesso:");
        console.log(data.token);

        console.log("\n\n🎯 Para usar manualmente:");
        console.log("1. Abra o DevTools (F12)");
        console.log("2. Vá para Application > Cookies");
        console.log("3. Adicione um cookie com:");
        console.log(`   Nome: auth_token`);
        console.log(`   Valor: ${data.token}`);
        console.log("4. Recarregue a página");

    } catch (error) {
        console.error("❌ Erro ao fazer login:", error);
        process.exit(1);
    }
}

login();
