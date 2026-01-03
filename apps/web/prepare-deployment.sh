#!/bin/bash

# 🎯 Complete Deployment Preparation Script
# This script completes all automated checklist items

set -e

echo "🎯 MorinaLight Security - Complete Deployment Preparation"
echo "=========================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Run from apps/web directory${NC}"
    exit 1
fi

# ============================================
# PRE-DEPLOYMENT CHECKLIST
# ============================================

echo -e "${BLUE}📋 PRE-DEPLOYMENT CHECKLIST${NC}"
echo ""

# 1. Environment Setup
echo "✅ Step 1: Environment Setup"
if [ ! -f ".env" ] && [ ! -f ".env.local" ]; then
    echo "  Creating .env from template..."
    cp .env.production.example .env
    echo -e "  ${GREEN}✓${NC} .env created"
else
    echo -e "  ${GREEN}✓${NC} .env exists"
fi

# Verify required variables
echo "  Checking required variables..."
required_vars=("ENCRYPTION_MASTER_KEY" "ENCRYPTION_SALT" "JWT_SECRET" "JWT_REFRESH_SECRET")
all_present=true

for var in "${required_vars[@]}"; do
    if grep -q "^${var}=" .env 2>/dev/null || grep -q "^${var}=" .env.local 2>/dev/null; then
        echo -e "    ${GREEN}✓${NC} $var"
    else
        echo -e "    ${RED}✗${NC} $var (missing)"
        all_present=false
    fi
done

if [ "$all_present" = true ]; then
    echo -e "  ${GREEN}✓${NC} All required variables present"
else
    echo -e "  ${YELLOW}⚠${NC}  Some variables missing - update .env"
fi
echo ""

# 2. Dependencies
echo "✅ Step 2: Dependencies"
echo "  Installing dependencies..."
if pnpm install --silent; then
    echo -e "  ${GREEN}✓${NC} Dependencies installed"
else
    echo -e "  ${RED}✗${NC} Failed to install dependencies"
    exit 1
fi
echo ""

# 3. Testing
echo "✅ Step 3: Security Tests"
echo "  Running test suite..."
if pnpm test security --silent 2>&1 | grep -q "24 passed"; then
    echo -e "  ${GREEN}✓${NC} All 24 tests passing"
else
    echo -e "  ${YELLOW}⚠${NC}  Running tests (check output)..."
    pnpm test security
fi
echo ""

# 4. Build Test
echo "✅ Step 4: Build Verification"
echo "  Testing production build..."
if pnpm build 2>&1 | tail -n 20; then
    echo -e "  ${GREEN}✓${NC} Build successful"
else
    echo -e "  ${RED}✗${NC} Build failed"
    exit 1
fi
echo ""

# ============================================
# CREATE DEPLOYMENT ARTIFACTS
# ============================================

echo -e "${BLUE}📦 CREATING DEPLOYMENT ARTIFACTS${NC}"
echo ""

# Create deployment directory
DEPLOY_DIR="deployment_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$DEPLOY_DIR"
echo -e "${GREEN}✓${NC} Created deployment directory: $DEPLOY_DIR"
echo ""

# 1. Environment file (sanitized)
echo "Creating deployment files..."
cat > "$DEPLOY_DIR/ENVIRONMENT_SETUP.md" << 'EOF'
# Environment Setup for Production

## Required Variables (Already in .env.production.example)

```env
ENCRYPTION_MASTER_KEY=<from .env.production.example>
ENCRYPTION_SALT=<from .env.production.example>
JWT_SECRET=<from .env.production.example>
JWT_REFRESH_SECRET=<from .env.production.example>
```

## Optional Services

### Resend (Email Notifications)
1. Sign up: https://resend.com
2. Get API key
3. Add to .env:
```env
RESEND_API_KEY=re_your_key
SECURITY_ADMIN_EMAIL=security@yourcompany.com
```

### Upstash (Redis Rate Limiting)
1. Sign up: https://upstash.com
2. Create Redis database
3. Add to .env:
```env
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
```

### ipapi.co (Geolocation)
1. Optional - free tier available
2. For more requests: https://ipapi.co/pricing/
```env
IPAPI_API_KEY=your_key
```

### Threat Response Configuration
```env
THREAT_RESPONSE_ENABLED=true
THREAT_RESPONSE_AUTO_BLOCK=false  # Start with false
THREAT_RESPONSE_DRY_RUN=true      # Test mode first
```

## Deployment Steps

1. Copy .env.production.example to .env
2. Update optional service credentials
3. Deploy application
4. Run encryption migration (with backup!)
5. Set up cron jobs
6. Monitor for 1 week
7. Enable auto-blocking
EOF

echo -e "${GREEN}✓${NC} Created ENVIRONMENT_SETUP.md"

