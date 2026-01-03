#!/bin/bash

# Cron Jobs Configuration for MorinaLight Security
# Copy these lines to your crontab: crontab -e

# IMPORTANT: Update /path/to/morinalight with your actual project path
PROJECT_PATH="/path/to/morinalight/apps/web"

# ============================================
# Security Monitor (Every 5 minutes)
# ============================================
*/5 * * * * cd $PROJECT_PATH && npx tsx src/lib/cron/security-monitor.ts >> /var/log/morinalight/security-monitor.log 2>&1

# ============================================
# Daily Block Review (9 AM)
# ============================================
0 9 * * * cd $PROJECT_PATH && npx tsx src/scripts/review-blocks.ts --stats --export=/var/log/morinalight/blocks_$(date +\%Y\%m\%d).csv >> /var/log/morinalight/block-review.log 2>&1

# ============================================
# Weekly Analytics Export (Monday 10 AM)
# ============================================
0 10 * * 1 cd $PROJECT_PATH && npx tsx src/scripts/export-analytics.ts --days=7 --output=/var/log/morinalight/analytics_weekly_$(date +\%Y\%m\%d).csv >> /var/log/morinalight/analytics.log 2>&1

# ============================================
# Daily Database Backup (2 AM)
# ============================================
0 2 * * * cd $PROJECT_PATH && ./scripts/backup-database.sh >> /var/log/morinalight/backup.log 2>&1

# ============================================
# Monthly Security Report (1st of month, 8 AM)
# ============================================
0 8 1 * * cd $PROJECT_PATH && npx tsx src/scripts/generate-security-report.ts --month=last >> /var/log/morinalight/monthly-report.log 2>&1

# ============================================
# Log Rotation (Daily at midnight)
# ============================================
0 0 * * * find /var/log/morinalight -name "*.log" -mtime +30 -delete

# ============================================
# Verify Cron Execution
# ============================================
# To verify cron jobs are running:
# tail -f /var/log/morinalight/security-monitor.log
# tail -f /var/log/morinalight/block-review.log
