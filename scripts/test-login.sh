#!/bin/bash

# Script para testar o login do sistema Morina

echo "🧪 Testando Login do Sistema Morina"
echo "===================================="
echo ""

# Verificar se o backend está rodando
echo "📡 Verificando backend..."
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend está rodando"
else
    echo "❌ Backend NÃO está rodando"
    echo "   Execute: cd apps/api && pnpm dev"
    exit 1
fi

# Verificar se o frontend está rodando
echo "🌐 Verificando frontend..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend está rodando"
else
    echo "❌ Frontend NÃO está rodando"
    echo "   Execute: cd apps/web && pnpm dev"
    exit 1
fi

echo ""
echo "✨ Sistema pronto para teste!"
echo ""
echo "📝 Credenciais de teste:"
echo "   Email: admin@morina.com"
echo "   Senha: Admin@123"
echo ""
echo "🔗 Acesse: http://localhost:3000/login"
echo ""