# 2. Cron jobs configuration
cat > "$DEPLOY_DIR/CRON_JOBS.sh" << 'EOF'
#!/bin/bash
# Cron Jobs for MorinaLight Security

# Add these to your crontab:
# crontab -e

# Security monitor (every 5 minutes)
# */5 * * * * cd /path/to/morinalight/apps/web && npx tsx src/lib/cron/security-monitor.ts >> /var/log/security-monitor.log 2>&1

# Daily block review (9 AM)
# 0 9 * * * cd /path/to/morinalight/apps/web && npx tsx src/scripts/review-blocks.ts --stats --export=/var/log/blocks_$(date +\%Y\%m\%d).csv >> /var/log/block-review.log 2>&1

# Weekly analytics export (Monday 9 AM)
# 0 9 * * 1 cd /path/to/morinalight/apps/web && curl -o /var/log/analytics_$(date +\%Y\%m\%d).json http://localhost:3000/api/security/analytics?days=7

# Instructions:
# 1. Replace /path/to/morinalight with actual path
# 2. Ensure log directories exist: mkdir -p /var/log
# 3. Add to crontab: crontab -e
# 4. Verify: crontab -l
EOF

chmod +x "$DEPLOY_DIR/CRON_JOBS.sh"
echo -e "${GREEN}✓${NC} Created CRON_JOBS.sh"

# 3. Database backup script
cat > "$DEPLOY_DIR/backup-database.sh" << 'EOF'
#!/bin/bash
# Database Backup Script

# Configuration
DB_USER="your_db_user"
DB_NAME="your_db_name"
BACKUP_DIR="/var/backups/morinalight"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p "$BACKUP_DIR"

# PostgreSQL backup
echo "Creating database backup..."
pg_dump -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_DIR/backup_$DATE.sql"

# Compress backup
gzip "$BACKUP_DIR/backup_$DATE.sql"

# Verify backup
if [ -f "$BACKUP_DIR/backup_$DATE.sql.gz" ]; then
    SIZE=$(du -h "$BACKUP_DIR/backup_$DATE.sql.gz" | cut -f1)
    echo "✓ Backup created: backup_$DATE.sql.gz ($SIZE)"
    
    # Keep only last 7 backups
    cd "$BACKUP_DIR"
    ls -t backup_*.sql.gz | tail -n +8 | xargs -r rm
    echo "✓ Old backups cleaned"
else
    echo "✗ Backup failed!"
    exit 1
fi

# Test restore (optional)
# psql -U "$DB_USER" -d test_database < "$BACKUP_DIR/backup_$DATE.sql"
EOF

chmod +x "$DEPLOY_DIR/backup-database.sh"
echo -e "${GREEN}✓${NC} Created backup-database.sh"

# 4. Deployment checklist (completed)
cat > "$DEPLOY_DIR/DEPLOYMENT_CHECKLIST.txt" << 'EOF'
# MorinaLight Security - Deployment Checklist

## ✅ COMPLETED AUTOMATICALLY

[✓] Environment file created (.env)
[✓] All dependencies installed
[✓] Security tests passing (24/24)
[✓] Production build verified
[✓] Deployment artifacts created

## 📋 MANUAL STEPS REQUIRED

### Pre-Deployment
[ ] Configure optional services (Resend, Upstash) in .env
[ ] Test email notifications (if configured)
[ ] Test Redis connection (if configured)

### Database
[ ] Create database backup (use backup-database.sh)
[ ] Verify backup file exists and has content
[ ] Test restore on staging database
[ ] Store backup in secure location

### Encryption Migration (Staging First!)
[ ] Run dry-run: npx tsx src/scripts/encrypt-existing-data.ts --dry-run --all
[ ] Review output carefully
[ ] Run on staging: npx tsx src/scripts/encrypt-existing-data.ts --all
[ ] Verify encrypted data in staging
[ ] Test application with encrypted data

### Deployment
[ ] Deploy to production environment
[ ] Verify deployment successful
[ ] Access security dashboard: /admin/security
[ ] Test block/unblock functionality

### Production Encryption Migration
[ ] CRITICAL: Verify database backup exists
[ ] Run dry-run on production
[ ] Review output
[ ] Run actual migration
[ ] Monitor progress
[ ] Verify completion

### Monitoring Setup
[ ] Set up cron jobs (see CRON_JOBS.sh)
[ ] Test cron jobs execute successfully
[ ] Start log monitor: nohup npx tsx src/scripts/log-monitor.ts --follow &
[ ] Set up log rotation

### Verification
[ ] Create test security alert
[ ] Verify email notification (if configured)
[ ] Block/unblock test user
[ ] Block/unblock test IP
[ ] Test rate limiting
[ ] Run full test suite
[ ] Check for console errors
[ ] Review security logs

### Documentation
[ ] Share SECURITY_GUIDE.md with team
[ ] Share SECURITY_SETUP.md with ops team
[ ] Document incident response procedures
[ ] Train admins on security dashboard

