#!/bin/bash

# OWASP Basic Verification Script
# Checks common security headers and endpoints

TARGET_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "Starting OWASP Basic Verification against $TARGET_URL..."

check_header() {
    HEADER=$1
    RESPONSE=$(curl -s -I "$TARGET_URL")
    if echo "$RESPONSE" | grep -i -q "$HEADER"; then
        echo -e "${GREEN}[PASS]${NC} Header $HEADER found."
    else
        echo -e "${RED}[FAIL]${NC} Header $HEADER NOT found."
    fi
}

echo "--- Security Headers ---"
check_header "Strict-Transport-Security"
check_header "X-Content-Type-Options"
check_header "X-Frame-Options"
check_header "Content-Security-Policy"
check_header "Referrer-Policy"
check_header "Permissions-Policy"

echo "--- Cookie Security ---"
# Check if cookies are HttpOnly and Secure (Requires inspecting a response with a Set-Cookie)
# We'll stick to static header checks for this script for simplicity or try to hit an auth endpoint if possible.
echo "Checking for HttpOnly/Secure flags on Set-Cookie..."
COOKIE_RESPONSE=$(curl -s -I "$TARGET_URL/api/auth/csrf") # Example endpoint
if echo "$COOKIE_RESPONSE" | grep -i "Set-Cookie" | grep -i "HttpOnly"; then
    echo -e "${GREEN}[PASS]${NC} Cookies are HttpOnly."
else
    echo -e "${RED}[WARN]${NC} HttpOnly flag not detected (might not be setting cookies on this endpoint)."
fi

if echo "$COOKIE_RESPONSE" | grep -i "Set-Cookie" | grep -i "Secure"; then
    echo -e "${GREEN}[PASS]${NC} Cookies are Secure."
else
    echo -e "${RED}[WARN]${NC} Secure flag not detected (might be strictly local dev or not setting cookies)."
fi

echo "--- Verification Complete ---"
