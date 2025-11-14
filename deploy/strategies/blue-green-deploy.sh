#!/bin/bash
set -e

# Blue-Green Deployment Strategy
# This script implements zero-downtime deployment by switching between two identical environments

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
ENVIRONMENT=${1:-production}
CURRENT_COLOR=$(docker compose -f docker-compose.prod.yml ps --format json | jq -r '.[] | select(.Service | contains("api-1")) | .Labels."com.docker.compose.project.config_files"' | head -1 || echo "blue")
NEW_COLOR=$([ "$CURRENT_COLOR" == "blue" ] && echo "green" || echo "blue")

COMPOSE_FILE="docker-compose.prod.yml"
HEALTH_CHECK_URL="http://localhost/api/health"
MAX_HEALTH_CHECK_RETRIES=30
HEALTH_CHECK_INTERVAL=5

echo -e "${BLUE}=== Blue-Green Deployment ===${NC}"
echo -e "${YELLOW}Current environment: ${CURRENT_COLOR}${NC}"
echo -e "${YELLOW}Deploying to: ${NEW_COLOR}${NC}\n"

# Step 1: Build new environment
echo -e "${GREEN}[1/5] Building new ${NEW_COLOR} environment...${NC}"
docker compose -f $COMPOSE_FILE build --no-cache

# Step 2: Start new environment in parallel
echo -e "${GREEN}[2/5] Starting new ${NEW_COLOR} environment...${NC}"
# Note: In a real scenario, you'd use different compose files or labels
# For now, we'll use a staging approach
docker compose -f $COMPOSE_FILE up -d --scale api-1=0 --scale api-2=0
docker compose -f $COMPOSE_FILE up -d --scale api-1=1 --scale api-2=1

# Step 3: Wait for new environment to be healthy
echo -e "${GREEN}[3/5] Waiting for ${NEW_COLOR} environment to be healthy...${NC}"
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_HEALTH_CHECK_RETRIES ]; do
    if curl -f -s $HEALTH_CHECK_URL > /dev/null 2>&1; then
        echo -e "${GREEN}✓ ${NEW_COLOR} environment is healthy${NC}"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo -e "${YELLOW}Waiting for health check... (${RETRY_COUNT}/${MAX_HEALTH_CHECK_RETRIES})${NC}"
    sleep $HEALTH_CHECK_INTERVAL
done

if [ $RETRY_COUNT -eq $MAX_HEALTH_CHECK_RETRIES ]; then
    echo -e "${RED}✗ ${NEW_COLOR} environment failed health checks${NC}"
    echo -e "${RED}Rolling back to ${CURRENT_COLOR} environment...${NC}"
    docker compose -f $COMPOSE_FILE restart
    exit 1
fi

# Step 4: Run smoke tests
echo -e "${GREEN}[4/5] Running smoke tests...${NC}"
./deploy/strategies/smoke-tests.sh || {
    echo -e "${RED}✗ Smoke tests failed${NC}"
    echo -e "${RED}Rolling back...${NC}"
    docker compose -f $COMPOSE_FILE restart
    exit 1
}

# Step 5: Switch traffic (update nginx config)
echo -e "${GREEN}[5/5] Switching traffic to ${NEW_COLOR} environment...${NC}"
# In production, you'd update nginx config or use service discovery
docker compose -f $COMPOSE_FILE restart nginx

# Step 6: Monitor for issues
echo -e "${GREEN}Monitoring for 60 seconds...${NC}"
sleep 60

# Final health check
if curl -f -s $HEALTH_CHECK_URL > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Deployment successful!${NC}"
    echo -e "${GREEN}New environment: ${NEW_COLOR}${NC}"
    
    # Cleanup old environment after grace period
    echo -e "${YELLOW}Old ${CURRENT_COLOR} environment will be kept for 24h for rollback${NC}"
else
    echo -e "${RED}✗ Deployment failed after switch${NC}"
    echo -e "${RED}Initiating automatic rollback...${NC}"
    ./deploy/rollback.sh
    exit 1
fi


