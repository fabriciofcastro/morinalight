# Segurança

Este documento descreve as práticas de segurança implementadas no sistema Morina.

## Headers de Segurança

### Nginx

O Nginx está configurado com headers de segurança abrangentes:

- **Content-Security-Policy**: Previne XSS e injeção de código
- **Strict-Transport-Security (HSTS)**: Força conexões HTTPS
- **X-Frame-Options**: Previne clickjacking
- **X-Content-Type-Options**: Previne MIME sniffing
- **X-XSS-Protection**: Proteção adicional contra XSS
- **Referrer-Policy**: Controla informações de referrer
- **Permissions-Policy**: Controla recursos do navegador

### API (Fastify + Helmet)

A API utiliza Helmet com configurações customizadas:

- Content Security Policy (CSP)
- HSTS com preload
- Proteção contra clickjacking
- MIME type sniffing prevention

## Rate Limiting

### Proteções Implementadas

1. **API Geral**: 10 requisições por segundo
2. **Web Application**: 30 requisições por segundo
3. **Login Endpoint**: 3 tentativas por minuto (proteção contra brute force)
4. **Conexões Simultâneas**: Máximo de 20 por IP

### Configuração

As configurações de rate limiting estão em `deploy/security/rate-limiting.conf`.

## Autenticação e Autorização

### JWT

- Tokens JWT com expiração configurável
- Secret mínimo de 32 caracteres
- Rotação de secrets recomendada

### RBAC (Role-Based Access Control)

O sistema utiliza RBAC para controle de acesso:

- **Permissões granulares**: Cada funcionalidade possui permissões específicas
- **Roles**: Agrupamento de permissões por função
- **Hierarquia**: Permissões podem ser herdadas através da estrutura organizacional
- **Auditoria**: Todas as mudanças de permissões são registradas

#### Sistema de Auditoria de Permissões

O sistema inclui um **módulo completo de auditoria de permissões** que:

**Detecção de Anomalias (7 tipos):**
1. **Permissões Órfãs** - Atribuídas a entidades deletadas
2. **Conflitos** - Permissões contraditórias (granted vs denied)
3. **Excessivas** - Redundantes ou desnecessárias
4. **Hierarquia** - Inconsistências na hierarquia organizacional
5. **Audit Gaps** - Mudanças sem registro adequado
6. **Obsoletas** - Permissões não utilizadas
7. **SoD** - Violações de segregação de funções

**Funcionalidades:**
- ✅ Score de conformidade (0-100%)
- ✅ Correções automáticas com dry-run
- ✅ Dashboard visual completo
- ✅ Auditorias agendadas (diária/semanal)
- ✅ Alertas automáticos (email/Slack)
- ✅ API REST e CLI

**Acesso:**
- Dashboard: `/admin/permissions/audit`
- API: `POST /permissions/audit/run`
- CLI: `npx tsx src/scripts/audit-permissions.ts`

**Documentação:**
- Guia completo: `apps/api/src/modules/permissions/README_AUDIT.md`
- Integração: `apps/api/src/modules/permissions/INTEGRATION.md`
- Documentação técnica: `apps/api/src/modules/permissions/DOCUMENTATION.md`

**Automação:**
- Auditoria diária às 2h da manhã
- Auditoria semanal aos domingos às 3h
- Auto-fix de anomalias de baixa severidade
- Alertas automáticos para problemas críticos

## Secrets Management

### Gerenciamento de Secrets

Use o script `deploy/security/secrets-manager.sh` para:

```bash
# Validar secrets configurados
make security:validate

# Gerar template de secrets
make security:secrets:generate
```

### Secrets Obrigatórios

- `JWT_SECRET`: Secret para assinatura de tokens JWT (mínimo 32 caracteres)
- `DATABASE_URL`: URL de conexão com PostgreSQL
- `REDIS_URL`: URL de conexão com Redis
- `REALTIME_SECRET`: Secret para comunicação realtime (mínimo 16 caracteres)

### Boas Práticas

1. **Nunca commite secrets no Git**
2. Use variáveis de ambiente em produção
3. Considere usar ferramentas como:
   - HashiCorp Vault
   - AWS Secrets Manager
   - Azure Key Vault
   - Google Secret Manager

## CORS

### Configuração

Em produção, o CORS está restrito a origens específicas configuradas via `FRONTEND_URL`.

Em desenvolvimento, permite todas as origens para facilitar o desenvolvimento.

## Proteção contra Ataques Comuns

### SQL Injection

- Uso de Prisma ORM com queries parametrizadas
- Validação de entrada com Zod schemas

