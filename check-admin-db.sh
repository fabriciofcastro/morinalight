#!/bin/bash

echo "🔍 Checking admin user in database..."
echo ""

PGPASSWORD=morina psql -h localhost -U morina -d morina <<EOF
SELECT 
    id,
    email,
    "displayName",
    status,
    "createdAt",
    CASE 
        WHEN "passwordHash" IS NULL THEN 'NULL'
        ELSE substring("passwordHash", 1, 20) || '...'
    END as password_hash_preview
FROM "User"
WHERE email = 'admin@morina.com';
EOF

echo ""
echo "🔍 Checking organization memberships..."
echo ""

PGPASSWORD=morina psql -h localhost -U morina -d morina <<EOF
SELECT 
    om.id,
    om.role,
    o.name as organization_name,
    u.email as user_email
FROM "OrganizationMembership" om
JOIN "User" u ON om."userId" = u.id
JOIN "Organization" o ON om."organizationId" = o.id
WHERE u.email = 'admin@morina.com';
EOF

echo ""
echo "✅ Done!"
