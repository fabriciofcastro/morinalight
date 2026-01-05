#!/bin/bash

# Script de preparação para deploy do Sistema de Auditoria
# Versão: 2.0.0

echo "🚀 Preparando Sistema de Auditoria de Permissões v2.0.0"
echo "=================================================="

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para verificar sucesso
check_success() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
    else
        echo -e "${RED}✗ Erro: $1${NC}"
        exit 1
    fi
}

# 1. Verificar Node.js e pnpm
echo ""
echo "📦 Verificando dependências do sistema..."
node --version > /dev/null 2>&1
check_success "Node.js instalado"

pnpm --version > /dev/null 2>&1
check_success "pnpm instalado"

# 2. Instalar dependências do backend
echo ""
echo "📦 Instalando dependências do backend..."
cd apps/api
pnpm add @nestjs/schedule @slack/webhook nodemailer pdfkit @tensorflow/tfjs-node splunk-sdk
check_success "Dependências principais instaladas"

pnpm add -D @types/pdfkit @types/nodemailer
check_success "Dependências de desenvolvimento instaladas"

# 3. Instalar dependências do frontend
echo ""
echo "📦 Instalando dependências do frontend..."
cd ../web
pnpm add recharts react-diff-viewer-continued
check_success "Dependências do frontend instaladas"

# 4. Voltar para raiz
cd ../..

# 5. Verificar variáveis de ambiente
echo ""
echo "⚙️  Verificando configuração..."
if [ ! -f "apps/api/.env" ]; then
    echo -e "${YELLOW}⚠ Arquivo .env não encontrado${NC}"
    echo "Criando .env de exemplo..."
    cat > apps/api/.env.example << 'EOF'
# Alertas Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
SMTP_FROM=noreply@seudominio.com
SECURITY_ALERT_EMAIL=security@seudominio.com
COMPLIANCE_ALERT_EMAIL=compliance@seudominio.com

# Alertas Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_SECURITY_CHANNEL=#security

# SIEM (Opcional)
SIEM_TYPE=splunk
SIEM_HOST=splunk.seudominio.com
SIEM_PORT=8089
SIEM_TOKEN=seu-token-aqui

# ML (Opcional)
ML_MODEL_PATH=/app/models/permission-audit
ML_AUTO_TRAIN=true
EOF
    echo -e "${YELLOW}✓ Arquivo .env.example criado. Configure suas variáveis!${NC}"
else
    echo -e "${GREEN}✓ Arquivo .env encontrado${NC}"
fi

# 6. Executar migrations (se necessário)
echo ""
echo "🗄️  Preparando banco de dados..."
cd apps/api

# Verificar se há migrations pendentes
if [ -f "prisma/migrations/add_audit_advanced_features.sql" ]; then
    echo "Aplicando migrations..."
    # npx prisma migrate deploy
    echo -e "${YELLOW}⚠ Execute manualmente: npx prisma migrate deploy${NC}"
fi

# 7. Build do projeto
echo ""
echo "🔨 Compilando projeto..."
cd ../..
# pnpm build
echo -e "${YELLOW}⚠ Execute manualmente: pnpm build${NC}"

# 8. Resumo
echo ""
echo "=================================================="
echo -e "${GREEN}✅ Preparação concluída!${NC}"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure as variáveis de ambiente em apps/api/.env"
echo "2. Execute: npx prisma migrate deploy (no diretório apps/api)"
echo "3. Execute: pnpm build (na raiz do projeto)"
echo "4. Inicie o servidor: pnpm dev"
echo "5. Acesse: http://localhost:3000/admin/permissions/audit"
echo ""
echo "📚 Documentação:"
echo "- QUICK_START.md - Guia rápido"
echo "- CHECKLIST.md - Lista completa de funcionalidades"
echo "- complete_documentation.md - Documentação completa"
echo ""
echo "🎉 Sistema de Auditoria v2.0.0 pronto para uso!"
echo "=================================================="
