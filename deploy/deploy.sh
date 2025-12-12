#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"

echo -e "${GREEN}Starting deployment for environment: ${ENVIRONMENT}${NC}"

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

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: $ENV_FILE not found!${NC}"
    echo -e "${YELLOW}Please copy .env.production.example to .env.production and configure it.${NC}"
    exit 1
fi

# Load environment variables
export $(cat $ENV_FILE | grep -v '^#' | xargs)

# Validate required variables
REQUIRED_VARS=("POSTGRES_PASSWORD" "REDIS_PASSWORD" "JWT_SECRET" "REALTIME_SECRET")
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ] || [[ "${!var}" == *"CHANGE_ME"* ]]; then
        echo -e "${RED}Error: $var is not set or still has default value!${NC}"
        exit 1
    fi
done

# Build images
echo -e "${GREEN}Building Docker images...${NC}"
compose -f $COMPOSE_FILE build --no-cache

# Stop existing containers
echo -e "${GREEN}Stopping existing containers...${NC}"
compose -f $COMPOSE_FILE down

# Start services
echo -e "${GREEN}Starting services...${NC}"
compose -f $COMPOSE_FILE up -d

# Wait for services to be healthy
echo -e "${GREEN}Waiting for services to be healthy...${NC}"
sleep 10

# Check health
echo -e "${GREEN}Checking service health...${NC}"
compose -f $COMPOSE_FILE ps

# Run database migrations
echo -e "${GREEN}Running database migrations...${NC}"
compose -f $COMPOSE_FILE exec -T api-1 pnpm --filter @morina/api exec prisma migrate deploy || true

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${YELLOW}Services are available at:${NC}"
echo -e "  - Web: http://localhost"
echo -e "  - API: http://localhost/api"
echo -e "  - Health: http://localhost/health"

