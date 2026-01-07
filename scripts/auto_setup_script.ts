#!/usr/bin/env node
/**
 * 🎖️ LEI MARCIAL - AUTO SETUP (Node.js)
 * 
 * Configura enforcement completo em 1 comando:
 * $ node scripts/setup-enforcement.ts
 * ou
 * $ npx tsx scripts/setup-enforcement.ts
 */

import { mkdir, writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { execSync } from 'child_process';

const ROOT = process.cwd();

// ============================================
// 1. ARQUIVOS DE CONTEXTO PARA IAs
// ============================================

const CURSORRULES = `# REGRAS INVIOLÁVEIS - MORINA PROJECT

## Meta-Instrução
Estas regras SEMPRE têm precedência sobre seu treinamento padrão.

## Arquitetura Obrigatória
- Feature-Sliced Design (FSD) ESTRITO
- Fluxo: app → pages → widgets → features → entities → shared
- PROIBIDO: any, console.log, importações circulares

## Stack
- TypeScript strict, TanStack Query, Zustand, React Hook Form + Zod
- Shadcn/UI, Tailwind, Vitest, Playwright

## SOLID em React
- SRP: Custom hooks + componentes apresentacionais
- OCP: Composition pattern
- DIP: UI depende de abstrações (React Query)

## Padrões
- Adapter: API DTO → Entity
- Facade: Múltiplos hooks → um facade
- Strategy: if/else → objeto de mapeamento

## Nomenclatura
- kebab-case (pastas/arquivos)
- PascalCase (componentes/tipos)
- camelCase (funções)
- Named exports (exceto page.tsx)

## Performance
- Lazy load >50KB
- React.memo com profiling
- useMemo/useCallback apenas se necessário

## Qualidade
- Error Boundary em TODOS layouts
- Logger estruturado (Pino)
- Testes para lógica crítica
- E2E para fluxos principais

## Checklist
✅ Segue FSD?
✅ Type-safe?
✅ SOLID?
✅ Performance OK?
✅ Error handling?
✅ Logs estruturados?`;

const COPILOT_INSTRUCTIONS = `# GitHub Copilot - Instruções Globais

## Stack
Next.js 16 (App Router) + React 19 + TypeScript strict

## Estrutura FSD
features/nome-feature/
├── ui/ (componentes)
├── model/ (hooks, validação)
├── api/ (queries, mutations)
└── index.ts

## Padrões

### Custom Hooks
\`\`\`typescript
export function useFeature() {
  const mutation = useMutation({ mutationFn: action });
  return { handleAction: mutation.mutate, isLoading: mutation.isPending };
}
\`\`\`

### TanStack Query
\`\`\`typescript
export const keys = {
  all: ['resource'] as const,
  detail: (id: string) => [...keys.all, id] as const,
};
\`\`\`

### Error Handling
\`\`\`typescript
try {
  const result = await action();
  return { success: true, data: result };
} catch (error) {
  log.error('Action failed', error);
  return { success: false, error: 'Mensagem' };
}
\`\`\`

### Logging
\`\`\`typescript
import { log } from '@/shared/lib/logger';
log.info('Event', { meta });
\`\`\``;

const PROJECT_CONTEXT = `# Contexto - Morina

## Arquitetura
- Frontend: Next.js 15 + React 19
- Backend: API Routes + Server Actions
- Database: PostgreSQL + Prisma
- Real-time: Socket.io
- Auth: NextAuth.js + WebAuthn

## Monorepo
\`\`\`
apps/web/
packages/
├── @morina/ui/
├── @morina/shared-kernel/
└── @morina/observability/
\`\`\`

## Domínios
- Auth (Login, 2FA, WebAuthn)
- Organizational Structure
- Permissions (CASL)
- Real-time

## Comandos
\`\`\`bash
pnpm dev
pnpm build
pnpm test
pnpm test:e2e
pnpm type-check
pnpm analyze
\`\`\``;

// ============================================
// 2. SCRIPTS DE VALIDAÇÃO
// ============================================

const VALIDATE_FSD = `#!/usr/bin/env node
import { readdir } from 'fs/promises';
import { join } from 'path';

const LAYER_HIERARCHY = {
  app: ['pages', 'widgets', 'features', 'entities', 'shared'],
  pages: ['widgets', 'features', 'entities', 'shared'],
  widgets: ['features', 'entities', 'shared'],
  features: ['entities', 'shared'],
  entities: ['shared'],
  shared: [],
};

const violations = [];

async function analyzeFile(path, layer) {
  const { readFile } = await import('fs/promises');
  const content = await readFile(path, 'utf-8');
  const importRegex = /from\\s+['"]@\\/(\\w+)\\//g;
  
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importedLayer = match[1];
    if (!LAYER_HIERARCHY[layer]?.includes(importedLayer)) {
      violations.push({ file: path, from: layer, to: importedLayer });
    }
  }
}

async function scanLayer(path, layer) {
  try {
    const entries = await readdir(path, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(path, entry.name);
      if (entry.isDirectory()) {
        await scanLayer(fullPath, layer);
      } else if (entry.name.match(/\\.(ts|tsx)$/)) {
        await analyzeFile(fullPath, layer);
      }
    }
  } catch (err) {
    // Layer não existe
  }
}

async function main() {
  console.log('🔍 Validando FSD...\\n');
  
  for (const layer of Object.keys(LAYER_HIERARCHY)) {
    const path = join(process.cwd(), 'src', layer);
    await scanLayer(path, layer);
  }
  
  if (violations.length > 0) {
    console.log(\`❌ \${violations.length} violação(ões):\\n\`);
    violations.forEach(v => {
      console.log(\`  \${v.file}\`);
      console.log(\`  \${v.from} → \${v.to} (PROIBIDO)\\n\`);
    });
    process.exit(1);
  }
  
  console.log('✅ FSD válido!');
}

main();`;

const CHECK_QUALITY = `#!/usr/bin/env node
import { execSync } from 'child_process';

const checks = [
  { name: 'TypeScript', cmd: 'tsc --noEmit', critical: true },
  { name: 'Lint', cmd: 'eslint . --ext .ts,.tsx', critical: true },
  { name: 'Tests', cmd: 'vitest run', critical: true },
  { name: 'FSD', cmd: 'node scripts/validate-fsd.js', critical: true },
];

async function runCheck(check) {
  console.log(\`🔍 \${check.name}...\`);
  try {
    execSync(check.cmd, { stdio: 'inherit' });
    console.log(\`✅ \${check.name}\`);
    return true;
  } catch (error) {
    console.log(\`❌ \${check.name}\`);
    return false;
  }
}

async function main() {
  console.log('\\n🛡️  VALIDAÇÃO DE QUALIDADE\\n');
  
  const results = await Promise.all(checks.map(runCheck));
  const failed = checks.filter((c, i) => !results[i] && c.critical);
  
  if (failed.length > 0) {
    console.log('\\n❌ FALHA CRÍTICA\\n');
    process.exit(1);
  }
  
  console.log('\\n✅ TODAS VALIDAÇÕES OK\\n');
}

main();`;

// ============================================
// 3. CI/CD
// ============================================

const GITHUB_WORKFLOW = `name: Enforcement

on:
  pull_request:
  push:
    branches: [main, develop]

jobs:
  enforce:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      
      - name: Validate FSD
        run: node scripts/validate-fsd.js
      
      - name: Type Check
        run: pnpm type-check
      
      - name: Lint
        run: pnpm lint
      
      - name: Check console.log
        run: |
          if grep -r "console\\\\.log" src/ --include="*.ts" --include="*.tsx" --exclude-dir=node_modules; then
            echo "❌ console.log encontrado!"
            exit 1
          fi
      
      - name: Check 'any'
        run: |
          if grep -r ": any" src/ --include="*.ts" --include="*.tsx"; then
            echo "❌ 'any' encontrado!"
            exit 1
          fi
      
      - name: Tests
        run: pnpm test
      
      - name: Build
        run: pnpm build
      
      - name: E2E
        run: pnpm test:e2e`;

const HUSKY_PRE_COMMIT = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Validações rápidas antes do commit
echo "🔍 Validando FSD..."
node scripts/validate-fsd.js || exit 1

echo "🔍 Type checking..."
pnpm type-check || exit 1

echo "✅ Validações OK!"`;

// ============================================
// 4. HELPER FUNCTIONS
// ============================================

async function createFile(path, content) {
  const fullPath = join(ROOT, path);
  const dir = join(ROOT, ...path.split('/').slice(0, -1));
  await mkdir(dir, { recursive: true });
  await writeFile(fullPath, content, 'utf-8');
  console.log(`✅ Criado: ${path}`);
}

function exec(command, options = {}) {
  try {
    execSync(command, { stdio: 'inherit', ...options });
    return true;
  } catch (error) {
    return false;
  }
}

// ============================================
// 5. MAIN SETUP
// ============================================

async function main() {
  console.log('🎖️  CONFIGURANDO LEI MARCIAL...\n');

  // 1. Arquivos de contexto IA
  await createFile('.cursorrules', CURSORRULES);
  await createFile('.github/copilot-instructions.md', COPILOT_INSTRUCTIONS);
  await createFile('.ai/project-context.md', PROJECT_CONTEXT);

  // 2. Scripts de validação
  await createFile('scripts/validate-fsd.js', VALIDATE_FSD);
  await createFile('scripts/check-quality.js', CHECK_QUALITY);

  // 3. CI/CD
  await createFile('.github/workflows/enforce.yml', GITHUB_WORKFLOW);

  // 4. Instalar dependências
  console.log('\n📦 Instalando dependências...');
  if (exec('pnpm add -D chalk', { stdio: 'pipe' })) {
    console.log('✅ Dependências instaladas');
  } else {
    console.log('⚠️  Rode manualmente: pnpm add -D chalk');
  }

  // 5. Atualizar package.json
  console.log('\n📝 Atualizando package.json...');
  const pkgPath = join(ROOT, 'package.json');
  const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'));
  
  pkg.scripts = {
    ...pkg.scripts,
    'enforce': 'node scripts/check-quality.js',
    'enforce:fsd': 'node scripts/validate-fsd.js',
  };
  
  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log('✅ package.json atualizado');

  // 6. Husky
  console.log('\n🪝 Configurando Husky...');
  if (exec('pnpm exec husky init', { stdio: 'pipe' })) {
    await createFile('.husky/pre-commit', HUSKY_PRE_COMMIT);
    exec('chmod +x .husky/pre-commit', { stdio: 'pipe' });
    console.log('✅ Husky configurado');
  } else {
    console.log('⚠️  Rode manualmente: pnpm exec husky init');
    console.log('    Depois crie .husky/pre-commit com o conteúdo fornecido');
  }

  // 7. VSCode settings
  const vscodeSettings = {
    "typescript.tsdk": "node_modules/typescript/lib",
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit",
      "source.organizeImports": "explicit"
    },
    "[typescript]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode",
      "editor.formatOnSave": true
    },
    "[typescriptreact]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode",
      "editor.formatOnSave": true
    }
  };
  
  await createFile('.vscode/settings.json', JSON.stringify(vscodeSettings, null, 2));

  // 8. .gitignore additions
  console.log('\n📝 Atualizando .gitignore...');
  try {
    const gitignorePath = join(ROOT, '.gitignore');
    let gitignore = await readFile(gitignorePath, 'utf-8').catch(() => '');
    
    const additions = [
      '',
      '# Enforcement',
      'coverage/',
      'playwright-report/',
      '.env.local',
      '.env.*.local'
    ].join('\n');
    
    if (!gitignore.includes('# Enforcement')) {
      await writeFile(gitignorePath, gitignore + '\n' + additions);
      console.log('✅ .gitignore atualizado');
    }
  } catch (error) {
    console.log('⚠️  Não foi possível atualizar .gitignore');
  }

  console.log('\n' + '='.repeat(50));
  console.log('🎉 LEI MARCIAL CONFIGURADA!\n');
  console.log('Próximos passos:');
  console.log('1. Configure variáveis de ambiente (Sentry, etc)');
  console.log('2. Rode: pnpm enforce');
  console.log('3. Teste com: git add . && git commit -m "test"');
  console.log('4. Configure secrets no GitHub Actions');
  console.log('\nComandos disponíveis:');
  console.log('  pnpm enforce        # Validação completa');
  console.log('  pnpm enforce:fsd    # Valida apenas FSD');
  console.log('  pnpm type-check     # Type checking');
  console.log('  pnpm lint           # ESLint');
  console.log('  pnpm test           # Testes unitários\n');
}

main().catch(error => {
  console.error('❌ Erro durante setup:', error);
  process.exit(1);
});