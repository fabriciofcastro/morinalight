# Morina Security System - Monitoring Dashboard Configuration

## Overview

This document provides configuration for monitoring all systems in production.

## Metrics to Monitor

### 1. Application Health

#### API Health
- **Endpoint**: `/health`
- **Expected**: 200 OK
- **Frequency**: Every 30s
- **Alert**: If down for > 2 minutes

#### Database Connection
- **Metric**: `db_connection_pool_active`
- **Threshold**: < 80% of max
- **Alert**: If > 90% for > 5 minutes

#### Redis Connection
- **Metric**: `redis_connected_clients`
- **Threshold**: > 0
- **Alert**: If 0 for > 1 minute

---

### 2. Security Metrics

#### Rate Limiting
- **Metric**: `rate_limit_blocks_total`
- **Dashboard**: Counter
- **Alert**: If > 100 blocks/minute

#### CSRF Violations
- **Metric**: `csrf_violations_total`
- **Dashboard**: Counter
- **Alert**: If > 10 violations/minute

#### Failed Login Attempts
- **Metric**: `login_failures_total`
- **Dashboard**: Time series
- **Alert**: If > 50 failures/minute

#### Anomaly Detections
- **Metric**: `anomalies_detected_total`
- **Dashboard**: Time series by severity
- **Alert**: If critical anomaly detected

---

### 3. Performance Metrics

#### Permission Resolution Time
- **Metric**: `permission_resolution_duration_ms`
- **Target**: < 100ms (p95)
- **Alert**: If p95 > 200ms

#### GeoIP Lookup Time
- **Metric**: `geoip_lookup_duration_ms`
- **Target**: < 5ms (p95)
- **Alert**: If p95 > 10ms

#### API Response Time
- **Metric**: `http_request_duration_ms`
- **Target**: < 500ms (p95)
- **Alert**: If p95 > 1000ms

---

### 4. Audit System Metrics

#### Audits Executed
- **Metric**: `audits_executed_total`
- **Dashboard**: Counter
- **Frequency**: Daily

#### SoD Violations
- **Metric**: `sod_violations_total`
- **Dashboard**: Gauge by severity
- **Alert**: If critical violation detected

#### ML Anomalies
- **Metric**: `ml_anomalies_detected_total`
- **Dashboard**: Time series
- **Alert**: If > 10 anomalies/hour

---

### 5. SIEM Integration

#### Events Sent
- **Metric**: `siem_events_sent_total`
- **Dashboard**: Counter by adapter
- **Target**: > 0

#### Events Failed
- **Metric**: `siem_events_failed_total`
- **Dashboard**: Counter
- **Alert**: If > 10 failures/hour

---

## Grafana Dashboards

### Dashboard 1: System Overview

```json
{
  "dashboard": {
    "title": "Morina - System Overview",
    "panels": [
      {
        "title": "API Health",
        "type": "stat",
        "targets": ["health_check_status"]
      },
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": ["http_requests_total"]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": ["http_errors_total"]
      },
      {
        "title": "Response Time (p95)",
        "type": "graph",
        "targets": ["http_request_duration_ms{quantile=\"0.95\"}"]
      }
    ]
  }
}
```

### Dashboard 2: Security Monitoring

```json
{
  "dashboard": {
    "title": "Morina - Security",
    "panels": [
      {
        "title": "Rate Limit Blocks",
        "type": "stat",
        "targets": ["rate_limit_blocks_total"]
      },
      {
        "title": "Failed Logins",
        "type": "graph",
        "targets": ["login_failures_total"]
      },
      {
        "title": "Anomalies by Severity",
        "type": "pie",
        "targets": ["anomalies_detected_total"]
      },
      {
        "title": "CSRF Violations",
        "type": "stat",
        "targets": ["csrf_violations_total"]
      }
    ]
  }
}
```

### Dashboard 3: Audit & Compliance

