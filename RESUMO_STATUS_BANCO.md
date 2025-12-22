# 📊 Status do Banco de Dados

## ✅ Progresso das Etapas

### 1. Containers Docker
- ⚠️ **Status:** Precisa ser iniciado manualmente
- **Comando:** `sudo docker compose up -d postgres redis`
- **Verificação:** `sudo docker ps | grep morina-`

### 2. Migration Corrigida
- ✅ **Arquivo criado:** `20251212002709_soft_delete_audit/migration.sql`
- ✅ **Migration marcada como aplicada:** `20251212002753_soft_delete_audit`

### 3. Migrations Restantes
- ⏳ `20251213231434_add_fichas_custo` - Pendente
- ⏳ `20251215233535_add_status_customizado_ficha_custo` - Pendente

### 4. Problema no Schema
- ⚠️ **Erro:** Falta relação no modelo `Organization` para `NotaSupplier`
- **Localização:** `prisma/schema.prisma:766`

## 🔧 Próximos Passos

### Passo 1: Iniciar Containers
```bash
sudo docker compose up -d postgres redis
```

### Passo 2: Aguardar Inicialização
```bash
sleep 10
```

### Passo 3: Aplicar Migrations
```bash
cd apps/api
export PNPM_HOME="$HOME/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"
pnpm prisma migrate deploy
```

### Passo 4: Corrigir Schema (se necessário)
Verificar e corrigir a relação faltante no `schema.prisma`

## 📋 Comando Completo

```bash
sudo docker compose up -d postgres redis && \
sleep 10 && \
cd apps/api && \
export PNPM_HOME="$HOME/.local/share/pnpm" && \
export PATH="$PNPM_HOME:$PATH" && \
pnpm prisma migrate deploy
```

## ✅ Verificação Final

Após executar, verifique:
- ✅ Containers rodando: `sudo docker ps | grep morina-`
- ✅ PostgreSQL: `pg_isready -h localhost -p 5432`
- ✅ Redis: `redis-cli -h localhost -p 6379 ping`
- ✅ Migrations: `pnpm prisma migrate status`









