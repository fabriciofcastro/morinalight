#!/bin/bash

# Script para iniciar PostgreSQL e Redis
# Execute com: ./iniciar-servicos.sh
# Ou com sudo se necessário: sudo ./iniciar-servicos.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 Iniciando PostgreSQL e Redis...${NC}"
echo ""

# Verificar se docker compose está disponível
if command -v docker > /dev/null 2>&1 && docker compose version > /dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
elif command -v podman > /dev/null 2>&1 && podman compose version > /dev/null 2>&1; then
    COMPOSE_CMD="podman compose"
else
    echo -e "${RED}❌ Docker Compose ou Podman Compose não encontrado!${NC}"
    exit 1
fi

# Verificar se precisa de sudo
if docker ps > /dev/null 2>&1; then
    DOCKER_CMD="docker"
    COMPOSE_CMD="docker compose"
elif sudo docker ps > /dev/null 2>&1; then
    DOCKER_CMD="sudo docker"
    COMPOSE_CMD="sudo docker compose"
    echo -e "${YELLOW}⚠️  Usando sudo para Docker${NC}"
else
    echo -e "${RED}❌ Não foi possível acessar Docker${NC}"
    echo "Tente executar: sudo usermod -aG docker $USER && newgrp docker"
    exit 1
fi

# Verificar containers existentes
echo -e "${YELLOW}📋 Verificando containers existentes...${NC}"
if $DOCKER_CMD ps -a --format '{{.Names}}' | grep -q "^morina-postgres$"; then
    echo "✅ Container morina-postgres encontrado"
fi
if $DOCKER_CMD ps -a --format '{{.Names}}' | grep -q "^morina-redis$"; then
    echo "✅ Container morina-redis encontrado"
fi

# Iniciar serviços
echo ""
echo -e "${YELLOW}🔄 Iniciando PostgreSQL e Redis...${NC}"
$COMPOSE_CMD up -d postgres redis

# Aguardar PostgreSQL
echo ""
echo -e "${YELLOW}⏳ Aguardando PostgreSQL iniciar...${NC}"
for i in {1..30}; do
    if $DOCKER_CMD exec morina-postgres pg_isready -U morina > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PostgreSQL está pronto!${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Aguardar Redis
echo ""
echo -e "${YELLOW}⏳ Aguardando Redis iniciar...${NC}"
for i in {1..15}; do
    if $DOCKER_CMD exec morina-redis redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Redis está pronto!${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Verificar status
echo ""
echo -e "${YELLOW}📊 Status dos containers:${NC}"
$DOCKER_CMD ps --filter "name=morina-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo -e "${GREEN}✅ Serviços iniciados!${NC}"
echo ""
echo -e "${GREEN}📋 Próximos passos:${NC}"
echo "   1. Os serviços devem reconectar automaticamente"
echo "   2. Verifique os logs se necessário:"
echo "      $DOCKER_CMD logs morina-postgres"
echo "      $DOCKER_CMD logs morina-redis"
echo "   3. Se precisar aplicar migrations:"
echo "      cd apps/api && pnpm prisma migrate deploy"





