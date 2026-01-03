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

Sistema de permissões baseado em roles:
- Admin
- Manager
- User
- Guest

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

## Logs e Monitoramento

### Logs de Segurança

- Tentativas de login falhadas
- Requisições bloqueadas por rate limiting
- Erros de autenticação
- Acessos não autorizados

### Monitoramento

- Health checks regulares
- Alertas para anomalias
- Monitoramento de recursos

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


