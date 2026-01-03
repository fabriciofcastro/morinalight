#!/bin/bash

# 🚀 MorinaLight Security - Production Deployment Script
# This script automates the deployment of all security features

set -e  # Exit on error

echo "🔐 MorinaLight Security - Production Deployment"
echo "================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Please run this script from the apps/web directory${NC}"
    exit 1
fi

# Step 1: Environment Check
echo "📋 Step 1: Checking environment configuration..."
if [ ! -f ".env" ] && [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  No .env file found${NC}"
    echo "Creating .env from .env.production.example..."
    cp .env.production.example .env
    echo -e "${YELLOW}⚠️  Please update .env with your actual values before continuing${NC}"
    echo ""
    read -p "Press Enter when ready to continue..."
fi

# Check required variables
echo "Checking required environment variables..."
required_vars=("ENCRYPTION_MASTER_KEY" "ENCRYPTION_SALT" "JWT_SECRET" "JWT_REFRESH_SECRET")
missing_vars=()

for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" .env 2>/dev/null && ! grep -q "^${var}=" .env.local 2>/dev/null; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo -e "${RED}❌ Missing required variables: ${missing_vars[*]}${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment configuration OK${NC}"
echo ""

# Step 2: Dependencies
echo "📦 Step 2: Installing dependencies..."
pnpm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 3: Run Tests
echo "🧪 Step 3: Running security tests..."
if pnpm test security; then
    echo -e "${GREEN}✅ All tests passed${NC}"
else
    echo -e "${RED}❌ Tests failed. Please fix before deploying.${NC}"
    exit 1
fi
echo ""

# Step 4: Database Backup
echo "💾 Step 4: Database backup..."
echo -e "${YELLOW}⚠️  CRITICAL: Backup your database before proceeding!${NC}"
echo ""
echo "Backup commands:"
echo "  PostgreSQL: pg_dump -U username -d database > backup_\$(date +%Y%m%d_%H%M%S).sql"
echo "  MySQL: mysqldump -u username -p database > backup_\$(date +%Y%m%d_%H%M%S).sql"
echo ""
read -p "Have you backed up your database? (yes/no) " -n 3 -r
echo
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo -e "${RED}❌ Please backup your database first!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Database backup confirmed${NC}"
echo ""

# Step 5: Encryption Migration
echo "🔐 Step 5: Data encryption migration..."
echo "Running dry-run first..."
if npx tsx src/scripts/encrypt-existing-data.ts --dry-run --all; then
    echo ""
    echo "Dry-run completed successfully."
    echo ""
    read -p "Proceed with actual encryption migration? (yes/no) " -n 3 -r
    echo
    if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        npx tsx src/scripts/encrypt-existing-data.ts --all
        echo -e "${GREEN}✅ Encryption migration completed${NC}"
    else
        echo -e "${YELLOW}⚠️  Skipping encryption migration${NC}"
    fi
else
    echo -e "${RED}❌ Dry-run failed. Please check the errors.${NC}"
    exit 1
fi
echo ""

# Step 6: Build
echo "🏗️  Step 6: Building application..."
if pnpm build; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo ""

# Step 7: Configuration Review
echo "⚙️  Step 7: Security configuration review..."
echo ""
echo "Current configuration:"
echo "  - Threat Response Enabled: $(grep THREAT_RESPONSE_ENABLED .env 2>/dev/null || echo 'Not set')"
echo "  - Auto-Block Enabled: $(grep THREAT_RESPONSE_AUTO_BLOCK .env 2>/dev/null || echo 'Not set')"
echo "  - Dry-Run Mode: $(grep THREAT_RESPONSE_DRY_RUN .env 2>/dev/null || echo 'Not set')"
echo "  - Email Configured: $(grep RESEND_API_KEY .env 2>/dev/null | grep -v 'xxxxx' && echo 'Yes' || echo 'No')"
echo "  - Redis Configured: $(grep UPSTASH_REDIS_REST_URL .env 2>/dev/null | grep -v 'xxxxx' && echo 'Yes' || echo 'No')"
echo ""

# Step 8: Deployment Checklist
echo "📝 Step 8: Final deployment checklist..."
echo ""
echo "Please confirm the following:"
echo "  [ ] Database is backed up"
echo "  [ ] All tests are passing"
echo "  [ ] Environment variables are configured"
echo "  [ ] Email notifications tested (if configured)"
echo "  [ ] Redis connection tested (if configured)"
echo "  [ ] Threat response in dry-run mode initially"
echo "  [ ] Security dashboard accessible"
echo "  [ ] Analytics dashboard working"
echo ""
read -p "All items confirmed? (yes/no) " -n 3 -r
echo
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo -e "${YELLOW}⚠️  Please complete the checklist before deploying${NC}"
    exit 1
fi
echo ""

# Step 9: Deploy
echo "🚀 Step 9: Ready to deploy!"
echo ""
echo "Deployment options:"
echo "  1. Deploy to Vercel: vercel --prod"
echo "  2. Deploy to Docker: docker build -t morinalight ."
echo "  3. Deploy manually: Copy build files to server"
echo ""
echo "Post-deployment tasks:"
echo "  - Set up cron jobs for security monitoring"
echo "  - Monitor logs for first 24 hours"
echo "  - Test all security features"
echo "  - Review security dashboard"
echo "  - Enable auto-blocking after 1 week (if using dry-run)"
echo ""
echo -e "${GREEN}✅ Pre-deployment checks complete!${NC}"
echo ""
echo "📚 Documentation:"
echo "  - Usage Guide: SECURITY_GUIDE.md"
echo "  - Setup Guide: SECURITY_SETUP.md"
echo "  - Deployment Checklist: See artifacts directory"
echo ""
echo "🎉 You're ready to deploy!"
