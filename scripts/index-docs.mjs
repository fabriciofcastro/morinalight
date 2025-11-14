#!/usr/bin/env node

/**
 * Script de indexação de documentos canônicos para MCP/Vectorstore
 *
 * Este script extrai e processa documentos canônicos do projeto MORINA
 * para melhorar o contexto do Cursor AI através de servidores MCP.
 *
 * Documentos canônicos:
 * - MANIFESTO.md: Princípios e diretrizes
 * - DOCS_STANDARDS.md: Padrões de documentação
 * - CURSOR_START.md: Regras para o Cursor
 * - catalogo.md: Documentação do módulo
 * - openapi/morina-openapi.yaml: Especificação OpenAPI
 * - schemas/*.ts: Contratos Zod
 * - events/*.ts: Definições de eventos
 */

import { readdir, readFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "..");

// Documentos canônicos para indexar
const CANONICAL_DOCS = [
  "docs/MANIFESTO.md",
  "docs/DOCS_STANDARDS.md",
  "docs/CURSOR_START.md",
  "docs/catalogo.md",
  "docs/estrutura-organizacional.md", // Prioridade: Base corporativa antes de módulos funcionais
  "docs/PLANO_REESTRUTURACAO.md",
  "docs/openapi/morina-openapi.yaml",
];

// Diretórios de contratos e eventos
const CONTRACT_DIRS = [
  "packages/catalogo-application/src/schemas",
  "packages/shared-kernel/src/events",
];

// Metadados para indexação
const _METADATA_KEYS = {
  dominio: ["catalogo", "preficha", "org", "auth"],
  tipo: ["contrato", "evento", "regra", "manifesto"],
  versao: ["v1"],
};

/**
 * Lê um arquivo e retorna seu conteúdo
 */
