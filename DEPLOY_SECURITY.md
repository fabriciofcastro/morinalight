# Guia de Deploy - Segurança Enterprise

## Pré-requisitos

- [ ] PostgreSQL configurado e acessível
- [ ] Variáveis de ambiente configuradas
- [ ] Chaves de criptografia geradas
- [ ] Certificado SSL/TLS (para produção)

## 1. Configuração de Variáveis de Ambiente

### Gerar Chaves de Criptografia

```bash
# Gerar ENCRYPTION_MASTER_KEY (32 bytes = 64 caracteres hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Gerar ENCRYPTION_SALT (64 bytes = 128 caracteres hex)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Gerar JWT_SECRET (32 bytes = 64 caracteres hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Gerar CRON_SECRET (para proteger endpoints de cron)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Configurar .env (Produção)

```bash
# Copiar do exemplo
cp .env.example .env

# Editar com valores reais
nano .env
```

**CRÍTICO**: Substituir TODOS os valores de desenvolvimento por valores seguros!

## 2. Migração do Banco de Dados

```bash
# Navegar para o diretório da API
cd apps/api

# Executar migrações
npx prisma migrate deploy

# Gerar Prisma Client
npx prisma generate
```

## 3. Verificar Configuração de Segurança

### Checklist de Segurança

- [ ] `ENCRYPTION_MASTER_KEY` configurado com valor único
- [ ] `ENCRYPTION_SALT` configurado com valor único
- [ ] `JWT_SECRET` configurado com valor único
- [ ] `CRON_SECRET` configurado (para Vercel Cron)
- [ ] `NODE_ENV=production`
- [ ] HTTPS habilitado
- [ ] Security headers configurados
- [ ] Rate limiting ativo

### Testar Criptografia

```bash
# Criar usuário de teste
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","cpf":"123.456.789-00","phone":"11999999999"}'

# Verificar no banco que CPF e phone estão criptografados
psql -d morina -c "SELECT id, email, cpf, phone FROM \"User\" WHERE email='test@example.com';"
# CPF e phone devem estar no formato: iv:authTag:encrypted
```

## 4. Configurar Cron Jobs

### Vercel

Criar `vercel.json` na raiz do projeto:

```json
{
  "crons": [
    {
      "path": "/api/cron/security-monitor",
      "schedule": "0 */5 * * * *"
    }
  ]
}
```

Adicionar ao `.env`:
```bash
CRON_SECRET=<valor-gerado-anteriormente>
```

### Alternativa: Node-Cron (Self-Hosted)

Instalar dependência:
```bash
pnpm add node-cron
pnpm add -D @types/node-cron
```

Criar `apps/web/src/lib/cron/scheduler.ts`:
```typescript
import cron from 'node-cron';
import { runSecurityMonitor } from './security-monitor';

export function startCronJobs() {
  // A cada 5 minutos
  cron.schedule('*/5 * * * *', async () => {
    console.log('[Cron] Running security monitor...');
    await runSecurityMonitor();
  });
  
  console.log('[Cron] Jobs scheduled');
}
```

Iniciar no `server.ts` ou `app.ts`:
```typescript
import { startCronJobs } from './lib/cron/scheduler';

// Após inicializar servidor
startCronJobs();
```

## 5. Configurar MFA

### Habilitar MFA para Administradores

1. Login como administrador
2. Ir para Settings → Security
3. Clicar em "Enable Two-Factor Authentication"
4. Escanear QR code com Google Authenticator
5. Salvar backup codes em local seguro
6. Testar logout e login com MFA

### Política Recomendada

- **Obrigatório** para: Administradores, usuários com acesso a dados sensíveis
- **Opcional** para: Usuários regulares
- **Backup codes**: Sempre salvar em local seguro

## 6. Monitoramento

### Verificar Logs de Segurança

```bash
# Ver alertas recentes
curl -X GET http://localhost:3000/api/security/alerts \
  -H "Authorization: Bearer <token>"

# Ver estatísticas
curl -X GET http://localhost:3000/api/security/alerts/stats \
  -H "Authorization: Bearer <token>"
