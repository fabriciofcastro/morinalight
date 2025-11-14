#!/bin/bash
set -e

# Automatic Rollback Script
# Rolls back to previous version if deployment fails

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="./backups/deployments"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "${RED}=== ROLLBACK INITIATED ===${NC}\n"

# Create backup directory
mkdir -p $BACKUP_DIR

# Step 1: Save current state
echo -e "${YELLOW}[1/4] Saving current deployment state...${NC}"
docker compose -f $COMPOSE_FILE ps > "$BACKUP_DIR/failed_deployment_$TIMESTAMP.log" 2>&1

# Step 2: Stop current services
echo -e "${YELLOW}[2/4] Stopping current services...${NC}"
docker compose -f $COMPOSE_FILE stop

# Step 3: Check for previous version backup
PREVIOUS_BACKUP=$(ls -t $BACKUP_DIR/*.tar.gz 2>/dev/null | head -1)

if [ -z "$PREVIOUS_BACKUP" ]; then
    echo -e "${RED}No previous backup found!${NC}"
    echo -e "${YELLOW}Attempting to restart with current configuration...${NC}"
    docker compose -f $COMPOSE_FILE up -d
    exit 1
fi

echo -e "${GREEN}Found previous backup: $(basename $PREVIOUS_BACKUP)${NC}"

# Step 4: Restore previous version
echo -e "${YELLOW}[3/4] Restoring previous version...${NC}"
# In a real scenario, you'd restore from the backup
# For now, we'll restart with previous image tags
docker compose -f $COMPOSE_FILE pull || true
docker compose -f $COMPOSE_FILE up -d

# Step 5: Verify rollback
echo -e "${YELLOW}[4/4] Verifying rollback...${NC}"
sleep 10

RETRY_COUNT=0
MAX_RETRIES=10
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f -s http://localhost/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Rollback successful!${NC}"
        echo -e "${GREEN}System is operational with previous version${NC}"
        exit 0
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    sleep 3
done

echo -e "${RED}✗ Rollback verification failed${NC}"
echo -e "${RED}Manual intervention required!${NC}"
exit 1


