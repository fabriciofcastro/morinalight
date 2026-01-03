# 🔐 Credenciais de Login - Morina Light

## Credenciais Padrão

**Email:** `admin@morina.com`  
**Senha:** `Admin@123`

## Requisitos de Senha

✅ Mínimo de **8 caracteres**  
✅ Formato de email válido (deve conter `@`)

## Troubleshooting - Login Não Funciona

### 1. Verificar se o Banco de Dados está Rodando

```bash
# Verificar containers Docker
docker ps | grep postgres

# Se não estiver rodando, iniciar:
docker-compose up -d postgres

# Aguardar 10 segundos
sleep 10
```

### 2. Aplicar Migrations

```bash
# Aplicar schema do banco
cd apps/api
pnpm prisma migrate deploy
```

### 3. Popular Dados Iniciais (Seed)

```bash
# Criar usuário admin padrão
cd apps/api
pnpm prisma db seed
```

### 4. Verificar se a API está Rodando

```bash
# Testar endpoint de saúde
curl http://localhost:3333/health

# Se não responder, iniciar API:
cd apps/api
pnpm dev
```

### 5. Verificar Logs da API

```bash
# Ver logs em tempo real
cd apps/api
pnpm dev

# Procurar por erros de autenticação
```

## Criar Usuário Manualmente (Se Seed Não Funcionar)

```bash
# Abrir Prisma Studio
cd apps/api
pnpm prisma studio

# Acessar: http://localhost:5555
# Criar usuário na tabela "User" com:
# - email: admin@morina.com
# - password: (hash bcrypt de "Admin@123")
# - role: "admin"
```

## Resetar Banco Completamente (CUIDADO!)

```bash
# Parar tudo
docker-compose down -v

# Iniciar novamente
docker-compose up -d postgres
sleep 10

# Aplicar migrations
cd apps/api
pnpm prisma migrate deploy

# Popular dados
pnpm prisma db seed
```

## Verificação Rápida

Execute estes comandos em ordem:

```bash
# 1. Banco rodando?
docker ps | grep postgres

# 2. API rodando?
curl http://localhost:3333/health

# 3. Seed aplicado?
cd apps/api && pnpm prisma db seed

# 4. Tentar login
# Acessar: http://localhost:3000/login
# Email: admin@morina.com
# Senha: Admin@123
```

## Mensagens de Erro Comuns

| Erro                    | Solução                                             |
| ----------------------- | --------------------------------------------------- |
| "Can't reach database"  | Iniciar PostgreSQL: `docker-compose up -d postgres` |
| "Credenciais inválidas" | Rodar seed: `pnpm prisma db seed`                   |
| "Network error"         | Verificar se API está rodando na porta 3333         |
| "Tenant não disponível" | Normal em rotas públicas, não afeta login           |

## Portas Utilizadas

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3333
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379
- **Prisma Studio:** http://localhost:5555

---

**Desenvolvido por:** Michel, Adriana e Fabrício