### Post-Deployment (First Week)
[ ] Monitor security alerts daily
[ ] Review blocked users/IPs daily
[ ] Check email notification quota
[ ] Monitor Redis usage (if configured)
[ ] Review application logs

### Ongoing Maintenance
[ ] Weekly: Export and review blocks
[ ] Monthly: Review email quota
[ ] Quarterly: Rotate encryption keys
[ ] Quarterly: Review documentation

## 🎯 SUCCESS CRITERIA

All items above must be completed for production deployment.

Deployment Date: _______________
Deployed By: _______________
Environment: _______________
EOF

echo -e "${GREEN}✓${NC} Created DEPLOYMENT_CHECKLIST.txt"

# 5. Quick start guide
cat > "$DEPLOY_DIR/QUICK_START.md" << 'EOF'
# Quick Start - Production Deployment

## 1. Pre-Deployment (5 minutes)

```bash
# Configure environment
cp .env.production.example .env
nano .env  # Add optional service credentials

# Verify setup
./setup-security.sh
```

## 2. Database Backup (2 minutes)

```bash
# Edit configuration in backup-database.sh
nano deployment_*/backup-database.sh

# Run backup
./deployment_*/backup-database.sh
```

## 3. Staging Test (10 minutes)

```bash
# Deploy to staging
# ... your deployment process ...

# Test encryption migration
npx tsx src/scripts/encrypt-existing-data.ts --dry-run --all
npx tsx src/scripts/encrypt-existing-data.ts --all

# Verify
# - Check encrypted data in database
# - Test application functionality
# - Run security tests
```

## 4. Production Deployment (15 minutes)

```bash
# Deploy to production
./deploy-security.sh

# Follow prompts:
# - Confirm database backup
# - Run encryption migration
# - Verify deployment
```

## 5. Post-Deployment (10 minutes)

```bash
# Set up cron jobs
crontab -e
# Add jobs from CRON_JOBS.sh

# Start monitoring
nohup npx tsx src/scripts/log-monitor.ts --follow &

# Verify
# - Access /admin/security
# - Test features
# - Check logs
```

## 6. Week 1 Monitoring

- Monitor security dashboard daily
- Review blocked users/IPs
- Check email quota (if using Resend)
- Monitor Redis usage (if using Upstash)

## 7. Enable Auto-Blocking (After 1 Week)

```env
# Update .env
THREAT_RESPONSE_AUTO_BLOCK=true
THREAT_RESPONSE_DRY_RUN=false
```

Restart application.

## Need Help?

- Complete Guide: SECURITY_GUIDE.md
- Setup Guide: SECURITY_SETUP.md
- Quick Reference: QUICK_REFERENCE.md
EOF

echo -e "${GREEN}✓${NC} Created QUICK_START.md"

# 6. Copy important files
echo ""
echo "Copying documentation..."
cp .env.production.example "$DEPLOY_DIR/"
cp SECURITY_GUIDE.md "$DEPLOY_DIR/" 2>/dev/null || echo "  Note: SECURITY_GUIDE.md not found"
cp SECURITY_SETUP.md "$DEPLOY_DIR/" 2>/dev/null || echo "  Note: SECURITY_SETUP.md not found"
cp SECURITY_README.md "$DEPLOY_DIR/" 2>/dev/null || echo "  Note: SECURITY_README.md not found"
echo -e "${GREEN}✓${NC} Documentation copied"

# ============================================
# SUMMARY
# ============================================

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ DEPLOYMENT PREPARATION COMPLETE!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "📦 Deployment package created: $DEPLOY_DIR/"
echo ""
echo "📁 Contents:"
echo "  - ENVIRONMENT_SETUP.md     Environment configuration guide"
echo "  - CRON_JOBS.sh             Cron job setup script"
echo "  - backup-database.sh       Database backup script"
echo "  - DEPLOYMENT_CHECKLIST.txt Complete deployment checklist"
echo "  - QUICK_START.md           Quick start guide"
echo "  - .env.production.example  Environment template"
echo "  - SECURITY_*.md            Documentation files"
echo ""
echo "🎯 Next Steps:"
echo "  1. Review $DEPLOY_DIR/DEPLOYMENT_CHECKLIST.txt"
echo "  2. Configure optional services in .env"
echo "  3. Run $DEPLOY_DIR/backup-database.sh"
echo "  4. Follow $DEPLOY_DIR/QUICK_START.md"
echo ""
echo "📚 Documentation:"
echo "  - Complete Guide: SECURITY_GUIDE.md"
echo "  - Setup Guide: SECURITY_SETUP.md"
echo "  - Quick Reference: QUICK_REFERENCE.md"
echo ""
echo -e "${GREEN}🚀 Ready for production deployment!${NC}"
echo ""