### XSS (Cross-Site Scripting)

- Content Security Policy
- Sanitização de entrada
- Escape de saída

### CSRF (Cross-Site Request Forgery)

- Tokens CSRF (implementar se necessário)
- SameSite cookies

### DDoS

- Rate limiting
- Connection limiting
- Timeouts configurados

### Brute Force

- Rate limiting específico para login (3 tentativas/minuto)
- Logs de tentativas falhadas
- Bloqueio temporário (implementar se necessário)

## SSL/TLS

### Configuração

Para habilitar HTTPS:

1. Obtenha certificados SSL (Let's Encrypt, Cloudflare, etc.)
2. Descomente e configure o bloco HTTPS em `deploy/nginx/conf.d/morina.conf`
3. Configure os caminhos dos certificados

### Recomendações

- Use TLS 1.2 ou superior
- Desabilite protocolos antigos (SSLv3, TLS 1.0, TLS 1.1)
- Configure cipher suites seguros
- Habilite HSTS

## 11. Auditoria e Monitoramento

### Auditorias de Segurança

O sistema realiza auditorias regulares de segurança:

- **Auditoria de Código**: Análise estática de código para vulnerabilidades
- **Auditoria de Dependências**: Verificação de vulnerabilidades em pacotes
- **Auditoria de Permissões**: Sistema automatizado de auditoria de RBAC
- **Penetration Testing**: Testes de penetração periódicos

#### Auditoria Automatizada de Permissões

Sistema completo de auditoria que executa automaticamente:

**Frequência:**
- Diária: 2h da manhã (todas as organizações)
- Semanal: Domingo 3h (auditoria completa + auto-fix)
- Manual: Via dashboard, API ou CLI

**Métricas Monitoradas:**
- Score de conformidade (0-100%)
- Total de anomalias por severidade
- Violações de segregação de funções
- Permissões órfãs e conflitos
- Gaps de auditoria

**Alertas Automáticos:**
- 🚨 Crítico: Score < 60% ou problemas críticos
- ⚠️  Aviso: Violações de SoD detectadas
- 📊 Info: Relatório semanal consolidado

**Canais de Notificação:**
- Email: `SECURITY_ALERT_EMAIL`, `COMPLIANCE_ALERT_EMAIL`
- Slack: `SLACK_SECURITY_CHANNEL`

**Correções Automáticas:**
- Remove permissões órfãs
- Remove permissões excessivas de baixa severidade
- Preenche gaps de auditoria
- **NÃO** resolve conflitos automaticamente (requer revisão manual)

### Logs e Monitoramento

- **Logs de Acesso**: Todos os acessos são registrados
- **Logs de Auditoria**: Mudanças em dados sensíveis são auditadas
- **Logs de Permissões**: Todas as alterações de permissões são registradas no `PermissionAuditLog`
- **Monitoramento em Tempo Real**: Alertas para atividades suspeitas
- **Retenção**: Logs mantidos por 90 dias (configurável)

## Backup e Recuperação

### Backups Automatizados

Execute backups regulares:

```bash
make backup
```

Os backups incluem:

- Banco de dados PostgreSQL
- Volumes Docker
- Configurações
- Informações de versão

### Restauração

```bash
make restore BACKUP=./backups/20241201_120000.tar.gz
```

## Atualizações de Segurança

### Checklist

- [ ] Atualizar dependências regularmente
- [ ] Revisar logs de segurança
- [ ] Testar procedimentos de backup/restore
- [ ] Revisar e atualizar secrets periodicamente
- [ ] Monitorar vulnerabilidades conhecidas (CVE)
- [ ] Realizar auditorias de segurança

### Dependências

Use ferramentas como:

- `npm audit` / `pnpm audit`
- Snyk
- Dependabot (GitHub)

## Incidentes de Segurança

### Procedimento

1. **Identificar**: Detectar e isolar o incidente
2. **Contenção**: Prevenir propagação
3. **Eradicação**: Remover a ameaça
4. **Recuperação**: Restaurar serviços
5. **Lições Aprendidas**: Documentar e melhorar

### Contatos

Mantenha uma lista de contatos de emergência:

- Equipe de segurança
- Administradores de sistema
- Fornecedores de serviços

## Compliance

### LGPD (Lei Geral de Proteção de Dados)

- Dados pessoais protegidos
- Consentimento explícito
- Direito ao esquecimento
- Portabilidade de dados

### Recomendações

- Implementar política de privacidade
- Registrar consentimentos
- Implementar mecanismos de exclusão de dados
- Auditorias regulares

## Referências

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
