# Sistema de Auditoria de Permissões

## Visão Geral

Sistema completo e automatizado de auditoria de permissões RBAC, com detecção de 7 tipos de anomalias, correções automáticas, dashboard visual e alertas em tempo real.

## Acesso Rápido

- **Dashboard**: `/admin/permissions/audit`
- **Documentação Completa**: `apps/api/src/modules/permissions/README_AUDIT.md`
- **Guia de Integração**: `apps/api/src/modules/permissions/INTEGRATION.md`

## Funcionalidades

### Detecção de Anomalias
1. Permissões órfãs
2. Conflitos de permissões
3. Permissões excessivas
4. Inconsistências hierárquicas
5. Gaps de auditoria
6. Permissões obsoletas
7. Violações de SoD

### Automação
- Auditoria diária (2h)
- Auditoria semanal (domingo 3h)
- Auto-fix de baixa severidade
- Alertas automáticos

### Interfaces
- 🌐 Dashboard Web
- 🔌 API REST
- 💻 CLI
- ⏰ Jobs agendados

## Uso Rápido

### Via Dashboard
```
http://localhost:3000/admin/permissions/audit
```

### Via API
```bash
POST /permissions/audit/run
POST /permissions/audit/fix
GET  /permissions/audit/summary
```

### Via CLI
```bash
npx tsx apps/api/src/scripts/audit-permissions.ts --org-id <uuid>
```

## Documentação

- [README_AUDIT.md](./apps/api/src/modules/permissions/README_AUDIT.md) - Guia completo
- [INTEGRATION.md](./apps/api/src/modules/permissions/INTEGRATION.md) - Integração
- [DOCUMENTATION.md](./apps/api/src/modules/permissions/DOCUMENTATION.md) - Documentação técnica
- [SUMMARY.md](./apps/api/src/modules/permissions/SUMMARY.md) - Resumo executivo

## Status

✅ **100% Completo e Pronto para Produção**

- 14 arquivos criados
- Testes unitários completos
- Documentação completa
- Dashboard funcional
- Automação configurada
