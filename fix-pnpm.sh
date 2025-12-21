#!/bin/bash

# Script para corrigir o PATH do pnpm

echo "🔧 Verificando instalação do pnpm..."

# Verificar se pnpm existe
if [ -f "$HOME/.local/share/pnpm/pnpm" ]; then
    echo "✅ pnpm encontrado em: $HOME/.local/share/pnpm/pnpm"
else
    echo "❌ pnpm não encontrado. Instalando..."
    curl -fsSL https://get.pnpm.io/install.sh | sh -
fi

# Adicionar ao .zshrc se não estiver lá
if ! grep -q "PNPM_HOME" ~/.zshrc; then
    echo "📝 Adicionando configuração ao .zshrc..."
    cat >> ~/.zshrc << 'EOF'

# pnpm
export PNPM_HOME="$HOME/.local/share/pnpm"
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac
# pnpm end
EOF
    echo "✅ Configuração adicionada ao .zshrc"
else
    echo "✅ Configuração já existe no .zshrc"
fi

# Aplicar no shell atual
export PNPM_HOME="$HOME/.local/share/pnpm"
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac

echo ""
echo "✅ Configuração aplicada!"
echo ""
echo "📋 Para usar no terminal atual, execute:"
echo "   source ~/.zshrc"
echo ""
echo "📋 Ou feche e abra um novo terminal"
echo ""
echo "🧪 Testando pnpm..."
if command -v pnpm &> /dev/null; then
    pnpm --version
    echo ""
    echo "✅ pnpm está funcionando!"
else
    echo "❌ Ainda não funciona. Tente executar: source ~/.zshrc"
fi





