# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

Use this section to tell people how to report a vulnerability.

Tell them where to go, how often they can expect to get an update on a reported vulnerability, what to expect if the vulnerability is accepted or rejected, etc.

## Enterprise Security Features

MorinaLight implements a defense-in-depth security strategy.

### 1. Authentication & Authorization
- **JWT Authentication**: Secure stateless authentication.
- **RBAC (Role-Based Access Control)**: Granular permission control.
- **MFA (Multi-Factor Authentication)**: TOTP and Backup Codes support.

### 2. Data Protection
- **Encryption at Rest**: Sensitive data (CPF, Phone, etc.) is automatically encrypted using AES-256-GCM before storage in PostgreSQL.
- **Secure Connections**: All database and API connections enforced over TLS/SSL.

### 3. Network Security
- **Rate Limiting**: Automated protection against DDoS and brute-force (Map-based for dev, Redis-ready for prod).
- **Security Headers**: HSTS, CSP, X-Frame-Options, etc., configured globally.
- **CORS**: Strict blocking policy for unauthorized origins.

### 4. Monitoring & Response
- **IDS (Intrusion Detection System)**: Passive monitoring of suspicious activities (failed logins, privilege escalation).
- **Audit Logs**: Immutable log of critical system actions.
- **Security Dashboard**: Real-time visibility into security alerts.

### 5. Compliance
- **LGPD/GDPR**: Built-in features for data privacy and user rights.
- **Cookie Consent**: Granular tracking controls.

## Configuration

To enable full security features, ensure the following environment variables are set:

```env
# Encryption
ENCRYPTION_MASTER_KEY=... (32 bytes hex)
ENCRYPTION_SALT=... (64 bytes hex)

# MFA
MFA_APP_NAME=MorinaLight

# Security
CRON_SECRET=... (Strong random string for scheduled scans)
```
