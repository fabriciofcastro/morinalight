#!/bin/bash

# Script para aplicar migration de contatos múltiplos de clientes

echo "🔄 Aplicando migration de contatos múltiplos de clientes..."
echo ""

cd apps/api

# Verificar se o Prisma está instalado
if ! command -v pnpm &> /dev/null; then
    echo "❌ Erro: pnpm não encontrado. Instale o pnpm primeiro."
    exit 1
fi

# Aplicar migration
echo "📦 Aplicando migration..."
pnpm prisma migrate dev --name add_cliente_contacts

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration aplicada com sucesso!"
    echo ""
    echo "📋 Próximos passos:"
    echo "   1. Verifique se a tabela ClienteContact foi criada"
    echo "   2. Teste a criação de contatos no sistema"
    echo "   3. Teste a marcação de contato principal"
else
    echo ""
    echo "❌ Erro ao aplicar migration. Verifique os logs acima."
    exit 1
fi


