#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

COMPOSE_FILE="docker-compose.prod.yml"

echo -e "${GREEN}=== Morina System Health Check ===${NC}\n"

# Compose wrapper (Docker ou Podman)
compose() {
  if command -v docker > /dev/null 2>&1 && docker compose version > /dev/null 2>&1; then
    docker compose "$@"
    return $?
  fi
  if command -v podman-compose > /dev/null 2>&1; then
    podman-compose "$@"
    return $?
  fi
  if command -v podman > /dev/null 2>&1 && podman compose version > /dev/null 2>&1; then
    podman compose "$@"
    return $?
  fi

  echo -e "${RED}Error: Docker Compose (docker compose) or Podman Compose not found!${NC}"
  exit 1
}

# Load environment variables (para REDIS_PASSWORD etc)
if [ -f ".env.production" ]; then
  export $(grep -v '^#' .env.production | xargs)
fi

# Check Docker Compose services
echo -e "${YELLOW}Service Status:${NC}"
compose -f $COMPOSE_FILE ps

echo -e "\n${YELLOW}Health Checks:${NC}"

# Check Nginx
if curl -f -s http://localhost/health > /dev/null; then
    echo -e "${GREEN}✓ Nginx: Healthy${NC}"
else
    echo -e "${RED}✗ Nginx: Unhealthy${NC}"
fi

# Check API servers
if curl -f -s http://localhost/api/health > /dev/null; then
    echo -e "${GREEN}✓ API: Healthy${NC}"
else
    echo -e "${RED}✗ API: Unhealthy${NC}"
fi

# Check Web servers
if curl -f -s http://localhost/ > /dev/null; then
    echo -e "${GREEN}✓ Web: Healthy${NC}"
else
    echo -e "${RED}✗ Web: Unhealthy${NC}"
fi

# Check PostgreSQL
if compose -f $COMPOSE_FILE exec -T postgres-master pg_isready -U morina > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL Master: Healthy${NC}"
else
    echo -e "${RED}✗ PostgreSQL Master: Unhealthy${NC}"
fi

if compose -f $COMPOSE_FILE exec -T postgres-replica pg_isready -U morina > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL Replica: Healthy${NC}"
else
    echo -e "${RED}✗ PostgreSQL Replica: Unhealthy${NC}"
fi

# Check Redis
if compose -f $COMPOSE_FILE exec -T redis-master redis-cli -a "$REDIS_PASSWORD" ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Redis Master: Healthy${NC}"
else
    echo -e "${RED}✗ Redis Master: Unhealthy${NC}"
fi

# Resource usage
echo -e "\n${YELLOW}Resource Usage:${NC}"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" \
  $(compose -f $COMPOSE_FILE ps -q)

# Database replication status
echo -e "\n${YELLOW}PostgreSQL Replication Status:${NC}"
compose -f $COMPOSE_FILE exec -T postgres-master \
  psql -U morina -c "SELECT client_addr, state, sync_state FROM pg_stat_replication;" 2>/dev/null || \
  echo "No replication connections found"

echo -e "\n${GREEN}Health check completed!${NC}"

