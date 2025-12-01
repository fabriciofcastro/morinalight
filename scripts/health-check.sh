#!/bin/bash

# Morina System Health Check
# Run this script to verify both frontend and backend are running

echo "🔍 Morina System Health Check"
echo "=============================="
echo ""

# Check Backend (API)
echo "📡 Checking Backend (port 3333)..."
if curl -s http://localhost:3333/health > /dev/null 2>&1; then
    echo "✅ Backend is running and healthy"
    echo "   URL: http://localhost:3333"
else
    echo "❌ Backend is NOT running"
    echo "   Start with: cd apps/api && pnpm dev"
fi

echo ""

# Check Frontend (Web)
echo "🌐 Checking Frontend (port 3000)..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is running"
    echo "   URL: http://localhost:3000"
else
    echo "❌ Frontend is NOT running"
    echo "   Start with: cd apps/web && pnpm dev"
fi

echo ""
echo "=============================="
echo "🎯 Quick Access Links:"
echo "   Login:     http://localhost:3000/login"
echo "   Dashboard: http://localhost:3000/dashboard"
echo "   API Docs:  http://localhost:3333/health"
echo ""
echo "📚 Documentation:"
echo "   README:    ./README.md"
echo "   Status:    ./docs/CURRENT_STATUS.md"
echo "   Checklist: ./docs/VERIFICATION_CHECKLIST.md"
echo ""
