# Integração do Dashboard de Auditoria

## Frontend (Next.js/React)

### 1. Adicionar Rota

Criar página em `apps/web/src/app/admin/permissions/audit/page.tsx`:

```tsx
import { PermissionAuditDashboard } from "@/components/permissions/PermissionAuditDashboard";

export default function PermissionAuditPage() {
  return <PermissionAuditDashboard />;
}
```

### 2. Adicionar ao Menu de Navegação

Em `apps/web/src/components/layout/Sidebar.tsx`:

```tsx
{
  name: "Auditoria de Permissões",
  href: "/admin/permissions/audit",
  icon: Shield,
  permission: "permissions:audit",
}
```

### 3. Configurar Proxy (se necessário)

Em `apps/web/next.config.js`:

```js
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'http://localhost:3001/:path*',
    },
  ];
}
```

## Backend (NestJS)

### 1. Registrar Scheduler

Em `apps/api/src/modules/permissions/permissions.module.ts`:

```typescript
import { ScheduleModule } from '@nestjs/schedule';
import { PermissionAuditScheduler } from './services/permission-audit.scheduler';
import { AuditAlertService } from './services/audit-alert.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    PermissionAuditScheduler,
    AuditAlertService,
  ],
})
export class PermissionsModule {}
```

### 2. Configurar Variáveis de Ambiente

Em `.env`:

```bash
# Alertas de Auditoria
SECURITY_ALERT_EMAIL=security@yourcompany.com
COMPLIANCE_ALERT_EMAIL=compliance@yourcompany.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_SECURITY_CHANNEL=#security-alerts

# SMTP (opcional - para envio de emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourcompany.com
```

### 3. Instalar Dependências

```bash
cd apps/api
pnpm add @nestjs/schedule
pnpm add @slack/webhook nodemailer
pnpm add -D @types/nodemailer
```

## Configuração de Alertas

### Email (Nodemailer)

Atualizar `audit-alert.service.ts`:

```typescript
import * as nodemailer from 'nodemailer';

private transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

private async sendEmail(options: any) {
  await this.transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: options.to,
    subject: options.subject,
    text: options.body,
  });
}
```

### Slack Webhook

Atualizar `audit-alert.service.ts`:

```typescript
import { IncomingWebhook } from '@slack/webhook';

private webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);

private async sendSlack(options: any) {
  await this.webhook.send({
    channel: options.channel,
    text: options.message,
    icon_emoji: ':shield:',
  });
}
```

## Permissões Necessárias

Adicionar permissão no banco de dados:

```sql
INSERT INTO "Permission" (id, code, name, description, module, level)
VALUES (
  gen_random_uuid(),
  'permissions:audit',
  'Auditar Permissões',
  'Executar auditoria de permissões e aplicar correções',
  'PERMISSIONS',
  'ADMIN'
);
```

## Testes

### Testar Dashboard

1. Acessar `http://localhost:3000/admin/permissions/audit`
2. Clicar em "Executar Auditoria"
3. Verificar se o relatório é exibido
4. Testar simulação de correções
5. Baixar relatório JSON

### Testar Scheduler

```typescript
// Em um controller de teste
@Get('/test-scheduler')
async testScheduler() {
  const scheduler = this.moduleRef.get(PermissionAuditScheduler);
  await scheduler.handleDailyAudit();
  return { message: 'Auditoria executada' };
}
```

### Testar Alertas

```typescript
// Em um controller de teste
@Get('/test-alerts')
async testAlerts() {
  const alertService = this.moduleRef.get(AuditAlertService);
  
  const mockReport = {
    summary: { criticalIssues: 5, conformityScore: 45 },
    sodViolations: [{ userId: 'test', severity: 'critical' }],
    recommendations: ['Fix critical issues'],
  };
  
  await alertService.processAuditReport(mockReport, 'Test Org');
  return { message: 'Alertas enviados' };
}
```

## Monitoramento

### Logs

Os logs do scheduler podem ser visualizados:

```bash
# Desenvolvimento
pnpm dev

# Produção
pm2 logs api
```

### Métricas

Adicionar métricas ao Prometheus/Grafana:

```typescript
import { Counter, Histogram } from 'prom-client';

const auditCounter = new Counter({
  name: 'permission_audits_total',
  help: 'Total de auditorias executadas',
});

const auditDuration = new Histogram({
  name: 'permission_audit_duration_seconds',
  help: 'Duração das auditorias',
});
```

## Troubleshooting

### Scheduler não executa

Verificar se `ScheduleModule` está importado:

```typescript
@Module({
  imports: [ScheduleModule.forRoot()],
})
```

### Emails não são enviados

1. Verificar variáveis de ambiente
2. Testar conexão SMTP:

```bash
telnet smtp.gmail.com 587
```

3. Verificar logs de erro

### Dashboard não carrega

1. Verificar se API está rodando
2. Verificar proxy do Next.js
3. Verificar permissões do usuário
4. Verificar console do navegador

## Deployment

### Docker

Adicionar ao `docker-compose.yml`:

```yaml
services:
  api:
    environment:
      - SECURITY_ALERT_EMAIL=${SECURITY_ALERT_EMAIL}
      - SLACK_WEBHOOK_URL=${SLACK_WEBHOOK_URL}
```

### PM2

Configurar em `ecosystem.config.js`:

```js
module.exports = {
  apps: [{
    name: 'api',
    script: 'dist/main.js',
    env: {
      NODE_ENV: 'production',
      SECURITY_ALERT_EMAIL: 'security@company.com',
    },
  }],
};
```

## Manutenção

### Desabilitar Scheduler Temporariamente

Comentar o decorator `@Cron`:

```typescript
// @Cron(CronExpression.EVERY_DAY_AT_2AM)
async handleDailyAudit() {
  // ...
}
```

### Executar Manualmente

Via API:

```bash
curl -X POST http://localhost:3001/permissions/audit/run \
  -H "Authorization: Bearer $TOKEN"
```

Via CLI:

```bash
npx tsx src/scripts/audit-permissions.ts --org-id <uuid>
```