```

### Configurar Notificações (Opcional)

Adicionar ao `.env`:
```bash
# Email para notificações de segurança
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=security@yourcompany.com
SMTP_PASSWORD=<senha-app>
SECURITY_ALERT_EMAIL=admin@yourcompany.com
```

Implementar em `lib/notifications/security-alerts.ts`:
```typescript
import nodemailer from 'nodemailer';

export async function sendSecurityAlert(alert: SecurityAlert) {
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.SECURITY_ALERT_EMAIL,
    subject: `[SECURITY] ${alert.severity.toUpperCase()}: ${alert.alertType}`,
    html: `
      <h2>Security Alert</h2>
      <p><strong>Severity:</strong> ${alert.severity}</p>
      <p><strong>Type:</strong> ${alert.alertType}</p>
      <p><strong>Description:</strong> ${alert.description}</p>
      <p><strong>User:</strong> ${alert.user.email}</p>
      <p><strong>Time:</strong> ${new Date(alert.createdAt).toLocaleString()}</p>
    `,
  });
}
```

## 7. Testes de Produção

### Teste 1: Rate Limiting

```bash
# Fazer 100+ requisições rápidas
for i in {1..150}; do
  curl -X GET http://localhost:3000/api/users &
done

# Deve retornar 429 após 100 requisições
```

### Teste 2: MFA

1. Criar usuário com MFA habilitado
2. Fazer login
3. Verificar que pede código MFA
4. Testar com código correto
5. Testar com código incorreto (deve falhar)
6. Testar com backup code

### Teste 3: Intrusion Detection

```bash
# Tentar login com senha errada 5+ vezes
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done

# Verificar que conta foi bloqueada
# Verificar que alerta foi criado no dashboard
```

### Teste 4: Criptografia

```bash
# Criar usuário com CPF
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","cpf":"123.456.789-00"}'

# Verificar no banco que está criptografado
psql -d morina -c "SELECT cpf FROM \"User\" WHERE email='test@example.com';"
# Deve mostrar: iv:authTag:encrypted

# Buscar via API e verificar que está descriptografado
curl -X GET http://localhost:3000/api/users/test@example.com
# Deve retornar: "cpf": "123.456.789-00"
```

## 8. Rollback Plan

Se algo der errado:

### Desabilitar Criptografia Temporariamente

```typescript
// lib/prisma.ts
// Comentar linha:
// prismaInstance.$use(encryptionMiddleware());
```

### Desabilitar IDS Temporariamente

```bash
# .env
IDS_ENABLED=false
```

### Reverter Migração

```bash
cd apps/api
npx prisma migrate resolve --rolled-back 20260102124323_add_security_alert_model
```

## 9. Checklist Final

Antes de ir para produção:

- [ ] Todas as variáveis de ambiente configuradas
- [ ] Chaves de criptografia únicas geradas
- [ ] Migrações aplicadas com sucesso
- [ ] Cron jobs configurados
- [ ] MFA testado e funcionando
- [ ] Rate limiting testado
- [ ] IDS testado
- [ ] Criptografia testada
- [ ] Security headers verificados
- [ ] HTTPS habilitado
- [ ] Logs de segurança funcionando
- [ ] Dashboard de segurança acessível
- [ ] Backup codes salvos para admins
- [ ] Documentação atualizada
- [ ] Equipe treinada

## 10. Manutenção Contínua

### Diário
- Verificar alertas críticos no dashboard
- Revisar logs de segurança

### Semanal
- Revisar estatísticas de segurança
- Verificar usuários bloqueados
- Limpar alertas antigos reconhecidos

### Mensal
- Rotacionar chaves de criptografia (se necessário)
- Revisar políticas de segurança
- Atualizar dependências de segurança
- Realizar auditoria de acessos

### Trimestral
- Teste de penetração
- Revisão de código de segurança
- Atualização de documentação
- Treinamento de equipe

---

## Suporte

Para problemas ou dúvidas:
1. Verificar logs: `tail -f logs/security.log`
2. Verificar dashboard: `/admin/security`
3. Consultar documentação: `walkthrough.md`
4. Contatar equipe de segurança
