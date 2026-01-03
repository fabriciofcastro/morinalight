#!/bin/bash

# 🚀 Security Features Quick Setup Script
# This script helps you set up all security features quickly

set -e

echo "🔐 MorinaLight Security Setup"
echo "=============================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the apps/web directory"
    exit 1
fi

# Step 1: Copy environment variables
echo "📋 Step 1: Setting up environment variables..."
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists"
    read -p "Do you want to append security variables? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cat .env.security >> .env.local
        echo "✅ Security variables appended to .env.local"
    fi
else
    cp .env.security .env.local
    echo "✅ Created .env.local with security variables"
fi

# Step 2: Run tests
echo ""
echo "🧪 Step 2: Running security tests..."
pnpm test security

# Step 3: Check dependencies
echo ""
echo "📦 Step 3: Checking dependencies..."
if grep -q "resend" package.json && grep -q "@upstash/redis" package.json; then
    echo "✅ All dependencies installed"
else
    echo "⚠️  Some dependencies missing. Installing..."
    pnpm add resend @upstash/redis
fi

# Step 4: Provide next steps
echo ""
echo "✅ Basic setup complete!"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Configure optional services:"
echo "   - Resend (email): https://resend.com"
echo "   - Upstash (Redis): https://upstash.com"
echo ""
echo "2. Update .env.local with your API keys:"
echo "   - RESEND_API_KEY=re_xxxxx"
echo "   - UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io"
echo "   - UPSTASH_REDIS_REST_TOKEN=xxxxx"
echo ""
echo "3. Before production deployment:"
echo "   - Backup your database!"
echo "   - Run: tsx src/scripts/encrypt-existing-data.ts --dry-run --all"
echo "   - Review: SECURITY_SETUP.md for detailed instructions"
echo ""
echo "4. Test the features:"
echo "   - Log monitor: tsx src/scripts/log-monitor.ts --follow"
echo "   - Block review: tsx src/scripts/review-blocks.ts --stats"
echo ""
echo "📚 Documentation:"
echo "   - Usage Guide: SECURITY_GUIDE.md"
echo "   - Setup Guide: SECURITY_SETUP.md"
echo "   - Summary: See artifacts directory"
echo ""
echo "🎉 You're ready to go!"
