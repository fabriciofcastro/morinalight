# Configuração MCP (Model Context Protocol)

Este diretório contém a configuração do Model Context Protocol para o projeto MORINA, otimizando a performance do Cursor AI através de servidores especializados.

## Arquivos

- `mcp.json`: Configuração dos servidores MCP (ativa)
- `mcp.optional.json`: Configurações de servidores opcionais (S3, Qdrant)
- `mcp.json.backup`: Backup da configuração anterior
- `README.md`: Esta documentação
- `PRISMA_MCP.md`: Guia completo sobre configuração e uso do Prisma MCP Server
- `CHANGELOG_MCP.md`: Histórico de mudanças na configuração MCP

## Servidores Configurados

### Essenciais

- **filesystem**: Acesso controlado ao sistema de arquivos do projeto

### Dados

- **postgres**: Acesso ao banco de dados PostgreSQL gerenciado pelo Prisma (db.prisma.io:5432)
- **postgres-local**: Acesso ao banco de dados PostgreSQL local (localhost:5432)
- **redis**: ⚠️ Opcional - Acesso ao cache/eventos Redis (localhost:6379) - Requer Redis rodando via Docker

### Prisma

O Cursor possui suporte nativo ao **Prisma MCP Server**, que permite gerenciar databases, conectar-se a workspaces do Prisma, executar queries SQL, e muito mais. Os tools do Prisma estão disponíveis automaticamente no Cursor.

**Workspace configurado**: 
- URL: https://console.prisma.io/cly0v45a508o0vfv2ztv0sr5f/cmj5rep4c0428uqfm5vgrj4u1/cmj5rep4c0426uqfm6x1as1l3/dashboard
- Database: Prisma Postgres (db.prisma.io:5432)

### Opcionais (Configuração Disponível)

- **redis**: Cache/eventos Redis (requer Redis rodando via `docker compose up -d redis`)
- **s3**: Storage de arquivos (requer MinIO ou S3 compatível)
- **qdrant**: Indexação semântica de documentos (requer Qdrant rodando)

**Nota:** Servidores MCP como `git`, `http`, `openapi`, `shell` mencionados anteriormente não existem como pacotes oficiais no npm e foram removidos da configuração.

**Nota**: Consulte o arquivo `.cursor/mcp.optional.json` para configurações prontas dos servidores opcionais. Veja também a seção "Servidores Opcionais" abaixo para instruções de configuração.

## Como Usar

### 1. Verificar Configuração

```bash
# Verificar se os serviços estão rodando
docker compose ps

# Verificar conexão com PostgreSQL
psql postgresql://morina:morina@localhost:5432/morina -c "SELECT 1;"

# Verificar conexão com Redis
redis-cli -h localhost -p 6379 ping
```

### 2. Indexar Documentos Canônicos

```bash
# Indexar documentos para melhor contexto
pnpm docs:index
```

### 3. Atualizar Configuração

Edite `.cursor/mcp.json` para adicionar ou remover servidores conforme necessidade.

## Variáveis de Ambiente

Os servidores MCP usam as seguintes variáveis (definidas em `mcp.json`):

- `POSTGRES_CONNECTION_STRING`: Conexão com PostgreSQL (Prisma ou local)
- `REDIS_URL`: URL do Redis
- `OPENAPI_SPEC_URL`: Caminho para a spec OpenAPI

## Prisma MCP Server

O Cursor possui suporte integrado ao **Prisma MCP Server**, permitindo interagir diretamente com seu workspace do Prisma através de tools especializados.

### Funcionalidades Disponíveis

- ✅ Listar databases do Prisma Postgres
- ✅ Introspectar schemas de database
- ✅ Executar queries SQL
- ✅ Gerenciar connection strings
- ✅ Criar backups e restaurar databases
- ✅ Executar atualizações de schema

### Como Usar

Os tools do Prisma estão disponíveis automaticamente. Você pode:

1. **Listar databases**: Use os tools `mcp_Prisma_list_prisma_postgres_databases` para ver seus databases
2. **Introspectar schema**: Use `mcp_Prisma_introspect_database_schema` para ver a estrutura do banco
3. **Executar queries**: Use `mcp_Prisma_execute_sql_query` para executar queries SQL

### Connection String Configurada

A connection string do Prisma está configurada no servidor MCP `postgres`:
```
postgres://8f2e8c48101c8bac6da1c4b39ebd56f06e65fd28f81c181786cef68106638321:***@db.prisma.io:5432/postgres?sslmode=require
```

**Nota**: Esta connection string permite acesso direto ao banco, mas para usar os tools completos do Prisma MCP (como gerenciar databases, backups, etc.), o Cursor precisa estar autenticado no seu workspace do Prisma. Isso é feito automaticamente quando você faz login no Prisma através do Cursor.

