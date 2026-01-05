# Funcionalidades Opcionais - Guia de Uso

## 📄 Exportação de Relatórios em PDF

### Via Dashboard

1. Acesse `/admin/permissions/audit`
2. Execute uma auditoria
3. Clique no botão **"Exportar PDF"**
4. O arquivo será baixado automaticamente

### Via API

```bash
GET /permissions/audit/export/{audit-id}/pdf

curl -X GET http://localhost:3001/permissions/audit/export/{id}/pdf \
  -H "Authorization: Bearer $TOKEN" \
  --output report.pdf
```

### Formato do PDF

O PDF gerado contém:
- **Cabeçalho**: Data, ID do relatório
- **Resumo Executivo**: Score, métricas, anomalias
- **Detalhamento**: Cada categoria de anomalia
- **Recomendações**: Lista de ações sugeridas
- **Rodapé**: Paginação e data de geração

---

## 📊 Gráficos Históricos

### Via Dashboard

1. Acesse `/admin/permissions/audit`
2. Clique na aba **"Histórico"**
3. Selecione o período (7, 30 ou 90 dias)
4. Visualize os gráficos:
   - **Score de Conformidade**: Evolução ao longo do tempo
   - **Anomalias por Severidade**: Distribuição por categoria
   - **Tendência Total**: Evolução do número de anomalias

### Via API

#### Obter Dados Históricos

```bash
GET /permissions/audit/history?days=30

curl -X GET "http://localhost:3001/permissions/audit/history?days=30" \
  -H "Authorization: Bearer $TOKEN"
```

**Resposta:**
```json
{
  "snapshots": [
    {
      "id": "snapshot-1",
      "timestamp": "2026-01-01T00:00:00Z",
      "conformityScore": 85,
      "totalAnomalies": 25,
      "criticalIssues": 2,
      "highSeverityIssues": 5,
      "mediumSeverityIssues": 10,
      "lowSeverityIssues": 8
    }
  ],
  "trends": {
    "conformityScoreTrend": "improving",
    "anomaliesTrend": "decreasing"
  }
}
```

#### Comparar Duas Auditorias

```bash
GET /permissions/audit/history/compare?id1={uuid1}&id2={uuid2}

curl -X GET "http://localhost:3001/permissions/audit/history/compare?id1=xxx&id2=yyy" \
  -H "Authorization: Bearer $TOKEN"
```

**Resposta:**
```json
{
  "audit1": {
    "id": "xxx",
    "timestamp": "2026-01-01T00:00:00Z",
    "conformityScore": 80,
    "totalAnomalies": 30
  },
  "audit2": {
    "id": "yyy",
    "timestamp": "2026-01-05T00:00:00Z",
    "conformityScore": 85,
    "totalAnomalies": 25
  },
  "differences": {
    "conformityScoreDiff": 5,
    "totalAnomaliesDiff": -5,
    "categoryDifferences": [
      {
        "category": "Órfãs",
        "diff": -3,
        "percentChange": -37.5
      }
    ]
  },
  "summary": "Melhoria significativa detectada! Score aumentou e anomalias diminuíram."
}
```

---

## 🎯 Interpretação de Tendências

### Tendência de Conformidade

- **Improving** 📈: Score aumentando consistentemente
- **Stable** ➡️: Score mantendo-se estável
- **Declining** 📉: Score diminuindo (atenção necessária)

### Tendência de Anomalias

- **Decreasing** 📉: Anomalias diminuindo (bom sinal)
- **Stable** ➡️: Número de anomalias estável
- **Increasing** 📈: Anomalias aumentando (ação necessária)

---

## 🔄 Automação

### Salvamento Automático de Histórico

O sistema salva automaticamente um snapshot após cada auditoria:
- Auditorias manuais
- Auditorias agendadas (diárias/semanais)
- Auditorias via API

### Retenção de Dados

Por padrão, os dados históricos são mantidos por:
- **90 dias**: Dados detalhados
- **1 ano**: Resumos agregados

---

## 📋 Casos de Uso

### 1. Relatório Mensal para Compliance

```bash
# Executar auditoria
curl -X POST http://localhost:3001/permissions/audit/run \
  -H "Authorization: Bearer $TOKEN"

# Exportar PDF
curl -X GET http://localhost:3001/permissions/audit/export/{id}/pdf \
  -H "Authorization: Bearer $TOKEN" \
  --output relatorio-mensal-janeiro.pdf
```

### 2. Análise de Tendências Trimestrais

1. Acessar dashboard
2. Ir para aba "Histórico"
3. Selecionar 90 dias
4. Analisar gráficos de evolução
5. Identificar padrões e tendências

### 3. Comparação Antes/Depois de Correções

```bash
# Auditoria antes das correções
AUDIT_BEFORE=$(curl -X POST .../audit/run | jq -r '.id')

# Aplicar correções
curl -X POST .../audit/fix -d '{...}'

# Auditoria depois
AUDIT_AFTER=$(curl -X POST .../audit/run | jq -r '.id')

# Comparar
curl -X GET ".../audit/history/compare?id1=$AUDIT_BEFORE&id2=$AUDIT_AFTER"
```

---

## 🛠️ Troubleshooting

### PDF não é gerado

**Problema**: Erro ao gerar PDF

**Solução**:
```bash
# Verificar se pdfkit está instalado
cd apps/api
pnpm list pdfkit

# Reinstalar se necessário
pnpm add pdfkit @types/pdfkit
```

### Gráficos não aparecem

**Problema**: Gráficos não são exibidos no dashboard

**Solução**:
```bash
# Verificar se recharts está instalado
cd apps/web
pnpm list recharts

# Instalar se necessário
pnpm add recharts
```

### Dados históricos vazios

**Problema**: Nenhum dado histórico disponível

**Solução**:
- Execute algumas auditorias primeiro
- Aguarde o scheduler executar (auditorias automáticas)
- Verifique se o repositório está salvando snapshots

---

## 📚 Documentação Adicional

- [README_AUDIT.md](./README_AUDIT.md) - Guia completo de auditoria
- [INTEGRATION.md](./INTEGRATION.md) - Guia de integração
- [DOCUMENTATION.md](./DOCUMENTATION.md) - Documentação técnica
- [INSTALL_DEPENDENCIES.md](./INSTALL_DEPENDENCIES.md) - Instalação de dependências

---

## ✅ Checklist de Verificação

- [ ] PDFKit instalado no backend
- [ ] Recharts instalado no frontend
- [ ] Endpoint `/audit/export/:id/pdf` funcionando
- [ ] Endpoint `/audit/history` retornando dados
- [ ] Dashboard exibe aba "Histórico"
- [ ] Botão "Exportar PDF" aparece após auditoria
- [ ] Gráficos são renderizados corretamente
- [ ] Comparação entre auditorias funciona

---

**Última atualização**: 2026-01-05  
**Versão**: 1.1.0
