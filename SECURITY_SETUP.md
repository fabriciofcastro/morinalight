# 🔐 Configuração Rápida de Segurança

## ✅ Chaves Geradas

Adicione estas chaves ao seu arquivo `.env`:

```bash
# Chaves de Criptografia
ENCRYPTION_MASTER_KEY=d8c1acd04505ab655632955d0aaf963e37553959e1b83e395eed08b0b99ae897
ENCRYPTION_SALT=0c1f171fb42f7f53524bc86dc2e548ab222a20e1cb138c4afd5e113a0bba447762ff9952866482dc0378e309ef6b9ec41443d6fc43895ca696ce0bccf680604c

# Cron Secret (para proteger endpoint de cron)
CRON_SECRET=1d5dea0b26c02de1826cb38f9958bf242bb7b4bac0f4886f48205377cb936f83

# Configurações de Segurança
MFA_APP_NAME=MorinaLight
IDS_ENABLED=true
IDS_BLOCK_DURATION_MINUTES=30
IDS_MAX_FAILED_LOGINS=5
```

## 📋 Páginas Criadas

### 1. Dashboard de Segurança (Admin)
**URL**: `http://localhost:3000/admin/security`

**Funcionalidades**:
- Visualizar todos os alertas de segurança
- Estatísticas de segurança (últimos 7 dias)
- Alertas críticos não reconhecidos
- Reconhecer alertas
- Filtrar por severidade e tipo

### 2. Configurações de Segurança (Usuário)
**URL**: `http://localhost:3000/settings/security`

**Funcionalidades**:
- Habilitar Two-Factor Authentication (MFA)
- Escanear QR code com Google Authenticator
- Salvar backup codes
- Alterar senha (placeholder)

## 🧪 Como Testar

### Teste 1: MFA Setup
1. Acesse `http://localhost:3000/settings/security`
2. Clique em "Enable Two-Factor Authentication"
3. Escaneie o QR code com Google Authenticator
4. Digite o código de 6 dígitos
5. Salve os backup codes

### Teste 2: Security Dashboard
1. Acesse `http://localhost:3000/admin/security`
2. Visualize estatísticas de segurança
3. Veja alertas recentes (se houver)

### Teste 3: Criptografia
```bash
# Criar usuário com CPF (via API ou Prisma Studio)
# Verificar no banco que o CPF está criptografado
psql -d morina -c "SELECT id, email, cpf FROM \"User\" LIMIT 1;"
# CPF deve estar no formato: iv:authTag:encrypted
```

### Teste 4: IDS (Intrusion Detection)
```bash
# Tentar login com senha errada 6 vezes
# Verificar que conta foi bloqueada
# Verificar alerta no dashboard
```

### Teste 5: Cron Job
```bash
# Testar endpoint de cron manualmente
curl -X GET http://localhost:3000/api/cron/security-monitor \
  -H "Authorization: Bearer 1d5dea0b26c02de1826cb38f9958bf242bb7b4bac0f4886f48205377cb936f83"

# Deve retornar: {"success": true, ...}
```

## 🚀 Próximos Passos

1. ✅ Adicionar chaves ao `.env`
2. ✅ Reiniciar servidor Next.js
3. ✅ Testar páginas de segurança
4. ✅ Habilitar MFA para sua conta
5. ✅ Verificar dashboard de segurança
6. 📝 Configurar notificações por email (opcional)
7. 📝 Criar testes automatizados (opcional)

## 📚 Documentação Completa

- **Walkthrough**: `/home/fabricio/.gemini/antigravity/brain/89014ba2-c70e-4b33-a459-7982d4c1001a/walkthrough.md`
- **Deploy Guide**: `/home/fabricio/projects/morinalight/DEPLOY_SECURITY.md`
- **Task Tracking**: `/home/fabricio/.gemini/antigravity/brain/89014ba2-c70e-4b33-a459-7982d4c1001a/task.md`

## ⚠️ IMPORTANTE

**Para Desenvolvimento**: As chaves acima são para desenvolvimento local.

**Para Produção**: SEMPRE gere novas chaves únicas:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🔧 Troubleshooting

### Erro: "Cannot find module '@/components/ui/dialog'"
```bash
# Instalar shadcn/ui dialog
npx shadcn-ui@latest add dialog
```

### Erro: "date-fns not found"
```bash
# Instalar date-fns
pnpm add date-fns --filter web
```

### Prisma Client desatualizado
```bash
cd apps/api
npx prisma generate
```
