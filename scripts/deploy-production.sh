#!/bin/bash

# Morina - Production Deployment Script
# Automated deployment to production with safety checks

set -e

echo "🚀 Morina - Production Deployment"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
PROD_SERVER="morina.ai"
PROD_USER="deploy"
APP_DIR="/var/www/morina"

echo -e "${YELLOW}⚠️  WARNING: Production Deployment${NC}"
echo "This will deploy to PRODUCTION environment."
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo "📋 Pre-deployment Checklist"
echo "----------------------------"

# Check 1: All tests passing
echo -n "Running full test suite... "
if ./scripts/test-security.sh > /dev/null 2>&1 && ./scripts/test-e2e.sh > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}❌ Tests failed. Aborting deployment.${NC}"
    exit 1
fi

# Check 2: Conformance score
echo -n "Checking conformance score... "
SCORE=$(./scripts/test-security.sh 2>&1 | grep "CONFORMANCE SCORE" | awk '{print $3}' | cut -d'/' -f1)
if [ "$SCORE" -ge 95 ]; then
    echo -e "${GREEN}✓ Score: $SCORE/100${NC}"
else
    echo -e "${RED}❌ Score too low: $SCORE/100${NC}"
    exit 1
fi

# Check 3: Build successful
echo -n "Building projects... "
cd apps/api && npm run build > /dev/null 2>&1
cd ../web && npm run build > /dev/null 2>&1
cd ../..
echo -e "${GREEN}✓${NC}"

# Check 4: Environment variables
echo -n "Checking production environment... "
if [ -f apps/api/.env.production ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}❌ .env.production not found${NC}"
    exit 1
fi

# Check 5: Staging validation
echo -n "Validating staging deployment... "
if curl -s https://staging.morina.ai/health | grep -q "ok"; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠️  Staging not responding${NC}"
fi

echo ""
echo "📦 Deploying to Production"
echo "--------------------------"

# Step 1: Create backup
echo "1. Creating backup..."
ssh $PROD_USER@$PROD_SERVER "cd $APP_DIR && tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz ."

# Step 2: Enable maintenance mode
echo "2. Enabling maintenance mode..."
ssh $PROD_USER@$PROD_SERVER "touch $APP_DIR/maintenance.flag"

# Step 3: Upload files
echo "3. Uploading files..."
rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.env' \
    ./ $PROD_USER@$PROD_SERVER:$APP_DIR/

# Step 4: Install dependencies
echo "4. Installing dependencies..."
ssh $PROD_USER@$PROD_SERVER "cd $APP_DIR/apps/api && npm install --production"
ssh $PROD_USER@$PROD_SERVER "cd $APP_DIR/apps/web && npm install --production"

# Step 5: Run migrations
echo "5. Running database migrations..."
ssh $PROD_USER@$PROD_SERVER "cd $APP_DIR/apps/api && npx prisma migrate deploy"

# Step 6: Restart services (zero-downtime)
echo "6. Restarting services..."
ssh $PROD_USER@$PROD_SERVER "pm2 reload morina-api"
ssh $PROD_USER@$PROD_SERVER "pm2 reload morina-web"

# Step 7: Disable maintenance mode
echo "7. Disabling maintenance mode..."
ssh $PROD_USER@$PROD_SERVER "rm -f $APP_DIR/maintenance.flag"

# Step 8: Health check
echo "8. Running health check..."
sleep 10

HEALTH_CHECK_PASSED=false
for i in {1..5}; do
    if curl -s https://morina.ai/health | grep -q "ok"; then
        HEALTH_CHECK_PASSED=true
        break
    fi
    sleep 2
done

if [ "$HEALTH_CHECK_PASSED" = true ]; then
    echo -e "${GREEN}✓ Deployment successful!${NC}"
else
    echo -e "${RED}❌ Health check failed. Rolling back...${NC}"
    
    # Rollback
    ssh $PROD_USER@$PROD_SERVER "cd $APP_DIR && \
        tar -xzf \$(ls -t backup-*.tar.gz | head -1) && \
        pm2 restart all"
    
    exit 1
fi

# Step 9: Smoke tests
echo "9. Running smoke tests..."
if curl -s https://morina.ai/api/auth/csrf-token | grep -q "token"; then
    echo -e "${GREEN}✓ Smoke tests passed${NC}"
else
    echo -e "${YELLOW}⚠️  Some smoke tests failed${NC}"
fi

echo ""
echo "✅ Production Deployment Complete!"
echo ""
echo "URL: https://morina.ai"
echo "Logs: ssh $PROD_USER@$PROD_SERVER 'pm2 logs'"
echo "Monitoring: https://morina.ai/monitoring"
echo ""
echo "Next steps:"
echo "- Monitor application logs"
echo "- Check error rates"
echo "- Verify user flows"
echo "- Run conformance tests"