async function readFileContent(filePath) {
  try {
    const content = await readFile(filePath, "utf-8");
    return content;
  } catch (error) {
    console.warn(`⚠️  Não foi possível ler ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * Extrai metadados de um arquivo baseado no caminho e conteúdo
 */
function extractMetadata(filePath, content) {
  const relativePath = relative(ROOT_DIR, filePath);
  const metadata = {
    path: relativePath,
    dominio: "geral",
    tipo: "documento",
    versao: "v1",
  };

  // Extrai domínio do caminho
  if (relativePath.includes("catalogo")) {
    metadata.dominio = "catalogo";
  } else if (relativePath.includes("preficha")) {
    metadata.dominio = "preficha";
  } else if (relativePath.includes("org")) {
    metadata.dominio = "org";
  } else if (relativePath.includes("auth")) {
    metadata.dominio = "auth";
  }

  // Extrai tipo do caminho e conteúdo
  if (relativePath.includes("schema") || relativePath.includes("schemas")) {
    metadata.tipo = "contrato";
  } else if (relativePath.includes("event") || relativePath.includes("events")) {
    metadata.tipo = "evento";
  } else if (relativePath.includes("MANIFESTO")) {
    metadata.tipo = "manifesto";
  } else if (relativePath.includes("DOCS_STANDARDS") || relativePath.includes("CURSOR_START")) {
    metadata.tipo = "regra";
  }

  // Extrai versão do conteúdo (ex: "v1", "v2")
  const versionMatch = content.match(/\.v(\d+)/i);
  if (versionMatch) {
    metadata.versao = `v${versionMatch[1]}`;
  }

  return metadata;
}

/**
 * Processa um arquivo e retorna seus metadados e conteúdo
 */
async function processFile(filePath) {
  const content = await readFileContent(filePath);
  if (!content) {
    return null;
  }

  const metadata = extractMetadata(filePath, content);

  // Limita o tamanho do conteúdo para indexação (primeiros 8000 caracteres)
  const truncatedContent =
    content.length > 8000 ? `${content.substring(0, 8000)}\n\n... (conteúdo truncado)` : content;

  return {
    ...metadata,
    content: truncatedContent,
    size: content.length,
  };
}

/**
 * Lista arquivos recursivamente em um diretório
 */
async function listFiles(dir, extensions = [".ts", ".md", ".yaml", ".yml"]) {
  const files = [];

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        // Ignora node_modules, dist, .next, etc.
        if (!entry.name.startsWith(".") && entry.name !== "node_modules" && entry.name !== "dist") {
          const subFiles = await listFiles(fullPath, extensions);
          files.push(...subFiles);
        }
      } else if (entry.isFile()) {
        const ext = entry.name.substring(entry.name.lastIndexOf("."));
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.warn(`⚠️  Não foi possível listar ${dir}: ${error.message}`);
  }

  return files;
}

/**
 * Gera um índice estruturado dos documentos
 */
async function generateIndex() {
  console.log("📚 Indexando documentos canônicos do MORINA...\n");

  const index = {
    timestamp: new Date().toISOString(),
    documents: [],
    summary: {
      total: 0,
      byDominio: {},
      byTipo: {},
    },
  };

  // Processa documentos canônicos
  console.log("📄 Processando documentos canônicos...");
  for (const docPath of CANONICAL_DOCS) {
    const fullPath = join(ROOT_DIR, docPath);
    const processed = await processFile(fullPath);
    if (processed) {
      index.documents.push(processed);
      index.summary.total++;
      index.summary.byDominio[processed.dominio] =
        (index.summary.byDominio[processed.dominio] || 0) + 1;
      index.summary.byTipo[processed.tipo] = (index.summary.byTipo[processed.tipo] || 0) + 1;
      console.log(`  ✓ ${docPath}`);
    }
  }

  // Processa contratos e eventos
  console.log("\n📋 Processando contratos e eventos...");
  for (const contractDir of CONTRACT_DIRS) {
    const fullPath = join(ROOT_DIR, contractDir);
    const files = await listFiles(fullPath);

    for (const file of files) {
      const processed = await processFile(file);
      if (processed) {
        index.documents.push(processed);
        index.summary.total++;
        index.summary.byDominio[processed.dominio] =
          (index.summary.byDominio[processed.dominio] || 0) + 1;
        index.summary.byTipo[processed.tipo] = (index.summary.byTipo[processed.tipo] || 0) + 1;
        console.log(`  ✓ ${relative(ROOT_DIR, file)}`);
      }
    }
  }

  return index;
}

/**
 * Exibe um resumo do índice gerado
 */
function displaySummary(index) {
  console.log("\n📊 Resumo da Indexação:\n");
  console.log(`  Total de documentos: ${index.summary.total}`);
  console.log(`  Por domínio:`, JSON.stringify(index.summary.byDominio, null, 2));
  console.log(`  Por tipo:`, JSON.stringify(index.summary.byTipo, null, 2));
  console.log(`  Timestamp: ${index.timestamp}`);
}

/**
 * Salva o índice em um arquivo JSON
 */
async function saveIndex(index) {
  const indexPath = join(ROOT_DIR, ".cursor", "docs-index.json");
  const { writeFile, mkdir } = await import("node:fs/promises");

  try {
    await mkdir(join(ROOT_DIR, ".cursor"), { recursive: true });
    await writeFile(indexPath, JSON.stringify(index, null, 2), "utf-8");
    console.log(`\n💾 Índice salvo em: ${relative(ROOT_DIR, indexPath)}`);
  } catch (error) {
    console.error(`❌ Erro ao salvar índice: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Função principal
 */
async function main() {
  try {
    const index = await generateIndex();
    displaySummary(index);
    await saveIndex(index);
    console.log("\n✅ Indexação concluída com sucesso!");
    console.log(
      "\n💡 Dica: Execute 'pnpm docs:index' sempre que documentos canônicos forem atualizados.",
    );
  } catch (error) {
    console.error(`❌ Erro durante a indexação: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Executa o script
main();
