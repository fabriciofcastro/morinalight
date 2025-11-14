# Estratégias de Deploy

Este documento descreve as estratégias de deploy implementadas para garantir zero downtime e recuperação rápida em caso de falhas.

## Estratégias Disponíveis

### 1. Blue-Green Deployment

Deploy sem downtime usando dois ambientes idênticos (blue e green).

**Como usar:**
```bash
make deploy:blue-green
# ou
./deploy/strategies/blue-green-deploy.sh
```

**Fluxo:**
1. Build da nova versão
2. Inicialização do ambiente green em paralelo
3. Health checks do ambiente green
4. Smoke tests
5. Switch de tráfego (atualização do Nginx)
6. Monitoramento por 60 segundos
7. Manutenção do ambiente blue por 24h para rollback

**Vantagens:**
- Zero downtime
- Rollback instantâneo
- Testes completos antes do switch

**Desvantagens:**
- Requer recursos duplicados temporariamente
- Mais complexo de gerenciar

### 2. Canary Deployment

Deploy gradual com aumento progressivo de tráfego.

**Como usar:**
```bash
make deploy:canary
# ou
./deploy/strategies/canary-deploy.sh
```

**Fluxo:**
1. Build da nova versão
2. Deploy de instância canary (1 réplica)
3. Health checks
4. Rollout gradual:
   - 10% do tráfego (5 minutos)
   - 50% do tráfego (5 minutos)
   - 100% do tráfego
5. Verificação final
6. Completação do deploy

**Vantagens:**
- Detecção precoce de problemas
- Impacto limitado em caso de falha
- Rollback automático em caso de problemas

**Desvantagens:**
- Deploy mais lento
- Requer monitoramento ativo

### 3. Rollback Automático

Rollback automático em caso de falha no deploy.

**Como usar:**
```bash
make rollback
# ou
./deploy/rollback.sh
```

**Fluxo:**
1. Detecção de falha (health check ou smoke test)
2. Parada dos serviços atuais
3. Restauração da versão anterior
4. Verificação de saúde
5. Notificação de rollback

**Quando é acionado:**
- Health checks falharem
- Smoke tests falharem
- Erros críticos detectados

## Smoke Tests

Testes rápidos executados após cada deploy para validar funcionalidades essenciais.

**O que é testado:**
- Health endpoint
- API health
- Web application carrega
- Conectividade com banco de dados
- Conectividade com Redis

**Como executar manualmente:**
```bash
./deploy/strategies/smoke-tests.sh
```

## Health Checks

### Endpoints

- `/health`: Health check básico
- `/api/health`: Health check da API

### Configuração

Health checks são executados:
- A cada 60 segundos quando tudo está OK
- A cada 15 segundos quando há problemas
- Imediatamente após deploy

### Critérios de Saúde

Um serviço é considerado saudável quando:
- Responde HTTP 200 no endpoint `/health`
- Tempo de resposta < 1 segundo
- Sem erros críticos nos logs

## Procedimentos de Emergência

### Deploy com Falha

1. **Detecção Automática**: Sistema detecta falha via health checks
2. **Rollback Automático**: Script de rollback é executado
3. **Notificação**: Equipe é notificada
4. **Investigação**: Logs são analisados
5. **Correção**: Problema é corrigido
6. **Re-deploy**: Novo deploy é tentado após correção

### Rollback Manual

Se o rollback automático falhar:

```bash
# 1. Parar serviços
docker compose -f docker-compose.prod.yml stop

# 2. Restaurar backup
make restore BACKUP=./backups/ultimo_backup_valido.tar.gz

# 3. Reiniciar serviços
docker compose -f docker-compose.prod.yml up -d

# 4. Verificar saúde
make health
```

## Monitoramento Pós-Deploy

### Primeiros 5 minutos

- Monitorar logs em tempo real
- Verificar métricas de performance
- Confirmar que health checks estão passando
- Verificar funcionalidades críticas manualmente

### Primeira hora

- Monitorar métricas de erro
- Verificar uso de recursos
- Confirmar que não há degradação de performance

### Primeiras 24 horas

- Manter ambiente anterior disponível para rollback
- Monitorar métricas de negócio
- Coletar feedback de usuários

## Best Practices

### Antes do Deploy

- [ ] Revisar mudanças no código
- [ ] Executar testes localmente
- [ ] Verificar que todos os secrets estão configurados
- [ ] Confirmar que backups estão atualizados
- [ ] Notificar equipe sobre o deploy

### Durante o Deploy

- [ ] Monitorar logs em tempo real
- [ ] Estar pronto para rollback manual se necessário
- [ ] Não fazer mudanças adicionais durante o deploy

### Após o Deploy

- [ ] Verificar health checks
- [ ] Executar smoke tests
- [ ] Monitorar métricas
- [ ] Documentar qualquer problema encontrado

## Versionamento

### Semantic Versioning

O sistema usa versionamento semântico (SemVer):
- **MAJOR**: Mudanças incompatíveis
- **MINOR**: Novas funcionalidades compatíveis
- **PATCH**: Correções de bugs

### Gerenciamento de Versões

```bash
# Ver versão atual
make version

# Incrementar patch (0.0.1)
make version:patch

# Incrementar minor (0.1.0)
make version:minor

# Incrementar major (1.0.0)
make version:major
```

### Changelog

Todas as mudanças são documentadas em `CHANGELOG.md` seguindo o padrão [Keep a Changelog](https://keepachangelog.com/).

## Troubleshooting

### Deploy falha no health check

1. Verificar logs do serviço: `docker compose logs <service>`
2. Verificar conectividade: `curl http://localhost/api/health`
3. Verificar recursos: `docker stats`
4. Revisar mudanças recentes

### Smoke tests falham

1. Verificar se todos os serviços estão rodando
2. Verificar conectividade de rede
3. Verificar logs de erro
4. Executar testes manualmente

### Rollback não funciona

1. Verificar se backup existe
2. Verificar permissões de arquivos
3. Verificar espaço em disco
4. Tentar rollback manual

## Referências

- [Blue-Green Deployment](https://martinfowler.com/bliki/BlueGreenDeployment.html)
- [Canary Releases](https://martinfowler.com/bliki/CanaryRelease.html)
- [Semantic Versioning](https://semver.org/)


