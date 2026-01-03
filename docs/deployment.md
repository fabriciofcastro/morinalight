# Guia Completo de Deploy - Morina Production

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Pré-requisitos](#pré-requisitos)
4. [Configuração Inicial](#configuração-inicial)
5. [Deploy](#deploy)
6. [Monitoramento](#monitoramento)
7. [Backup e Restore](#backup-e-restore)
8. [Escalabilidade](#escalabilidade)
9. [Troubleshooting](#troubleshooting)
10. [Segurança](#segurança)

## 🎯 Visão Geral

O sistema Morina está configurado para produção com:

- ✅ Alta disponibilidade (HA)
- ✅ Balanceamento de carga
- ✅ Replicação de banco de dados
- ✅ Escalabilidade horizontal
- ✅ Health checks automáticos
- ✅ Backup automatizado
- ✅ Monitoramento

## 🏗️ Arquitetura

```
                    ┌─────────────┐
                    │   Nginx     │
                    │ Load Balancer│
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐        ┌────▼────┐        ┌────▼────┐
   │  Web-1  │        │  Web-2  │        │  API-1 │
   └─────────┘        └─────────┘        └─────────┘
                                              │
                                        ┌────▼────┐
                                        │  API-2  │
                                        └────┬────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
              ┌─────▼─────┐          ┌───────▼──────┐          ┌──────▼──────┐
              │PostgreSQL │          │PostgreSQL    │          │   Redis     │
              │  Master   │◄─────────│  Replica    │          │   Master    │
              └───────────┘          └──────────────┘          └──────┬──────┘
                                                                      │
                                                              ┌──────▼──────┐
                                                              │   Redis     │
                                                              │   Replica   │
                                                              └─────────────┘
```

### Componentes

- **2x Web Servers**: Next.js com load balancing
- **2x API Servers**: Fastify com load balancing
- **2x Realtime Servers**: WebSocket com sticky sessions
- **PostgreSQL Master-Slave**: Replicação síncrona
- **Redis Master-Slave**: Cache e eventos
- **Nginx**: Load balancer e reverse proxy

## 📦 Pré-requisitos

### Hardware Mínimo

- **CPU**: 4 cores
- **RAM**: 8GB
- **Disco**: 20GB SSD
- **Rede**: 100Mbps

### Software

- Docker 20.10+
- Docker Compose 2.0+
- Git
- Make (opcional)

## ⚙️ Configuração Inicial

### 1. Clonar Repositório

```bash
git clone <repository-url>
cd morina2
```

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.production.example .env.production

# Editar variáveis
nano .env.production
```

**Variáveis Críticas:**

```env
# Senhas fortes (mínimo 16 caracteres)
POSTGRES_PASSWORD=your_strong_password_here
POSTGRES_REPLICATION_PASSWORD=your_replication_password
REDIS_PASSWORD=your_redis_password

# Secrets (mínimo 32 caracteres para JWT)
JWT_SECRET=your_jwt_secret_minimum_32_characters_long
REALTIME_SECRET=your_realtime_secret_minimum_16_chars

# URLs (ajustar para seu domínio)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_REALTIME_URL=wss://realtime.yourdomain.com
```

### 3. Configurar SSL (Recomendado)

```bash
# Criar diretório
mkdir -p deploy/nginx/ssl

# Copiar certificados
cp your-cert.pem deploy/nginx/ssl/cert.pem
cp your-key.pem deploy/nginx/ssl/key.pem

# Descomentar bloco HTTPS em deploy/nginx/conf.d/morina.conf
```

## 🚀 Deploy

### Deploy Automático

```bash
# Deploy completo
./deploy/deploy.sh production

# Ou usando Make
make deploy
```

### Deploy Manual

```bash
# 1. Build das imagens
docker compose -f docker-compose.prod.yml build

# 2. Iniciar serviços
docker compose -f docker-compose.prod.yml up -d

# 3. Verificar status
docker compose -f docker-compose.prod.yml ps

# 4. Rodar migrations
docker compose -f docker-compose.prod.yml exec api-1 \
  pnpm --filter @morina/api exec prisma migrate deploy
```

### Verificar Deploy

```bash
# Health check
curl http://localhost/health

# API health
curl http://localhost/api/health

# Status dos serviços
make health
```

## 📊 Monitoramento

### Health Checks

Todos os serviços têm health checks configurados:

```bash
# Verificar saúde geral
make health

# Ou manualmente
./deploy/monitor.sh
```

### Logs

```bash
# Todos os serviços
make logs

# Serviço específico
docker compose -f docker-compose.prod.yml logs -f api-1
docker compose -f docker-compose.prod.yml logs -f nginx
```

### Métricas

- **API Metrics**: `http://localhost/api/metrics` (Prometheus)
- **Health Endpoints**: Todos os serviços expõem `/health`

## 💾 Backup e Restore

### Backup Automático

```bash
# Criar backup
make backup

# Ou manualmente
./deploy/backup.sh
```

Backups são salvos em `./backups/` e mantidos por 7 dias.

### Restore

```bash
# Restaurar PostgreSQL
docker compose -f docker-compose.prod.yml exec -T postgres-master \
  gunzip < backups/postgres_YYYYMMDD_HHMMSS.sql.gz | \
  psql -U morina morina
```

## 📈 Escalabilidade

### Adicionar Mais Instâncias

```bash
# Escalar API
docker compose -f docker-compose.prod.yml up -d --scale api-1=3

# Escalar Web
docker compose -f docker-compose.prod.yml up -d --scale web-1=3
```

**Importante**: Atualizar `deploy/nginx/conf.d/morina.conf` com novos servidores.

### Load Balancing

- **API/Web**: Least connections (menor carga)
- **Realtime**: IP hash (sticky sessions para WebSocket)

## 🔧 Troubleshooting

### Serviço não inicia

```bash
# Ver logs
docker compose -f docker-compose.prod.yml logs [service-name]

# Verificar health
docker compose -f docker-compose.prod.yml ps

# Reiniciar serviço
docker compose -f docker-compose.prod.yml restart [service-name]
```

### Problemas de conectividade

```bash
# Verificar rede
docker network inspect morina2_morina-network

# Testar conectividade
docker compose -f docker-compose.prod.yml exec api-1 ping postgres-master
```

### Problemas de replicação

```bash
# Verificar status da replicação
docker compose -f docker-compose.prod.yml exec postgres-master \
  psql -U morina -c "SELECT * FROM pg_stat_replication;"

# Verificar lag
docker compose -f docker-compose.prod.yml exec postgres-master \
  psql -U morina -c "SELECT NOW() - pg_last_xact_replay_timestamp() AS replication_lag;"
```

### Limpar e recomeçar

```bash
# Parar e remover volumes
make clean

# Remover tudo incluindo imagens
make clean:all

# Rebuild completo
make build && make up
```

## 🔒 Segurança

### Checklist

- [ ] Todas as senhas alteradas
- [ ] SSL/TLS configurado
- [ ] Firewall configurado
- [ ] Backups automáticos
- [ ] Logs monitorados
- [ ] Updates aplicados

### Recomendações

1. **Secrets Management**: Use Docker Secrets ou gerenciador de secrets
2. **Firewall**: Apenas portas 80, 443 abertas
3. **Backups**: Automatize backups diários
4. **Updates**: Mantenha imagens atualizadas
5. **Monitoramento**: Configure alertas

### Hardening

```bash
# Limitar recursos
# Adicionar em docker-compose.prod.yml:
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
    reservations:
      cpus: '1'
      memory: 1G
```

## 📝 Comandos Úteis

```bash
# Ver ajuda
make help

# Desenvolvimento
make dev              # Iniciar dev local
make dev:stack        # Iniciar stack Docker

# Produção
make build            # Build imagens
make up               # Iniciar serviços
make down             # Parar serviços
make restart          # Reiniciar serviços

# Monitoramento
make logs             # Ver logs
make ps               # Status serviços
make health           # Health check

# Backup
make backup           # Criar backup

# Database
make db:migrate       # Rodar migrations
make db:seed          # Seed database

# Limpeza
make clean            # Limpar containers/volumes
make clean:all        # Limpar tudo
```

## 🆘 Suporte

Para problemas:

1. Verificar logs: `make logs`
2. Verificar health: `make health`
3. Consultar documentação
4. Abrir issue no repositório

## 📚 Referências

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Nginx Load Balancing](https://nginx.org/en/docs/http/load_balancing.html)
- [PostgreSQL Replication](https://www.postgresql.org/docs/current/high-availability.html)
