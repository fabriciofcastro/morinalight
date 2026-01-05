#!/bin/bash

# Morina - Security Compliance Checker
# Validates that all pages follow security standards

set -e

echo "🔐 Morina Security Compliance Checker"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASSED=0
FAILED=0
WARNINGS=0

# Check frontend files
echo "📱 Checking Frontend Compliance..."
echo "-----------------------------------"

FRONTEND_FILES=$(find apps/web/src -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | grep -v ".next")

for file in $FRONTEND_FILES; do
    if [[ $file == *"/app/"* ]] || [[ $file == *"/pages/"* ]]; then
        echo -n "Checking: $(basename $file)... "
        
        ISSUES=()
        
        # Check 1: useSession for authentication
        if ! grep -q "useSession" "$file"; then
            ISSUES+=("Missing useSession()")
        fi
        
        # Check 2: useAbility for authorization
        if ! grep -q "useAbility" "$file"; then
            ISSUES+=("Missing useAbility()")
        fi
        
        # Check 3: Permission check
        if ! grep -q "ability.can" "$file" && ! grep -q "hasPermission" "$file"; then
            ISSUES+=("Missing permission check")
        fi
        
        # Check 4: Redirect to login
        if ! grep -q "redirect.*login" "$file" && ! grep -q "required: true" "$file"; then
            ISSUES+=("Missing login redirect")
        fi
        
        if [ ${#ISSUES[@]} -eq 0 ]; then
            echo -e "${GREEN}✓ PASS${NC}"
            ((PASSED++))
        else
            echo -e "${RED}✗ FAIL${NC}"
            for issue in "${ISSUES[@]}"; do
                echo "    - $issue"
            done
            ((FAILED++))
        fi
    fi
done

echo ""
echo "🔧 Checking Backend Compliance..."
echo "----------------------------------"

BACKEND_FILES=$(find apps/api/src -name "*.route.ts" -o -name "*.controller.ts" | grep -v "node_modules")

for file in $BACKEND_FILES; do
    echo -n "Checking: $(basename $file)... "
    
    ISSUES=()
    
    # Check 1: Authentication middleware
    if ! grep -q "app.authenticate" "$file" && ! grep -q "preHandler.*authenticate" "$file"; then
        ISSUES+=("Missing authentication")
    fi
    
    # Check 2: Schema validation
    if ! grep -q "schema:" "$file"; then
        ISSUES+=("Missing schema validation")
    fi
    
    # Check 3: Permission check
    if ! grep -q "checkPermission" "$file" && ! grep -q "hasPermission" "$file"; then
        ISSUES+=("Missing permission check")
    fi
    
    # Check 4: Audit logging
    if ! grep -q "auditLog" "$file" && ! grep -q "audit(" "$file"; then
        ISSUES+=("Missing audit logging")
    fi
    
    # Check 5: Rate limiting
    if ! grep -q "rateLimit" "$file"; then
        ISSUES+=("Missing rate limiting")
    fi
    
    if [ ${#ISSUES[@]} -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASSED++))
    elif [ ${#ISSUES[@]} -le 2 ]; then
        echo -e "${YELLOW}⚠ WARNING${NC}"
        for issue in "${ISSUES[@]}"; do
            echo "    - $issue"
        done
        ((WARNINGS++))
    else
        echo -e "${RED}✗ FAIL${NC}"
        for issue in "${ISSUES[@]}"; do
            echo "    - $issue"
        done
        ((FAILED++))
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  SECURITY COMPLIANCE RESULTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

TOTAL=$((PASSED + WARNINGS + FAILED))
if [ $TOTAL -eq 0 ]; then
    echo "No files to check"
    exit 0
fi

COMPLIANCE_SCORE=$(( (PASSED + WARNINGS/2) * 100 / TOTAL ))

echo "Compliance Score: $COMPLIANCE_SCORE%"
echo ""

if [ $COMPLIANCE_SCORE -ge 90 ]; then
    echo -e "${GREEN}✅ Excellent compliance${NC}"
    exit 0
elif [ $COMPLIANCE_SCORE -ge 70 ]; then
    echo -e "${YELLOW}⚠️  Good compliance, some improvements needed${NC}"
    exit 0
else
    echo -e "${RED}❌ Poor compliance, immediate action required${NC}"
    exit 1
fi
