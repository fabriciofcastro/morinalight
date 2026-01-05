#!/bin/bash

# Morina Security System - Comprehensive Testing Script
# Tests all security features for 100% conformance

set -e

echo "🧪 Morina Security System - Comprehensive Tests"
echo "=============================================="
echo ""

API_URL="http://localhost:3333"
WEB_URL="http://localhost:3000"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test 1: Health Check
echo "1️⃣  Testing API Health..."
if curl -s "$API_URL/health" > /dev/null; then
    echo -e "${GREEN}✅ API is healthy${NC}"
else
    echo -e "${RED}❌ API is not responding${NC}"
    exit 1
fi
echo ""

# Test 2: Redis Connection
echo "2️⃣  Testing Redis Connection..."
if redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis is connected${NC}"
else
    echo -e "${RED}❌ Redis is not connected${NC}"
    exit 1
fi
echo ""

# Test 3: Rate Limiting
echo "3️⃣  Testing Rate Limiting..."
echo "Sending 6 login requests (should block on 6th)..."

for i in {1..6}; do
    RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null -X POST "$API_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"test@test.com","password":"wrong"}')
    
    if [ $i -eq 6 ]; then
        if [ "$RESPONSE" -eq 429 ]; then
            echo -e "${GREEN}✅ Rate limiting working (got 429 on 6th request)${NC}"
        else
            echo -e "${RED}❌ Rate limiting not working (expected 429, got $RESPONSE)${NC}"
        fi
    fi
done
echo ""

# Test 4: CSRF Protection
echo "4️⃣  Testing CSRF Protection..."

# Get CSRF token
CSRF_RESPONSE=$(curl -s "$API_URL/api/auth/csrf-token")
CSRF_TOKEN=$(echo $CSRF_RESPONSE | jq -r '.token')

if [ -n "$CSRF_TOKEN" ] && [ "$CSRF_TOKEN" != "null" ]; then
    echo -e "${GREEN}✅ CSRF token generated: ${CSRF_TOKEN:0:20}...${NC}"
    
    # Test without token (should fail)
    RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null -X POST "$API_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"test@test.com","password":"test1234"}')
    
    if [ "$RESPONSE" -eq 403 ]; then
        echo -e "${GREEN}✅ CSRF protection working (blocked request without token)${NC}"
    else
        echo -e "${YELLOW}⚠️  CSRF protection may not be working (expected 403, got $RESPONSE)${NC}"
    fi
else
    echo -e "${RED}❌ Failed to get CSRF token${NC}"
fi
echo ""

# Test 5: GeoIP Database
echo "5️⃣  Testing GeoIP Database..."
if [ -f /usr/share/GeoIP/GeoLite2-City.mmdb ]; then
    echo -e "${GREEN}✅ GeoIP database found${NC}"
else
    echo -e "${YELLOW}⚠️  GeoIP database not found (optional feature)${NC}"
fi
echo ""

# Test 6: Fail2Ban Logs
echo "6️⃣  Testing Fail2Ban Log Directory..."
if [ -d /var/log/morina ]; then
    echo -e "${GREEN}✅ Fail2Ban log directory exists${NC}"
else
    echo -e "${YELLOW}⚠️  Fail2Ban log directory not found${NC}"
fi
echo ""

# Test 7: Environment Variables
echo "7️⃣  Testing Environment Variables..."

cd apps/api

if [ -f .env ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
    
    # Check critical variables
    if grep -q "DATABASE_URL" .env; then
        echo -e "${GREEN}  ✓ DATABASE_URL configured${NC}"
    fi
    
    if grep -q "REDIS_URL" .env; then
        echo -e "${GREEN}  ✓ REDIS_URL configured${NC}"
    fi
    
    if grep -q "JWT_SECRET" .env; then
        echo -e "${GREEN}  ✓ JWT_SECRET configured${NC}"
    fi
    
    # Check optional variables
    if grep -q "SLACK_WEBHOOK_URL=" .env && [ -n "$(grep SLACK_WEBHOOK_URL .env | cut -d'=' -f2)" ]; then
        echo -e "${GREEN}  ✓ Slack alerts configured${NC}"
    else
        echo -e "${YELLOW}  ⚠️  Slack alerts not configured (optional)${NC}"
    fi
    
    if grep -q "SMTP_USER=" .env && [ -n "$(grep SMTP_USER .env | cut -d'=' -f2)" ]; then
        echo -e "${GREEN}  ✓ Email alerts configured${NC}"
    else
        echo -e "${YELLOW}  ⚠️  Email alerts not configured (optional)${NC}"
    fi
else
    echo -e "${RED}❌ .env file not found${NC}"
fi

cd ../..
echo ""

# Test 8: Database Connection
echo "8️⃣  Testing Database Connection..."
cd apps/api
if npx prisma db execute --stdin <<< "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
fi
cd ../..
echo ""

# Test 9: Build Status
echo "9️⃣  Testing Build Status..."
if [ -d apps/api/dist ]; then
    echo -e "${GREEN}✅ API build exists${NC}"
else
    echo -e "${YELLOW}⚠️  API not built yet${NC}"
fi

if [ -d apps/web/.next ]; then
    echo -e "${GREEN}✅ Web build exists${NC}"
else
    echo -e "${YELLOW}⚠️  Web not built yet${NC}"
fi
echo ""

# Test 10: Conformance Score
echo "🎯 Calculating Conformance Score..."
echo ""

SCORE=0
MAX_SCORE=100

# Core features (40 points)
[ -f apps/api/.env ] && SCORE=$((SCORE + 10))
redis-cli ping > /dev/null 2>&1 && SCORE=$((SCORE + 10))
[ -d apps/api/dist ] && SCORE=$((SCORE + 10))
[ -d apps/web/.next ] && SCORE=$((SCORE + 10))

# Security features (30 points)
curl -s "$API_URL/health" > /dev/null && SCORE=$((SCORE + 10))
[ -f /usr/share/GeoIP/GeoLite2-City.mmdb ] && SCORE=$((SCORE + 10))
[ -d /var/log/morina ] && SCORE=$((SCORE + 10))

# Optional features (30 points)
grep -q "SLACK_WEBHOOK_URL=" apps/api/.env && [ -n "$(grep SLACK_WEBHOOK_URL apps/api/.env | cut -d'=' -f2)" ] && SCORE=$((SCORE + 10))
grep -q "SMTP_USER=" apps/api/.env && [ -n "$(grep SMTP_USER apps/api/.env | cut -d'=' -f2)" ] && SCORE=$((SCORE + 10))
grep -q "ELASTICSEARCH_URL=" apps/api/.env && [ -n "$(grep ELASTICSEARCH_URL apps/api/.env | cut -d'=' -f2)" ] && SCORE=$((SCORE + 10))

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  CONFORMANCE SCORE: $SCORE/$MAX_SCORE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $SCORE -ge 95 ]; then
    echo -e "${GREEN}✅ Excelente (95-100%)${NC}"
elif [ $SCORE -ge 80 ]; then
    echo -e "${GREEN}👍 Bom (80-94%)${NC}"
elif [ $SCORE -ge 60 ]; then
    echo -e "${YELLOW}⚠️  Atenção (60-79%)${NC}"
else
    echo -e "${RED}🚨 Crítico (0-59%)${NC}"
fi

echo ""
echo "Test Summary Complete!"
