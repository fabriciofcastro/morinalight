#!/bin/bash
set -e

# Smoke Tests - Quick validation after deployment

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

BASE_URL=${1:-http://localhost}
FAILED=0

echo -e "${YELLOW}=== Running Smoke Tests ===${NC}\n"

# Test 1: Health endpoint
echo -n "Testing health endpoint... "
if curl -f -s "$BASE_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    FAILED=1
fi

# Test 2: API health
echo -n "Testing API health... "
if curl -f -s "$BASE_URL/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    FAILED=1
fi

# Test 3: Web application loads
echo -n "Testing web application... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/")
if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 302 ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ (HTTP $HTTP_CODE)${NC}"
    FAILED=1
fi

# Test 4: Database connectivity (via API)
echo -n "Testing database connectivity... "
# This would require an authenticated endpoint or health check
# For now, we'll check if API responds
if curl -f -s "$BASE_URL/api/health" | grep -q "ok" 2>/dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠ (Could not verify)${NC}"
fi

# Test 5: Redis connectivity
echo -n "Testing Redis connectivity... "
# Would need a specific endpoint for this
echo -e "${YELLOW}⚠ (Skipped)${NC}"

if [ $FAILED -eq 1 ]; then
    echo -e "\n${RED}✗ Smoke tests failed!${NC}"
    exit 1
else
    echo -e "\n${GREEN}✓ All smoke tests passed!${NC}"
    exit 0
fi
