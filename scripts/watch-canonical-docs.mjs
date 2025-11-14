#!/usr/bin/env node

/**
 * Script para monitorar alterações em documentos canônicos e reindexar automaticamente
 * 
 * Este script pode ser usado com um watcher (ex: chokidar) para reindexar
 * documentos quando arquivos canônicos são modificados.
 * 
 * Uso:
 *   node scripts/watch-canonical-docs.mjs
 * 
 * Ou como parte de um processo de desenvolvimento:
 *   pnpm dev:watch
 */

import { watch } from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "..");

// Documentos e diretórios canônicos para monitorar
const CANONICAL_PATHS = [
  "docs/MANIFESTO.md",
  "docs/DOCS_STANDARDS.md",
  "docs/CURSOR_START.md",
  "docs/catalogo.md",
  "docs/openapi/morina-openapi.yaml",
  "packages/catalogo-application/src/schemas",
  "packages/shared-kernel/src/events",
];

// Debounce para evitar múltiplas execuções
let indexTimeout = null;
const DEBOUNCE_MS = 2000;

/**
 * Executa a indexação
 */
async function runIndex() {
  try {
    console.log("🔄 Reindexando documentos canônicos...");
    await execAsync("pnpm docs:index", { cwd: ROOT_DIR });
    console.log("✅ Indexação concluída!\n");
  } catch (error) {
    console.error(`❌ Erro ao reindexar: ${error.message}`);
  }
}

/**
 * Agenda a indexação com debounce
 */
function scheduleIndex() {
  if (indexTimeout) {
    clearTimeout(indexTimeout);
  }
  
  indexTimeout = setTimeout(() => {
    runIndex();
    indexTimeout = null;
  }, DEBOUNCE_MS);
  
  console.log("📝 Alteração detectada, agendando reindexação...");
}

/**
 * Monitora um arquivo ou diretório
 */
function watchPath(relativePath) {
  const fullPath = join(ROOT_DIR, relativePath);
  
  try {
    watch(fullPath, { recursive: true }, (eventType, filename) => {
      if (filename && !filename.includes("node_modules") && !filename.includes(".git")) {
        console.log(`\n📂 Alteração detectada: ${relativePath}/${filename || ""}`);
        scheduleIndex();
      }
    });
    
    console.log(`👀 Monitorando: ${relativePath}`);
  } catch (error) {
    console.warn(`⚠️  Não foi possível monitorar ${relativePath}: ${error.message}`);
  }
}

/**
 * Função principal
 */
function main() {
  console.log("🚀 Iniciando monitoramento de documentos canônicos...\n");
  console.log("📚 Documentos monitorados:");
  CANONICAL_PATHS.forEach(path => console.log(`  - ${path}`));
  console.log("\n💡 Pressione Ctrl+C para parar o monitoramento\n");
  
  // Monitora todos os caminhos canônicos
  CANONICAL_PATHS.forEach(watchPath);
  
  // Mantém o processo rodando
  process.on("SIGINT", () => {
    console.log("\n\n👋 Parando monitoramento...");
    process.exit(0);
  });
}

// Executa o script
main();

