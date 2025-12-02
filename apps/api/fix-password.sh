#!/bin/bash

echo "🔧 Gerando hash de senha..."
HASH=$(node -p "require('bcryptjs').hashSync('Admin@123', 10)")

echo "Hash gerado: $HASH"
echo ""
echo "🔄 Atualizando banco de dados..."

cd /home/fabricio/projects/morina2/apps/api

npx prisma db execute --stdin <<EOF
UPDATE "User" 
SET "passwordHash" = '$HASH',
    status = 'active'
WHERE email = 'admin@morina.com';
EOF

echo ""
echo "✅ Senha atualizada!"
echo ""
echo "📝 Credenciais:"
echo "   Email: admin@morina.com"
echo "   Senha: Admin@123"
