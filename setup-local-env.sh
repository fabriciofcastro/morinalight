#!/bin/bash

# Script para criar arquivos .env necessários para desenvolvimento local

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🔧 Configurando arquivos .env para desenvolvimento local...${NC}"
echo ""

# 1. Criar .env na raiz (se não existir)
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}1️⃣ Criando .env na raiz...${NC}"
    cat > .env << 'EOF'
# Configurações para desenvolvimento local
REALTIME_SECRET=dev_realtime_secret_change_me_in_production
REALTIME_PENDING_ALERT_THRESHOLD=100
REALTIME_PENDING_ALERT_INTERVAL_MS=30000
DATABASE_URL=postgresql://morina:morina@localhost:5432/morina
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-jwt-secret-key-change-me-in-production-min-32-chars
NEXT_PUBLIC_API_URL=http://localhost:3333
NEXT_PUBLIC_REALTIME_URL=ws://localhost:3334
NEXT_PUBLIC_ORG_ID=org-demo
NEXT_PUBLIC_ACTOR_ID=user-demo
EOF
    echo -e "${GREEN}✅ .env criado${NC}"
else
    echo -e "${YELLOW}1️⃣ .env já existe na raiz (mantido)${NC}"
fi

# 2. Criar apps/realtime/.env (se não existir)
if [ ! -f "apps/realtime/.env" ]; then
    echo -e "${YELLOW}2️⃣ Criando apps/realtime/.env...${NC}"
    cat > apps/realtime/.env << 'EOF'
REALTIME_PORT=3334
REALTIME_HOST=0.0.0.0
REDIS_URL=redis://localhost:6379
# Redis sem senha para dev local (docker-compose.yml sobe sem senha)
REALTIME_SECRET=dev_realtime_secret_change_me_in_production
REALTIME_STREAM=realtime.catalogo
REALTIME_PENDING_ALERT_THRESHOLD=100
REALTIME_PENDING_ALERT_INTERVAL_MS=30000
EOF
    echo -e "${GREEN}✅ apps/realtime/.env criado${NC}"
else
    echo -e "${YELLOW}2️⃣ apps/realtime/.env já existe (mantido)${NC}"
fi

echo ""
echo -e "${GREEN}✅ Configuração concluída!${NC}"
echo ""
echo -e "${YELLOW}💡 Próximos passos:${NC}"
echo "   1. Execute: ./start-database.sh"
echo "   2. Execute: pnpm turbo dev"
echo ""


