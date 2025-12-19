#!/bin/bash

# Script para liberar a porta 3333 antes de iniciar o servidor
# Uso: ./scripts/free-port.sh [PORT]

PORT=${1:-3333}

echo "🔍 Verificando processos na porta $PORT..."

# Função para encontrar processos usando a porta
find_processes() {
  # Tenta usar lsof primeiro (mais comum no Linux/Mac)
  if command -v lsof &> /dev/null; then
    lsof -ti :$PORT 2>/dev/null
  # Fallback para fuser (Linux)
  elif command -v fuser &> /dev/null; then
    fuser $PORT/tcp 2>/dev/null | awk '{print $1}'
  # Fallback para netstat (mais comum)
  elif command -v netstat &> /dev/null; then
    netstat -tulpn 2>/dev/null | grep :$PORT | awk '{print $7}' | cut -d'/' -f1 | grep -v '-' | sort -u
  # Fallback para ss (Linux moderno)
  elif command -v ss &> /dev/null; then
    ss -tulpn 2>/dev/null | grep :$PORT | awk '{print $6}' | cut -d',' -f2 | cut -d'=' -f2 | sort -u
  else
    echo "⚠️  Nenhum comando disponível para verificar a porta (lsof, fuser, netstat ou ss)"
    exit 1
  fi
}

# Encontrar PIDs usando a porta
PIDS=$(find_processes)

if [ -z "$PIDS" ]; then
  echo "✅ Porta $PORT está livre"
  exit 0
fi

# Converter para array e remover duplicatas
PIDS=$(echo "$PIDS" | tr '\n' ' ' | xargs -n1 | sort -u | xargs)

echo "⚠️  Encontrados processos usando a porta $PORT:"
for PID in $PIDS; do
  if [ -n "$PID" ] && [ "$PID" != "-" ]; then
    # Tentar obter informações do processo
    if ps -p $PID > /dev/null 2>&1; then
      PROCESS_INFO=$(ps -p $PID -o comm=,args= 2>/dev/null | head -1)
      echo "   PID $PID: $PROCESS_INFO"
    fi
  fi
done

echo ""
read -p "Deseja encerrar esses processos? (s/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Ss]$ ]]; then
  for PID in $PIDS; do
    if [ -n "$PID" ] && [ "$PID" != "-" ]; then
      if ps -p $PID > /dev/null 2>&1; then
        echo "🛑 Encerrando processo $PID..."
        kill $PID 2>/dev/null
        
        # Aguardar um pouco e verificar se ainda está rodando
        sleep 1
        if ps -p $PID > /dev/null 2>&1; then
          echo "⚠️  Processo $PID ainda está rodando, forçando encerramento..."
          kill -9 $PID 2>/dev/null
        fi
      fi
    fi
  done
  
  # Verificar novamente
  sleep 1
  REMAINING_PIDS=$(find_processes)
  if [ -z "$REMAINING_PIDS" ]; then
    echo "✅ Porta $PORT liberada com sucesso!"
    exit 0
  else
    echo "⚠️  Ainda há processos na porta $PORT: $REMAINING_PIDS"
    exit 1
  fi
else
  echo "❌ Processos não foram encerrados. A porta $PORT ainda está em uso."
  exit 1
fi












