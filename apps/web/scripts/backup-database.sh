#!/bin/bash

# Database Backup Script for MorinaLight
# Automated backup with compression and rotation

set -e

# Configuration
BACKUP_DIR="/var/backups/morinalight"
DB_NAME="${DATABASE_NAME:-morina}"
DB_USER="${DATABASE_USER:-morina}"
DB_HOST="${DATABASE_HOST:-localhost}"
DB_PORT="${DATABASE_PORT:-5432}"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/morinalight_backup_${TIMESTAMP}.sql"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}🔄 Starting database backup...${NC}"
echo "Database: $DB_NAME"
echo "Timestamp: $TIMESTAMP"
echo ""

# Perform backup
echo -e "${YELLOW}📦 Creating backup...${NC}"
if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE"; then
    echo -e "${GREEN}✅ Backup created successfully${NC}"
else
    echo -e "${RED}❌ Backup failed!${NC}"
    exit 1
fi

# Compress backup
echo -e "${YELLOW}🗜️  Compressing backup...${NC}"
if gzip "$BACKUP_FILE"; then
    BACKUP_FILE="${BACKUP_FILE}.gz"
    echo -e "${GREEN}✅ Backup compressed${NC}"
else
    echo -e "${RED}❌ Compression failed!${NC}"
    exit 1
fi

# Verify backup
echo -e "${YELLOW}🔍 Verifying backup...${NC}"
if [ -f "$BACKUP_FILE" ]; then
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✅ Backup verified: $SIZE${NC}"
else
    echo -e "${RED}❌ Backup file not found!${NC}"
    exit 1
fi

# Remove old backups
echo -e "${YELLOW}🧹 Cleaning old backups (older than $RETENTION_DAYS days)...${NC}"
find "$BACKUP_DIR" -name "morinalight_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
REMAINING=$(find "$BACKUP_DIR" -name "morinalight_backup_*.sql.gz" | wc -l)
echo -e "${GREEN}✅ Cleanup complete. $REMAINING backups remaining.${NC}"

# Summary
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Backup completed successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "Backup file: $BACKUP_FILE"
echo "Size: $SIZE"
echo "Total backups: $REMAINING"
echo ""
echo -e "${YELLOW}💡 To restore this backup:${NC}"
echo "gunzip -c $BACKUP_FILE | psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
