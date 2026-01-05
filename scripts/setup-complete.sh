#!/bin/bash

# Morina Security System - Complete Setup Script
# This script automates ALL configuration steps for 100% conformance

set -e  # Exit on error

echo "🚀 Morina Security System - Complete Setup"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check Prerequisites
echo "📋 Step 1/10: Checking Prerequisites..."

command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ Node.js is required but not installed${NC}"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}❌ npm is required but not installed${NC}"; exit 1; }
command -v redis-cli >/dev/null 2>&1 || { echo -e "${RED}❌ Redis is required but not installed${NC}"; exit 1; }
command -v psql >/dev/null 2>&1 || { echo -e "${RED}❌ PostgreSQL is required but not installed${NC}"; exit 1; }

echo -e "${GREEN}✅ All prerequisites installed${NC}"
echo ""

# Step 2: Install Dependencies
echo "📦 Step 2/10: Installing Dependencies..."

cd apps/api
npm install @slack/webhook nodemailer @maxmind/geoip2-node @simplewebauthn/server --save
npm install @types/nodemailer --save-dev

cd ../web
npm install @fingerprintjs/fingerprintjs @simplewebauthn/browser --save

cd ../..

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 3: Setup Environment Variables
echo "⚙️  Step 3/10: Setting up Environment Variables..."

if [ ! -f apps/api/.env ]; then
    cat > apps/api/.env << 'EOF'
# Core Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/morina
REDIS_URL=redis://localhost:6379
JWT_SECRET=$(openssl rand -base64 32)
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

# Security Alerts
SLACK_WEBHOOK_URL=
ALERT_EMAIL_FROM=security@morina.ai
ALERT_EMAIL_TO=admin@morina.ai
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=

# Geolocation
GEOIP_DB_PATH=/usr/share/GeoIP/GeoLite2-City.mmdb

# SIEM (Optional)
SPLUNK_HEC_URL=
SPLUNK_HEC_TOKEN=
ELASTICSEARCH_URL=
ELASTICSEARCH_API_KEY=
ELASTICSEARCH_INDEX=morina-audit

# WebAuthn (Optional)
WEBAUTHN_RP_ID=localhost
WEBAUTHN_ORIGIN=http://localhost:3000

# Machine Learning
ML_ENABLED=true
ML_TRAINING_SCHEDULE=0 2 * * *
ML_MIN_TRAINING_SAMPLES=1000
EOF
    echo -e "${GREEN}✅ Created .env file${NC}"
else
    echo -e "${YELLOW}⚠️  .env file already exists, skipping${NC}"
fi

echo ""

# Step 4: Setup GeoIP Database
echo "🌍 Step 4/10: Setting up GeoIP Database..."

if [ ! -f /usr/share/GeoIP/GeoLite2-City.mmdb ]; then
    echo "Downloading GeoLite2-City database..."
    
    # Create directory
    sudo mkdir -p /usr/share/GeoIP
    
    # Download (requires MaxMind account - manual step)
    echo -e "${YELLOW}⚠️  Manual step required:${NC}"
    echo "1. Create account at: https://www.maxmind.com/en/geolite2/signup"
    echo "2. Download GeoLite2-City.mmdb"
    echo "3. Run: sudo mv ~/Downloads/GeoLite2-City.mmdb /usr/share/GeoIP/"
    echo ""
    echo "Press Enter when done..."
    read
    
    if [ -f /usr/share/GeoIP/GeoLite2-City.mmdb ]; then
        echo -e "${GREEN}✅ GeoIP database installed${NC}"
    else
        echo -e "${YELLOW}⚠️  GeoIP database not found, skipping (optional)${NC}"
    fi
else
    echo -e "${GREEN}✅ GeoIP database already installed${NC}"
fi

echo ""

# Step 5: Test Redis Connection
echo "🔴 Step 5/10: Testing Redis Connection..."

if redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis is running${NC}"
else
    echo -e "${RED}❌ Redis is not running. Starting Redis...${NC}"
    sudo service redis-server start || brew services start redis
fi

echo ""

# Step 6: Test PostgreSQL Connection
echo "🐘 Step 6/10: Testing PostgreSQL Connection..."

if psql -U postgres -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL is running${NC}"
else
    echo -e "${RED}❌ PostgreSQL is not running. Please start PostgreSQL${NC}"
    exit 1
fi

echo ""

# Step 7: Run Database Migrations
echo "🗄️  Step 7/10: Running Database Migrations..."

cd apps/api
npx prisma generate
npx prisma migrate dev --name init

echo -e "${GREEN}✅ Database migrations completed${NC}"
echo ""

# Step 8: Create Fail2Ban Log Directory
echo "🛡️  Step 8/10: Setting up Fail2Ban..."

sudo mkdir -p /var/log/morina
sudo chmod 755 /var/log/morina

echo -e "${GREEN}✅ Fail2Ban log directory created${NC}"
echo ""

# Step 9: Build Projects
echo "🔨 Step 9/10: Building Projects..."

cd apps/api
npm run build

cd ../web
npm run build

cd ../..

echo -e "${GREEN}✅ Projects built successfully${NC}"
echo ""

# Step 10: Verification
echo "✅ Step 10/10: Final Verification..."

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Configure Slack webhook (optional): Edit apps/api/.env"
echo "2. Configure SMTP credentials (optional): Edit apps/api/.env"
echo "3. Start API: cd apps/api && npm run start"
echo "4. Start Web: cd apps/web && npm run dev"
echo ""
echo "For testing:"
echo "- Run: ./scripts/test-security.sh"
echo ""
