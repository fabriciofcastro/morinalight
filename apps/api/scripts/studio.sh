#!/bin/bash
# Script para iniciar Prisma Studio com .env da raiz

cd "$(dirname "$0")/../.." || exit 1

# Carregar .env da raiz
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Executar Prisma Studio
cd apps/api || exit 1
pnpm prisma studio --schema prisma/schema.prisma













