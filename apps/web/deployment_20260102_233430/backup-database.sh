#!/bin/bash
# Database Backup Script

# Configuration
DB_USER="your_db_user"
DB_NAME="your_db_name"
BACKUP_DIR="/var/backups/morinalight"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p "$BACKUP_DIR"

# PostgreSQL backup
echo "Creating database backup..."
pg_dump -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_DIR/backup_$DATE.sql"

# Compress backup
gzip "$BACKUP_DIR/backup_$DATE.sql"

# Verify backup
if [ -f "$BACKUP_DIR/backup_$DATE.sql.gz" ]; then
    SIZE=$(du -h "$BACKUP_DIR/backup_$DATE.sql.gz" | cut -f1)
    echo "✓ Backup created: backup_$DATE.sql.gz ($SIZE)"
    
    # Keep only last 7 backups
    cd "$BACKUP_DIR"
    ls -t backup_*.sql.gz | tail -n +8 | xargs -r rm
    echo "✓ Old backups cleaned"
else
    echo "✗ Backup failed!"
    exit 1
fi

# Test restore (optional)
# psql -U "$DB_USER" -d test_database < "$BACKUP_DIR/backup_$DATE.sql"
