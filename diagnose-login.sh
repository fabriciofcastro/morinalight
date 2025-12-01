#!/bin/bash

echo "🔍 DIAGNÓSTICO COMPLETO DO SISTEMA DE LOGIN"
echo "=============================================="
echo ""

# 1. Verificar se o banco está rodando
echo "1️⃣ Verificando banco de dados PostgreSQL..."
if docker ps | grep -q postgres; then
    echo "   ✅ PostgreSQL está rodando"
else
    echo "   ❌ PostgreSQL NÃO está rodando"
    echo "   Execute: docker-compose up -d postgres"
    exit 1
fi
echo ""

# 2. Verificar se a API está rodando
echo "2️⃣ Verificando API..."
if curl -s http://localhost:3333/health > /dev/null 2>&1; then
    echo "   ✅ API está respondendo na porta 3333"
else
    echo "   ❌ API NÃO está respondendo"
    echo "   Execute: cd apps/api && pnpm dev"
    exit 1
fi
echo ""

# 3. Verificar variáveis de ambiente
echo "3️⃣ Verificando variáveis de ambiente..."
cd apps/api
if grep -q "JWT_SECRET" .env; then
    echo "   ✅ JWT_SECRET está configurado"
else
    echo "   ❌ JWT_SECRET NÃO está configurado"
    echo "   Adicionando JWT_SECRET..."
    echo "JWT_SECRET=change-me-jwt-secret-key-at-least-32-chars-development" >> .env
    echo "   ⚠️  REINICIE A API para carregar a nova variável!"
fi

if grep -q "DATABASE_URL" .env; then
    echo "   ✅ DATABASE_URL está configurado"
else
    echo "   ❌ DATABASE_URL NÃO está configurado"
fi
cd ../..
echo ""

# 4. Verificar se o usuário existe no banco
echo "4️⃣ Verificando usuário admin no banco..."
cd apps/api
USER_EXISTS=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) as count FROM \"User\" WHERE email = 'admin@morina.com';" 2>/dev/null | grep -o '[0-9]' | head -1)

if [ "$USER_EXISTS" = "1" ]; then
    echo "   ✅ Usuário admin@morina.com existe no banco"
else
    echo "   ❌ Usuário admin@morina.com NÃO existe"
    echo "   Executando seed..."
    pnpm prisma db seed
fi
cd ../..
echo ""

# 5. Testar login diretamente na API
echo "5️⃣ Testando login na API..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@morina.com","password":"Admin@123"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Login bem-sucedido!"
    echo "   Token recebido: $(echo "$BODY" | jq -r '.token' 2>/dev/null | head -c 30)..."
    echo ""
    echo "🎉 TUDO ESTÁ FUNCIONANDO!"
    echo ""
    echo "📝 Credenciais:"
    echo "   Email: admin@morina.com"
    echo "   Senha: Admin@123"
    echo ""
    echo "💡 Tente fazer login no navegador agora!"
elif [ "$HTTP_CODE" = "401" ]; then
    echo "   ❌ Erro 401 - Credenciais inválidas"
    echo "   Resposta: $BODY"
    echo ""
    echo "🔧 PROBLEMA IDENTIFICADO: Usuário ou senha incorretos"
    echo ""
    echo "Executando correção..."
    cd apps/api
    pnpm prisma db seed
    cd ../..
    echo ""
    echo "✅ Seed executado. Teste novamente!"
else
    echo "   ⚠️  Erro inesperado: HTTP $HTTP_CODE"
    echo "   Resposta: $BODY"
fi

echo ""
echo "=============================================="
echo "Diagnóstico concluído!"
