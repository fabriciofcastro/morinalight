#!/bin/bash

# Script para iniciar o banco de dados PostgreSQL do Morina

echo "🚀 Iniciando PostgreSQL para Morina Light..."
echo ""

# 1. Parar containers existentes
echo "1️⃣ Parando containers existentes..."
docker-compose down 2>/dev/null || true
sleep 2

# 2. Iniciar PostgreSQL
echo ""
echo "2️⃣ Iniciando PostgreSQL..."
docker-compose up -d postgres

# 3. Aguardar PostgreSQL ficar pronto
echo ""
echo "3️⃣ Aguardando PostgreSQL iniciar (pode levar até 30 segundos)..."
for i in {1..30}; do
    if docker exec morina-postgres pg_isready -U morina >/dev/null 2>&1; then
        echo "✅ PostgreSQL está pronto!"
        break
    fi
    echo -n "."
    sleep 1
done

# 4. Verificar se está rodando
echo ""
echo "4️⃣ Verificando status..."
if docker ps | grep morina-postgres >/dev/null; then
    echo "✅ Container morina-postgres está rodando"
    docker ps | grep morina-postgres
else
    echo "❌ ERRO: Container não está rodando"
    echo "Logs do container:"
    docker logs morina-postgres 2>&1 | tail -20
    exit 1
fi

# 5. Aplicar migrations
echo ""
echo "5️⃣ Aplicando migrations do banco de dados..."
cd apps/api
pnpm prisma migrate deploy

# 6. Criar usuário admin
echo ""
echo "6️⃣ Criando usuário admin (seed)..."
pnpm prisma db seed

echo ""
echo "✅ CONCLUÍDO!"
echo ""
echo "📋 Credenciais de login:"
echo "   Email: admin@morina.com"
echo "   Senha: Admin@123"
echo ""
echo "🌐 Acesse: http://localhost:3000/login"
