#!/bin/bash

# Lighthouse Performance Audit Script
# Runs Lighthouse tests and generates reports

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
URL="${1:-http://localhost:3000/playbook}"
OUTPUT_DIR="./lighthouse-reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="${OUTPUT_DIR}/report_${TIMESTAMP}.html"
JSON_FILE="${OUTPUT_DIR}/report_${TIMESTAMP}.json"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔍 Lighthouse Performance Audit${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}URL:${NC} $URL"
echo -e "${YELLOW}Output:${NC} $OUTPUT_DIR"
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Check if lighthouse is installed
if ! command -v lighthouse &> /dev/null; then
    echo -e "${RED}❌ Lighthouse not found!${NC}"
    echo -e "${YELLOW}Installing Lighthouse...${NC}"
    npm install -g lighthouse
fi

# Run Lighthouse
echo -e "${YELLOW}🚀 Running Lighthouse audit...${NC}"
echo ""

lighthouse "$URL" \
    --output=html \
    --output=json \
    --output-path="$OUTPUT_DIR/report_$TIMESTAMP" \
    --chrome-flags="--headless" \
    --only-categories=performance,accessibility,best-practices,seo \
    --quiet

# Parse results
if [ -f "$JSON_FILE" ]; then
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}📊 Results${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Extract scores using jq if available
    if command -v jq &> /dev/null; then
        PERF_SCORE=$(jq -r '.categories.performance.score * 100' "$JSON_FILE")
        ACCESS_SCORE=$(jq -r '.categories.accessibility.score * 100' "$JSON_FILE")
        BP_SCORE=$(jq -r '.categories["best-practices"].score * 100' "$JSON_FILE")
        SEO_SCORE=$(jq -r '.categories.seo.score * 100' "$JSON_FILE")
        
        echo -e "Performance:    ${PERF_SCORE}%"
        echo -e "Accessibility:  ${ACCESS_SCORE}%"
        echo -e "Best Practices: ${BP_SCORE}%"
        echo -e "SEO:            ${SEO_SCORE}%"
        echo ""
        
        # Check if performance meets threshold
        if (( $(echo "$PERF_SCORE >= 90" | bc -l) )); then
            echo -e "${GREEN}✅ Performance score meets threshold (≥90)${NC}"
        else
            echo -e "${RED}❌ Performance score below threshold (<90)${NC}"
        fi
    fi
    
    echo ""
    echo -e "${YELLOW}📄 Reports generated:${NC}"
    echo -e "  HTML: $REPORT_FILE"
    echo -e "  JSON: $JSON_FILE"
    echo ""
    echo -e "${BLUE}💡 Open HTML report:${NC}"
    echo -e "  open $REPORT_FILE"
else
    echo -e "${RED}❌ Failed to generate reports${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Audit complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
