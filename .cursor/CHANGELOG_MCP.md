# Changelog - Configuração MCP

## Versão 2.4 (2025-12-18)

### 🔧 Corrigido
- **OpenAPI**: Removido - pacote `@modelcontextprotocol/server-openapi` não existe no npm (erro 404)
- **Redis**: Movido para opcionais (requer Redis rodando)
- **Caminhos**: Corrigidos caminhos de filesystem e OpenAPI spec

### ➖ Removido
- **openapi**: Servidor MCP removido (pacote não existe no npm)

### ✅ Servidores Ativos
- **filesystem**: ✅ Funcionando
- **postgres-local**: ✅ Funcionando
- **postgres** (Prisma): ✅ Funcionando

## Versão 2.3 (2025-01-27)

### 🔧 Corrigido
- **Postgres-local**: Corrigido para usar connection string como argumento (não variável de ambiente)
- **Postgres (Prisma)**: Corrigido para usar connection string como argumento
- **Git e HTTP**: Removidos - pacotes `@modelcontextprotocol/server-git` e `@modelcontextprotocol/server-http` não existem no npm
- **Auth0**: Adicionado servidor Auth0 MCP

### ➕ Adicionado
- **auth0**: Servidor Auth0 MCP configurado

### ➖ Removido
- **git**: Pacote não existe no npm (erro 404)
- **http**: Pacote não existe no npm (erro 404)

### 📋 Status dos Servidores

#### ✅ Funcionando Corretamente
- **filesystem**: Configurado com caminho do projeto
- **postgres-local**: Connection string como argumento
- **postgres**: Connection string Prisma como argumento
- **redis**: Configurado corretamente
- **openapi**: Configurado com spec URL
- **auth0**: Configurado (requer inicialização com `npx @auth0/auth0-mcp-server init`)

#### ⚠️ Notas Importantes
- **socket**: Não é um servidor MCP separado - é o mecanismo de transporte usado pelos servidores
- **git/http**: Esses servidores não existem como pacotes npm oficiais do MCP
- **Auth0**: Para usar, execute primeiro `npx @auth0/auth0-mcp-server init` para autenticar

## Versão 2.2 (2025-01-27)

### 🔧 Corrigido
- **Configuração Postgres**: Garantido que todos os servidores postgres usam variável de ambiente `POSTGRES_CONNECTION_STRING` corretamente
- **JSON Format**: Validação e formatação do JSON corrigidas
- **Servidores essenciais**: Verificados e validados (filesystem, git, http, postgres-local)

## Versão 2.1 (2025-01-27)

### 🔧 Correções
- Removido servidor "shell" com configuração incorreta
- Ajustada formatação JSON

## Versão 2.0 (2025-01-01)

### ✅ Adicionado
- **Servidor Shell**: Adicionado servidor `shell` para execução de comandos do sistema
- **Documentação**: Criado arquivo `mcp.optional.json` com configurações de servidores opcionais (S3, Qdrant)
- **Versionamento**: Adicionado controle de versão ao `mcp.json`
- **Metadata**: Adicionados comentários e descrições para melhor compreensão

### 🔄 Mantido
- Todos os servidores anteriores permanecem configurados
- Connection strings do Prisma e local preservadas
- Configurações de OpenAPI mantidas

### 📋 Servidores Ativos

#### Essenciais
1. **filesystem** - Acesso ao sistema de arquivos
2. **git** - Operações Git
3. **shell** - Execução de comandos shell ⭐ NOVO
4. **http** - Requisições HTTP
5. **openapi** - Validação OpenAPI

#### Banco de Dados
6. **postgres** - PostgreSQL do Prisma (db.prisma.io)
7. **postgres-local** - PostgreSQL local (docker-compose)
8. **redis** - Redis cache/eventos

### 📦 Servidores Opcionais Disponíveis

Consulte `.cursor/mcp.optional.json` para configurações prontas de:
- **s3** - Storage MinIO/S3
- **qdrant** - Vectorstore para documentos

## Versão 1.0 (Anterior)

### Configuração Inicial
- Servidores básicos: filesystem, git, http, openapi
- Servidores de dados: postgres, redis
- Configuração do Prisma

---

## Como Atualizar

### Verificar Atualizações de Pacotes

Os servidores MCP usam `npx -y` para sempre usar as versões mais recentes. Para forçar atualização:

```bash
# Limpar cache do npx (opcional)
npm cache clean --force

# Testar um servidor específico
npx -y @modelcontextprotocol/server-postgres --help
```

### Adicionar Novos Servidores

1. Consulte a documentação oficial: https://modelcontextprotocol.io/
2. Adicione a configuração ao `mcp.json` dentro de `mcpServers`
3. Atualize o `CHANGELOG_MCP.md` e o `README.md`
4. Teste a configuração com `pnpm mcp:validate`

### Remover Servidores

1. Remova a entrada do `mcp.json`
2. Documente a remoção no changelog
3. Atualize o README

---

## Próximas Melhorias Sugeridas

- [ ] Adicionar servidor de browser automation (Puppeteer)
- [ ] Adicionar servidor de SQLite se necessário
- [ ] Configurar monitoramento de saúde dos servidores
- [ ] Adicionar testes automatizados de conectividade

---

## Referências

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP Servers Registry](https://github.com/modelcontextprotocol/servers)
- [Cursor MCP Docs](https://docs.cursor.com/mcp)

