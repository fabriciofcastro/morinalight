#!/bin/bash
set -e

# Script de Restauração
# Restaura backup do banco de dados, volumes e configurações

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BACKUP_DIR="./backups"

if [ -z "$1" ]; then
    echo -e "${RED}Erro: Especifique o arquivo de backup${NC}"
    echo -e "Uso: $0 <backup_file.tar.gz>"
    echo -e "\nBackups disponíveis:"
    ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null | tail -5 || echo "Nenhum backup encontrado"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Erro: Arquivo de backup não encontrado: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${RED}=== ATENÇÃO: RESTAURAÇÃO ===${NC}"
echo -e "${YELLOW}Este processo irá SOBRESCREVER os dados atuais!${NC}"
read -p "Tem certeza que deseja continuar? (digite 'RESTORE' para confirmar): " confirm

if [ "$confirm" != "RESTORE" ]; then
    echo -e "${YELLOW}Restauração cancelada${NC}"
    exit 0
fi

# Extrair backup
TEMP_DIR=$(mktemp -d)
echo -e "${BLUE}Extraindo backup...${NC}"
tar xzf "$BACKUP_FILE" -C "$TEMP_DIR"
BACKUP_CONTENT=$(ls -d "$TEMP_DIR"/*/ | head -1)

echo -e "${BLUE}=== Iniciando Restauração ===${NC}\n"

# 1. Restaurar banco de dados
echo -e "${YELLOW}[1/3] Restaurando banco de dados...${NC}"
if [ -f "$BACKUP_CONTENT/database.sql" ]; then
    # Parar serviços que usam o banco
    docker compose -f docker-compose.prod.yml stop api web 2>/dev/null || true
    
    # Restaurar
    if docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d morina < "$BACKUP_CONTENT/database.sql" 2>/dev/null; then
        echo -e "${GREEN}✓ Banco de dados restaurado${NC}"
    else
        echo -e "${YELLOW}⚠ Tentando restauração local...${NC}"
        if command -v psql >/dev/null 2>&1; then
            PGPASSWORD="${DB_PASSWORD:-postgres}" psql -h localhost -U postgres -d morina < "$BACKUP_CONTENT/database.sql"
            echo -e "${GREEN}✓ Banco de dados restaurado (local)${NC}"
        else
            echo -e "${RED}✗ Falha na restauração do banco de dados${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠ Arquivo de backup do banco não encontrado${NC}"
fi

# 2. Restaurar volumes
echo -e "${YELLOW}[2/3] Restaurando volumes...${NC}"
VOLUME_BACKUPS=$(find "$BACKUP_CONTENT" -name "volume_*.tar.gz" || true)
if [ -n "$VOLUME_BACKUPS" ]; then
    for volume_backup in $VOLUME_BACKUPS; do
        volume_name=$(basename "$volume_backup" | sed 's/volume_\(.*\)\.tar\.gz/\1/')
        echo -e "  Restaurando volume: $volume_name"
        docker volume create "$volume_name" 2>/dev/null || true
        docker run --rm -v "$volume_name":/data -v "$(dirname "$volume_backup")":/backup alpine sh -c "cd /data && tar xzf /backup/$(basename "$volume_backup")" || true
    done
    echo -e "${GREEN}✓ Volumes restaurados${NC}"
else
    echo -e "${YELLOW}⚠ Nenhum backup de volume encontrado${NC}"
fi

# 3. Mostrar informações do backup
echo -e "${YELLOW}[3/3] Informações do backup restaurado:${NC}"
if [ -f "$BACKUP_CONTENT/backup_info.txt" ]; then
    cat "$BACKUP_CONTENT/backup_info.txt"
fi

# Limpar
rm -rf "$TEMP_DIR"

echo -e "\n${GREEN}=== Restauração Concluída ===${NC}"
echo -e "${YELLOW}Reinicie os serviços: docker compose -f docker-compose.prod.yml up -d${NC}"

