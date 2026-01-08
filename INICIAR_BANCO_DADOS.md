# 🚀 Como Iniciar PostgreSQL e Redis

## ⚠️ Problema Identificado

Os serviços estão rodando, mas **PostgreSQL** e **Redis** não estão disponíveis, causando:
- ❌ Erros de conexão com banco de dados (porta 5432)
- ❌ Erros de conexão com Redis (porta 6379)
- ⚠️ Health checks retornando 503

## ✅ Solução: Iniciar PostgreSQL e Redis

### Opção 1: Usar o Script Automático (Recomendado)

```bash
# Dar permissão de execução (se necessário)
chmod +x start-database.sh

# Executar o script
./start-database.sh
```

**Nota:** Se aparecer erro de permissão do Docker, veja a Opção 2.

### Opção 2: Usar Docker Compose Diretamente

```bash
# Iniciar apenas PostgreSQL e Redis
docker compose up -d postgres redis

# Ou se usar podman:
podman compose up -d postgres redis
```

### Opção 3: Corrigir Permissões do Docker

Se aparecer erro de permissão (`permission denied while trying to connect to the Docker daemon socket`):

```bash
# Adicionar seu usuário ao grupo docker
sudo usermod -aG docker $USER

# Fazer logout e login novamente (ou executar):
newgrp docker

# Depois testar:
docker ps
```

**Alternativa temporária (usar sudo):**
```bash
sudo docker compose up -d postgres redis
```

### Opção 4: Verificar se Containers Já Estão Rodando

```bash
# Ver containers rodando
docker ps

# Ver todos os containers (incluindo parados)
docker ps -a

# Se os containers existem mas estão parados, iniciar:
docker start morina-postgres morina-redis
```

## 🔍 Verificação

Após iniciar, verifique se estão rodando:

```bash
# Verificar PostgreSQL
pg_isready -h localhost -p 5432

# Verificar Redis
redis-cli -h localhost -p 6379 ping

# Ou verificar via Docker
docker ps | grep -E "(postgres|redis)"
```

## 📋 Status Esperado

Após iniciar corretamente, você deve ver:

```
✅ PostgreSQL rodando na porta 5432
✅ Redis rodando na porta 6379
✅ API conectando ao banco sem erros
✅ Realtime conectando ao Redis sem erros
✅ Health checks retornando 200 OK
```

## 🆘 Troubleshooting

### Erro: "Can't reach database server at localhost:5432"

**Solução:** Inicie o PostgreSQL:
```bash
docker compose up -d postgres
```

### Erro: "Connection refused" no Redis

**Solução:** Inicie o Redis:
```bash
docker compose up -d redis
```

### Erro: "Permission denied" no Docker

**Solução:** Adicione seu usuário ao grupo docker:
```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Containers não iniciam

**Solução:** Verifique os logs:
```bash
docker logs morina-postgres
docker logs morina-redis
```

## 🎯 Próximos Passos

1. ✅ Iniciar PostgreSQL e Redis
2. ✅ Verificar conexões
3. ✅ Aplicar migrations (se necessário):
   ```bash
   cd apps/api
   pnpm prisma migrate deploy
   ```
4. ✅ Recarregar a aplicação (os serviços já devem reconectar automaticamente)










