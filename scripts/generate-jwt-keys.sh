#!/bin/bash
# Script para gerar par de chaves RSA para JWT RS256

set -e

KEYS_DIR="./keys"
PRIVATE_KEY="$KEYS_DIR/jwt-private.pem"
PUBLIC_KEY="$KEYS_DIR/jwt-public.pem"

echo "🔑 Gerando par de chaves RSA para JWT RS256..."

# Criar diretório se não existir
mkdir -p "$KEYS_DIR"

# Gerar chave privada RSA 2048 bits
openssl genrsa -out "$PRIVATE_KEY" 2048

# Gerar chave pública a partir da privada
openssl rsa -in "$PRIVATE_KEY" -pubout -out "$PUBLIC_KEY"

# Ajustar permissões (apenas leitura para chave privada)
chmod 600 "$PRIVATE_KEY"
chmod 644 "$PUBLIC_KEY"

echo "✅ Chaves geradas com sucesso!"
echo ""
echo "📁 Localização:"
echo "   Privada: $PRIVATE_KEY"
echo "   Pública:  $PUBLIC_KEY"
echo ""
echo "📝 Para usar em produção, configure as variáveis de ambiente:"
echo "   JWT_PRIVATE_KEY=\$(cat $PRIVATE_KEY)"
echo "   JWT_PUBLIC_KEY=\$(cat $PUBLIC_KEY)"
echo ""
echo "⚠️  IMPORTANTE: Adicione '$KEYS_DIR/' ao .gitignore!"
