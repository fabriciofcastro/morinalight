#!/bin/bash
set -e

# Pre-Deployment Safety Checks

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

FAILED=0

echo -e "${YELLOW}=== Pre-Deployment Safety Checks ===${NC}\n"

# Check 1: Environment variables
echo -n "Checking environment variables... "
if [ ! -f ".env.production" ]; then
    echo -e "${RED}✗ .env.production not found${NC}"
    FAILED=1
else
    # Check for default/placeholder values
    if grep -q "CHANGE_ME" .env.production; then
        echo -e "${RED}✗ Found placeholder values in .env.production${NC}"
        FAILED=1
    else
        echo -e "${GREEN}✓${NC}"
    fi
fi

# Check 2: Docker is running
echo -n "Checking Docker... "
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker is not running${NC}"
    FAILED=1
else
    echo -e "${GREEN}✓${NC}"
fi

# Check 3: Disk space
echo -n "Checking disk space... "
AVAILABLE=$(df -BG . | tail -1 | awk '{print $4}' | sed 's/G//')
if [ "$AVAILABLE" -lt 10 ]; then
    echo -e "${RED}✗ Less than 10GB available${NC}"
    FAILED=1
else
    echo -e "${GREEN}✓ (${AVAILABLE}GB available)${NC}"
fi

# Check 4: Required ports
echo -n "Checking required ports... "
PORTS=(80 443 3333 3334 5432 6379)
PORT_CONFLICTS=0
for port in "${PORTS[@]}"; do
    if netstat -tuln 2>/dev/null | grep -q ":$port "; then
        PORT_CONFLICTS=$((PORT_CONFLICTS + 1))
    fi
done
if [ $PORT_CONFLICTS -gt 0 ]; then
    echo -e "${YELLOW}⚠ Some ports may be in use${NC}"
else
    echo -e "${GREEN}✓${NC}"
fi

# Check 5: Git status
echo -n "Checking Git status... "
if ! git diff --quiet HEAD 2>/dev/null; then
    echo -e "${YELLOW}⚠ Uncommitted changes detected${NC}"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        FAILED=1
    fi
else
    echo -e "${GREEN}✓${NC}"
fi

# Check 6: Backup exists
echo -n "Checking for recent backup... "
if [ -d "backups" ] && [ -n "$(ls -A backups/*.sql.gz 2>/dev/null)" ]; then
    LATEST_BACKUP=$(ls -t backups/*.sql.gz | head -1)
    BACKUP_AGE=$(( ($(date +%s) - $(stat -c %Y "$LATEST_BACKUP")) / 3600 ))
    if [ $BACKUP_AGE -lt 24 ]; then
        echo -e "${GREEN}✓ (Backup from ${BACKUP_AGE}h ago)${NC}"
    else
        echo -e "${YELLOW}⚠ Backup is older than 24h${NC}"
    fi
else
    echo -e "${YELLOW}⚠ No backup found${NC}"
    read -p "Create backup before deploying? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ./deploy/backup.sh
    fi
fi

# Check 7: Current system health
echo -n "Checking current system health... "
if curl -f -s http://localhost/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠ System may be down or not running${NC}"
fi

if [ $FAILED -eq 1 ]; then
    echo -e "\n${RED}✗ Pre-deployment checks failed!${NC}"
    echo -e "${RED}Please fix the issues above before deploying.${NC}"
    exit 1
else
    echo -e "\n${GREEN}✓ All pre-deployment checks passed!${NC}"
    exit 0
fi

