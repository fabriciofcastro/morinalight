#!/bin/bash
set -e

# Script para matar processo em uma porta específica

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PORT=${1:-3333}

if [ -z "$PORT" ]; then
    echo -e "${RED}Erro: Especifique a porta${NC}"
    echo "Uso: $0 <porta>"
    exit 1
fi

echo -e "${BLUE}Procurando processos na porta $PORT...${NC}"

# Tentar diferentes métodos para encontrar o processo
PID=""

# Método 1: lsof
if command -v lsof >/dev/null 2>&1; then
    PID=$(lsof -ti :$PORT 2>/dev/null || echo "")
fi

# Método 2: fuser
if [ -z "$PID" ] && command -v fuser >/dev/null 2>&1; then
    PID=$(fuser $PORT/tcp 2>/dev/null | awk '{print $1}' || echo "")
fi

# Método 3: netstat
if [ -z "$PID" ] && command -v netstat >/dev/null 2>&1; then
    PID=$(netstat -tulpn 2>/dev/null | grep ":$PORT " | awk '{print $7}' | cut -d'/' -f1 | head -1 || echo "")
fi

# Método 4: ss
if [ -z "$PID" ] && command -v ss >/dev/null 2>&1; then
    PID=$(ss -tulpn 2>/dev/null | grep ":$PORT " | grep -oP 'pid=\K[0-9]+' | head -1 || echo "")
fi

if [ -z "$PID" ]; then
    echo -e "${YELLOW}Nenhum processo encontrado na porta $PORT${NC}"
    exit 0
fi

# Remover espaços e quebras de linha
PID=$(echo $PID | tr -d '[:space:]')

# Verificar se é um número válido
if ! [[ "$PID" =~ ^[0-9]+$ ]]; then
    echo -e "${RED}Erro: PID inválido encontrado: $PID${NC}"
    exit 1
fi

# Mostrar informações do processo
echo -e "${YELLOW}Processo encontrado:${NC}"
ps -p $PID -o pid,ppid,cmd --no-headers 2>/dev/null || {
    echo -e "${RED}Processo $PID não encontrado (pode ter terminado)${NC}"
    exit 1
}

# Confirmar antes de matar
read -p "Deseja matar o processo $PID? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Operação cancelada${NC}"
    exit 0
fi

# Matar o processo
echo -e "${BLUE}Matando processo $PID...${NC}"
kill $PID 2>/dev/null || {
    echo -e "${YELLOW}Tentando kill -9...${NC}"
    kill -9 $PID 2>/dev/null || {
        echo -e "${RED}Erro ao matar processo $PID${NC}"
        exit 1
    }
}

# Aguardar um pouco e verificar
sleep 1
if ps -p $PID > /dev/null 2>&1; then
    echo -e "${RED}Processo ainda está rodando, tentando kill -9...${NC}"
    kill -9 $PID 2>/dev/null
    sleep 1
    if ps -p $PID > /dev/null 2>&1; then
        echo -e "${RED}Erro: Não foi possível matar o processo $PID${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓ Processo $PID terminado com sucesso${NC}"
echo -e "${GREEN}Porta $PORT está livre agora${NC}"

