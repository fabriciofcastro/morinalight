#!/bin/bash

# Script para verificar status do Docker e containers do Morina Light

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Verificação Docker - Morina Light Backend${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# 1. Verificar se Docker está instalado
echo -e "${YELLOW}1️⃣ Verificando instalação do Docker...${NC}"
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}✅ Docker instalado: ${DOCKER_VERSION}${NC}"
else
    echo -e "${RED}❌ Docker não está instalado${NC}"
    exit 1
fi

# 2. Verificar se Docker daemon está rodando
echo ""
echo -e "${YELLOW}2️⃣ Verificando Docker daemon...${NC}"
if systemctl is-active --quiet docker; then
    echo -e "${GREEN}✅ Docker daemon está ativo${NC}"
else
    echo -e "${RED}❌ Docker daemon não está ativo${NC}"
    echo -e "${YELLOW}   Execute: sudo systemctl start docker${NC}"
    exit 1
fi

# 3. Verificar permissões
echo ""
echo -e "${YELLOW}3️⃣ Verificando permissões...${NC}"
if docker ps &> /dev/null; then
    echo -e "${GREEN}✅ Permissões OK - pode usar docker sem sudo${NC}"
    USE_SUDO=""
else
    echo -e "${YELLOW}⚠️  Precisa de sudo para usar docker${NC}"
    echo -e "${YELLOW}   Para corrigir: sudo usermod -aG docker \$USER${NC}"
    USE_SUDO="sudo "
fi

# 4. Verificar containers do Morina
echo ""
echo -e "${YELLOW}4️⃣ Verificando containers do Morina...${NC}"
CONTAINERS=$(${USE_SUDO}docker ps -a --filter "name=morina-" --format "{{.Names}}" 2>/dev/null)

if [ -z "$CONTAINERS" ]; then
    echo -e "${RED}❌ Nenhum container do Morina encontrado${NC}"
    echo -e "${YELLOW}   Execute: ./start-database.sh${NC}"
else
    echo -e "${GREEN}✅ Containers encontrados:${NC}"
    ${USE_SUDO}docker ps -a --filter "name=morina-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
fi

# 5. Verificar containers rodando
echo ""
echo -e "${YELLOW}5️⃣ Status dos containers principais...${NC}"

check_container() {
    local name=$1
    local port=$2
    
    if ${USE_SUDO}docker ps --format "{{.Names}}" | grep -q "^${name}$"; then
        echo -e "${GREEN}✅ ${name} - RODANDO (porta ${port})${NC}"
        return 0
    elif ${USE_SUDO}docker ps -a --format "{{.Names}}" | grep -q "^${name}$"; then
        echo -e "${YELLOW}⚠️  ${name} - PARADO${NC}"
        return 1
    else
        echo -e "${RED}❌ ${name} - NÃO ENCONTRADO${NC}"
        return 2
    fi
}

check_container "morina-postgres" "5432"
POSTGRES_STATUS=$?

check_container "morina-redis" "6379"
REDIS_STATUS=$?

check_container "morina-api" "3333"
API_STATUS=$?

check_container "morina-realtime" "3334"
REALTIME_STATUS=$?

check_container "morina-web" "3000"
WEB_STATUS=$?

# 6. Verificar conectividade (se containers estão rodando)
echo ""
echo -e "${YELLOW}6️⃣ Verificando conectividade...${NC}"

if [ $POSTGRES_STATUS -eq 0 ]; then
    if ${USE_SUDO}docker exec morina-postgres pg_isready -U morina &> /dev/null; then
        echo -e "${GREEN}✅ PostgreSQL - Aceitando conexões${NC}"
    else
        echo -e "${RED}❌ PostgreSQL - Não está aceitando conexões${NC}"
    fi
fi

if [ $REDIS_STATUS -eq 0 ]; then
    if ${USE_SUDO}docker exec morina-redis redis-cli ping &> /dev/null; then
        echo -e "${GREEN}✅ Redis - Respondendo${NC}"
    else
        echo -e "${RED}❌ Redis - Não está respondendo${NC}"
    fi
fi

if [ $API_STATUS -eq 0 ]; then
    if curl -s http://localhost:3333/health &> /dev/null; then
        echo -e "${GREEN}✅ API - Health check OK${NC}"
    else
        echo -e "${YELLOW}⚠️  API - Health check falhou (pode estar iniciando)${NC}"
    fi
fi

# 7. Verificar volumes
echo ""
echo -e "${YELLOW}7️⃣ Verificando volumes...${NC}"
VOLUMES=$(${USE_SUDO}docker volume ls --filter "name=morina" --format "{{.Name}}" 2>/dev/null)
if [ -z "$VOLUMES" ]; then
    echo -e "${YELLOW}⚠️  Nenhum volume encontrado${NC}"
else
    echo -e "${GREEN}✅ Volumes encontrados:${NC}"
    ${USE_SUDO}docker volume ls --filter "name=morina" --format "table {{.Name}}\t{{.Driver}}"
fi

# 8. Resumo e recomendações
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Resumo e Recomendações${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

if [ $POSTGRES_STATUS -eq 0 ] && [ $REDIS_STATUS -eq 0 ]; then
    echo -e "${GREEN}✅ Banco de dados (PostgreSQL + Redis) está rodando${NC}"
    echo -e "${GREEN}   Você pode iniciar a aplicação com: pnpm turbo dev${NC}"
elif [ $POSTGRES_STATUS -eq 2 ] || [ $REDIS_STATUS -eq 2 ]; then
    echo -e "${RED}❌ Containers não encontrados${NC}"
    echo -e "${YELLOW}   Execute: ./start-database.sh${NC}"
else
    echo -e "${YELLOW}⚠️  Containers existem mas estão parados${NC}"
    echo -e "${YELLOW}   Execute: ${USE_SUDO}docker start morina-postgres morina-redis${NC}"
fi

echo ""
echo -e "${BLUE}📚 Documentação:${NC}"
echo -e "   - Verificação completa: ~/.gemini/antigravity/brain/e9094757-2995-482a-ab12-a8454f4b7b58/verificacao_docker_backend.md"
echo -e "   - Guia de inicialização: ./INICIAR_BANCO_DADOS.md"
echo -e "   - README: ./README.md"
echo ""
