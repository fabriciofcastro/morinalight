# DevOps - Morina Light

Estrutura completa de DevOps para o projeto Morina Light.

## 📁 Estrutura de Diretórios

```
devops/
├── observability/          # Stack de observabilidade
│   ├── prometheus/         # Configuração Prometheus
│   ├── grafana/            # Dashboards e provisioning Grafana
│   ├── loki/               # Configuração Loki
│   ├── promtail/           # Configuração Promtail
│   └── alertmanager/       # Configuração Alertmanager
├── terraform/              # Infrastructure as Code
│   ├── environments/       # Configurações por ambiente
│   └── modules/            # Módulos reutilizáveis
├── kubernetes/             # Manifests Kubernetes
│   ├── base/               # Base manifests
│   ├── overlays/           # Overlays por ambiente
│   └── helm/               # Helm charts
├── monitoring/             # Scripts de monitoramento
└── performance/            # Scripts de performance testing
```

## 🚀 Quick Start

### Observability Stack

```bash
# Iniciar stack de observabilidade
cd devops/observability
docker compose -f docker-compose.observability.yml up -d

# Acessar:
# - Grafana: http://localhost:3001 (admin/admin)
# - Prometheus: http://localhost:9090
# - Loki: http://localhost:3100
# - Jaeger: http://localhost:16686
```

### CI/CD

Os pipelines estão configurados em `.github/workflows/`:

- `ci-enhanced.yml` - Pipeline completo de CI
- `cd-enhanced.yml` - Pipeline de CD

## 📊 Observability

### Métricas Disponíveis

- **Application**: Request rate, error rate, latency
- **Infrastructure**: CPU, memory, disk, network
- **Business**: User metrics, feature usage

### Dashboards Grafana

1. **System Overview** - Visão geral do sistema
2. **API Performance** - Performance da API
3. **Database Metrics** - Métricas do PostgreSQL
4. **Business Metrics** - Métricas de negócio

### Alertas

Alertas configurados para:
- Service down
- High error rate
- High latency
- Resource exhaustion
- Database issues

## 🔐 Security

### Scanning Automatizado

- **SAST**: CodeQL, SonarCloud
- **DAST**: OWASP ZAP
- **Dependency**: npm audit, Snyk
- **Container**: Trivy

### Secrets Management

- GitHub Secrets para CI/CD
- Vault para produção (recomendado)
- Environment variables com validação

## 🏗️ Infrastructure as Code

### Terraform

```bash
cd devops/terraform/environments/production
terraform init
terraform plan
terraform apply
```

### Kubernetes

```bash
# Aplicar manifests
kubectl apply -f kubernetes/base/

# Com overlays (Kustomize)
kubectl apply -k kubernetes/overlays/production/
```

## 📈 Monitoring

### Health Checks

```bash
# Verificar saúde dos serviços
./deploy/monitor.sh

# Health check específico
curl http://localhost:3333/health
```

### Logs

```bash
# Logs via Loki
# Acessar Grafana → Explore → Loki

# Logs Docker
docker compose logs -f api
```

## 🔄 Deployment

### Estratégias Disponíveis

1. **Blue-Green**
   ```bash
   ./deploy/strategies/blue-green-deploy.sh production
   ```

2. **Canary**
   ```bash
   ./deploy/strategies/canary-deploy.sh production
   ```

3. **Rolling**
   ```bash
   kubectl set image deployment/api api=image:tag
   ```

## 📚 Documentação

- [DevOps Overview](../docs/devops/DEVOPS_OVERVIEW.md)
- [CI/CD Pipeline](../docs/devops/CI_CD_PIPELINE.md)
- [Observability Guide](../docs/devops/OBSERVABILITY.md)
- [Infrastructure Guide](../docs/devops/INFRASTRUCTURE.md)

## 🛠️ Tools

- **CI/CD**: GitHub Actions
- **Containers**: Docker, Docker Compose
- **Orchestration**: Kubernetes
- **IaC**: Terraform
- **Monitoring**: Prometheus, Grafana
- **Logging**: Loki
- **Tracing**: Jaeger
- **GitOps**: ArgoCD (planejado)

## 📞 Suporte

Para questões relacionadas a DevOps:
- Abra uma issue no GitHub
- Consulte a documentação em `docs/devops/`
- Entre em contato com a equipe DevOps

---

**Última atualização**: 2025-01-01












