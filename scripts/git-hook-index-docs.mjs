#!/usr/bin/env node

/**
 * Git hook para reindexar documentos canônicos quando arquivos relevantes são modificados
 * 
 * Este script verifica se algum documento canônico foi modificado no commit
 * e reindexa automaticamente se necessário.
 * 
 * Uso como hook do Git:
 *   ln -s ../../scripts/git-hook-index-docs.mjs .git/hooks/post-commit
 * 
 * Ou configurado via Husky:
 *   .husky/post-commit
 */

import { exec } from "child_process";
import { promisify } from "util";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "..");

// Padrões de arquivos canônicos
const CANONICAL_PATTERNS = [
  /^docs\/(MANIFESTO|DOCS_STANDARDS|CURSOR_START|catalogo)\.md$/,
  /^docs\/openapi\/.*\.yaml$/,
  /^packages\/catalogo-application\/src\/schemas\/.*\.ts$/,
  /^packages\/shared-kernel\/src\/events\/.*\.ts$/,
];

/**
 * Verifica se algum arquivo modificado é um documento canônico
 */
async function hasCanonicalChanges() {
  try {
    // Obtém arquivos modificados no último commit
    const { stdout } = await execAsync(
      "git diff-tree --no-commit-id --name-only -r HEAD",
      { cwd: ROOT_DIR }
    );
    
    const changedFiles = stdout.trim().split("\n").filter(Boolean);
    
    // Verifica se algum arquivo modificado corresponde aos padrões canônicos
    for (const file of changedFiles) {
      for (const pattern of CANONICAL_PATTERNS) {
        if (pattern.test(file)) {
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    // Se não houver commit anterior, não há nada para verificar
    if (error.message.includes("fatal: ambiguous argument 'HEAD'")) {
      return false;
    }
    console.warn(`⚠️  Erro ao verificar alterações: ${error.message}`);
    return false;
  }
}

/**
 * Executa a indexação
 */
async function runIndex() {
  try {
    console.log("🔄 Reindexando documentos canônicos após commit...");
    await execAsync("pnpm docs:index", { cwd: ROOT_DIR });
    console.log("✅ Indexação concluída!");
  } catch (error) {
    console.error(`❌ Erro ao reindexar: ${error.message}`);
    // Não falha o commit se a indexação falhar
    process.exit(0);
  }
}

/**
 * Função principal
 */
async function main() {
  const shouldIndex = await hasCanonicalChanges();
  
  if (shouldIndex) {
    await runIndex();
  } else {
    console.log("ℹ️  Nenhum documento canônico modificado, pulando indexação.");
  }
}

// Executa o script
main();

