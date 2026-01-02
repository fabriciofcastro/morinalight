#!/bin/bash

# Script para configurar permissões Docker permanentemente

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Configurando Permissões Docker - Morina Light${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# 1. Adicionar usuário ao grupo docker
echo -e "${YELLOW}1️⃣ Adicionando usuário ao grupo docker...${NC}"
sudo usermod -aG docker $USER

echo -e "${GREEN}✅ Usuário adicionado ao grupo docker${NC}"
echo ""

# 2. Verificar grupos
echo -e "${YELLOW}2️⃣ Verificando grupos do usuário...${NC}"
groups $USER
echo ""

# 3. Ativar grupo na sessão atual
echo -e "${YELLOW}3️⃣ Ativando grupo docker na sessão atual...${NC}"
echo -e "${GREEN}✅ Executando: newgrp docker${NC}"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ CONFIGURAÇÃO CONCLUÍDA!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}📋 Próximos passos:${NC}"
echo ""
echo -e "1. Execute este comando para ativar o grupo:"
echo -e "   ${GREEN}newgrp docker${NC}"
echo ""
echo -e "2. Ou faça logout e login novamente"
echo ""
echo -e "3. Depois, inicie os serviços:"
echo -e "   ${GREEN}./start-database.sh${NC}"
echo ""
echo -e "4. Verifique se funciona sem sudo:"
echo -e "   ${GREEN}docker ps${NC}"
echo ""
