# Configuração MCP (Model Context Protocol)

Este diretório contém a configuração do Model Context Protocol para o projeto MORINA, otimizando a performance do Cursor AI através de servidores especializados.

## Arquivos

- `mcp.json`: Configuração dos servidores MCP
- `README.md`: Esta documentação

## Servidores Configurados

### Essenciais

- **filesystem**: Acesso controlado ao sistema de arquivos do projeto
- **git**: Operações Git para controle de versão
- **http**: Requisições HTTP para APIs internas/externas
- **openapi**: Validação e consumo de APIs via OpenAPI Spec

### Dados

- **postgres**: Acesso ao banco de dados PostgreSQL (localhost:5432)
- **redis**: Acesso ao cache/eventos Redis (localhost:6379)

### Opcionais (Configuração Disponível)

- **s3**: Storage de arquivos (requer MinIO ou S3 compatível)
- **qdrant**: Indexação semântica de documentos (requer Qdrant rodando)

**Nota**: Consulte a seção "Servidores Opcionais" abaixo para instruções de configuração.

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

- `POSTGRES_CONNECTION_STRING`: Conexão com PostgreSQL
- `REDIS_URL`: URL do Redis
- `OPENAPI_SPEC_URL`: Caminho para a spec OpenAPI

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

**Referência**: Veja `.cursor/mcp.optional.json.example` para um exemplo completo de configuração.

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
- [MinIO Documentation](https://min.io/docs/)
- [Qdrant Documentation](https://qdrant.tech/documentation/)

