#!/bin/bash
set -e

# Script de Backup Automatizado
# Faz backup do banco de dados, volumes e configurações

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/$TIMESTAMP"

# Configurações
DB_NAME=${DB_NAME:-morina}
DB_USER=${DB_USER:-postgres}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
RETENTION_DAYS=${RETENTION_DAYS:-30}

mkdir -p "$BACKUP_PATH"

echo -e "${BLUE}=== Iniciando Backup ===${NC}"
echo -e "Destino: ${GREEN}$BACKUP_PATH${NC}\n"

# 1. Backup do banco de dados
echo -e "${YELLOW}[1/4] Fazendo backup do banco de dados...${NC}"
if docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_PATH/database.sql" 2>/dev/null; then
    echo -e "${GREEN}✓ Backup do banco de dados concluído${NC}"
else
    echo -e "${RED}✗ Falha no backup do banco de dados${NC}"
    # Tentar backup local se docker não estiver disponível
    if command -v pg_dump >/dev/null 2>&1; then
        PGPASSWORD="${DB_PASSWORD:-postgres}" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" > "$BACKUP_PATH/database.sql"
        echo -e "${GREEN}✓ Backup do banco de dados concluído (local)${NC}"
    else
        echo -e "${RED}✗ pg_dump não disponível${NC}"
    fi
fi

# 2. Backup de volumes Docker
echo -e "${YELLOW}[2/4] Fazendo backup de volumes...${NC}"
VOLUMES=$(docker volume ls --format "{{.Name}}" | grep -E "morina|postgres|redis" || true)
if [ -n "$VOLUMES" ]; then
    for volume in $VOLUMES; do
        echo -e "  Backup do volume: $volume"
        docker run --rm -v "$volume":/data -v "$(pwd)/$BACKUP_PATH":/backup alpine tar czf "/backup/volume_${volume}.tar.gz" -C /data . || true
    done
    echo -e "${GREEN}✓ Backup de volumes concluído${NC}"
else
    echo -e "${YELLOW}⚠ Nenhum volume encontrado${NC}"
fi

# 3. Backup de configurações
echo -e "${YELLOW}[3/4] Fazendo backup de configurações...${NC}"
mkdir -p "$BACKUP_PATH/config"
cp -r deploy/ "$BACKUP_PATH/config/" 2>/dev/null || true
cp docker-compose.prod.yml "$BACKUP_PATH/config/" 2>/dev/null || true
cp .env* "$BACKUP_PATH/config/" 2>/dev/null || true
echo -e "${GREEN}✓ Backup de configurações concluído${NC}"

# 4. Backup de versão
echo -e "${YELLOW}[4/4] Salvando informações de versão...${NC}"
{
    echo "Backup criado em: $(date)"
    echo "Versão do sistema: $(cat VERSION 2>/dev/null || echo 'N/A')"
    echo "Git commit: $(git rev-parse HEAD 2>/dev/null || echo 'N/A')"
    echo "Git tag: $(git describe --tags --abbrev=0 2>/dev/null || echo 'N/A')"
    echo ""
    echo "=== Status dos containers ==="
    docker compose -f docker-compose.prod.yml ps 2>/dev/null || echo "Docker não disponível"
} > "$BACKUP_PATH/backup_info.txt"
echo -e "${GREEN}✓ Informações de versão salvas${NC}"

# Comprimir backup
echo -e "\n${YELLOW}Comprimindo backup...${NC}"
cd "$BACKUP_DIR"
tar czf "${TIMESTAMP}.tar.gz" "$TIMESTAMP" && rm -rf "$TIMESTAMP"
cd - > /dev/null
echo -e "${GREEN}✓ Backup comprimido: ${BACKUP_DIR}/${TIMESTAMP}.tar.gz${NC}"

# Limpar backups antigos
echo -e "\n${YELLOW}Limpando backups antigos (mais de ${RETENTION_DAYS} dias)...${NC}"
find "$BACKUP_DIR" -name "*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete
echo -e "${GREEN}✓ Limpeza concluída${NC}"

# Calcular tamanho do backup
BACKUP_SIZE=$(du -h "$BACKUP_DIR/${TIMESTAMP}.tar.gz" | cut -f1)
echo -e "\n${GREEN}=== Backup Concluído ===${NC}"
echo -e "Arquivo: ${GREEN}${BACKUP_DIR}/${TIMESTAMP}.tar.gz${NC}"
echo -e "Tamanho: ${GREEN}${BACKUP_SIZE}${NC}"

