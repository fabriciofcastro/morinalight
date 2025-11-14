#!/bin/bash
set -e

# Gerenciador de Secrets
# Gerencia variáveis de ambiente sensíveis de forma segura

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SECRETS_DIR="./secrets"
SECRETS_FILE="$SECRETS_DIR/.secrets.encrypted"

# Verificar se está em produção
if [ "${NODE_ENV:-development}" != "production" ]; then
    echo -e "${YELLOW}Aviso: Este script deve ser usado apenas em produção${NC}"
fi

# Função para gerar secret aleatório
generate_secret() {
    local length=${1:-32}
    openssl rand -base64 $length | tr -d "=+/" | cut -c1-$length
}

# Função para listar secrets
list_secrets() {
    echo -e "${BLUE}=== Secrets Configurados ===${NC}"
    if [ -f "$SECRETS_FILE" ]; then
        # Em produção, você usaria uma ferramenta como Vault, AWS Secrets Manager, etc.
        echo -e "${YELLOW}Secrets estão criptografados${NC}"
        echo -e "Use uma ferramenta de gerenciamento de secrets para visualizar"
    else
        echo -e "${YELLOW}Nenhum secret configurado${NC}"
    fi
}

# Função para validar secrets necessários
validate_secrets() {
    local missing=0
    
    echo -e "${BLUE}=== Validando Secrets ===${NC}"
    
    required_secrets=(
        "JWT_SECRET"
        "DATABASE_URL"
        "REDIS_URL"
        "REALTIME_SECRET"
    )
    
    for secret in "${required_secrets[@]}"; do
        if [ -z "${!secret}" ]; then
            echo -e "${RED}✗ $secret não configurado${NC}"
            missing=$((missing + 1))
        else
            echo -e "${GREEN}✓ $secret configurado${NC}"
        fi
    done
    
    if [ $missing -gt 0 ]; then
        echo -e "\n${RED}Erro: $missing secret(s) faltando${NC}"
        exit 1
    else
        echo -e "\n${GREEN}✓ Todos os secrets estão configurados${NC}"
    fi
}

# Função para gerar secrets iniciais
generate_initial_secrets() {
    echo -e "${BLUE}=== Gerando Secrets Iniciais ===${NC}"
    
    mkdir -p "$SECRETS_DIR"
    
    cat > "$SECRETS_DIR/.secrets.example" << EOF
# Secrets do Sistema
# NUNCA commite este arquivo no Git!
# Use este arquivo como template e configure os valores reais

JWT_SECRET=$(generate_secret 64)
REALTIME_SECRET=$(generate_secret 64)
DATABASE_URL=postgresql://user:password@host:5432/database
REDIS_URL=redis://host:6379
ENCRYPTION_KEY=$(generate_secret 32)

# Secrets de terceiros (se aplicável)
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# SENDGRID_API_KEY=
EOF
    
    echo -e "${GREEN}✓ Template de secrets criado em $SECRETS_DIR/.secrets.example${NC}"
    echo -e "${YELLOW}Copie para .secrets e configure os valores reais${NC}"
}

case "${1:-}" in
    list)
        list_secrets
        ;;
    validate)
        validate_secrets
        ;;
    generate)
        generate_initial_secrets
        ;;
    *)
        echo "Uso: $0 [list|validate|generate]"
        echo ""
        echo "Comandos:"
        echo "  list     - Lista secrets configurados"
        echo "  validate - Valida se todos os secrets necessários estão configurados"
        echo "  generate - Gera template de secrets"
        exit 1
        ;;
esac


