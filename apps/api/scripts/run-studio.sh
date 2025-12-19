#!/bin/bash
# Script simples para rodar Prisma Studio com .env da raiz

# Ir para a raiz do projeto
cd "$(dirname "$0")/../../.." || exit 1

# Carregar todas as variáveis do .env (sem comentários e linhas vazias)
set -a
source <(grep -v '^#' .env | grep -v '^$' | sed 's/^/export /')
set +a

# Verificar se DATABASE_URL foi carregada
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Erro: DATABASE_URL não encontrada no .env"
  echo "   Verifique se o arquivo .env existe na raiz do projeto"
  exit 1
fi

echo "✅ DATABASE_URL carregada"
echo "   Database: $(echo $DATABASE_URL | cut -d'@' -f2 | cut -d'/' -f1)"

# Voltar para apps/api e rodar Prisma Studio
cd apps/api || exit 1
echo ""
echo "🚀 Iniciando Prisma Studio..."
echo "   Acesse em: http://localhost:5555"
echo ""

pnpm prisma studio --schema prisma/schema.prisma













