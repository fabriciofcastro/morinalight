#!/bin/bash

# Gerar hash da senha Admin@123
HASH=$(cd apps/api && node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('Admin@123', 10));")

echo "Hash gerado: $HASH"
echo ""
echo "Criando usuário admin no banco..."

cd apps/api
PGPASSWORD=morina psql -h localhost -U morina -d morina <<EOF
-- Criar organização
INSERT INTO "Organization" (id, name, slug, "createdAt", "updatedAt")
VALUES ('org-demo', 'Morina Demo', 'morina-demo', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Criar usuário admin
INSERT INTO "User" (
    id,
    email,
    "displayName",
    "passwordHash",
    status,
    "termsAcceptedAt",
    "createdAt",
    "updatedAt"
)
VALUES (
    gen_random_uuid(),
    'admin@morina.com',
    'Administrador',
    '$HASH',
    'active',
    NOW(),
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    "passwordHash" = EXCLUDED."passwordHash",
    "updatedAt" = NOW()
RETURNING id, email, "displayName";

-- Criar membership
INSERT INTO "OrganizationMembership" (
    id,
    "userId",
    "organizationId",
    role,
    "createdAt",
    "updatedAt"
)
SELECT 
    gen_random_uuid(),
    u.id,
    'org-demo',
    'owner',EX
    NOW(),
    NOW()
FROM "User" u
WHERE u.email = 'admin@morina.com'
ON CONFLICT DO NOTHING;

-- Verificar
SELECT email, status FROM "User" WHERE email = 'admin@morina.com';
EOF

echo ""
echo "✅ Usuário criado!"
echo ""
echo "Testando login..."
sleep 2
curl -s -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@morina.com","password":"Admin@123"}' | head -c 200
echo ""
