# 📊 Monitoramento Completo - Documentação

## Visão Geral

O sistema de monitoramento completo foi implementado integrando Prometheus (coleta de métricas), Grafana (visualização) e Alertmanager (alertas).

## Arquitetura

```
Aplicações → Prometheus → Grafana
                ↓
          Alertmanager → Notificações
```

### Componentes

1. **Prometheus**: Coleta e armazena métricas
2. **Grafana**: Visualização e dashboards
3. **Alertmanager**: Gerenciamento de alertas (configurado mas não implementado ainda)
4. **Node Exporter**: Métricas do sistema

## Funcionalidades Implementadas

### 1. Provisioning do Grafana

**Arquivos:**

- `devops/observability/grafana/provisioning/datasources/prometheus.yml`
- `devops/observability/grafana/provisioning/dashboards/default.yml`

- Datasources configurados automaticamente:
  - Prometheus (padrão)
  - Loki (para logs)
- Dashboards carregados automaticamente da pasta `/var/lib/grafana/dashboards`

### 2. Dashboards do Grafana

#### System Overview

**Arquivo:** `devops/observability/grafana/dashboards/system-overview.json`

Métricas exibidas:

- CPU Usage (%)
- Memory Usage (%)
- Disk Usage (%)
- Service Status (up/down)
- Request Rate (req/s)
- Error Rate (errors/s)

#### API Performance

**Arquivo:** `devops/observability/grafana/dashboards/api-performance.json`

Métricas exibidas:

- Request Rate por método HTTP
- Response Time (p50, p95, p99)
- Requests por Status Code (gráfico de pizza)
- Top 10 Routes por Request Rate
- Error Rate por Route

#### Business Metrics

**Arquivo:** `devops/observability/grafana/dashboards/business-metrics.json`

Métricas exibidas:

- Domain Events Published (por stream)
- Realtime Events Forwarded (por stream)
- Domain Event Stream Length
- Total Requests (últimas 24h)
- Error Rate (últimas 24h)
- Average Response Time (últimas 24h)
- P95 Response Time (últimas 24h)

### 3. Alertas do Prometheus

**Arquivo:** `devops/observability/prometheus/rules/alerts.yml`

Alertas configurados:

#### Sistema

- **HighErrorRate**: Taxa de erro acima de 5% por 5 minutos
- **HighLatency**: Latência p95 acima de 1s por 5 minutos
- **ServiceDown**: Serviço down por mais de 2 minutos
- **HighCPUUsage**: CPU acima de 80% por 10 minutos
- **HighMemoryUsage**: Memória acima de 85% por 10 minutos
- **DiskSpaceLow**: Espaço em disco abaixo de 15% por 5 minutos

#### Banco de Dados

- **DatabaseConnectionPoolExhausted**: Pool de conexões acima de 80% por 5 minutos
- **PostgreSQLReplicationLag**: Lag de replicação acima de 30s por 5 minutos

#### Redis

- **RedisDown**: Redis down por mais de 2 minutos

#### Negócio

- **HighAPIResponseTime**: Tempo de resposta p99 acima de 2s por 5 minutos
- **LowRequestRate**: Taxa de requisições abaixo de 1 req/s por 10 minutos

## Métricas Disponíveis

### Métricas da API

- `morina_api_http_requests_total`: Total de requisições HTTP
  - Labels: `method`, `route`, `status_code`
- `morina_api_http_request_duration_seconds`: Duração das requisições HTTP
  - Labels: `method`, `route`, `status_code`
  - Buckets: 0.01, 0.05, 0.1, 0.3, 0.5, 1, 3, 5, 10
- `morina_domain_events_published_total`: Total de eventos de domínio publicados
  - Labels: `stream`
- `morina_realtime_events_forwarded_total`: Total de eventos encaminhados para realtime
  - Labels: `stream`
- `morina_domain_event_stream_length`: Quantidade de mensagens por stream
  - Labels: `stream`

### Métricas do Sistema (Node Exporter)

- `node_cpu_seconds_total`: Uso de CPU
- `node_memory_*`: Uso de memória
- `node_filesystem_*`: Uso de disco
- `node_network_*`: Uso de rede

## Iniciando a Stack de Observabilidade

```bash
cd devops/observability
docker-compose -f docker-compose.observability.yml up -d
```

Serviços disponíveis:

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)
- **Loki**: http://localhost:3100
- **Jaeger**: http://localhost:16686

## Configuração do Grafana

1. Acesse http://localhost:3001
2. Login: admin / admin
3. Datasources já configurados automaticamente:
   - Prometheus (http://prometheus:9090)
   - Loki (http://loki:3100)
4. Dashboards já disponíveis:
   - System Overview
   - API Performance
   - Business Metrics

## Queries PromQL Úteis

### Request Rate

```promql
rate(morina_api_http_requests_total[5m])
```

### Error Rate

```promql
rate(morina_api_http_requests_total{status_code=~"5.."}[5m])
```

### Response Time (p95)

```promql
histogram_quantile(0.95, rate(morina_api_http_request_duration_seconds_bucket[5m]))
```

### Total Requests (últimas 24h)

```promql
sum(increase(morina_api_http_requests_total[24h]))
```

### Error Percentage

```promql
sum(rate(morina_api_http_requests_total{status_code=~"5.."}[5m])) / sum(rate(morina_api_http_requests_total[5m])) * 100
```

## Adicionando Novas Métricas

### 1. Definir métrica no código

```typescript
import { Counter, Histogram, Gauge } from "prom-client";
import { apiMetricsRegistry } from "@/core/observability/metrics";

const myCounter = new Counter({
  name: "morina_my_metric_total",
  help: "Description of my metric",
  labelNames: ["label1", "label2"],
  registers: [apiMetricsRegistry],
});

// Usar a métrica
myCounter.inc({ label1: "value1", label2: "value2" });
```

### 2. Adicionar ao dashboard

Edite o arquivo JSON do dashboard e adicione um novo painel com a query PromQL.

## Alertas

Os alertas são avaliados pelo Prometheus e podem ser encaminhados para:

- Email
- Slack
- PagerDuty
- Webhook customizado

**Nota:** Alertmanager ainda não está configurado no docker-compose. Para adicionar:

1. Adicionar serviço Alertmanager ao docker-compose
2. Configurar rotas de alertas
3. Configurar receivers (email, Slack, etc.)

## Troubleshooting

### Métricas não aparecem no Grafana

1. Verifique se Prometheus está coletando: http://localhost:9090/targets
2. Verifique se a aplicação está expondo `/metrics`: http://localhost:3333/metrics
3. Verifique se o job está configurado no `prometheus.yml`

### Dashboards não aparecem

1. Verifique se os arquivos JSON estão em `grafana/dashboards/`
2. Verifique se o provisioning está configurado: `grafana/provisioning/dashboards/default.yml`
3. Verifique logs do Grafana: `docker logs morina-grafana`

### Alertas não funcionam

1. Verifique se as regras estão sendo carregadas: http://localhost:9090/rules
2. Verifique se as queries estão corretas (teste no Prometheus)
3. Verifique se os nomes das métricas estão corretos

## Próximos Passos

1. **Alertmanager**: Configurar notificações de alertas
2. **Métricas de Negócio**: Adicionar métricas específicas do domínio
3. **Dashboards Customizados**: Criar dashboards específicos por módulo
4. **SLOs/SLIs**: Definir e monitorar Service Level Objectives
5. **Distributed Tracing**: Integrar Jaeger para tracing completo

