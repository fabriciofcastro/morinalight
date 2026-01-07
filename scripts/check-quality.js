#!/usr/bin/env node
import { execSync } from 'child_process';

const checks = [
  { name: 'TypeScript', cmd: 'tsc --noEmit', critical: true },
  { name: 'Lint', cmd: 'eslint . --ext .ts,.tsx', critical: true },
  { name: 'Tests', cmd: 'vitest run', critical: true },
  { name: 'FSD', cmd: 'node scripts/validate-fsd.js', critical: true },
];

async function runCheck(check) {
  console.log(`🔍 ${check.name}...`);
  try {
    execSync(check.cmd, { stdio: 'inherit' });
    console.log(`✅ ${check.name}`);
    return true;
  } catch (error) {
    console.log(`❌ ${check.name}`);
    return false;
  }
}

async function main() {
  console.log('\n🛡️  VALIDAÇÃO DE QUALIDADE\n');
  
  const results = await Promise.all(checks.map(runCheck));
  const failed = checks.filter((c, i) => !results[i] && c.critical);
  
  if (failed.length > 0) {
    console.log('\n❌ FALHA CRÍTICA\n');
    process.exit(1);
  }
  
  console.log('\n✅ TODAS VALIDAÇÕES OK\n');
}

main();