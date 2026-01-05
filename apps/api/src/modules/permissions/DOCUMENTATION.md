# Auditoria de Permissões - Documentação Completa

## Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Componentes](#componentes)
4. [Uso](#uso)
5. [Automação](#automação)
6. [Alertas](#alertas)
7. [Integração](#integração)
8. [Troubleshooting](#troubleshooting)

## Visão Geral

Sistema completo de auditoria de permissões que:
- ✅ Detecta 7 tipos de anomalias
- ✅ Calcula score de conformidade (0-100)
- ✅ Aplica correções automáticas
- ✅ Envia alertas críticos
- ✅ Executa auditorias agendadas
- ✅ Fornece dashboard visual

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │      PermissionAuditDashboard.tsx                │  │
│  │  - Visualização de métricas                      │  │
│  │  - Execução de auditorias                        │  │
│  │  - Aplicação de correções                        │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   API REST (NestJS)                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │      permission-audit.route.ts                   │  │
│  │  - POST /audit/run                               │  │
│  │  - POST /audit/fix                               │  │
│  │  - GET  /audit/summary                           │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Use Cases (Business Logic)              │
│  ┌──────────────────────────────────────────────────┐  │
│  │  AuditPermissionAnomaliesUseCase                 │  │
│  │  - findOrphanedPermissions()                     │  │
│  │  - findPermissionConflicts()                     │  │
│  │  - findExcessivePermissions()                    │  │
│  │  - findHierarchyInconsistencies()                │  │
│  │  - findAuditGaps()                               │  │
│  │  - findObsoletePermissions()                     │  │
│  │  - findSoDViolations()                           │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  FixPermissionAnomaliesUseCase                   │  │
│  │  - removeOrphanedPermissions()                   │  │
│  │  - resolvePermissionConflicts()                  │  │
│  │  - removeExcessivePermissions()                  │  │
│  │  - backfillAuditLogs()                           │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Automação & Alertas                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │  PermissionAuditScheduler                        │  │
│  │  - Auditoria diária (2h)                         │  │
│  │  - Auditoria semanal (domingo 3h)                │  │
│  │  - Auto-fix de baixa severidade                  │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  AuditAlertService                               │  │
│  │  - Email para problemas críticos                 │  │
│  │  - Slack para alertas de segurança               │  │
│  │  - Notificações de SoD                           │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Database (PostgreSQL)                   │
│  - UserPermission                                        │
│  - PositionPermission                                    │
│  - SectorPermission                                      │
│  - DepartmentPermission                                  │
│  - PermissionAuditLog                                    │
└─────────────────────────────────────────────────────────┘
```

## Componentes

### Backend

| Arquivo | Descrição |
|---------|-----------|
| `audit-types.ts` | Definições TypeScript |
| `audit-permission-anomalies.use-case.ts` | Lógica de detecção |
| `fix-permission-anomalies.use-case.ts` | Lógica de correção |
| `permission-audit.route.ts` | Endpoints HTTP |
| `permission-audit.scheduler.ts` | Jobs agendados |
| `audit-alert.service.ts` | Notificações |
| `audit-permissions.ts` | Script CLI |

### Frontend

| Arquivo | Descrição |
|---------|-----------|
| `PermissionAuditDashboard.tsx` | Dashboard React |
| `page.tsx` | Página Next.js |

### Testes

| Arquivo | Descrição |
|---------|-----------|
| `audit-permission-anomalies.use-case.spec.ts` | Testes de detecção |
| `fix-permission-anomalies.use-case.spec.ts` | Testes de correção |

## Uso

Consulte [`README_AUDIT.md`](./README_AUDIT.md) para instruções detalhadas.

## Automação

### Jobs Agendados

- **Diário (2h)**: Auditoria de todas as organizações
- **Semanal (Domingo 3h)**: Auditoria completa + auto-fix

### Auto-Fix

Correções automáticas aplicadas:
- ✅ Permissões órfãs
- ✅ Permissões excessivas (baixa severidade)
- ✅ Gaps de auditoria

**Não aplicado automaticamente:**
- ❌ Conflitos de permissões
- ❌ Violações de SoD
- ❌ Inconsistências hierárquicas

## Alertas

### Email

Enviado para:
- `SECURITY_ALERT_EMAIL` - Problemas críticos e SoD
- `COMPLIANCE_ALERT_EMAIL` - Baixa conformidade

### Slack

Canal: `SLACK_SECURITY_CHANNEL`

Tipos de alerta:
- 🚨 Crítico (score < 60 ou problemas críticos)
- ⚠️  Aviso (violações de SoD)
- 📊 Relatório (auditoria semanal)

## Integração

Consulte [`INTEGRATION.md`](./INTEGRATION.md) para instruções completas.

## Métricas

### Score de Conformidade

| Score | Status | Ação |
|-------|--------|------|
| 95-100 | ✅ Excelente | Manter |
| 80-94 | 👍 Bom | Monitorar |
| 60-79 | ⚠️  Atenção | Corrigir |
| 0-59 | 🚨 Crítico | Ação imediata |

### Severidade de Anomalias

- **Crítica**: Violações de SoD, conflitos graves
- **Alta**: Conflitos de permissões, órfãs críticas
- **Média**: Permissões excessivas, hierarquia
- **Baixa**: Gaps de auditoria, obsoletas

## Troubleshooting

### Problemas Comuns

**Dashboard não carrega**
- Verificar se API está rodando
- Verificar permissões do usuário
- Verificar console do navegador

**Scheduler não executa**
- Verificar `ScheduleModule.forRoot()`
- Verificar logs da aplicação
- Testar manualmente

**Alertas não são enviados**
- Verificar variáveis de ambiente
- Testar conexão SMTP/Slack
- Verificar logs de erro

## Roadmap

- [ ] Dashboard com gráficos históricos
- [ ] Exportar relatórios em PDF
- [ ] Comparação entre auditorias
- [ ] Políticas customizáveis de SoD
- [ ] Integração com SIEM
- [ ] Machine learning para detecção

## Suporte

- **Documentação**: [`README_AUDIT.md`](./README_AUDIT.md)
- **Integração**: [`INTEGRATION.md`](./INTEGRATION.md)
- **Walkthrough**: Ver artifact `walkthrough.md`
- **Issues**: GitHub Issues
