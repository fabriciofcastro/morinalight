# 🚀 Guia Rápido - Iniciar Sistema Morina

## Problema Identificado
- ❌ PostgreSQL não estava rodando
- ❌ Login não funciona sem banco de dados

## Solução Rápida

### 1. Iniciar Banco de Dados
```bash
# Iniciar PostgreSQL
docker-compose up -d postgres

# Verificar se está rodando
docker ps | grep postgres
```

### 2. Rodar Migrações
```bash
# Aplicar schema do banco
pnpm db:migrate

# OU (se não funcionar)
cd apps/api && pnpm prisma migrate deploy
```

### 3. Seed de Dados (Opcional)
```bash
# Popular banco com dados iniciais
pnpm db:seed

# OU
cd apps/api && pnpm prisma db seed
```

### 4. Verificar Conexão
```bash
# Testar conexão
curl http://localhost:3333/health
```

### 5. Acessar Sistema
```
Frontend: http://localhost:3000/login
Backend API: http://localhost:3333
```

## Credenciais Padrão (Após Seed)
```
Email: admin@morina.com
Senha: Admin@123
```

## Comandos Úteis

### Parar Tudo
```bash
docker-compose down
```

### Reiniciar Banco
```bash
docker-compose restart postgres
```

### Ver Logs do Banco
```bash
docker-compose logs -f postgres
```

### Resetar Banco (CUIDADO!)
```bash
docker-compose down -v
docker-compose up -d postgres
pnpm db:migrate
pnpm db:seed
```

## Troubleshooting

### Erro: "Can't reach database"
```bash
# 1. Verificar se PostgreSQL está rodando
docker ps

# 2. Reiniciar container
docker-compose restart postgres

# 3. Aguardar 5-10 segundos
sleep 10

# 4. Rodar migrations
pnpm db:migrate
```

### Erro: "Tenant não disponível"
- Isso é normal em rotas públicas
- O sistema tem fallback automático
- Não afeta o login

### Login não funciona
```bash
# 1. Verificar se API está rodando
curl http://localhost:3333/health

# 2. Verificar se banco tem dados
# (Rodar seed se necessário)
pnpm db:seed
```

## Status Atual

✅ PostgreSQL: Iniciando...  
⏳ Migrations: Pendente  
⏳ Seed: Pendente  
⏳ Login: Aguardando banco  

## Próximos Passos

1. Aguardar PostgreSQL iniciar (10-15 segundos)
2. Rodar `pnpm db:migrate`
3. Rodar `pnpm db:seed`
4. Testar login em http://localhost:3000/login

---

**Desenvolvido por:** Michel, Adriana e Fabrício