```json
{
  "dashboard": {
    "title": "Morina - Audit & Compliance",
    "panels": [
      {
        "title": "Compliance Score",
        "type": "gauge",
        "targets": ["compliance_score"]
      },
      {
        "title": "SoD Violations",
        "type": "table",
        "targets": ["sod_violations_total"]
      },
      {
        "title": "ML Anomalies",
        "type": "graph",
        "targets": ["ml_anomalies_detected_total"]
      },
      {
        "title": "SIEM Events",
        "type": "stat",
        "targets": ["siem_events_sent_total"]
      }
    ]
  }
}
```

---

## Alert Rules

### Critical Alerts (PagerDuty)

```yaml
groups:
  - name: critical
    rules:
      - alert: APIDown
        expr: up{job="morina-api"} == 0
        for: 2m
        annotations:
          summary: "API is down"
          
      - alert: DatabaseDown
        expr: db_up == 0
        for: 1m
        annotations:
          summary: "Database connection lost"
          
      - alert: CriticalAnomaly
        expr: anomalies_detected_total{severity="critical"} > 0
        annotations:
          summary: "Critical security anomaly detected"
```

### Warning Alerts (Slack)

```yaml
groups:
  - name: warnings
    rules:
      - alert: HighErrorRate
        expr: rate(http_errors_total[5m]) > 0.05
        for: 5m
        annotations:
          summary: "Error rate > 5%"
          
      - alert: SlowResponses
        expr: histogram_quantile(0.95, http_request_duration_ms) > 1000
        for: 10m
        annotations:
          summary: "95th percentile response time > 1s"
```

---

## Prometheus Configuration

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'morina-api'
    static_configs:
      - targets: ['localhost:3333']
    metrics_path: '/metrics'
    
  - job_name: 'morina-web'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
    
  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:9121']
    
  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:9187']
```

---

## Log Aggregation (ELK Stack)

### Filebeat Configuration

```yaml
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /var/log/morina/api/*.log
      - /var/log/morina/auth-failures.log
    fields:
      service: morina-api
      
  - type: log
    enabled: true
    paths:
      - /var/log/morina/web/*.log
    fields:
      service: morina-web

output.elasticsearch:
  hosts: ["localhost:9200"]
  index: "morina-%{+yyyy.MM.dd}"
```

---

## Uptime Monitoring

### Pingdom/UptimeRobot Configuration

```yaml
monitors:
  - name: "Morina API Health"
    url: "https://morina.ai/health"
    interval: 60
    
  - name: "Morina Web"
    url: "https://morina.ai"
    interval: 60
    
  - name: "Login Page"
    url: "https://morina.ai/login"
    interval: 300
```

---

## Performance Budgets

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| API Response Time (p95) | < 500ms | > 800ms | > 1000ms |
| Permission Resolution | < 100ms | > 150ms | > 200ms |
| GeoIP Lookup | < 5ms | > 8ms | > 10ms |
| Error Rate | < 1% | > 3% | > 5% |
| Uptime | > 99.9% | < 99.5% | < 99% |

---

## Incident Response

### Severity Levels

1. **Critical** (P1)
   - API down
   - Database down
   - Security breach
   - Response: Immediate (< 15 min)

2. **High** (P2)
   - High error rate
   - Slow responses
   - Multiple anomalies
   - Response: < 1 hour

3. **Medium** (P3)
   - Individual anomalies
   - SoD violations
   - SIEM failures
   - Response: < 4 hours

4. **Low** (P4)
   - Minor issues
   - Non-critical warnings
   - Response: Next business day

---

## Runbook

### API Down

1. Check health endpoint
2. Check logs: `pm2 logs morina-api`
3. Check database connection
4. Check Redis connection
5. Restart if needed: `pm2 restart morina-api`
6. If persists, rollback: `./scripts/rollback.sh`

### High Error Rate

1. Check error logs
2. Identify error pattern
3. Check recent deployments
4. Monitor metrics
5. Rollback if needed

### Security Anomaly

1. Check anomaly details
2. Verify user activity
3. Check audit logs
4. Block user if needed
5. Notify security team

---

## Success Criteria

✅ All dashboards configured  
✅ All alerts set up  
✅ Logs aggregated  
✅ Uptime monitoring active  
✅ Incident response plan documented  
✅ Team trained on runbooks  

**Status**: Production-ready monitoring 🎯
