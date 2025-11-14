#!/bin/bash
set -e

# Canary Deployment Strategy
# Implementa deploy gradual (10% -> 50% -> 100% do tráfego)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

COMPOSE_FILE="docker-compose.prod.yml"
HEALTH_CHECK_URL="http://localhost/api/health"
STAGES=(10 50 100)  # Percentuais de tráfego
STAGE_DURATION=300  # 5 minutos por estágio

echo -e "${BLUE}=== Canary Deployment ===${NC}\n"

# Step 1: Build new version
echo -e "${GREEN}[1/6] Building new version...${NC}"
docker compose -f $COMPOSE_FILE build --no-cache

# Step 2: Start canary instance (1 replica)
echo -e "${GREEN}[2/6] Starting canary instance...${NC}"
docker compose -f $COMPOSE_FILE up -d --scale api-1=1 --scale api-2=0

# Step 3: Wait for canary to be healthy
echo -e "${GREEN}[3/6] Waiting for canary to be healthy...${NC}"
sleep 15

RETRY_COUNT=0
MAX_RETRIES=20
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f -s $HEALTH_CHECK_URL > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Canary is healthy${NC}"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    sleep 3
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}✗ Canary failed health checks${NC}"
    docker compose -f $COMPOSE_FILE up -d --scale api-1=0 --scale api-2=1
    exit 1
fi

# Step 4: Gradual rollout
for stage in "${STAGES[@]}"; do
    echo -e "\n${YELLOW}=== Deploying ${stage}% of traffic ===${NC}"
    
    # Atualizar nginx para direcionar % do tráfego
    # Em produção, você usaria service mesh ou load balancer avançado
    # Por simplicidade, vamos escalar os containers
    
    if [ $stage -eq 10 ]; then
        # 10%: 1 canary, 9 stable
        docker compose -f $COMPOSE_FILE up -d --scale api-1=1 --scale api-2=9
    elif [ $stage -eq 50 ]; then
        # 50%: 5 canary, 5 stable
        docker compose -f $COMPOSE_FILE up -d --scale api-1=5 --scale api-2=5
    else
        # 100%: todos canary
        docker compose -f $COMPOSE_FILE up -d --scale api-1=10 --scale api-2=0
    fi
    
    echo -e "${GREEN}Monitoring for ${STAGE_DURATION} seconds...${NC}"
    
    # Monitorar por X segundos
    for i in $(seq 1 $((STAGE_DURATION / 10))); do
        if ! curl -f -s $HEALTH_CHECK_URL > /dev/null 2>&1; then
            echo -e "${RED}✗ Health check failed at ${stage}%${NC}"
            echo -e "${RED}Rolling back...${NC}"
            docker compose -f $COMPOSE_FILE up -d --scale api-1=0 --scale api-2=10
            exit 1
        fi
        sleep 10
    done
    
    echo -e "${GREEN}✓ ${stage}% deployment successful${NC}"
done

# Step 5: Final verification
echo -e "\n${GREEN}[5/6] Running final verification...${NC}"
./deploy/strategies/smoke-tests.sh || {
    echo -e "${RED}✗ Final verification failed${NC}"
    ./deploy/rollback.sh
    exit 1
}

# Step 6: Complete deployment
echo -e "${GREEN}[6/6] Canary deployment complete!${NC}"
echo -e "${GREEN}All traffic is now on new version${NC}"


