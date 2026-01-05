#!/bin/bash
# Script to clean up stale lock files and start development servers
# This prevents the "Unable to acquire lock" error in Next.js

set -e

echo "🧹 Cleaning up stale lock files..."

# Remove Next.js dev lock file if it exists
if [ -f "apps/web/.next/dev/lock" ]; then
  echo "  ✓ Removing apps/web/.next/dev/lock"
  rm -f apps/web/.next/dev/lock
fi

# Remove any other potential lock files
find apps/web/.next -name "*.lock" -type f -delete 2>/dev/null || true

echo "✅ Cleanup complete!"
echo ""
echo "🚀 Starting development servers..."
echo ""

# Start turbo dev
pnpm turbo dev
