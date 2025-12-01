#!/bin/bash

# Script para verificar se o usuário admin existe no banco

echo "🔍 Verificando usuário admin no banco de dados..."
echo ""

cd apps/api

# Executar query SQL diretamente
npx prisma db execute --stdin <<EOF
SELECT 
    id,
    email,
    "displayName",
    status,
    "termsAcceptedAt",
    substring("passwordHash", 1, 20) as password_preview
FROM "User"
WHERE email = 'admin@morina.com';
EOF

echo ""
echo "Se não aparecer nenhum resultado acima, o usuário não existe!"
echo "Execute: cd apps/api && pnpm prisma db seed"
