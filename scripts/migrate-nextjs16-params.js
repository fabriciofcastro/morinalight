#!/usr/bin/env node
/**
 * Script de migração de rotas API para Next.js 16
 * Converte params de objeto para Promise de forma segura
 */

const fs = require('fs');
const path = require('path');

const API_DIR = path.join(__dirname, '../apps/web/src/app/api');

// Encontrar todos os arquivos route.ts recursivamente
function findRouteFiles(dir, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            findRouteFiles(fullPath, files);
        } else if (entry.name === 'route.ts') {
            files.push(fullPath);
        }
    }
    return files;
}

// Processar um arquivo
function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;

    // Padrão 1: { params }: { params: { xxx: string } }
    // Padrão 2: { params }: { params: { xxx: string; yyy: string } }

    // Regex para capturar a definição de params simples
    const simpleParamRegex = /\{ params \}: \{ params: \{ (\w+): string \} \}/g;
    // Regex para capturar definição com múltiplos params
    const multiParamRegex = /\{ params \}: \{ params: \{ (\w+: string(?:; \w+: string)*) \} \}/g;
    // Padrão 3: Tipos definidos separadamente (e.g. type RouteParams = { params: { ... } })
    const typeParamRegex = /type \w+ = \{\s*params: \{\s*(\w+: string(?:;\s*\w+: string)*);?\s*\}\s*;?\s*\}/g;

    // Encontrar todos os matches antes de substituir
    const simpleMatches = [...content.matchAll(simpleParamRegex)];
    const multiMatches = [...content.matchAll(multiParamRegex)];
    const typeMatches = [...content.matchAll(typeParamRegex)];

    if (simpleMatches.length === 0 && multiMatches.length === 0 && typeMatches.length === 0) {
        return false;
    }

    // Coletar todos os nomes de parâmetros
    const allParamNames = new Set();

    simpleMatches.forEach(match => {
        allParamNames.add(match[1]);
    });

    multiMatches.forEach(match => {
        const params = match[1].split(';').map(p => p.split(':')[0].trim());
        params.forEach(p => allParamNames.add(p));
    });

    typeMatches.forEach(match => {
        const params = match[1].split(';').map(p => p.split(':')[0].trim());
        params.forEach(p => allParamNames.add(p));
    });

    // Substituir tipo de params para Promise (inline)
    content = content.replace(
        /\{ params \}: \{ params: \{ ([^}]+) \} \}/g,
        '{ params }: { params: Promise<{ $1 }> }'
    );

    // Substituir definição de tipo separado
    content = content.replace(
        /(type \w+ = \{\s*)params: \{\s*([^}]+)\s*\}(\s*;?\s*\})/g,
        '$1params: Promise<{ $2 }>$3'
    );

    // Encontrar e adicionar await params após try { ou no início da função
    const paramNamesArray = [...allParamNames];
    if (paramNamesArray.length > 0) {
        const awaitLine = `const { ${paramNamesArray.join(', ')} } = await params;`;

        // Verificar se já existe await params
        if (!content.includes('await params')) {
            // Adicionar após "try {" se existir
            content = content.replace(
                /(\{\s*\n\s*try \{\s*\n)/g,
                `$1    ${awaitLine}\n`
            );

            // Se não tem try, adicionar no início da função
            if (!content.includes('await params')) {
                // Procurar por padrão de função async sem try
                content = content.replace(
                    /(export async function \w+\([^)]+\)\s*\{\s*\n)/g,
                    `$1  ${awaitLine}\n`
                );
            }
        }

        // Substituir params.xxx por xxx
        paramNamesArray.forEach(name => {
            const regex = new RegExp(`params\\.${name}`, 'g');
            content = content.replace(regex, name);
        });
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ ${path.relative(process.cwd(), filePath)}`);
        return true;
    }

    return false;
}

// Main
console.log('🔄 Migrando rotas API para Next.js 16...\n');

const files = findRouteFiles(API_DIR);
console.log(`📁 Encontrados ${files.length} arquivos route.ts\n`);

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
