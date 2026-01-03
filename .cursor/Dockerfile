# Dockerfile para Background Agents do Cursor
# Baseado nas diretrizes: https://cursor.com/environment-json-dockerfile.md
#
# IMPORTANTE: Este Dockerfile NÃO copia o código
# O código será clonado pelo agente posteriormente

FROM node:22-slim

# Instalar dependências do sistema necessárias para desenvolvimento
# Inclui bibliotecas nativas para Prisma + PostgreSQL
RUN apt-get update && apt-get install -y \
    git \
    curl \
    bash \
    build-essential \
    python3 \
    ca-certificates \
    openssl \
    libpq-dev \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Instalar pnpm globalmente (versão específica usada no projeto)
RUN npm install -g pnpm@10.18.2

# Criar usuário não-root para desenvolvimento
RUN useradd -m -s /bin/bash ubuntu

# Configurar diretório de trabalho no home do usuário
USER ubuntu
WORKDIR /home/ubuntu

# Variáveis de ambiente
ENV NODE_ENV=development
ENV PNPM_HOME="/home/ubuntu/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Pré-configurar pnpm
RUN pnpm config set store-dir /home/ubuntu/.pnpm-store

# Verificar instalações
RUN node --version && \
    pnpm --version && \
    git --version && \
    bash --version

