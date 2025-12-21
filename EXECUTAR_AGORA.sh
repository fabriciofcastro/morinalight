#!/bin/bash
# Execute este script no terminal: bash EXECUTAR_AGORA.sh

echo "🚀 Iniciando PostgreSQL e Redis..."
echo ""

# Comandos que você precisa executar
echo "Execute estes comandos no seu terminal:"
echo ""
echo "1. Iniciar serviços:"
echo "   sudo docker compose up -d postgres redis"
echo ""
echo "2. Aguardar alguns segundos e verificar:"
echo "   sudo docker ps | grep morina-"
echo ""
echo "3. Aplicar migrations:"
echo "   cd apps/api"
echo "   export PNPM_HOME=\"\$HOME/.local/share/pnpm\""
echo "   export PATH=\"\$PNPM_HOME:\$PATH\""
echo "   pnpm prisma migrate deploy"
echo ""
echo "✅ Pronto! Os serviços devem reconectar automaticamente."





