# 🔐 Security Guide - Complete Reference

**Version**: 3.0 (All Phases Complete)  
**Last Updated**: 2026-01-02  
**Status**: Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Phase 1: Core Features](#phase-1-core-features)
4. [Phase 2: Enhanced Features](#phase-2-enhanced-features)
5. [Phase 3: Advanced Features](#phase-3-advanced-features)
6. [Configuration](#configuration)
7. [API Reference](#api-reference)
8. [Troubleshooting](#troubleshooting)

---

## Overview

MorinaLight Security provides enterprise-grade security features:

- **Data Encryption**: AES-256-GCM field-level encryption
- **Authentication**: JWT with MFA/2FA support
- **Intrusion Detection**: Real-time threat detection
- **Rate Limiting**: Redis-based distributed rate limiting
- **Geolocation**: IP tracking with impossible travel detection
- **Analytics**: Comprehensive security metrics and charts
- **Automated Response**: Rule-based threat response engine

---

## Quick Start

### 1. Setup

```bash
cd apps/web
./setup-security.sh
```

### 2. Configure Environment

```bash
# Copy example file
cp .env.production.example .env

# Update with your values
nano .env
```

### 3. Run Tests

```bash
pnpm --filter web test security
```

### 4. Deploy

```bash
./deploy-security.sh
```

---

## Phase 1: Core Features

### Automated Security Tests

**Location**: `/src/__tests__/security.test.ts`

**Run Tests**:
```bash
pnpm --filter web test security
```

**Coverage**:
- Data Encryption (5 tests)
- MFA/2FA (5 tests)
- Intrusion Detection (5 tests)
- Security Middleware (4 tests)
- JWT Management (3 tests)
- Security Monitor (2 tests)

### Log Monitoring

**Location**: `/src/scripts/log-monitor.ts`

**Usage**:
```bash
# Real-time monitoring
npx tsx src/scripts/log-monitor.ts --follow

# Filter by severity
npx tsx src/scripts/log-monitor.ts --severity=critical

# Custom interval
npx tsx src/scripts/log-monitor.ts --follow --interval=10
```

### Block Review

**Location**: `/src/scripts/review-blocks.ts`

**Usage**:
```bash
# List all blocks
npx tsx src/scripts/review-blocks.ts

# Show statistics
npx tsx src/scripts/review-blocks.ts --stats

# Export to CSV
npx tsx src/scripts/review-blocks.ts --export=blocks.csv
```

---

## Phase 2: Enhanced Features

### Email Notifications

**Service**: Resend  
**Location**: `/src/lib/services/notification-service.ts`

**Setup**:
```env
RESEND_API_KEY=re_your_key_here
SECURITY_ADMIN_EMAIL=security@yourcompany.com
```

**Features**:
- HTML email templates
- Batch notifications
- Severity-based styling
- Automatic integration with security monitor

### Redis Rate Limiting

**Service**: Upstash Redis  
**Location**: `/src/lib/redis/rate-limiter.ts`

**Setup**:
```env
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

**Features**:
- Sliding window algorithm
- Automatic fallback to in-memory
- Rate limit headers
- Configurable limits

### Encryption Migration

**Location**: `/src/scripts/encrypt-existing-data.ts`

**Usage**:
```bash
# Dry-run (recommended first)
npx tsx src/scripts/encrypt-existing-data.ts --dry-run --all

# Encrypt all models
npx tsx src/scripts/encrypt-existing-data.ts --all

# Encrypt specific model
npx tsx src/scripts/encrypt-existing-data.ts --model=User

# Custom batch size
npx tsx src/scripts/encrypt-existing-data.ts --all --batch-size=50
```

**⚠️ CRITICAL**: Always backup database before running!

---

## Phase 3: Advanced Features

### IP Geolocation

**Service**: ipapi.co  
**Location**: `/src/lib/services/geolocation-service.ts`

**Setup**:
```env
IPAPI_API_KEY=your_key_here  # Optional, free tier available
```

**Features**:
- Automatic IP location tracking
- 7-day Redis caching
- Impossible travel detection
- Distance calculation
- Local network detection

**API**:
```typescript
import { geolocationService } from '@/lib/services/geolocation-service';

// Get location
const location = await geolocationService.getLocation('8.8.8.8');

// Check impossible travel
const isImpossible = geolocationService.detectImpossibleTravel(
    location1,
    location2,
    timeDiffMinutes
);

// Get summary
const summary = geolocationService.getLocationSummary(location);
```

### Configurable Block Durations

**Location**: `/src/components/admin/security/block-duration-selector.tsx`

**Presets**:
- 15 minutes
- 1 hour
- 6 hours
- 24 hours
- 7 days
- 30 days
- Permanent
- Custom (any duration)

**Usage**:
```tsx
<BlockDurationSelector
    value={duration}
    onChange={(minutes) => setDuration(minutes)}
/>
```

### Security Analytics Dashboard

**Location**: `/src/components/admin/security/security-analytics.tsx`  
**API**: `/api/security/analytics`

**Features**:
- Time-series charts (daily alerts)
- Alert type distribution
- Severity distribution
- Geographic heatmap
- Top affected users
- Trend analysis
- CSV export

**Access**:
```
/admin/security → Analytics tab
```

**API Usage**:
```bash
# Get analytics for last 30 days
GET /api/security/analytics?days=30

# Response includes:
# - summary (totals, counts)
# - timeSeries (daily data)
# - typeDistribution
# - severityDistribution
# - geoDistribution
# - topUsers
# - trend (vs previous period)
```

### Automated Threat Response

**Location**: `/src/lib/security/threat-response-engine.ts`  
**Rules**: `/src/lib/security/threat-rules.ts`  
**API**: `/api/security/threat-rules`

**Setup**:
```env
THREAT_RESPONSE_ENABLED=true
THREAT_RESPONSE_AUTO_BLOCK=false  # Start with false
THREAT_RESPONSE_DRY_RUN=true      # Test mode
```

**Default Rules**:

1. **Multiple Failed Logins**
   - Trigger: 5 failed logins in 5 minutes
   - Action: Block user 1 hour

2. **Impossible Travel**
   - Trigger: Impossible travel detected
   - Action: Block user 2h + Block IP 24h

3. **Privilege Escalation**
   - Trigger: Escalation attempt
   - Action: Permanent block + Escalate

4. **Brute Force**
   - Trigger: 3+ brute force alerts in 15 min
   - Action: Permanent IP block

5. **After Hours Access**
   - Trigger: Sensitive data access outside hours
   - Action: Email alert

6. **Multiple IPs**
   - Trigger: 2+ alerts from multiple IPs in 1h
   - Action: Email alert

7. **Abnormal Volume**
   - Trigger: High/critical abnormal volume
   - Action: Block 30 minutes

**API Usage**:
```bash
# Get all rules
GET /api/security/threat-rules

# Update rules
POST /api/security/threat-rules
{
  "action": "update_rules",
  "rules": [...]
}

# Toggle engine
POST /api/security/threat-rules
{
  "action": "toggle_engine",
  "enabled": true
}

# Toggle dry-run
POST /api/security/threat-rules
{
  "action": "toggle_dry_run",
  "dryRun": false
}
```

**Programmatic Usage**:
```typescript
import { threatResponseEngine } from '@/lib/security/threat-response-engine';

// Get rules
const rules = threatResponseEngine.getRules();

// Update rules
threatResponseEngine.setRules(newRules);

// Control engine
threatResponseEngine.setEnabled(true);
threatResponseEngine.setDryRun(false);

// Process alert (automatic via IDS)
const results = await threatResponseEngine.processAlert(alert);
```

---

## Configuration

### Environment Variables

**Required**:
```env
ENCRYPTION_MASTER_KEY=<32-byte-hex>
ENCRYPTION_SALT=<64-byte-hex>
JWT_SECRET=<32-byte-hex>
JWT_REFRESH_SECRET=<32-byte-hex>
```

**Optional - Email**:
```env
RESEND_API_KEY=re_xxxxx
SECURITY_ADMIN_EMAIL=security@example.com
```

**Optional - Redis**:
```env
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx
```

**Optional - Geolocation**:
```env
IPAPI_API_KEY=xxxxx
```

**Optional - IDS**:
```env
IDS_MAX_FAILED_LOGINS=5
IDS_BLOCK_DURATION_MINUTES=30
```

**Optional - Threat Response**:
```env
THREAT_RESPONSE_ENABLED=true
THREAT_RESPONSE_AUTO_BLOCK=false
THREAT_RESPONSE_DRY_RUN=true
```

### Generate Keys

```bash
# Encryption master key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Encryption salt
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## API Reference

### Security Alerts

**GET** `/api/security/alerts`
- List all security alerts
- Query params: `severity`, `acknowledged`, `limit`

**POST** `/api/security/alerts/:id/acknowledge`
- Acknowledge an alert

### Block Management

**POST** `/api/security/block-user`
- Block a user
- Body: `{ userId, minutes, reason }`

**POST** `/api/security/block-ip`
- Block an IP
- Body: `{ ip, minutes, reason }`

### Analytics

**GET** `/api/security/analytics`
- Get security analytics
- Query params: `days` (7, 30, 90)

### Threat Rules

**GET** `/api/security/threat-rules`
- Get all threat response rules

**POST** `/api/security/threat-rules`
- Manage rules
- Actions: `update_rules`, `toggle_engine`, `toggle_dry_run`

---

## Troubleshooting

### Tests Failing

**Error**: `ENCRYPTION_MASTER_KEY not set`

**Solution**:
```bash
cp .env.production.example .env
# Or
cp .env.security .env.local
```

### Email Not Sending

**Check**:
1. `RESEND_API_KEY` is correct
2. Resend account is active
3. Check server logs for errors
4. Verify email quota

### Redis Not Working

**Check**:
1. `UPSTASH_REDIS_REST_URL` and `TOKEN` are correct
2. Upstash database is active
3. Network connectivity

**Note**: System automatically falls back to in-memory

### Geolocation Not Working

**Check**:
1. Free tier limit (1000/day)
2. API key (if using paid tier)
3. Check logs for API errors

**Note**: Local IPs return "Local Network"

### Threat Response Not Triggering

**Check**:
1. `THREAT_RESPONSE_ENABLED=true`
2. Rules are enabled
3. Check dry-run mode
4. Review logs for errors

---

## Best Practices

### Security

1. **Rotate keys quarterly**
2. **Backup encryption keys** in secure vault
3. **Never commit** secrets to git
4. **Monitor** security dashboard daily
5. **Review** blocked users/IPs weekly

### Deployment

1. **Test** in staging first
2. **Backup** database before migration
3. **Start** with dry-run mode
4. **Monitor** logs for 1 week
5. **Enable** auto-blocking gradually

### Monitoring

1. **Set up** cron jobs for monitoring
2. **Export** analytics weekly
3. **Review** threat rules monthly
4. **Update** documentation as needed

---

## Support

For issues or questions:
1. Check this guide
2. Review test files for examples
3. Check implementation documentation
4. Review walkthrough artifacts

---

**🎉 Complete security system ready for production!**
