#!/bin/bash

echo "🔐 Resetting password for fabricio@morina.com..."
echo ""

# Generate password hash for Admin@123 using API dependencies
HASH=$(cd apps/api && node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('Admin@123', 10));")

if [ -z "$HASH" ]; then
  echo "❌ Error generating hash. Make sure bcryptjs is installed in apps/api."
  exit 1
fi

echo "✅ New password hash generated (Password: Admin@123)"
echo ""

# Update user in database
# If psql is not available locally, it might be in a container
if command -v psql &> /dev/null; then
    PGPASSWORD=morina psql -h localhost -U morina -d morina <<EOF
UPDATE "User" 
SET "passwordHash" = '$HASH', 
    status = 'active', 
    "updatedAt" = NOW() 
WHERE email = 'fabricio@morina.com'
RETURNING id, email, "displayName", status;
EOF
else
    echo "⚠️ psql not found locally. Trying via Docker..."
    docker exec -i morina-postgres psql -U morina -d morina <<EOF
UPDATE "User" 
SET "passwordHash" = '$HASH', 
    status = 'active', 
    "updatedAt" = NOW() 
WHERE email = 'fabricio@morina.com'
RETURNING id, email, "displayName", status;
EOF
fi

echo ""
echo "✅ Password reset successfully!"
echo "📝 Login credentials:"
echo "   Email: fabricio@morina.com"
echo "   Password: Admin@123"
echo ""
