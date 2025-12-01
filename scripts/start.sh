#!/bin/bash

echo "🚀 Iniciando Sistema Morina..."
echo ""

# 1. Iniciar Docker
echo "1️⃣ Iniciando PostgreSQL..."
docker-compose up -d postgres redis
sleep 5

# 2. Verificar Docker
echo "2️⃣ Verificando containers..."
docker ps

# 3. Aguardar banco
echo "3️⃣ Aguardando PostgreSQL..."
sleep 10

# 4. Rodar migrations
echo "4️⃣ Rodando migrations..."
cd apps/api && pnpm prisma migrate deploy && cd ../..

# 5. Seed (opcional)
echo "5️⃣ Populando dados..."
cd apps/api && pnpm prisma db seed && cd ../..

# 6. Iniciar serviços
echo "6️⃣ Iniciando serviços..."
echo "   - API: http://localhost:3333"
echo "   - Frontend: http://localhost:3000"
echo ""
echo "Execute em terminais separados:"
echo "  Terminal 1: cd apps/api && pnpm dev"
echo "  Terminal 2: cd apps/web && pnpm dev"
echo ""
echo "✅ Pronto! Acesse: http://localhost:3000/login"
