#!/bin/bash

# Script completo para iniciar PostgreSQL e Redis
# Execute: ./iniciar-banco-completo.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🚀 Iniciando PostgreSQL e Redis - Morina Light      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar Docker
if ! command -v docker > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker não encontrado!${NC}"
    exit 1
fi

# Verificar permissões
if ! docker ps > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Sem permissões do Docker. Tentando com sudo...${NC}"
    DOCKER_CMD="sudo docker"
    COMPOSE_CMD="sudo docker compose"
else
    DOCKER_CMD="docker"
    COMPOSE_CMD="docker compose"
fi

# Etapa 1: Parar containers existentes
echo -e "${YELLOW}1️⃣ Parando containers existentes (se houver)...${NC}"
$COMPOSE_CMD down 2>/dev/null || true
sleep 2

# Etapa 2: Iniciar PostgreSQL e Redis
echo ""
echo -e "${YELLOW}2️⃣ Iniciando PostgreSQL e Redis...${NC}"
$COMPOSE_CMD up -d postgres redis

# Etapa 3: Aguardar PostgreSQL
echo ""
echo -e "${YELLOW}3️⃣ Aguardando PostgreSQL iniciar (pode levar até 30 segundos)...${NC}"
POSTGRES_READY=false
for i in {1..30}; do
    if $DOCKER_CMD exec morina-postgres pg_isready -U morina > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PostgreSQL está pronto!${NC}"
        POSTGRES_READY=true
        break
    fi
    echo -n "."
    sleep 1
done

if [ "$POSTGRES_READY" = false ]; then
    echo ""
    echo -e "${RED}❌ PostgreSQL não iniciou corretamente${NC}"
    echo "Logs:"
    $DOCKER_CMD logs morina-postgres 2>&1 | tail -10
    exit 1
fi

# Etapa 4: Aguardar Redis
echo ""
echo -e "${YELLOW}4️⃣ Aguardando Redis iniciar...${NC}"
REDIS_READY=false
for i in {1..15}; do
    if $DOCKER_CMD exec morina-redis redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Redis está pronto!${NC}"
        REDIS_READY=true
        break
    fi
    echo -n "."
    sleep 1
done

if [ "$REDIS_READY" = false ]; then
    echo ""
    echo -e "${RED}❌ Redis não iniciou corretamente${NC}"
    echo "Logs:"
    $DOCKER_CMD logs morina-redis 2>&1 | tail -10
    exit 1
fi

# Etapa 5: Verificar status
echo ""
echo -e "${YELLOW}5️⃣ Status dos containers:${NC}"
$DOCKER_CMD ps --filter "name=morina-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Etapa 6: Verificar conexões locais
echo ""
echo -e "${YELLOW}6️⃣ Verificando conexões locais...${NC}"
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL acessível em localhost:5432${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL não acessível via pg_isready (mas pode estar funcionando)${NC}"
fi

if redis-cli -h localhost -p 6379 ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis acessível em localhost:6379${NC}"
else
    echo -e "${YELLOW}⚠️  Redis não acessível via redis-cli (mas pode estar funcionando)${NC}"
fi

# Etapa 7: Aplicar migrations
echo ""
echo -e "${YELLOW}7️⃣ Aplicando migrations do banco de dados...${NC}"
cd apps/api
export PNPM_HOME="$HOME/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"

MIGRATIONS_STATUS=$(pnpm prisma migrate status 2>&1 | grep -c "not yet been applied" || echo "0")
if [ "$MIGRATIONS_STATUS" -gt 0 ]; then
    echo "Aplicando migrations pendentes..."
    pnpm prisma migrate deploy
    echo -e "${GREEN}✅ Migrations aplicadas!${NC}"
else
    echo -e "${GREEN}✅ Todas as migrations já estão aplicadas${NC}"
fi

# Etapa 8: Verificar conexão Prisma
echo ""
echo -e "${YELLOW}8️⃣ Verificando conexão com Prisma...${NC}"
if pnpm prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Prisma conectado ao banco!${NC}"
else
    echo -e "${YELLOW}⚠️  Não foi possível testar conexão Prisma (mas pode estar funcionando)${NC}"
fi

# Resumo final
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  ✅ CONCLUÍDO COM SUCESSO!                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}📋 Serviços rodando:${NC}"
echo "   • PostgreSQL: localhost:5432"
echo "   • Redis: localhost:6379"
echo ""
echo -e "${GREEN}🌐 URLs da aplicação:${NC}"
echo "   • Web: http://localhost:3000"
echo "   • API: http://localhost:3333"
echo "   • Swagger: http://localhost:3333/docs"
echo "   • Realtime: ws://localhost:3334"
echo ""
echo -e "${GREEN}🔐 Credenciais padrão:${NC}"
echo "   • Email: admin@morina.com"
echo "   • Senha: Admin@123"
echo ""
echo -e "${YELLOW}💡 Os serviços devem reconectar automaticamente!${NC}"
echo "   Verifique os logs do pnpm dev para confirmar."









