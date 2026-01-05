# Auditoria de Permissões - Guia de Uso

## Visão Geral

Sistema completo de auditoria de permissões que identifica e corrige anomalias no RBAC.

## Instalação

Não é necessária instalação adicional. O sistema já está integrado ao módulo de permissões.

## Uso via API

### 1. Executar Auditoria Completa

```bash
POST /permissions/audit/run
```

**Request:**
```json
{
  "filters": {
    "includeOrphaned": true,
    "includeConflicts": true,
    "includeExcessive": true,
    "includeHierarchy": true,
    "includeAuditGaps": true,
    "includeObsolete": true,
    "includeSoD": true
  }
}
```

### 2. Obter Resumo Rápido

```bash
GET /permissions/audit/summary
```

### 3. Aplicar Correções

```bash
POST /permissions/audit/fix
```

**Request:**
```json
{
  "options": {
    "removeOrphaned": true,
    "resolveConflicts": true,
    "removeExcessive": true,
    "dryRun": true
  },
  "anomalies": {
    "orphaned": [...],
    "conflicts": [...],
    "excessive": [...]
  }
}
```

## Uso via CLI

### Executar Auditoria

```bash
cd apps/api
npx tsx src/scripts/audit-permissions.ts --org-id <uuid>
```

### Simular Correções

```bash
npx tsx src/scripts/audit-permissions.ts \
  --org-id <uuid> \
  --fix \
  --remove-orphaned \
  --resolve-conflicts \
  --dry-run true
```

### Aplicar Correções Reais

```bash
npx tsx src/scripts/audit-permissions.ts \
  --org-id <uuid> \
  --fix \
  --remove-orphaned \
  --resolve-conflicts \
  --dry-run false
```

### Salvar Relatório

```bash
npx tsx src/scripts/audit-permissions.ts \
  --org-id <uuid> \
  --output audit-report.json
```

## Executar Testes

```bash
cd apps/api

# Testes unitários
pnpm test src/modules/permissions/application/use-cases/audit-permission-anomalies.use-case.spec.ts
pnpm test src/modules/permissions/application/use-cases/fix-permission-anomalies.use-case.spec.ts

# Todos os testes de permissões
pnpm test src/modules/permissions
```

## Tipos de Anomalias

1. **Permissões Órfãs** - Atribuídas a entidades deletadas
2. **Conflitos** - Permissões contraditórias
3. **Excessivas** - Redundantes ou desnecessárias
4. **Hierarquia** - Inconsistências na hierarquia
5. **Audit Gaps** - Mudanças sem registro
6. **Obsoletas** - Não utilizadas
7. **SoD** - Violações de segregação de funções

## Score de Conformidade

- **95-100**: ✅ Excelente
- **80-94**: 👍 Bom
- **60-79**: ⚠️ Atenção
- **0-59**: 🚨 Crítico

## Automação

### Cron Job (Exemplo)

```bash
# Executar auditoria diária às 2h da manhã
0 2 * * * cd /path/to/app && npx tsx src/scripts/audit-permissions.ts --org-id <uuid> --output /var/log/audit-$(date +\%Y\%m\%d).json
```

### CI/CD (Exemplo)

```yaml
# .github/workflows/audit-permissions.yml
name: Permission Audit
on:
  schedule:
    - cron: '0 2 * * *'
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npx tsx src/scripts/audit-permissions.ts --org-id ${{ secrets.ORG_ID }}
```

## Troubleshooting

### Erro: "Cannot find module"

Certifique-se de estar no diretório correto:
```bash
cd apps/api
```

### Erro: "Database connection failed"

Verifique as variáveis de ambiente:
```bash
echo $DATABASE_URL
```

### Performance lenta

Para grandes volumes, use filtros:
```bash
npx tsx src/scripts/audit-permissions.ts \
  --org-id <uuid> \
  --entity-type user \
  --entity-id <specific-user-id>
```

## Suporte

Para dúvidas ou problemas, consulte:
- [Walkthrough](./walkthrough.md)
- [Implementation Plan](./implementation_plan.md)
- [Task](./task.md)
