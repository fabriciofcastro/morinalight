# 🚀 Guia Rápido de Início - Sistema de Auditoria de Permissões

## ✅ Status: 100% Completo - Pronto para Uso!

---

## 📦 1. Instalação de Dependências

```bash
# Backend
cd apps/api
pnpm add @nestjs/schedule @slack/webhook nodemailer pdfkit @tensorflow/tfjs-node splunk-sdk
pnpm add -D @types/pdfkit @types/nodemailer

# Frontend
cd apps/web
pnpm add recharts react-diff-viewer-continued
```

---

## ⚙️ 2. Configuração

### Variáveis de Ambiente (.env)

```env
# Alertas Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
SMTP_FROM=noreply@seudominio.com
SECURITY_ALERT_EMAIL=security@seudominio.com
COMPLIANCE_ALERT_EMAIL=compliance@seudominio.com

# Alertas Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_SECURITY_CHANNEL=#security

# SIEM (Opcional)
SIEM_TYPE=splunk
SIEM_HOST=splunk.seudominio.com
SIEM_PORT=8089
SIEM_TOKEN=seu-token-aqui

# ML (Opcional)
ML_MODEL_PATH=/app/models/permission-audit
ML_AUTO_TRAIN=true
```

---

## 🎯 3. Uso Rápido

### Via Dashboard Web

1. Acesse: `http://localhost:3000/admin/permissions/audit`
2. Clique em **"Executar Auditoria"**
3. Visualize resultados nas abas:
   - **Visão Geral**: Métricas principais
   - **Detalhes**: Anomalias por tipo
   - **Histórico**: Gráficos de tendências
   - **Comparação**: Comparar auditorias
   - **SoD**: Gerenciar políticas
   - **Recomendações**: Ações sugeridas

### Via API

```bash
# Executar auditoria
curl -X POST http://localhost:3001/permissions/audit/run \
  -H "Authorization: Bearer $TOKEN"

# Exportar PDF
curl -X GET http://localhost:3001/permissions/audit/export/{id}/pdf \
  -H "Authorization: Bearer $TOKEN" \
  --output relatorio.pdf

# Treinar modelo ML
curl -X POST http://localhost:3001/permissions/ml/train \
  -H "Authorization: Bearer $TOKEN"

# Detectar com ML
curl -X POST http://localhost:3001/permissions/ml/detect \
  -H "Authorization: Bearer $TOKEN"
```

### Via CLI

```bash
cd apps/api

# Auditoria básica
npx tsx src/scripts/audit-permissions.ts --org-id <uuid>

# Com correções (dry-run)
npx tsx src/scripts/audit-permissions.ts --org-id <uuid> --fix --dry-run

# Aplicar correções reais
npx tsx src/scripts/audit-permissions.ts --org-id <uuid> --fix
```

---

## 🤖 4. Machine Learning

### Treinar Modelo

```bash
# Via API
curl -X POST http://localhost:3001/permissions/ml/train \
  -H "Authorization: Bearer $TOKEN"

# Resposta esperada:
{
  "success": true,
  "accuracy": 0.87,
  "message": "Modelo treinado com 87.00% de acurácia"
}
```

### Detectar Anomalias com IA

```bash
curl -X POST http://localhost:3001/permissions/ml/detect \
  -H "Authorization: Bearer $TOKEN"

# Resposta:
{
  "predictions": [
    {
      "userId": "user-123",
      "userEmail": "usuario@example.com",
      "anomalyType": "ml_detected",
      "probability": 0.92,
      "confidence": "high",
      "features": {...}
    }
  ],
  "summary": {
    "totalPredictions": 5,
    "highConfidence": 3,
    "mediumConfidence": 2,
    "lowConfidence": 0
  }
}
```

---

## 🔐 5. Políticas SoD

### Criar Política Customizada

```bash
curl -X POST http://localhost:3001/permissions/sod/policies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Segregação Financeira Custom",
    "description": "Impede criar e aprovar transações",
    "conflictingPermissions": [
      ["transactions.create", "transactions.approve"],
      ["transactions.create", "transactions.execute"]
    ],
    "severity": "critical"
  }'
```

### Simular Política

```bash
curl -X POST http://localhost:3001/permissions/sod/simulate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conflictingPermissions": [
      ["payments.create", "payments.approve"]
    ]
  }'

# Resposta:
{
  "affectedUsers": 3,
  "violations": [...]
}
```

---

## 📊 6. Integração SIEM

### Configurar Splunk

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
```

### Testar Conexão

```bash
curl -X POST http://localhost:3001/permissions/siem/test \
  -H "Authorization: Bearer $TOKEN"

# Resposta:
{
  "success": true,
  "message": "Conexão testada com sucesso"
}
```

---

## 📈 7. Automação

### Jobs Agendados (Automático)

O sistema executa automaticamente:

- **Diário**: 2h da manhã - Auditoria completa
- **Semanal**: Domingo 3h - Auditoria detalhada + Relatório

### Alertas Automáticos

Alertas são enviados quando:
- Score de conformidade < 80%
- Anomalias críticas detectadas
- Violações de SoD encontradas
- Mudanças suspeitas identificadas

---

## 📚 8. Documentação Completa

| Documento | Localização |
|-----------|-------------|
| Guia Completo | `complete_documentation.md` |
| Resumo Final | `FINAL_SUMMARY.md` |
| Sistema Base | `README_AUDIT.md` |
| Integração | `INTEGRATION.md` |
| Funcionalidades Opcionais | `OPTIONAL_FEATURES.md` |

---

## 🎯 9. Checklist de Verificação

- [ ] Dependências instaladas
- [ ] Variáveis de ambiente configuradas
- [ ] Primeira auditoria executada
- [ ] Dashboard acessível
- [ ] Alertas testados
- [ ] Modelo ML treinado (opcional)
- [ ] SIEM configurado (opcional)
- [ ] Políticas SoD criadas (opcional)

---

## 🆘 10. Troubleshooting

### Erro: "Modelo ML não treinado"
```bash
# Treinar modelo primeiro
curl -X POST http://localhost:3001/permissions/ml/train
```

### Erro: "SIEM não configurado"
```bash
# Configurar SIEM
curl -X POST http://localhost:3001/permissions/siem/configure -d '{...}'
```

### Erro: "Dependências não instaladas"
```bash
# Reinstalar
cd apps/api && pnpm install
cd apps/web && pnpm install
```

---

## 🚀 Pronto!

Seu sistema de auditoria está **100% completo** e pronto para uso!

**Próximo passo**: Acesse o dashboard e execute sua primeira auditoria! 🎉

---

**Versão**: 2.0.0  
**Data**: 2026-01-05  
**Suporte**: Consulte a documentação completa
