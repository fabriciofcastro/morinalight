# 🚀 Guia Rápido de Deploy - Morina

## Deploy Rápido (5 minutos)

```bash
# 1. Configurar variáveis
cp .env.production.example .env.production
nano .env.production  # Editar senhas e secrets

# 2. Deploy
./deploy/deploy.sh production

# 3. Verificar
make health
```

## Comandos Essenciais

```bash
make help          # Ver todos os comandos
make deploy        # Deploy completo
make health        # Verificar saúde
make logs          # Ver logs
make backup        # Criar backup
```

## Estrutura de Deploy

```
morina2/
├── deploy/
│   ├── nginx/          # Configuração do load balancer
│   ├── postgres/       # Scripts de replicação
│   ├── deploy.sh       # Script de deploy
│   ├── backup.sh       # Script de backup
│   └── monitor.sh      # Script de monitoramento
├── docker-compose.prod.yml  # Orquestração produção
├── apps/
│   ├── api/Dockerfile
│   ├── web/Dockerfile
│   └── realtime/Dockerfile
└── Makefile            # Comandos úteis
```

## Arquitetura

- **2x API Servers** (load balanced)
- **2x Web Servers** (load balanced)
- **2x Realtime Servers** (sticky sessions)
- **PostgreSQL Master-Slave**
- **Redis Master-Slave**
- **Nginx Load Balancer**

## Documentação Completa

Ver `docs/deployment.md` para documentação detalhada.

