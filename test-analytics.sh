#!/bin/bash

echo "🔍 Diagnóstico de Analytics API"
echo "================================"
echo ""

# 1. Verificar se o servidor API está rodando
echo "1️⃣ Verificando servidor API..."
if lsof -i :4000 | grep -q LISTEN; then
    echo "✅ Servidor API rodando na porta 4000"
else
    echo "❌ Servidor API NÃO está rodando na porta 4000"
    echo "   Execute: cd apps/api && pnpm dev"
    exit 1
fi

echo ""

# 2. Verificar dados no banco
echo "2️⃣ Verificando dados no banco..."
cd apps/api

echo "   📊 SalesMetric:"
npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"SalesMetric\";" 2>/dev/null | grep -o '[0-9]*' | tail -1 || echo "   Erro ao consultar"

echo "   📦 InventoryMetric:"
npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"InventoryMetric\";" 2>/dev/null | grep -o '[0-9]*' | tail -1 || echo "   Erro ao consultar"

echo "   👥 CustomerMetric:"
npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"CustomerMetric\";" 2>/dev/null | grep -o '[0-9]*' | tail -1 || echo "   Erro ao consultar"

cd ../..

echo ""

# 3. Testar endpoints
echo "3️⃣ Testando endpoints da API..."

echo "   GET /analytics/dashboard/kpis"
curl -s -H "x-org-id: org-demo" http://localhost:4000/analytics/dashboard/kpis | jq '.' 2>/dev/null || echo "   ❌ Erro"

echo ""
echo "   GET /analytics/sales?period=30d"
curl -s -H "x-org-id: org-demo" "http://localhost:4000/analytics/sales?period=30d" | jq '. | length' 2>/dev/null || echo "   ❌ Erro"

echo ""
echo "✅ Diagnóstico completo!"
