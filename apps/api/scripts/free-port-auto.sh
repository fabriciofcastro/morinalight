#!/bin/bash

# Script automático para liberar a porta 3333 (não interativo)
# Uso: ./scripts/free-port-auto.sh [PORT]

PORT=${1:-3333}

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
    echo "⚠️  Nenhum comando disponível para verificar a porta"
    exit 0
  fi
}

# Encontrar PIDs usando a porta
PIDS=$(find_processes)

if [ -z "$PIDS" ]; then
  exit 0
fi

# Converter para array e remover duplicatas
PIDS=$(echo "$PIDS" | tr '\n' ' ' | xargs -n1 | sort -u | xargs)

# Encerrar processos automaticamente
for PID in $PIDS; do
  if [ -n "$PID" ] && [ "$PID" != "-" ]; then
    if ps -p $PID > /dev/null 2>&1; then
      echo "🛑 Encerrando processo $PID na porta $PORT..."
      kill $PID 2>/dev/null
    fi
  fi
done

# Aguardar um pouco
sleep 1

# Verificar se ainda há processos e forçar encerramento se necessário
REMAINING_PIDS=$(find_processes)
if [ -n "$REMAINING_PIDS" ]; then
  for PID in $REMAINING_PIDS; do
    if [ -n "$PID" ] && [ "$PID" != "-" ]; then
      if ps -p $PID > /dev/null 2>&1; then
        echo "⚠️  Forçando encerramento do processo $PID..."
        kill -9 $PID 2>/dev/null
      fi
    fi
  done
fi

# Verificar resultado final
sleep 1
FINAL_PIDS=$(find_processes)
if [ -z "$FINAL_PIDS" ]; then
  echo "✅ Porta $PORT liberada!"
  exit 0
else
  echo "⚠️  Ainda há processos na porta $PORT"
  exit 0  # Não falhar, apenas avisar
fi

