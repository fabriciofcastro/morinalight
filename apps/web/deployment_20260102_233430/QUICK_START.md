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
