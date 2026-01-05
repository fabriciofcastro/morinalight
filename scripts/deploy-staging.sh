#!/bin/bash

# Morina - Staging Deployment Script
# Automated deployment to staging environment

set -e

echo "🚀 Morina - Staging Deployment"
echo "==============================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
STAGING_SERVER="staging.morina.ai"
STAGING_USER="deploy"
APP_DIR="/var/www/morina"

echo "📋 Pre-deployment Checklist"
echo "----------------------------"

# Check 1: All tests passing
echo -n "Running tests... "
if ./scripts/test-security.sh > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo "❌ Tests failed. Aborting deployment."
    exit 1
fi

# Check 2: Build successful
echo -n "Building projects... "
cd apps/api && npm run build > /dev/null 2>&1
cd ../web && npm run build > /dev/null 2>&1
cd ../..
echo -e "${GREEN}✓${NC}"

# Check 3: Environment variables
echo -n "Checking environment variables... "
if [ -f apps/api/.env.staging ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠️  .env.staging not found${NC}"
fi

echo ""
echo "📦 Deploying to Staging"
echo "-----------------------"

# Step 1: Create backup
echo "1. Creating backup..."
ssh $STAGING_USER@$STAGING_SERVER "cd $APP_DIR && tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz ."

# Step 2: Upload files
echo "2. Uploading files..."
rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.env' \
    ./ $STAGING_USER@$STAGING_SERVER:$APP_DIR/

# Step 3: Install dependencies
echo "3. Installing dependencies..."
ssh $STAGING_USER@$STAGING_SERVER "cd $APP_DIR/apps/api && npm install --production"
ssh $STAGING_USER@$STAGING_SERVER "cd $APP_DIR/apps/web && npm install --production"

# Step 4: Run migrations
echo "4. Running database migrations..."
ssh $STAGING_USER@$STAGING_SERVER "cd $APP_DIR/apps/api && npx prisma migrate deploy"

# Step 5: Restart services
echo "5. Restarting services..."
ssh $STAGING_USER@$STAGING_SERVER "pm2 restart morina-api"
ssh $STAGING_USER@$STAGING_SERVER "pm2 restart morina-web"

# Step 6: Health check
echo "6. Running health check..."
sleep 5
if curl -s https://staging.morina.ai/health | grep -q "ok"; then
    echo -e "${GREEN}✓ Deployment successful!${NC}"
else
    echo "❌ Health check failed. Rolling back..."
    ssh $STAGING_USER@$STAGING_SERVER "cd $APP_DIR && pm2 restart all"
    exit 1
fi

echo ""
echo "✅ Staging Deployment Complete!"
echo ""
echo "URL: https://staging.morina.ai"
echo "Logs: ssh $STAGING_USER@$STAGING_SERVER 'pm2 logs'"
