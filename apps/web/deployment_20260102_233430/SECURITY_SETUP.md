# 🔐 Security Setup Guide

This guide walks you through setting up all security features for production.

## Step 1: Configure Environment Variables

### Copy the security environment file

```bash
# From apps/web directory
cp .env.security .env.local

# Or append to existing .env
cat .env.security >> .env
```

### ✅ Required Variables (Already Generated)

The following keys have been **pre-generated** and are in `.env.security`:

- `ENCRYPTION_MASTER_KEY` - For encrypting sensitive data
- `ENCRYPTION_SALT` - Salt for key derivation
- `JWT_SECRET` - For access tokens
- `JWT_REFRESH_SECRET` - For refresh tokens

**⚠️ CRITICAL**: 
- Keep these keys **secret and secure**
- **Never commit** them to git
- Store backups in a **secure location** (password manager, vault)
- If you lose `ENCRYPTION_MASTER_KEY`, encrypted data **cannot be recovered**

---

## Step 2: Set Up Email Notifications (Optional)

### Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email
4. Get your API key from the dashboard

### Configure

Add to your `.env`:

```env
RESEND_API_KEY=re_your_actual_key_here
SECURITY_ADMIN_EMAIL=security@yourcompany.com
```

### Test

```bash
# Create a test security alert to trigger email
# Or run the security monitor
tsx apps/web/src/lib/cron/security-monitor.ts
```

---

## Step 3: Set Up Redis Rate Limiting (Optional)

### Create Upstash Account

1. Go to [upstash.com](https://upstash.com)
2. Sign up for a free account
3. Create a new Redis database
4. Choose a region close to your servers
5. Copy the REST URL and Token

### Configure

Add to your `.env`:

```env
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

### Verify

The system will automatically use Redis if configured, otherwise it falls back to in-memory rate limiting.

---

## Step 4: Database Backup (CRITICAL)

Before running encryption migration, **ALWAYS backup your database**:

### PostgreSQL Backup

```bash
# Full backup
pg_dump -U username -d database_name > backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
pg_dump -U username -d database_name | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Verify Backup

```bash
# Check file size
ls -lh backup_*.sql

# Test restore (on test database)
psql -U username -d test_database < backup_20260102_230000.sql
```

---

## Step 5: Run Encryption Migration

### Dry Run First (Recommended)

```bash
cd apps/web

# Test migration without making changes
tsx src/scripts/encrypt-existing-data.ts --dry-run --all
```

Review the output carefully. It should show:
- Number of records to process
- Fields to encrypt
- Estimated time

### Run Actual Migration

```bash
# Encrypt all models
tsx src/scripts/encrypt-existing-data.ts --all

# Or encrypt specific model
tsx src/scripts/encrypt-existing-data.ts --model=User
```

### Verify Encryption

```sql
-- Check that data is encrypted (should see format: iv:authTag:encrypted)
SELECT cpf, phone FROM "User" LIMIT 5;

-- Should NOT see plain text like "123.456.789-00"
```

---

## Step 6: Deploy to Production

### Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database backup completed and verified
- [ ] Encryption migration tested in staging
- [ ] Email notifications tested
- [ ] Redis connection verified (if using)
- [ ] Security tests passing (`pnpm --filter web test security`)

### Deploy

```bash
# Build
pnpm build

# Deploy (your deployment method)
# e.g., Vercel, Docker, etc.
```

### Post-Deployment Verification

```bash
# 1. Check security dashboard
# Navigate to: https://yourdomain.com/admin/security

# 2. Test block functionality
# Block a test user, verify it works

# 3. Check logs
# Run log monitor
tsx apps/web/src/scripts/log-monitor.ts --follow

# 4. Review blocks
tsx apps/web/src/scripts/review-blocks.ts --stats
```

---

## Step 7: Set Up Monitoring (Production)

### Cron Jobs

Set up cron jobs to run security monitoring:

```bash
# Run security monitor every 5 minutes
*/5 * * * * cd /path/to/app && tsx apps/web/src/lib/cron/security-monitor.ts

# Review blocks daily
0 9 * * * cd /path/to/app && tsx apps/web/src/scripts/review-blocks.ts --stats --export=/var/log/blocks_$(date +\%Y\%m\%d).csv
```

### Log Monitoring

```bash
# Continuous monitoring in production
tsx apps/web/src/scripts/log-monitor.ts --follow --severity=critical
```

---

## Troubleshooting

### Tests Failing

**Error**: `ENCRYPTION_MASTER_KEY not set`

```bash
# Make sure .env.security is copied to .env or .env.local
cp apps/web/.env.security apps/web/.env.local
```

### Email Not Sending

**Check**:
1. `RESEND_API_KEY` is correct
2. Resend account is active
3. Check server logs for errors

### Redis Not Working

**Check**:
1. `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are correct
2. Upstash database is active
3. Network connectivity

**Note**: System automatically falls back to in-memory if Redis unavailable

### Encryption Migration Failed

**Recovery**:
1. Restore from backup
2. Check environment variables
3. Run with `--dry-run` first
4. Try smaller batch size: `--batch-size=50`

---

## Security Best Practices

### Key Management

1. **Rotate keys quarterly**
   ```bash
   # Generate new keys
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   
   # Update .env
   # Re-encrypt data with new key (advanced)
   ```

2. **Store backups securely**
   - Use password manager (1Password, LastPass)
   - Use cloud vault (AWS Secrets Manager, Azure Key Vault)
   - Keep offline backup in safe location

3. **Never commit secrets**
   - Add `.env*` to `.gitignore` (except `.env.example`)
   - Use environment variables in CI/CD
   - Scan commits for secrets

### Monitoring

1. **Daily**: Review security dashboard
2. **Weekly**: Export and review blocked users/IPs
3. **Monthly**: Review email notification quota
4. **Quarterly**: Rotate encryption keys

### Incident Response

If security breach detected:

1. **Immediate**: Block affected users/IPs from dashboard
2. **Investigate**: Review security logs and alerts
3. **Notify**: Send alerts to security team
4. **Document**: Export logs and blocks for audit
5. **Rotate**: Change all keys and secrets

---

## Next Steps

- [ ] Complete all setup steps above
- [ ] Test in staging environment
- [ ] Deploy to production
- [ ] Set up monitoring cron jobs
- [ ] Document incident response procedures
- [ ] Train team on security features

---

## Support

For issues:
1. Check `/apps/web/SECURITY_GUIDE.md`
2. Review test files for examples
3. Check implementation documentation
