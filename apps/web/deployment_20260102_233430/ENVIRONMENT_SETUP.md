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
