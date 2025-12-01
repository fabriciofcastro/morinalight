#!/bin/bash

echo "🔐 Creating admin user..."
echo ""

# Generate password hash for Admin@123
HASH=$(node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('Admin@123', 10));")

echo "✅ Password hash generated"
echo ""

# Create user in database
PGPASSWORD=morina psql -h localhost -U morina -d morina <<EOF
-- Create organization if not exists
INSERT INTO "Organization" (id, name, slug, "createdAt", "updatedAt")
VALUES ('org-demo', 'Morina Demo', 'morina-demo', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create or update admin user
INSERT INTO "User" (
    id,
    email,
    "displayName",
    "passwordHash",
    status,
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
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    "passwordHash" = EXCLUDED."passwordHash",
    status = 'active',
    "updatedAt" = NOW()
RETURNING id, email, "displayName", status;

-- Create membership
INSERT INTO "OrganizationMembership" (
    id,
    "userId",
    "organizationId",
    role,
    "createdAt"
)
SELECT 
    gen_random_uuid(),
    u.id,
    'org-demo',
    'owner',
    NOW()
FROM "User" u
WHERE u.email = 'admin@morina.com'
ON CONFLICT DO NOTHING;

-- Verify
SELECT 
    u.email,
    u."displayName",
    u.status,
    o.name as organization,
    om.role
FROM "User" u
JOIN "OrganizationMembership" om ON om."userId" = u.id
JOIN "Organization" o ON o.id = om."organizationId"
WHERE u.email = 'admin@morina.com';
EOF

echo ""
echo "✅ Admin user created/updated!"
echo ""
echo "📝 Login credentials:"
echo "   Email: admin@morina.com"
echo "   Password: Admin@123"
echo ""
