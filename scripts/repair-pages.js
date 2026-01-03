const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(__dirname, '../apps/web/src/app');

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

function repairFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;

    // Regex para achar a linha deslocada DENTRO dos argumentos
    // Procura por: ({ \n\s*const { ... } = await params;
    const badLineRegex = /(\{\s*\n)(\s*const \{ [^}]+ \} = await params;)/;

    const match = content.match(badLineRegex);

    if (match) {
        const badLine = match[2].trim(); // "const { ... } = await params;"

        // Remover a linha errada
        content = content.replace(badLineRegex, '$1');

        // Inserir no local correto: após a assinatura da função.
        // Procura pelo fechamento dos argumentos e inicio do bloco: `) {` ou `}: Type) {` etc.
        // Vamos procurar o PRIMEIRO `{` que ocorre DEPOIS da exportação e que tenha um `)` antes.

        // Uma abordagem segura: achar `export default async function ... ({ ... }) {`
        // Mas pode ser multilinha.

        // Vamos procurar `) {` que fecha os params e inicia o corpo.
        // E inserir logo depois.
        const bodyStartRegex = /\)\s*\{/;
        const bodyMatch = content.match(bodyStartRegex);

        if (bodyMatch) {
            // Inserir após o match
            const splitPos = bodyMatch.index + bodyMatch[0].length;
            const before = content.substring(0, splitPos);
            const after = content.substring(splitPos);

            content = before + '\n  ' + badLine + after;

            fs.writeFileSync(filePath, content);
            console.log(`✅ Repaired: ${path.relative(process.cwd(), filePath)}`);
            return true;
        } else {
            console.error(`❌ Could not find function body in ${filePath}`);
        }
    }

    return false;
}

console.log('🔧 Reparando Pages...\n');
const files = findPageFiles(APP_DIR);
let count = 0;
files.forEach(file => {
    if (repairFile(file)) count++;
});
console.log(`\nTotal reparados: ${count}`);
