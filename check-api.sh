#!/bin/bash

# Script para verificar se a API está rodando e acessível

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:3333}"

echo -e "${YELLOW}🔍 Verificando status da API...${NC}"
echo ""

# 1. Verificar se a porta está em uso
echo -e "${YELLOW}1️⃣ Verificando porta 3333...${NC}"
if command -v ss > /dev/null 2>&1; then
    PORT_CHECK=$(ss -tuln | grep ':3333' || true)
elif command -v netstat > /dev/null 2>&1; then
    PORT_CHECK=$(netstat -tuln | grep ':3333' || true)
else
    PORT_CHECK=""
fi

if [ -n "$PORT_CHECK" ]; then
    echo -e "${GREEN}✅ Porta 3333 está em uso${NC}"
else
    echo -e "${RED}❌ Porta 3333 não está em uso (API provavelmente não está rodando)${NC}"
fi

# 2. Tentar conectar na API
echo ""
echo -e "${YELLOW}2️⃣ Tentando conectar em ${API_URL}...${NC}"
if command -v curl > /dev/null 2>&1; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "${API_URL}/health" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ API está respondendo (HTTP ${HTTP_CODE})${NC}"
        echo ""
        echo -e "${GREEN}📋 Resposta do /health:${NC}"
        curl -s "${API_URL}/health" | head -5
    elif [ "$HTTP_CODE" = "000" ]; then
        echo -e "${RED}❌ Não foi possível conectar na API${NC}"
        echo -e "${YELLOW}   Possíveis causas:${NC}"
        echo "   - API não está rodando (execute: pnpm turbo dev)"
        echo "   - Firewall bloqueando a porta 3333"
        echo "   - API está rodando em outro host/porta"
    else
        echo -e "${YELLOW}⚠️  API respondeu com HTTP ${HTTP_CODE}${NC}"
    fi
elif command -v wget > /dev/null 2>&1; then
    if wget -q --spider --timeout=5 "${API_URL}/health" 2>/dev/null; then
        echo -e "${GREEN}✅ API está respondendo${NC}"
    else
        echo -e "${RED}❌ Não foi possível conectar na API${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  curl ou wget não encontrado. Não é possível testar conexão HTTP.${NC}"
fi

# 3. Verificar processos Node
echo ""
echo -e "${YELLOW}3️⃣ Verificando processos Node.js rodando...${NC}"
NODE_PROCS=$(pgrep -f "node.*api|tsx.*api|turbo.*dev" | wc -l)
if [ "$NODE_PROCS" -gt 0 ]; then
    echo -e "${GREEN}✅ Encontrados ${NODE_PROCS} processo(s) Node.js${NC}"
    echo ""
    echo -e "${YELLOW}Processos relacionados:${NC}"
    ps aux | grep -E "node.*api|tsx.*api|turbo.*dev" | grep -v grep | head -3
else
    echo -e "${RED}❌ Nenhum processo Node.js encontrado${NC}"
    echo -e "${YELLOW}   Execute: pnpm turbo dev${NC}"
fi

# 4. Verificar variáveis de ambiente
echo ""
echo -e "${YELLOW}4️⃣ Verificando variáveis de ambiente...${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ Arquivo .env encontrado${NC}"
    if grep -q "NEXT_PUBLIC_API_URL" .env 2>/dev/null; then
        API_URL_ENV=$(grep "NEXT_PUBLIC_API_URL" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
        echo -e "${GREEN}   NEXT_PUBLIC_API_URL=${API_URL_ENV}${NC}"
    else
        echo -e "${YELLOW}   NEXT_PUBLIC_API_URL não encontrado no .env (usando default: http://localhost:3333)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado${NC}"
    echo -e "${YELLOW}   Execute: ./setup-local-env.sh${NC}"
fi

echo ""
echo -e "${GREEN}💡 Próximos passos:${NC}"
echo "   1. Se a API não está rodando: pnpm turbo dev"
echo "   2. Se o banco não está rodando: ./start-database.sh"
echo "   3. Se precisa configurar .env: ./setup-local-env.sh"
echo ""













