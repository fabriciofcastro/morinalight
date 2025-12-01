#!/bin/bash

echo "🧪 TESTE FINAL DE LOGIN"
echo "======================="
echo ""
echo "Testando: admin@morina.com / Admin@123"
echo ""

response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@morina.com","password":"Admin@123"}')

http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
body=$(echo "$response" | grep -v "HTTP_CODE:")

echo "Status HTTP: $http_code"
echo ""

if [ "$http_code" = "200" ]; then
    echo "✅ ✅ ✅ LOGIN FUNCIONANDO! ✅ ✅ ✅"
    echo ""
    echo "Token recebido:"
    echo "$body" | grep -o '"token":"[^"]*"' | head -c 80
    echo "..."
    echo ""
    echo "🎉 PROBLEMA RESOLVIDO!"
    echo ""
    echo "📝 Use estas credenciais no navegador:"
    echo "   http://localhost:3000/login"
    echo "   Email: admin@morina.com"
    echo "   Senha: Admin@123"
else
    echo "❌ Ainda com erro $http_code"
    echo ""
    echo "Resposta:"
    echo "$body"
fi
