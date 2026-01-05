#!/bin/bash

# Morina - E2E Test Suite
# Comprehensive end-to-end tests for all systems

set -e

echo "🧪 Morina E2E Test Suite"
echo "========================"
echo ""

API_URL="http://localhost:3333"
WEB_URL="http://localhost:3000"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

TESTS_PASSED=0
TESTS_FAILED=0

# Helper function
run_test() {
    local test_name=$1
    local test_command=$2
    
    echo -n "Testing: $test_name... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo "1️⃣  Authentication Tests"
echo "------------------------"

# Test 1: Login with valid credentials
run_test "Login with valid credentials" \
    "curl -s -X POST $API_URL/api/auth/login \
        -H 'Content-Type: application/json' \
        -d '{\"email\":\"admin@morina.ai\",\"password\":\"admin123\"}' \
        | grep -q 'access_token'"

# Test 2: Login with invalid credentials
run_test "Login with invalid credentials (should fail)" \
    "! curl -s -X POST $API_URL/api/auth/login \
        -H 'Content-Type: application/json' \
        -d '{\"email\":\"wrong@test.com\",\"password\":\"wrong\"}' \
        | grep -q 'access_token'"

echo ""
echo "2️⃣  Security Tests"
echo "------------------"

# Test 3: Rate limiting
run_test "Rate limiting (6th request should be blocked)" \
    "for i in {1..6}; do \
        curl -s -X POST $API_URL/api/auth/login \
            -d '{\"email\":\"test@test.com\",\"password\":\"wrong\"}' \
    done | tail -1 | grep -q '429'"

# Test 4: CSRF token generation
run_test "CSRF token generation" \
    "curl -s $API_URL/api/auth/csrf-token | grep -q 'token'"

echo ""
echo "3️⃣  Permissions Tests"
echo "---------------------"

# Get auth token for subsequent tests
TOKEN=$(curl -s -X POST $API_URL/api/auth/login \
    -H 'Content-Type: application/json' \
    -d '{\"email\":\"admin@morina.ai\",\"password\":\"admin123\"}' \
    | jq -r '.access_token')

# Test 5: Get permission matrix
run_test "Get permission matrix" \
    "curl -s -H 'Authorization: Bearer $TOKEN' \
        $API_URL/api/permissions/matrix | grep -q 'permissions'"

# Test 6: Check effective permissions
run_test "Check effective permissions" \
    "curl -s -H 'Authorization: Bearer $TOKEN' \
        $API_URL/api/permissions/effective | grep -q 'permissions'"

echo ""
echo "4️⃣  Audit System Tests"
echo "----------------------"

# Test 7: Run audit
run_test "Run permission audit" \
    "curl -s -X POST -H 'Authorization: Bearer $TOKEN' \
        $API_URL/api/permissions/audit/run | grep -q 'success'"

# Test 8: Get SoD policies
run_test "Get SoD policies" \
    "curl -s -H 'Authorization: Bearer $TOKEN' \
        $API_URL/api/permissions/sod-policies | grep -q 'policies'"

# Test 9: Install pre-defined SoD policies
run_test "Install pre-defined SoD policies" \
    "curl -s -X POST -H 'Authorization: Bearer $TOKEN' \
        $API_URL/api/permissions/sod-policies/install-pre-defined | grep -q 'installed'"

echo ""
echo "5️⃣  ML Detection Tests"
echo "----------------------"

# Test 10: ML detection status
run_test "ML detection status" \
    "curl -s -H 'Authorization: Bearer $TOKEN' \
        $API_URL/api/permissions/ml/status | grep -q 'enabled'"

# Test 11: Run ML detection
run_test "Run ML anomaly detection" \
    "curl -s -X POST -H 'Authorization: Bearer $TOKEN' \
        $API_URL/api/permissions/ml/detect | grep -q 'success'"

echo ""
echo "6️⃣  SIEM Integration Tests"
echo "---------------------------"

# Test 12: SIEM status
run_test "SIEM integration status" \
    "curl -s -H 'Authorization: Bearer $TOKEN' \
        $API_URL/api/permissions/integrations/siem/status | grep -q 'configured'"

echo ""
echo "7️⃣  Frontend Tests"
echo "------------------"

# Test 13: Web app loads
run_test "Web app loads" \
    "curl -s $WEB_URL | grep -q 'Morina'"

# Test 14: Login page loads
run_test "Login page loads" \
    "curl -s $WEB_URL/login | grep -q 'login'"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  E2E TEST RESULTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

TOTAL=$((TESTS_PASSED + TESTS_FAILED))
PERCENTAGE=$((TESTS_PASSED * 100 / TOTAL))

echo "Success Rate: $PERCENTAGE%"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
