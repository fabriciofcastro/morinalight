# 🔐 MorinaLight Security System

**Enterprise-Grade Security Platform**  
**Version**: 3.0 Complete  
**Status**: ✅ Production Ready

---

## 🚀 Quick Start

```bash
# 1. Setup
cd apps/web
./setup-security.sh

# 2. Configure
cp .env.production.example .env
# Edit .env with your values

# 3. Test
pnpm test security

# 4. Deploy
./deploy-security.sh
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [SECURITY_GUIDE.md](./SECURITY_GUIDE.md) | Complete usage guide |
| [SECURITY_SETUP.md](./SECURITY_SETUP.md) | Setup instructions |
| [.env.production.example](./.env.production.example) | Environment configuration |

---

## ✨ Features

### Core Security
- ✅ AES-256-GCM Encryption
- ✅ JWT Authentication
- ✅ MFA/2FA Support
- ✅ Intrusion Detection
- ✅ Rate Limiting (Redis)

### Advanced Features
- ✅ IP Geolocation
- ✅ Impossible Travel Detection
- ✅ Security Analytics Dashboard
- ✅ Automated Threat Response
- ✅ Configurable Block Durations

### Monitoring
- ✅ Real-time Log Monitoring
- ✅ Email Notifications
- ✅ Analytics & Charts
- ✅ CSV Export

---

## 🎯 Key Scripts

```bash
# Setup
./setup-security.sh          # Quick setup wizard
./deploy-security.sh         # Production deployment

# Monitoring
npx tsx src/scripts/log-monitor.ts --follow
npx tsx src/scripts/review-blocks.ts --stats

# Migration
npx tsx src/scripts/encrypt-existing-data.ts --dry-run --all

# Testing
pnpm test security
```

---

## 🔧 Configuration

### Required Environment Variables

```env
ENCRYPTION_MASTER_KEY=<generated>
ENCRYPTION_SALT=<generated>
JWT_SECRET=<generated>
JWT_REFRESH_SECRET=<generated>
```

### Optional Services

```env
# Email (Resend)
RESEND_API_KEY=re_xxxxx
SECURITY_ADMIN_EMAIL=security@example.com

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx

# Geolocation (ipapi.co)
IPAPI_API_KEY=xxxxx

# Threat Response
THREAT_RESPONSE_ENABLED=true
THREAT_RESPONSE_AUTO_BLOCK=false
THREAT_RESPONSE_DRY_RUN=true
```

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Security System                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Detection  │  │  Analytics   │  │   Response   │ │
│  │              │  │              │  │              │ │
│  │ • IDS        │  │ • Dashboard  │  │ • Auto-block │ │
│  │ • Geoloc     │  │ • Charts     │  │ • Rules      │ │
│  │ • Monitoring │  │ • Export     │  │ • Notify     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Encryption   │  │ Rate Limit   │  │ Notifications│ │
│  │              │  │              │  │              │ │
│  │ • AES-256    │  │ • Redis      │  │ • Email      │ │
│  │ • Field-level│  │ • Fallback   │  │ • Templates  │ │
│  │ • Migration  │  │ • Headers    │  │ • Batch      │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing

**24 Automated Tests**:
- Data Encryption (5)
- MFA/2FA (5)
- Intrusion Detection (5)
- Security Middleware (4)
- JWT Management (3)
- Security Monitor (2)

**Run Tests**:
```bash
pnpm --filter web test security
```

---

## 🎨 Dashboard

Access the security dashboard at:
```
/admin/security
```

**Features**:
- View all security alerts
- Block/unblock users and IPs
- Analytics with charts
- Export data to CSV
- Manage threat rules

---

## 🔐 Security Best Practices

1. **Keys**
   - ✅ Rotate quarterly
   - ✅ Backup in secure vault
   - ✅ Never commit to git

2. **Deployment**
   - ✅ Test in staging
   - ✅ Backup database
   - ✅ Start with dry-run
   - ✅ Monitor for 1 week

3. **Monitoring**
   - ✅ Daily dashboard review
   - ✅ Weekly block review
   - ✅ Monthly rule review
   - ✅ Quarterly key rotation

---

## 📈 Performance

| Feature | Metric |
|---------|--------|
| Encryption | <1ms overhead |
| Rate Limiting | 1-5ms (Redis) |
| Geolocation | Cached 7 days |
| Analytics | <500ms (90 days) |
| Threat Response | <100ms per alert |

---

## 🆘 Support

**Troubleshooting**:
1. Check [SECURITY_GUIDE.md](./SECURITY_GUIDE.md)
2. Review test files for examples
3. Check logs for errors
4. Verify environment variables

**Common Issues**:
- Tests failing → Check .env
- Email not sending → Verify Resend key
- Redis not working → Check Upstash credentials
- Geolocation errors → Check API quota

---

## 📦 Dependencies

```json
{
  "resend": "Email notifications",
  "@upstash/redis": "Distributed rate limiting",
  "recharts": "Analytics charts",
  "date-fns": "Date manipulation"
}
```

---

## 🎉 What's Included

### Phase 1: Core (100%)
- ✅ Automated tests
- ✅ Log monitoring
- ✅ Block review

### Phase 2: Enhanced (100%)
- ✅ Email notifications
- ✅ Redis rate limiting
- ✅ Encryption migration
- ✅ Unblock functionality

### Phase 3: Advanced (100%)
- ✅ IP geolocation
- ✅ Impossible travel detection
- ✅ Analytics dashboard
- ✅ Automated threat response

---

## 🚀 Deployment

### Pre-Deployment
```bash
# 1. Configure environment
cp .env.production.example .env

# 2. Run tests
pnpm test security

# 3. Backup database
pg_dump -U user -d db > backup.sql

# 4. Run deployment script
./deploy-security.sh
```

### Post-Deployment
```bash
# 1. Set up cron jobs
*/5 * * * * npx tsx src/lib/cron/security-monitor.ts

# 2. Monitor logs
npx tsx src/scripts/log-monitor.ts --follow

# 3. Review dashboard
# Navigate to /admin/security

# 4. Enable auto-blocking (after 1 week)
# Set THREAT_RESPONSE_AUTO_BLOCK=true
```

---

## 📝 License

Copyright © 2026 MorinaLight. All rights reserved.

---

**Built with ❤️ for enterprise security**