## Documentos Canônicos

Os seguintes documentos são considerados canônicos e devem ser indexados:

- `docs/MANIFESTO.md`: Princípios e diretrizes do projeto
- `docs/DOCS_STANDARDS.md`: Padrões de documentação
- `docs/CURSOR_START.md`: Regras para o Cursor
- `docs/catalogo.md`: Documentação do módulo Catálogo
- `docs/openapi/morina-openapi.yaml`: Especificação OpenAPI
- `packages/catalogo-application/src/schemas/*.ts`: Contratos Zod
- `packages/shared-kernel/src/events/*.ts`: Definições de eventos

## Troubleshooting

### Servidor não inicia

1. Verifique se o pacote está instalado: `npx -y @modelcontextprotocol/server-<nome>`
2. Verifique as variáveis de ambiente no `mcp.json`
3. Verifique se os serviços (PostgreSQL, Redis) estão rodando

### Conexão com banco falha

1. Verifique se o Docker Compose está rodando: `docker compose ps`
2. Verifique as credenciais em `docker-compose.yml`
3. Teste a conexão manualmente: `psql postgresql://morina:morina@localhost:5432/morina`

### Documentos não são encontrados

1. Execute `pnpm docs:index` para reindexar
2. Verifique se os arquivos existem nos caminhos especificados
3. Verifique permissões de leitura dos arquivos

## Servidores Opcionais

### S3 (MinIO)

Para habilitar o servidor S3:

1. **Descomente os serviços no `docker-compose.yml`**:
   ```yaml
   minio:
     image: minio/minio:latest
     container_name: morina-minio
     # ... configuração completa no docker-compose.yml
   ```

2. **Inicie o MinIO**:
   ```bash
   docker compose up -d minio
   ```

3. **Crie o bucket**:
   ```bash
   # Acesse o console em http://localhost:9001
   # Login: morina / morina-secret
   # Crie um bucket chamado "morina"
   ```

4. **Adicione ao `.cursor/mcp.json`**:
   ```json
   "s3": {
     "command": "npx",
     "args": ["-y", "@mcp-community/s3-server"],
     "env": {
       "S3_ENDPOINT": "http://localhost:9000",
       "S3_ACCESS_KEY_ID": "morina",
       "S3_SECRET_ACCESS_KEY": "morina-secret",
       "S3_BUCKET": "morina",
       "S3_REGION": "us-east-1"
     }
   }
   ```

### Qdrant (Vectorstore)

Para habilitar o servidor Qdrant:

1. **Descomente os serviços no `docker-compose.yml`**:
   ```yaml
   qdrant:
     image: qdrant/qdrant:latest
     container_name: morina-qdrant
     # ... configuração completa no docker-compose.yml
   ```

2. **Inicie o Qdrant**:
   ```bash
   docker compose up -d qdrant
   ```

3. **Adicione ao `.cursor/mcp.json`**:
   ```json
   "qdrant": {
     "command": "npx",
     "args": ["-y", "@mcp-community/qdrant-server"],
     "env": {
       "QDRANT_URL": "http://localhost:6333",
       "QDRANT_API_KEY": ""
     }
   }
   ```

4. **Indexe documentos no Qdrant**:
   ```bash
   # Execute o script de indexação (que pode ser estendido para usar Qdrant)
   pnpm docs:index
   ```

**Referência**: 
- Veja `.cursor/mcp.optional.json` para configurações prontas dos servidores opcionais
- Veja `.cursor/mcp.optional.json.example` para o exemplo original
- Consulte `.cursor/CHANGELOG_MCP.md` para histórico de mudanças

## Automação de Indexação

### Git Hook (Automático)

Um hook do Git (`post-commit`) foi configurado para reindexar automaticamente quando documentos canônicos são modificados em commits.

**Funcionamento**:
- O hook verifica se arquivos canônicos foram modificados no commit
- Se sim, executa `pnpm docs:index` automaticamente
- Não bloqueia o commit se a indexação falhar

### Watch Mode (Desenvolvimento)

Para monitorar alterações em tempo real durante o desenvolvimento:

```bash
pnpm docs:watch
```

Este comando monitora arquivos canônicos e reindexa automaticamente quando detecta alterações (com debounce de 2 segundos).

## Referências

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP Servers](https://github.com/modelcontextprotocol/servers)
- [Cursor MCP Documentation](https://docs.cursor.com/mcp)
- [Prisma MCP Configuration](PRISMA_MCP.md) - Guia detalhado sobre o Prisma MCP
- [MinIO Documentation](https://min.io/docs/)
- [Qdrant Documentation](https://qdrant.tech/documentation/)

