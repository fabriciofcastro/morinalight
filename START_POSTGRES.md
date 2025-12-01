# 🚀 Solução Rápida - Iniciar PostgreSQL

## Problema Identificado
- ✅ Docker está instalado (v29.0.3)
- ✅ Redis está rodando
- ❌ PostgreSQL NÃO está rodando
- ❌ Comando `docker-compose` não existe (Docker moderno usa `docker compose`)

## Solução - Execute ESTES comandos:

```bash
# 1. Voltar para raiz do projeto
cd ~/projects/morina2

# 2. Usar comando correto do Docker moderno
docker compose up -d postgres

# 3. Aguardar 20 segundos
sleep 20

# 4. Verificar se está rodando
docker ps | grep postgres

# 5. Se aparecer "morina-postgres", continuar:
cd apps/api
pnpm prisma migrate deploy
pnpm prisma db seed
```

## Se o passo 2 der erro:

```bash
# Ver logs de erro
docker compose logs postgres

# OU iniciar em foreground para ver erros
docker compose up postgres
```

## Credenciais após seed:
- **Email:** admin@morina.com
- **Senha:** Admin@123

## Comandos Úteis (Docker Moderno):

```bash
# Parar tudo
docker compose down

# Iniciar serviço específico
docker compose up -d postgres

# Ver logs
docker compose logs -f postgres

# Listar containers
docker ps

# Reiniciar serviço
docker compose restart postgres
```

---

**IMPORTANTE:** Use `docker compose` (com espaço) ao invés de `docker-compose` (com hífen)!
