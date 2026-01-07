#!/usr/bin/env node
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
  const importRegex = /from\s+['"]@\/(\w+)\//g;
  
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
      } else if (entry.name.match(/\.(ts|tsx)$/)) {
        await analyzeFile(fullPath, layer);
      }
    }
  } catch (err) {
    // Layer não existe
  }
}

async function main() {
  console.log('🔍 Validando FSD...\n');
  
  for (const layer of Object.keys(LAYER_HIERARCHY)) {
    const path = join(process.cwd(), 'src', layer);
    await scanLayer(path, layer);
  }
  
  if (violations.length > 0) {
    console.log(`❌ ${violations.length} violação(ões):\n`);
    violations.forEach(v => {
      console.log(`  ${v.file}`);
      console.log(`  ${v.from} → ${v.to} (PROIBIDO)\n`);
    });
    process.exit(1);
  }
  
  console.log('✅ FSD válido!');
}

main();