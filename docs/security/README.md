# Segurança e Deploy - Guia Rápido

Este documento fornece um guia rápido sobre as práticas de segurança e estratégias de deploy implementadas.

## 🚀 Deploy Seguro

### Estratégias Disponíveis

#### 1. Blue-Green Deployment (Zero Downtime)
```bash
make deploy:blue-green
```
- Deploy sem downtime
- Rollback instantâneo
- Ambiente anterior mantido por 24h

#### 2. Canary Deployment (Deploy Gradual)
```bash
make deploy:canary
```
- Deploy gradual (10% → 50% → 100%)
- Detecção precoce de problemas
- Rollback automático em caso de falha

#### 3. Rollback Automático
```bash
make rollback
```
- Acionado automaticamente em caso de falha
- Restaura versão anterior
- Verifica saúde após rollback

### Smoke Tests

Testes rápidos executados após cada deploy:
```bash
./deploy/strategies/smoke-tests.sh
```

Testa:
- Health endpoints
- Conectividade com banco de dados
- Carregamento da aplicação web

## 🔒 Segurança

### Headers de Segurança

Configurados automaticamente no Nginx:
- Content-Security-Policy
- Strict-Transport-Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy

### Rate Limiting

- **API**: 10 requisições/segundo
- **Web**: 30 requisições/segundo
- **Login**: 3 tentativas/minuto (proteção contra brute force)
- **Conexões**: Máximo 20 por IP

### Secrets Management

Validar secrets configurados:
```bash
make security:validate
```

Gerar template de secrets:
```bash
make security:secrets:generate
```

**Secrets Obrigatórios:**
- `JWT_SECRET` (mínimo 32 caracteres)
- `DATABASE_URL`
- `REDIS_URL`
- `REALTIME_SECRET` (mínimo 16 caracteres)

## 📦 Backup e Restore

### Criar Backup
```bash
make backup
```

Backups incluem:
- Banco de dados PostgreSQL
- Volumes Docker
- Configurações
- Informações de versão

### Restaurar Backup
```bash
make restore BACKUP=./backups/20241201_120000.tar.gz
```

**⚠️ ATENÇÃO**: Restauração sobrescreve dados atuais!

## 📝 Versionamento

### Ver Versão Atual
```bash
make version
```

### Incrementar Versão

**Patch** (0.0.1) - Correções de bugs:
```bash
make version:patch
```

**Minor** (0.1.0) - Novas funcionalidades:
```bash
make version:minor
```

**Major** (1.0.0) - Mudanças incompatíveis:
```bash
make version:major
```

### Changelog

Todas as mudanças são documentadas em `CHANGELOG.md` seguindo o padrão [Keep a Changelog](https://keepachangelog.com/).

## 🔍 Monitoramento

### Health Checks

Verificar saúde dos serviços:
```bash
make health
```

### Logs

Ver logs em tempo real:
```bash
make logs
```

### Status dos Serviços

Ver status de todos os containers:
```bash
make ps
```

## 📚 Documentação Completa

- **Segurança Detalhada**: `docs/SECURITY.md`
- **Estratégias de Deploy**: `docs/DEPLOYMENT_STRATEGIES.md`
- **Deploy Geral**: `docs/deployment.md`

## ⚠️ Procedimentos de Emergência

### Deploy com Falha

1. Sistema detecta falha automaticamente
2. Rollback automático é executado
3. Equipe é notificada
4. Investigar logs: `make logs`
5. Corrigir problema
6. Tentar novo deploy

### Rollback Manual

Se o rollback automático falhar:

```bash
# 1. Parar serviços
docker compose -f docker-compose.prod.yml stop

# 2. Restaurar backup
make restore BACKUP=./backups/ultimo_backup_valido.tar.gz

# 3. Reiniciar
docker compose -f docker-compose.prod.yml up -d

# 4. Verificar
make health
```

## ✅ Checklist Pré-Deploy

- [ ] Revisar mudanças no código
- [ ] Executar testes localmente
- [ ] Verificar secrets configurados (`make security:validate`)
- [ ] Confirmar backups atualizados
- [ ] Notificar equipe sobre deploy
- [ ] Estar pronto para rollback manual se necessário

## 📞 Suporte

Em caso de problemas:
1. Verificar logs: `make logs`
2. Verificar saúde: `make health`
3. Consultar documentação em `docs/`
4. Executar rollback se necessário: `make rollback`

