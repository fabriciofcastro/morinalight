#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
COMPOSE_FILE="docker-compose.prod.yml"

# Create backup directory
mkdir -p $BACKUP_DIR

echo -e "${GREEN}Starting backup process...${NC}"

# Backup PostgreSQL
echo -e "${GREEN}Backing up PostgreSQL...${NC}"
docker compose -f $COMPOSE_FILE exec -T postgres-master \
  pg_dump -U morina morina | gzip > "$BACKUP_DIR/postgres_$TIMESTAMP.sql.gz"

# Backup Redis (if needed)
echo -e "${GREEN}Backing up Redis...${NC}"
docker compose -f $COMPOSE_FILE exec -T redis-master \
  redis-cli --rdb - | gzip > "$BACKUP_DIR/redis_$TIMESTAMP.rdb.gz" || true

# Keep only last 7 days of backups
echo -e "${GREEN}Cleaning old backups (keeping last 7 days)...${NC}"
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo -e "${GREEN}Backup completed successfully!${NC}"
echo -e "${YELLOW}Backup location: $BACKUP_DIR${NC}"

# List backups
echo -e "${GREEN}Recent backups:${NC}"
ls -lh $BACKUP_DIR | tail -5

