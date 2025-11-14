# Guia de Implantação - Morina Light

Este documento descreve o processo completo de implantação do sistema Morina Light em ambientes de produção.

## Pré-requisitos

- Node.js 20+ e pnpm
- Docker e Docker Compose
- PostgreSQL 14+
- Redis (opcional, para eventos em tempo real)
- Variáveis de ambiente configuradas

## Estrutura do Projeto

```
morina2/
├── apps/
│   ├── api/          # Backend Fastify
│   └── web/          # Frontend Next.js
├── packages/
│   ├── catalogo-domain/
│   ├── catalogo-application/
│   └── ui/
└── docker-compose.yml
```

## Configuração de Ambiente

### Backend (API)

Crie o arquivo `apps/api/.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/morina_prod?schema=public"

# JWT
JWT_SECRET="seu-jwt-secret-super-seguro-aqui"
JWT_EXPIRES_IN="7d"

# Server
PORT=3333
NODE_ENV=production

# Redis (opcional)
REDIS_URL="redis://localhost:6379"

# Realtime
REALTIME_SECRET="seu-realtime-secret-super-seguro-aqui"

# e-millennium (opcional)
EMILLENNIUM_BASE_URL="https://api.e-millennium.com.br"
EMILLENNIUM_USERNAME="seu-usuario"
EMILLENNIUM_PASSWORD="sua-senha"
EMILLENNIUM_TENANT_ID="seu-tenant-id"
EMILLENNIUM_VITRINE_ID="seu-vitrine-id"

# CORS
CORS_ORIGIN="https://seu-dominio.com.br"
```

### Frontend (Web)

Crie o arquivo `apps/web/.env.local`:

```env
# API
NEXT_PUBLIC_API_URL="https://api.seu-dominio.com.br"

# Realtime (opcional)
NEXT_PUBLIC_REALTIME_URL="wss://realtime.seu-dominio.com.br"
```

## Build do Projeto

### 1. Instalar Dependências

```bash
pnpm install
```

### 2. Build do Frontend

```bash
cd apps/web
pnpm build
```

### 3. Build do Backend

```bash
cd apps/api
pnpm build
```

## Banco de Dados

### 1. Configurar Banco

```bash
cd apps/api
cp .env.example .env
# Editar .env com suas credenciais
```

### 2. Executar Migrações

```bash
cd apps/api
pnpm prisma migrate deploy
```

### 3. Executar Seeds (Opcional)

```bash
cd apps/api
pnpm prisma db seed
```

### 4. Criar Permissões Base

Execute o SQL em `apps/api/prisma/migrations/add-permissions.sql`:

```bash
psql -h localhost -U morina -d morina_prod -f apps/api/prisma/migrations/add-permissions.sql
```

## Docker Compose (Produção)

Crie um `docker-compose.prod.yml`:

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: morina
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: morina_prod
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U morina"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    environment:
      DATABASE_URL: postgresql://morina:${DB_PASSWORD}@postgres:5432/morina_prod
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      REALTIME_SECRET: ${REALTIME_SECRET}
      NODE_ENV: production
      PORT: 3333
    ports:
      - "3333:3333"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: ${API_URL}
      NEXT_PUBLIC_REALTIME_URL: ${REALTIME_URL}
    ports:
      - "3000:3000"
    depends_on:
      - api
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

## Deploy com Docker

### 1. Build das Imagens

```bash
docker-compose -f docker-compose.prod.yml build
```

### 2. Iniciar Serviços

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Executar Migrações

```bash
docker-compose -f docker-compose.prod.yml exec api pnpm prisma migrate deploy
```

### 4. Verificar Logs

```bash
docker-compose -f docker-compose.prod.yml logs -f
```

## Deploy Manual

### Backend

```bash
cd apps/api
pnpm install --production
pnpm prisma generate
pnpm prisma migrate deploy
pnpm build
pm2 start dist/server.js --name morina-api
```

### Frontend

```bash
cd apps/web
pnpm install --production
pnpm build
pm2 start pnpm --name morina-web -- start
```

## Nginx (Proxy Reverso)

```nginx
server {
    listen 80;
    server_name seu-dominio.com.br;

    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com.br;

    ssl_certificate /etc/letsencrypt/live/seu-dominio.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com.br/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## SSL/TLS com Let's Encrypt

```bash
sudo certbot --nginx -d seu-dominio.com.br
```

## Variáveis de Ambiente de Produção

### Backend

- `NODE_ENV=production`
- `DATABASE_URL`: URL do banco de dados PostgreSQL
- `JWT_SECRET`: Chave secreta para JWT (mínimo 32 caracteres)
- `REALTIME_SECRET`: Chave secreta para WebSocket
- `REDIS_URL`: URL do Redis (opcional)
- `CORS_ORIGIN`: Domínio do frontend

### Frontend

- `NEXT_PUBLIC_API_URL`: URL da API
- `NEXT_PUBLIC_REALTIME_URL`: URL do WebSocket (opcional)

## Backup do Banco de Dados

### Backup Manual

```bash
pg_dump -h localhost -U morina -d morina_prod > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restaurar Backup

```bash
psql -h localhost -U morina -d morina_prod < backup_20240101_120000.sql
```

## Monitoramento

### Health Check

- Backend: `GET https://api.seu-dominio.com.br/health`
- Frontend: Verificar status HTTP 200

### Logs

- Backend: `pm2 logs morina-api`
- Frontend: `pm2 logs morina-web`

## Troubleshooting

### Problema: Banco de dados não conecta

1. Verificar `DATABASE_URL` no `.env`
2. Verificar se PostgreSQL está rodando
3. Verificar credenciais e permissões

### Problema: JWT não funciona

1. Verificar se `JWT_SECRET` está configurado
2. Verificar se token está sendo enviado no header
3. Verificar expiração do token

### Problema: Permissões não funcionam

1. Executar SQL de permissões: `apps/api/prisma/migrations/add-permissions.sql`
2. Verificar se usuário tem role na organização
3. Verificar logs da API para erros

## Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados criado e migrações executadas
- [ ] Permissões base criadas no banco
- [ ] Build do frontend e backend concluído
- [ ] SSL/TLS configurado
- [ ] Nginx configurado
- [ ] Health checks funcionando
- [ ] Backup do banco configurado
- [ ] Monitoramento configurado
- [ ] Testes de integração executados
- [ ] Documentação atualizada

## Suporte

Para suporte técnico, entre em contato:
- Email: ops@morina.ai
- GitHub: https://github.com/fabriciofcastro/morinalight/issues


