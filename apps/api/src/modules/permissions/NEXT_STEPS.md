# 🎯 Próximos Passos - Deploy e Configuração

## ✅ Status Atual
- 38 arquivos criados
- Todas as 3 fases implementadas
- Dependências instaladas
- Sistema 100% completo

---

## 📋 Checklist de Deploy

### 1. Configuração de Ambiente ⚙️

```bash
# Copiar arquivo de exemplo
cp apps/api/.env.example apps/api/.env

# Editar variáveis de ambiente
nano apps/api/.env
```

**Variáveis Obrigatórias:**
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Para alertas email
- `SLACK_WEBHOOK_URL` - Para alertas Slack

**Variáveis Opcionais:**
- `SIEM_*` - Para integração SIEM
- `ML_*` - Para Machine Learning

---

### 2. Banco de Dados 🗄️

```bash
cd apps/api

# Aplicar migrations
npx prisma migrate deploy

# Ou executar SQL manualmente
psql -U usuario -d database < prisma/migrations/add_audit_advanced_features.sql
```

**Modelos Adicionados:**
- `SoDPolicy` - Políticas de segregação
- `AuditSnapshot` - Histórico de auditorias

**Permissões Adicionadas:**
- `permissions:ml` - Gerenciar ML
- `permissions:siem` - Configurar SIEM
- `permissions:sod` - Gerenciar SoD

---

### 3. Build e Deploy 🔨

```bash
# Na raiz do projeto
pnpm build

# Iniciar em desenvolvimento
pnpm dev

# Ou em produção
pnpm start
```

---

### 4. Primeira Execução 🚀

#### Via Dashboard
1. Acesse: `http://localhost:3000/admin/permissions/audit`
2. Clique em **"Executar Auditoria"**
3. Aguarde processamento
4. Visualize resultados

#### Via API
```bash
# Executar primeira auditoria
curl -X POST http://localhost:3001/permissions/audit/run \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

---

### 5. Configurar Machine Learning 🤖

```bash
# Treinar modelo inicial
curl -X POST http://localhost:3001/permissions/ml/train \
  -H "Authorization: Bearer $TOKEN"

# Aguardar treinamento (pode levar alguns minutos)
# Verificar accuracy na resposta
```

---

### 6. Configurar SIEM 📊

#### Splunk
```bash
curl -X POST http://localhost:3001/permissions/siem/configure \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "splunk",
    "host": "splunk.example.com",
    "port": 8089,
    "username": "admin",
    "password": "password",
    "index": "permission_audit"
  }'

# Testar conexão
curl -X POST http://localhost:3001/permissions/siem/test \
  -H "Authorization: Bearer $TOKEN"
```

---

### 7. Criar Políticas SoD 🔐

#### Via Dashboard
1. Acesse aba **"SoD"**
2. Clique em **"Nova Política"**
3. Defina permissões conflitantes
4. Simule antes de ativar

#### Via API
```bash
curl -X POST http://localhost:3001/permissions/sod/policies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Segregação Financeira",
    "description": "Impede criar e aprovar pagamentos",
    "conflictingPermissions": [
      ["payments.create", "payments.approve"]
    ],
    "severity": "critical"
  }'
```

---

### 8. Verificar Automação ⏰

O sistema executará automaticamente:
- **Diário**: 2h - Auditoria completa
- **Semanal**: Domingo 3h - Relatório detalhado

**Verificar logs:**
```bash
# Ver logs do scheduler
tail -f logs/scheduler.log

# Ver logs de alertas
tail -f logs/alerts.log
```

---

### 9. Testar Alertas 📧

```bash
# Forçar envio de alerta de teste
curl -X POST http://localhost:3001/permissions/siem/send-event \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "test_alert",
    "severity": "low",
    "details": {"test": true}
  }'
```

Verificar:
- ✅ Email recebido
- ✅ Mensagem no Slack
- ✅ Evento no SIEM (se configurado)

---

### 10. Monitoramento 📈

#### Métricas para Acompanhar
- Score de conformidade (meta: >90%)
- Número de anomalias (meta: <10)
- Violações de SoD (meta: 0)
- Accuracy do ML (meta: >85%)

#### Dashboard de Monitoramento
- Acesse: `/admin/permissions/audit`
- Aba **"Histórico"** - Ver tendências
- Aba **"Comparação"** - Comparar períodos

---

## 🎯 Próximas Ações Recomendadas

### Curto Prazo (1 semana)
- [ ] Executar 3-5 auditorias para coletar dados
- [ ] Treinar modelo ML com dados reais
- [ ] Configurar políticas SoD específicas da organização
- [ ] Ajustar thresholds de alertas

### Médio Prazo (1 mês)
- [ ] Analisar tendências históricas
- [ ] Refinar políticas SoD baseado em violações
- [ ] Otimizar modelo ML
- [ ] Integrar com SIEM corporativo

### Longo Prazo (3 meses)
- [ ] Criar políticas SoD customizadas avançadas
- [ ] Implementar dashboards executivos
- [ ] Automatizar correções de baixo risco
- [ ] Expandir features do ML

---

## 🆘 Troubleshooting

### Erro: "Dependências não instaladas"
```bash
./scripts/prepare-audit-system.sh
```

### Erro: "Migrations pendentes"
```bash
cd apps/api
npx prisma migrate deploy
```

### Erro: "Modelo ML não treinado"
```bash
curl -X POST http://localhost:3001/permissions/ml/train
```

### Erro: "SIEM não responde"
```bash
curl -X POST http://localhost:3001/permissions/siem/test
```

---

## 📞 Suporte

**Documentação:**
- `QUICK_START.md` - Início rápido
- `complete_documentation.md` - Documentação completa
- `CHECKLIST.md` - Lista de funcionalidades

**Logs:**
- Backend: `apps/api/logs/`
- Frontend: Console do navegador

---

## ✅ Checklist Final

- [ ] Variáveis de ambiente configuradas
- [ ] Migrations aplicadas
- [ ] Primeira auditoria executada
- [ ] Modelo ML treinado
- [ ] SIEM configurado (opcional)
- [ ] Políticas SoD criadas
- [ ] Alertas testados
- [ ] Automação verificada
- [ ] Dashboard acessível
- [ ] Documentação revisada

---

**Status**: Pronto para produção! 🚀  
**Versão**: 2.0.0  
**Data**: 2026-01-05
