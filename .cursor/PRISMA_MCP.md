# Configuração do Prisma MCP Server

Este documento explica como configurar e usar o servidor MCP do Prisma no Cursor.

## Status da Configuração

✅ **Connection String Configurada**: A connection string do seu banco Prisma está configurada no servidor MCP `postgres` no arquivo `.cursor/mcp.json`.

```
postgres://8f2e8c48101c8bac6da1c4b39ebd56f06e65fd28f81c181786cef68106638321:***@db.prisma.io:5432/postgres?sslmode=require
```

✅ **Workspace do Prisma**:
- URL: https://console.prisma.io/cly0v45a508o0vfv2ztv0sr5f/cmj5rep4c0428uqfm5vgrj4u1/cmj5rep4c0426uqfm6x1as1l3/dashboard
- Database: Prisma Postgres (db.prisma.io:5432)

## Servidores MCP Configurados

### 1. Postgres (Prisma)
O servidor `postgres` está configurado para usar o banco de dados gerenciado pelo Prisma. Isso permite acesso direto ao banco através dos tools do servidor MCP postgres.

### 2. Postgres Local
O servidor `postgres-local` está configurado para usar o banco de dados local (caso você queira usar ambos).

### 3. Prisma MCP Server (Nativo do Cursor)
O Cursor possui um servidor MCP do Prisma integrado que fornece tools avançados para gerenciar seu workspace do Prisma.

## Tools Disponíveis do Prisma MCP

O Prisma MCP Server fornece os seguintes tools (disponíveis automaticamente no Cursor):

### Gerenciamento de Databases
- `mcp_Prisma_list_prisma_postgres_databases` - Lista todos os databases do Prisma
- `mcp_Prisma_create_prisma_postgres_database` - Cria um novo database
- `mcp_Prisma_delete_prisma_postgres_database` - Deleta um database
- `mcp_Prisma_fetch_workspace_details` - Obtém detalhes do workspace

### Connection Strings
- `mcp_Prisma_list_prisma_postgres_connection_strings` - Lista connection strings
- `mcp_Prisma_create_prisma_postgres_connection_string` - Cria uma nova connection string
- `mcp_Prisma_delete_prisma_postgres_connection_string` - Deleta uma connection string

### Backups
- `mcp_Prisma_list_prisma_postgres_backups` - Lista backups disponíveis
- `mcp_Prisma_create_prisma_postgres_backup` - Cria um backup
- `mcp_Prisma_create_prisma_postgres_recovery` - Restaura de um backup

### Schema e Queries
- `mcp_Prisma_introspect_database_schema` - Introspecta o schema do banco
- `mcp_Prisma_execute_sql_query` - Executa queries SQL
- `mcp_Prisma_execute_prisma_postgres_schema_update` - Executa atualizações de schema

## Como Usar

### 1. Acessar o Database através do MCP Postgres

O servidor MCP `postgres` configurado permite que você use tools como:
- Executar queries SQL diretamente
- Explorar tabelas e estruturas
- Testar conexões

**Exemplo**: Você pode pedir ao Cursor para "listar todas as tabelas do banco Prisma" e ele usará o servidor MCP postgres configurado.

### 2. Usar os Tools do Prisma MCP

Para usar os tools avançados do Prisma MCP, você precisa estar autenticado no workspace do Prisma. O Cursor geralmente gerencia isso automaticamente, mas você pode precisar:

1. Fazer login no console do Prisma: https://console.prisma.io
2. O Cursor pode solicitar autenticação ao usar os tools pela primeira vez
3. Alguns tools podem precisar de parâmetros específicos como `projectId` ou `databaseId`

### 3. Encontrar IDs Necessários

Para usar alguns tools do Prisma MCP, você precisará dos seguintes IDs:

- **Project ID**: Pode ser encontrado na URL do console do Prisma
  - Exemplo: `cly0v45a508o0vfv2ztv0sr5f` (da sua URL)
  
- **Database ID**: Pode ser obtido usando `mcp_Prisma_list_prisma_postgres_databases`
  - Este tool retornará uma lista com os IDs dos databases

- **Team ID**: Geralmente não necessário, mas pode ser encontrado nas configurações do workspace

## Exemplos de Uso

### Listar Databases
```
Você: "Liste todos os databases do Prisma"
```

### Introspectar Schema
```
Você: "Mostre o schema do database do Prisma"
```
O Cursor usará `mcp_Prisma_introspect_database_schema` com os IDs apropriados.

### Executar Query SQL
```
Você: "Execute SELECT * FROM users LIMIT 10 no banco Prisma"
```
O Cursor pode usar tanto o servidor MCP postgres quanto os tools do Prisma MCP.

## Troubleshooting

### Tools do Prisma MCP não funcionam
1. Verifique se você está autenticado no console do Prisma
2. Verifique se o Cursor tem permissões para acessar seu workspace
3. Alguns tools requerem IDs específicos - use `list_prisma_postgres_databases` primeiro

### Connection String não funciona
1. Verifique se a connection string está correta no `mcp.json`
2. Teste a connection string manualmente com `psql` ou outra ferramenta
3. Verifique se as credenciais não expiraram

### Erro de autenticação
1. Faça login novamente no console do Prisma
2. Verifique se o token da connection string não expirou
3. Gere uma nova connection string no console do Prisma se necessário

## Próximos Passos

1. ✅ Connection string configurada no `mcp.json`
2. ⏭️ Teste a conexão pedindo ao Cursor para listar as tabelas
3. ⏭️ Use os tools do Prisma MCP para gerenciar seu workspace
4. ⏭️ Configure backups automáticos se necessário

## Referências

- [Prisma Console](https://console.prisma.io)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Cursor MCP Documentation](https://docs.cursor.com/mcp)
- [Model Context Protocol](https://modelcontextprotocol.io/)












