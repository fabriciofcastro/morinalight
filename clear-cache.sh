#!/bin/bash

# Script para limpar cache do Next.js/Turbopack e reiniciar

echo "🧹 Limpando cache do Next.js..."

# Parar processos do Next.js
pkill -f "next dev" || true
pkill -f "turbopack" || true

# Limpar diretórios de cache
rm -rf apps/web/.next
rm -rf apps/web/.turbo
rm -rf apps/web/node_modules/.cache

echo "✅ Cache limpo!"
echo ""
echo "🚀 Para reiniciar o frontend, execute:"
echo "   cd apps/web"
echo "   pnpm dev"
