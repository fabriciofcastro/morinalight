# 🚀 Quick Start Deployment Guide

**Estimated Time**: 30-45 minutes  
**Difficulty**: Intermediate

---

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ PostgreSQL database running
- ✅ Access to deployment environment
- ✅ Basic command line knowledge

---

## Step 1: Environment Setup (5 min)

```bash
cd apps/web

# Copy environment template
cp .env.production.example .env

# Edit with your values
nano .env
```

**Required Variables**:
```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
ENCRYPTION_MASTER_KEY=<already generated>
ENCRYPTION_SALT=<already generated>
JWT_SECRET=<already generated>
JWT_REFRESH_SECRET=<already generated>
CRON_SECRET=<already generated>
```

**Optional (Recommended for Production)**:
```env
# Email notifications
RESEND_API_KEY=re_xxxxx
SECURITY_ADMIN_EMAIL=security@yourcompany.com

# Redis rate limiting
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx
```

---

## Step 2: Install Dependencies (3 min)

```bash
pnpm install
```

---

## Step 3: Database Backup (2 min)

```bash
# Make script executable
chmod +x scripts/backup-database.sh

# Run backup
./scripts/backup-database.sh
```

---

## Step 4: Build Application (5 min)

```bash
pnpm build
```

---

## Step 5: Verify Installation (3 min)

```bash
# Test encryption
npx tsx src/scripts/verify-encryption.ts

# Check health
curl http://localhost:3000/api/health
```

---

## Step 6: Deploy (Varies by Platform)

### Vercel
```bash
vercel --prod
```

### Docker
```bash
docker build -t morinalight .
docker run -p 3000:3000 --env-file .env morinalight
```

### PM2
```bash
pm2 start npm --name "morinalight" -- start
pm2 save
```

---

## Step 7: Post-Deployment Verification (5 min)

### Test Health Endpoint
```bash
curl https://your-domain.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "components": {
    "database": { "status": "healthy" },
    "environment": { "status": "healthy" },
    "security": { "status": "healthy" }
  }
}
```

### Test Security Dashboard
1. Navigate to: `https://your-domain.com/admin/security`
2. Verify dashboard loads
3. Check for console errors

---

## Step 8: Setup Cron Jobs (5 min)

### For Vercel
Already configured in `vercel.json` ✅

### For Other Platforms
```bash
# Edit crontab
crontab -e

# Add from scripts/CRON_JOBS.sh
# Update PROJECT_PATH first!
```

---

## Step 9: Enable Monitoring (3 min)

```bash
# Create log directory
sudo mkdir -p /var/log/morinalight
sudo chown $USER:$USER /var/log/morinalight

# Start log monitor (optional)
nohup npx tsx src/scripts/log-monitor.ts --follow > /var/log/morinalight/monitor.log 2>&1 &
```

---

## Step 10: Final Verification (5 min)

### Checklist
- [ ] Health endpoint returns 200
- [ ] Security dashboard accessible
- [ ] No console errors
- [ ] Cron jobs scheduled (if applicable)
- [ ] Logs directory created
- [ ] Backup script tested

---

## 🎉 Deployment Complete!

### Next Steps

**First 24 Hours**:
- Monitor `/api/health` endpoint
- Check security dashboard every 2 hours
- Review logs for errors

**First Week**:
- Daily dashboard review
- Monitor email notifications (if configured)
- Review blocked users/IPs

**After 1 Week**:
- Enable auto-blocking if not already enabled
- Review and adjust threat rules
- Document any issues

---

## 🆘 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next
pnpm build
```

### Database Connection Error
```bash
# Verify DATABASE_URL
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Health Check Fails
```bash
# Check logs
tail -f /var/log/morinalight/*.log

# Verify environment variables
npx tsx src/scripts/verify-encryption.ts
```

---

## 📚 Additional Resources

- **Complete Guide**: [SECURITY_GUIDE.md](file:///home/fabricio/projects/morinalight/apps/web/SECURITY_GUIDE.md)
- **Security Setup**: [SECURITY_SETUP.md](file:///home/fabricio/projects/morinalight/apps/web/SECURITY_SETUP.md)
- **Production Readiness**: [production_readiness.md](file:///home/fabricio/.gemini/antigravity/brain/6199169b-d7ee-48c6-9191-e408b70040f4/production_readiness.md)

---

**Need Help?** Check the troubleshooting section or review the complete security guide.
