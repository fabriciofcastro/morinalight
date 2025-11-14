#!/usr/bin/env node

/**
 * Script de validação da configuração MCP
 *
 * Verifica se:
 * - Os servidores MCP estão configurados corretamente
 * - Os serviços (PostgreSQL, Redis) estão acessíveis
 * - Os documentos canônicos existem
 * - O índice de documentos está atualizado
 */

import { exec } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "..");

/**
 * Verifica se um arquivo existe
 */
async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Verifica a configuração do MCP
 */
async function validateMcpConfig() {
  console.log("🔍 Validando configuração MCP...\n");

  const mcpConfigPath = join(ROOT_DIR, ".cursor", "mcp.json");

  if (!(await fileExists(mcpConfigPath))) {
    console.error("❌ Arquivo .cursor/mcp.json não encontrado!");
    return false;
  }

  try {
    const configContent = await readFile(mcpConfigPath, "utf-8");
    const config = JSON.parse(configContent);

    if (!config.mcpServers) {
      console.error("❌ Configuração mcpServers não encontrada!");
      return false;
    }

    const servers = Object.keys(config.mcpServers).filter((key) => !key.startsWith("_"));
    console.log(`  ✓ Configuração encontrada com ${servers.length} servidores:`);
    servers.forEach((server) => {
      console.log(`    - ${server}`);
    });

    return true;
  } catch (error) {
    console.error(`❌ Erro ao ler configuração: ${error.message}`);
    return false;
  }
}

/**
 * Verifica se o PostgreSQL está acessível
 */
async function validatePostgres() {
  console.log("\n🐘 Verificando PostgreSQL...");

  try {
    const { stdout } = await execAsync(
      "psql postgresql://morina:morina@localhost:5432/morina -c 'SELECT 1;' 2>&1",
    );
    console.log("  ✓ PostgreSQL está acessível");
    return true;
  } catch (_error) {
    console.warn("  ⚠️  PostgreSQL não está acessível (pode estar rodando no Docker)");
    console.warn("     Certifique-se de que o Docker Compose está rodando: docker compose ps");
    return false;
  }
}

/**
 * Verifica se o Redis está acessível
 */
async function validateRedis() {
  console.log("\n🔴 Verificando Redis...");

  try {
    const { stdout } = await execAsync("redis-cli -h localhost -p 6379 ping 2>&1");
    if (stdout.trim() === "PONG") {
      console.log("  ✓ Redis está acessível");
      return true;
    }
  } catch (_error) {
    console.warn("  ⚠️  Redis não está acessível (pode estar rodando no Docker)");
    console.warn("     Certifique-se de que o Docker Compose está rodando: docker compose ps");
    return false;
  }

  return false;
}

/**
 * Verifica se os documentos canônicos existem
 */
async function validateCanonicalDocs() {
  console.log("\n📚 Verificando documentos canônicos...");

  const canonicalDocs = [
    "docs/MANIFESTO.md",
    "docs/DOCS_STANDARDS.md",
    "docs/CURSOR_START.md",
    "docs/catalogo.md",
    "docs/openapi/morina-openapi.yaml",
  ];

  let allExist = true;
  for (const doc of canonicalDocs) {
    const docPath = join(ROOT_DIR, doc);
    const exists = await fileExists(docPath);
    if (exists) {
      console.log(`  ✓ ${doc}`);
    } else {
      console.warn(`  ⚠️  ${doc} não encontrado`);
      allExist = false;
    }
  }

  return allExist;
}

/**
 * Verifica se o índice de documentos existe
 */
async function validateDocsIndex() {
  console.log("\n📊 Verificando índice de documentos...");

  const indexPath = join(ROOT_DIR, ".cursor", "docs-index.json");
  const exists = await fileExists(indexPath);

  if (exists) {
    try {
      const indexContent = await readFile(indexPath, "utf-8");
      const index = JSON.parse(indexContent);
      console.log(`  ✓ Índice encontrado com ${index.summary?.total || 0} documentos`);
      console.log(`    Timestamp: ${index.timestamp || "desconhecido"}`);
      return true;
    } catch (error) {
      console.warn(`  ⚠️  Erro ao ler índice: ${error.message}`);
      return false;
    }
  } else {
    console.warn("  ⚠️  Índice não encontrado. Execute 'pnpm docs:index' para criar.");
    return false;
  }
}

/**
 * Função principal
 */
async function main() {
  console.log("🚀 Validação da Configuração MCP\n");
  console.log(`${"=".repeat(50)}\n`);

  const results = {
    mcpConfig: await validateMcpConfig(),
    postgres: await validatePostgres(),
    redis: await validateRedis(),
    canonicalDocs: await validateCanonicalDocs(),
    docsIndex: await validateDocsIndex(),
  };

  console.log(`\n${"=".repeat(50)}`);
  console.log("\n📋 Resumo da Validação:\n");

  const allPassed = Object.values(results).every((r) => r);
  const passedCount = Object.values(results).filter((r) => r).length;
  const totalCount = Object.keys(results).length;

  Object.entries(results).forEach(([key, passed]) => {
    const status = passed ? "✓" : "✗";
    const name = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
    console.log(`  ${status} ${name}`);
  });

  console.log(`\n${passedCount}/${totalCount} verificações passaram\n`);

  if (allPassed) {
    console.log("✅ Todas as validações passaram! MCP está configurado corretamente.\n");
    process.exit(0);
  } else {
    console.log("⚠️  Algumas validações falharam. Verifique os avisos acima.\n");
    console.log("💡 Dicas:");
    console.log("  - Execute 'docker compose up -d' para iniciar os serviços");
    console.log("  - Execute 'pnpm docs:index' para criar/atualizar o índice");
    console.log("  - Verifique a documentação em .cursor/README.md\n");
    process.exit(1);
  }
}

// Executa o script
main();
