# 🚀 Como Iniciar PostgreSQL e Redis

## ⚡ Solução Rápida

Execute este comando no terminal:

```bash
cd ~/projects/morinalight
./iniciar-banco-completo.sh
```

**Nota:** Se pedir senha do sudo, digite sua senha de usuário.

## 📋 O que o script faz

1. ✅ Para containers existentes (se houver)
2. ✅ Inicia PostgreSQL e Redis
3. ✅ Aguarda PostgreSQL ficar pronto (até 30 segundos)
4. ✅ Aguarda Redis ficar pronto (até 15 segundos)
5. ✅ Verifica status dos containers
6. ✅ Testa conexões locais
7. ✅ Aplica migrations do banco de dados
8. ✅ Verifica conexão Prisma

## 🔧 Alternativa Manual

Se preferir fazer manualmente:

```bash
# 1. Iniciar serviços
sudo docker compose up -d postgres redis

# 2. Aguardar (pode levar alguns segundos)
sleep 10

# 3. Verificar status
sudo docker ps | grep -E "(postgres|redis)"

# 4. Aplicar migrations
cd apps/api
export PNPM_HOME="$HOME/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"
pnpm prisma migrate deploy
```

## ✅ Verificação

Após executar, você deve ver:

- ✅ Containers rodando: `sudo docker ps | grep morina-`
- ✅ PostgreSQL acessível: `pg_isready -h localhost -p 5432`
- ✅ Redis acessível: `redis-cli -h localhost -p 6379 ping`
- ✅ API conectando sem erros nos logs
- ✅ Health checks retornando 200 OK

## 🆘 Problemas Comuns

### Erro: "permission denied"
**Solução:** O script usa sudo automaticamente se necessário.

### Erro: "Can't reach database server"
**Solução:** Aguarde alguns segundos e verifique: `sudo docker ps`

### Containers não iniciam
**Solução:** Verifique logs: `sudo docker logs morina-postgres`

## 🎯 Próximos Passos

Após iniciar os serviços:
1. ✅ Os serviços devem reconectar automaticamente
2. ✅ Verifique os logs do `pnpm dev` para confirmar
3. ✅ Acesse http://localhost:3000 para testar

