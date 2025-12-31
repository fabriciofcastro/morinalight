#!/usr/bin/env node
/**
 * Script de migração de Pages (page.tsx) para Next.js 16
 * Converte params de objeto para Promise em componentes de página
 */

const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(__dirname, '../apps/web/src/app');

// Encontrar todos os arquivos page.tsx recursivamente
function findPageFiles(dir, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            findPageFiles(fullPath, files);
        } else if (entry.name === 'page.tsx') {
            files.push(fullPath);
        }
    }
    return files;
}

// Processar um arquivo
function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    let hasChanges = false;

    // 1. Detectar e corrigir definições de params (seja inline ou em interface/type)
    // Procura por `params: { key: type }` que não seja Promise
    // Regex: params:\s*\{\s*([^{}]+)\s*\} (simplificado)

    // Vamos usar um pattern que pega `params: { ... }` e verifica se tem "Promise" antes.
    // Se não tiver, substitui.

    const paramsDefRegex = /(params:\s*)(\{\s*(\w+\??:\s*string(?:;\s*\w+\??:\s*string)*);?\s*\})/g;

    // Coletar nomes de variáveis para inserir await depois
    const paramNames = new Set();

    content = content.replace(paramsDefRegex, (match, prefix, inner) => {
        // Verificar se já tem Promise antes (lookbehind não suportado em todos node versions, ver contexto)
        // Aqui assumimos que se o match pegou "params: { ... }", vamos ver se no content original tinha Promise antes.
        // Mas replace percorre.

        // Melhor approach: capturar o que vem antes?
        // Regex acima pega "params: { ... }".

        // Vamos extrair os nomes das props
        const cleanInner = inner.replace(/[{}]/g, '').trim();
        const props = cleanInner.split(';').map(p => p.split(':')[0].trim().replace('?', ''));
        props.forEach(p => {
            if (p) paramNames.add(p);
        });

        hasChanges = true;
        return `${prefix}Promise<${inner}>`;
    });

    // Se não fez alterações via regex genérico, tenta o específico de função se falhou
    // Mas o regex genérico deve cobrir.

    if (hasChanges) {
        // 2. Inserir const { ... } = await params;
        // Precisamos encontrar a função default export

        // Tornar função async se não for
        if (!content.match(/export default async function/)) {
            content = content.replace(/export default function/, 'export default async function');
        }

        const paramsList = [...paramNames];
        if (paramsList.length > 0) {
            const awaitStmt = `  const { ${paramsList.join(', ')} } = await params;`;

            // Inserir logo no início da função
            // Procura por "export default async function ... { "
            const funcStartRegex = /(export default async function [^{]+\{)/;
            if (content.match(funcStartRegex)) {
                // Verificar se já não tem o await
                if (!content.includes('await params')) {
                    content = content.replace(funcStartRegex, `$1\n${awaitStmt}`);

                    // 3. Substituir params.x por x
                    paramsList.forEach(p => {
                        const pRegex = new RegExp(`params\\.${p}`, 'g');
                        content = content.replace(pRegex, p);
                    });
                }
            }
        }

        fs.writeFileSync(filePath, content);
        console.log(`✅ Migrated: ${path.relative(process.cwd(), filePath)}`);
        return true;
    }

    return false;
}

// Main
console.log('🔄 Migrando Pages para Next.js 16...\n');

const files = findPageFiles(APP_DIR);
console.log(`📁 Encontrados ${files.length} arquivos page.tsx\n`);

let migratedCount = 0;
let errorCount = 0;

files.forEach(file => {
    try {
        if (processFile(file)) {
            migratedCount++;
        }
    } catch (error) {
        console.error(`❌ Erro em ${file}: ${error.message}`);
        errorCount++;
    }
});

console.log(`\n📊 Resultado:`);
console.log(`   ✅ Migrados: ${migratedCount}`);
console.log(`   ❌ Erros: ${errorCount}`);
console.log(`   ⏭️  Ignorados: ${files.length - migratedCount - errorCount}`);
