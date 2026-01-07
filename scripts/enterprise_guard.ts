#!/usr/bin/env tsx

import fs from 'fs'
import path from 'path'

import { execSync } from 'node:child_process'

console.log('🛡️  ENTERPRISE GUARD — INICIANDO AUDITORIA')

const diff = execSync('git diff --name-only origin/main').toString()

if (
  diff.match(/src\/(domain|application|presentation)/) &&
  !diff.match(/scripts\/generators/)
) {
  console.error('❌ Código estrutural deve ser criado via Golden Path')
  process.exit(1)
}

if (diff.match(/packages\/ui\/.*next/)) {
  console.error('❌ packages/ui não pode depender de Next')
  process.exit(1)
}

const structuralChange =
  diff.match(/src\/(domain|application|presentation)/)

const fromGenerator =
  diff.match(/scripts\/generators/) ||
  diff.match(/hygen/)

if (structuralChange && !fromGenerator) {
  console.error('❌ Mudança estrutural sem Golden Path')
  process.exit(1)
}

console.log('🎉 Auditoria concluída. Projeto em conformidade.')

/**
 * ================================
 * ENTERPRISE GUARD
 * ================================
 * Auditor de arquitetura, dependências e governança.
 * Não altera estado. Apenas valida.
 */

type GuardResult = {
  ok: boolean
  message: string
}

interface GuardRule {
  name: string
  critical?: boolean
  run(): GuardResult
}

/* ================================
 * Utilities
 * ================================ */

const ROOT = process.cwd()

function exists(p: string) {
  return fs.existsSync(path.join(ROOT, p))
}

function readJSON(p: string) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf-8'))
}

function fail(msg: string): GuardResult {
  return { ok: false, message: msg }
}

function pass(msg: string): GuardResult {
  return { ok: true, message: msg }
}

/* ================================
 * Rules (Strategies)
 * ================================ */

const rules: GuardRule[] = [
  {
    name: 'Root must be a pnpm + turborepo project',
    critical: true,
    run() {
      if (!exists('pnpm-lock.yaml')) {
        return fail('pnpm-lock.yaml não encontrado (pnpm é obrigatório)')
      }
      if (!exists('turbo.json')) {
        return fail('turbo.json não encontrado (Turborepo esperado)')
      }
      return pass('pnpm + Turborepo detectados')
    }
  },

  {
    name: 'Required governance files',
    critical: true,
    run() {
      const required = [
        '.cursorrules',
        '.ai/project-context.md',
        '.github/workflows/enforce.yml',
        'scripts/check-quality.js',
        'scripts/validate-fsd.js'
      ]

      const missing = required.filter(p => !exists(p))
      if (missing.length > 0) {
        return fail(`Arquivos de governança ausentes: ${missing.join(', ')}`)
      }

      return pass('Arquivos de governança presentes')
    }
  },

  {
    name: 'No framework leakage in shared packages',
    critical: true,
    run() {
      const uiPkg = 'packages/ui/package.json'
      if (!exists(uiPkg)) {
        return pass('packages/ui não existe (skip)')
      }

      const pkg = readJSON(uiPkg)
      const forbidden = ['next', 'react-router', 'next-auth']

      const deps = Object.keys({
        ...(pkg.dependencies || {}),
        ...(pkg.devDependencies || {})
      })

      const leaked = deps.filter(d => forbidden.includes(d))
      if (leaked.length > 0) {
        return fail(
          `packages/ui depende de frameworks (${leaked.join(
            ', '
          )}). UI compartilhada NÃO pode conhecer framework.`
        )
      }

      return pass('packages/ui isolado de frameworks')
    }
  },

  {
    name: 'Zod version consistency',
    critical: true,
    run() {
      const versions = new Set<string>()

      function scan(dir: string) {
        if (!exists(dir)) return
        const pkg = readJSON(dir + '/package.json')
        if (pkg.dependencies?.zod) versions.add(pkg.dependencies.zod)
      }

      scan('.')
      scan('apps/web')
      scan('apps/api')
      scan('packages/ui')

      if (versions.size > 1) {
        return fail(
          `Versões divergentes de zod detectadas: ${Array.from(versions).join(
            ', '
          )}. Padronização obrigatória.`
        )
      }

      return pass('Versão de zod consistente')
    }
  },

  {
    name: 'React version safety check',
    run() {
      const webPkg = 'apps/web/package.json'
      if (!exists(webPkg)) return pass('apps/web não encontrado')

      const pkg = readJSON(webPkg)
      const react = pkg.dependencies?.react

      if (react?.startsWith('19')) {
        return pass(
          'React 19 detectado. Atenção: algumas libs ainda não suportam oficialmente.'
        )
      }

      return pass('Versão de React estável')
    }
  },

  {
    name: 'Scripts must exist',
    critical: true,
    run() {
      const rootPkg = readJSON('package.json')
      const requiredScripts = ['enforce', 'lint', 'type-check']

      const missing = requiredScripts.filter(
        s => !rootPkg.scripts || !rootPkg.scripts[s]
      )

      if (missing.length > 0) {
        return fail(`Scripts obrigatórios ausentes: ${missing.join(', ')}`)
      }

      return pass('Scripts obrigatórios presentes')
    }
  }
]

/* ================================
 * Facade
 * ================================ */

class EnterpriseGuard {
  static run() {
    console.log('\n🛡️  ENTERPRISE GUARD — INICIANDO AUDITORIA\n')

    let hasCriticalFailure = false

    for (const rule of rules) {
      const result = rule.run()

      if (result.ok) {
        console.log(`✅ ${rule.name}`)
      } else {
        console.error(`❌ ${rule.name}`)
        console.error(`   ↳ ${result.message}`)
        if (rule.critical) hasCriticalFailure = true
      }
    }

    if (hasCriticalFailure) {
      console.error('\n⛔ Falhas críticas detectadas. Execução bloqueada.\n')
      process.exit(1)
    }

    console.log('\n🎉 Auditoria concluída. Projeto em conformidade.\n')
  }
}

EnterpriseGuard.run()
