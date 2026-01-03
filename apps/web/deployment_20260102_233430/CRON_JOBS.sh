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
