#!/bin/bash

# Script para iniciar PostgreSQL e Redis do Morina (dev local)

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Wrapper para docker-compose / podman-compose
compose() {
    if command -v docker > /dev/null 2>&1 && docker compose version > /dev/null 2>&1; then
        docker compose "$@"
        return $?
    fi
    if command -v podman-compose > /dev/null 2>&1; then
        podman-compose "$@"
        return $?
    fi
    if command -v podman > /dev/null 2>&1 && podman compose version > /dev/null 2>&1; then
        podman compose "$@"
        return $?
    fi
    echo -e "${RED}❌ Erro: Docker Compose ou Podman Compose não encontrado!${NC}"
    exit 1
}

# Verificar se container está rodando
container_running() {
    local name=$1
    if command -v docker > /dev/null 2>&1; then
        docker ps --format '{{.Names}}' | grep -q "^${name}$" 2>/dev/null
    elif command -v podman > /dev/null 2>&1; then
        podman ps --format '{{.Names}}' | grep -q "^${name}$" 2>/dev/null
    else
        return 1
    fi
}

# Executar comando no container
exec_container() {
    local name=$1
    shift
    if command -v docker > /dev/null 2>&1; then
        docker exec "$name" "$@"
    elif command -v podman > /dev/null 2>&1; then
        podman exec "$name" "$@"
    else
        return 1
    fi
}

echo -e "${GREEN}🚀 Iniciando PostgreSQL e Redis para Morina Light (dev local)...${NC}"
echo ""

# 1. Parar containers existentes
echo -e "${YELLOW}1️⃣ Parando containers existentes...${NC}"
compose down 2>/dev/null || true
sleep 2

# 2. Iniciar PostgreSQL e Redis
echo ""
echo -e "${YELLOW}2️⃣ Iniciando PostgreSQL e Redis...${NC}"
compose up -d postgres redis

# 3. Aguardar PostgreSQL ficar pronto
echo ""
echo -e "${YELLOW}3️⃣ Aguardando PostgreSQL iniciar (pode levar até 30 segundos)...${NC}"
for i in {1..30}; do
    if exec_container morina-postgres pg_isready -U morina >/dev/null 2>&1; then
        echo -e "${GREEN}✅ PostgreSQL está pronto!${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Verificar se PostgreSQL realmente está rodando
if ! exec_container morina-postgres pg_isready -U morina >/dev/null 2>&1; then
    echo -e "\n${RED}❌ ERRO: PostgreSQL não iniciou corretamente${NC}"
    echo "Logs do container:"
    if command -v docker > /dev/null 2>&1; then
        docker logs morina-postgres 2>&1 | tail -20
    elif command -v podman > /dev/null 2>&1; then
        podman logs morina-postgres 2>&1 | tail -20
    fi
    exit 1
fi

# 4. Aguardar Redis ficar pronto
echo ""
echo -e "${YELLOW}4️⃣ Aguardando Redis iniciar...${NC}"
for i in {1..15}; do
    if exec_container morina-redis redis-cli ping >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Redis está pronto!${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Verificar se Redis realmente está rodando
if ! exec_container morina-redis redis-cli ping >/dev/null 2>&1; then
    echo -e "\n${RED}❌ ERRO: Redis não iniciou corretamente${NC}"
    echo "Logs do container:"
    if command -v docker > /dev/null 2>&1; then
        docker logs morina-redis 2>&1 | tail -20
    elif command -v podman > /dev/null 2>&1; then
        podman logs morina-redis 2>&1 | tail -20
    fi
    exit 1
fi

# 5. Verificar status dos containers
echo ""
echo -e "${YELLOW}5️⃣ Verificando status dos containers...${NC}"
if container_running morina-postgres && container_running morina-redis; then
    echo -e "${GREEN}✅ Containers rodando:${NC}"
    if command -v docker > /dev/null 2>&1; then
        docker ps --filter "name=morina-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    elif command -v podman > /dev/null 2>&1; then
        podman ps --filter "name=morina-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    fi
else
    echo -e "${RED}❌ ERRO: Alguns containers não estão rodando${NC}"
    exit 1
fi

# 6. Aplicar migrations
echo ""
echo -e "${YELLOW}6️⃣ Aplicando migrations do banco de dados...${NC}"
cd apps/api
pnpm prisma migrate deploy

# 7. Criar usuário admin (seed)
echo ""
echo -e "${YELLOW}7️⃣ Criando usuário admin (seed)...${NC}"
pnpm prisma db seed || echo -e "${YELLOW}⚠️  Seed pode ter falhado (normal se já existe)${NC}"

echo ""
echo -e "${GREEN}✅ CONCLUÍDO!${NC}"
echo ""
echo -e "${GREEN}📋 Credenciais de login:${NC}"
echo "   Email: admin@morina.com"
echo "   Senha: Admin@123"
echo ""
echo -e "${GREEN}🌐 URLs:${NC}"
echo "   Web: http://localhost:3000/login"
echo "   API: http://localhost:3333"
echo "   Realtime: ws://localhost:3334"
echo ""
echo -e "${YELLOW}💡 Próximo passo:${NC}"
echo "   Execute: pnpm turbo dev"
