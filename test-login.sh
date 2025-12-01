#!/bin/bash

echo "🧪 Testando endpoint de login diretamente..."
echo ""
echo "📧 Email: admin@morina.com"
echo "🔑 Senha: Admin@123"
echo ""

response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@morina.com","password":"Admin@123"}')

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

echo "📊 Status HTTP: $http_code"
echo ""
echo "📦 Resposta da API:"
echo "$body" | jq '.' 2>/dev/null || echo "$body"
echo ""

if [ "$http_code" = "200" ]; then
    echo "✅ Login bem-sucedido!"
    echo ""
    echo "🎫 Token recebido:"
    echo "$body" | jq -r '.token' 2>/dev/null | head -c 50
    echo "..."
elif [ "$http_code" = "401" ]; then
    echo "❌ Erro 401 - Credenciais inválidas"
    echo ""
    echo "Possíveis causas:"
    echo "1. Usuário não existe no banco"
    echo "2. Senha incorreta"
    echo "3. Hash da senha não corresponde"
    echo ""
    echo "Execute para verificar:"
    echo "  cd apps/api && pnpm prisma db seed"
else
    echo "⚠️  Erro inesperado: $http_code"
fi
