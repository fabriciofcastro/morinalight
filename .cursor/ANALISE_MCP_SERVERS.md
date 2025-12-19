# 🔍 Análise: Servidores MCP Necessários para o Projeto MORINA

## 📊 Resumo Executivo

Este documento analisa quais servidores MCP são **essenciais**, **recomendados** ou **opcionais** para o desenvolvimento do projeto MORINA.

---

## ✅ Servidores ESSENCIAIS (Obrigatórios)

### 1. **filesystem** ⭐⭐⭐
**Status:** ✅ Essencial  
**Motivo:**
- Permite ao Cursor acessar e modificar arquivos do projeto
- Necessário para leitura de código, schemas, documentação
- Sem ele, o Cursor não consegue entender a estrutura do projeto

**Configuração atual:** ✅ Configurado

---

### 2. **postgres-local** ou **postgres** ⭐⭐⭐
**Status:** ✅ Essencial (pelo menos um)  
**Motivo:**
- O projeto **depende completamente** de PostgreSQL para funcionar
- Usa Prisma ORM que requer conexão ativa com banco
- Necessário para:
  - Executar migrações (`prisma migrate`)
  - Gerar Prisma Client (`prisma generate`)
  - Testar queries e schemas
  - Validar estrutura do banco

**Recomendação:**
- Manter **postgres-local** para desenvolvimento local (docker-compose)
- Manter **postgres** (Prisma) apenas se você usa o Prisma Cloud em produção
- Se não usa Prisma Cloud, pode remover o servidor `postgres`

**Configuração atual:** ✅ Ambos configurados

---

## 🔶 Servidores RECOMENDADOS (Altamente Úteis)

### 3. **openapi** ⭐⭐
**Status:** 🔶 Recomendado  
**Motivo:**
- Projeto possui spec OpenAPI em `docs/openapi/morina-openapi.yaml`
- Ajuda o Cursor a:
  - Validar contratos de API
  - Gerar código de clientes
  - Entender endpoints disponíveis
  - Garantir consistência entre frontend e backend

**Quando é essencial:**
- Se você trabalha muito com APIs
- Se precisa gerar documentação automática
- Se usa ferramentas que consomem OpenAPI spec

**Configuração atual:** ✅ Configurado

---

### 4. **Prisma MCP Server (Nativo do Cursor)** ⭐⭐
**Status:** 🔶 Recomendado (se usa Prisma Cloud)  
**Motivo:**
- O Cursor já tem suporte nativo ao Prisma MCP
- Permite gerenciar databases do Prisma Cloud
- Executar queries SQL diretamente
- Gerenciar backups e connection strings

**Quando é essencial:**
- Se você usa Prisma Cloud em produção
- Se precisa gerenciar databases remotamente
- Se trabalha com múltiplos ambientes

**Configuração atual:** ✅ Disponível nativamente no Cursor

---

## ⚠️ Servidores OPCIONAIS (Apenas se necessário)

### 5. **redis** ⭐
**Status:** ⚠️ Opcional  
**Motivo:**
- Redis é usado para cache e eventos em tempo real
- O projeto funciona sem Redis (modo fallback)
- Segundo documentação: "Redis (opcional, para eventos em tempo real)"

**Quando usar:**
- Se você trabalha com funcionalidades de tempo real
- Se precisa testar cache
- Se desenvolve funcionalidades que dependem de Redis

**Configuração atual:** ⚠️ Movido para opcionais (corrigido recentemente)

---

### 6. **s3** / **MinIO** ⭐
**Status:** ⚠️ Opcional  
**Motivo:**
- Não encontrado uso direto no código principal
- Útil apenas se você implementar storage de arquivos
- Requer configuração adicional no docker-compose

**Quando usar:**
- Se precisa armazenar arquivos (uploads, imagens, etc.)
- Se implementa funcionalidades de storage

**Configuração atual:** ⚠️ Disponível em `mcp.optional.json`

---

### 7. **qdrant** ⭐
**Status:** ⚠️ Opcional  
**Motivo:**
- Vectorstore para busca semântica
- Não encontrado uso no código atual
- Útil apenas para funcionalidades de IA/ML avançadas

**Quando usar:**
- Se implementa busca semântica
- Se trabalha com embeddings
- Se precisa de indexação vetorial

**Configuração atual:** ⚠️ Disponível em `mcp.optional.json`

---

## ❌ Servidores NÃO NECESSÁRIOS

### Servidores que NÃO existem ou não funcionam:
- **git** - O pacote `@modelcontextprotocol/server-git` não existe oficialmente
- **http** - O pacote `@modelcontextprotocol/server-http` não existe oficialmente
- **shell** - Removido anteriormente por configuração incorreta

**Nota:** O Cursor já tem suporte nativo ao Git, então não precisa de servidor MCP para isso.

---

## 🎯 Configuração Recomendada Mínima

### Para Desenvolvimento Básico:
```json
{
  "mcpServers": {
    "filesystem": { ... },
    "postgres-local": { ... }
  }
}
```

### Para Desenvolvimento Completo:
```json
{
  "mcpServers": {
    "filesystem": { ... },
    "postgres-local": { ... },
    "openapi": { ... },
    "postgres": { ... }  // Apenas se usa Prisma Cloud
  }
}
```

### Configuração Atual (Corrigida):
- ✅ **filesystem** - Essencial
- ✅ **postgres-local** - Essencial
- ✅ **openapi** - Recomendado
- ✅ **postgres** (Prisma) - Recomendado se usa Prisma Cloud
- ⚠️ **redis** - Opcional (movido para mcp.optional.json)

---

## 📋 Decisões de Configuração

### Você deve manter:

1. **filesystem** ✅
   - **Motivo:** Essencial para funcionamento do Cursor

2. **postgres-local** ✅
   - **Motivo:** Banco de dados local para desenvolvimento

3. **openapi** ✅
   - **Motivo:** Projeto tem spec OpenAPI, útil para validação

### Você pode remover se:

1. **postgres** (Prisma Cloud)
   - ❌ **Remover se:** Você não usa Prisma Cloud
   - ✅ **Manter se:** Você gerencia databases via Prisma Cloud

### Você deve adicionar quando necessário:

1. **redis**
   - Adicionar quando precisar testar funcionalidades de cache/tempo real
   - Configuração já está em `mcp.optional.json`

2. **s3** / **MinIO**
   - Adicionar quando implementar storage de arquivos
   - Configuração já está em `mcp.optional.json`

3. **qdrant**
   - Adicionar quando implementar busca semântica
   - Configuração já está em `mcp.optional.json`

---

## 🔧 Como Otimizar

### Se você NÃO usa Prisma Cloud:

Remova o servidor `postgres` (Prisma) e mantenha apenas `postgres-local`:

```bash
# Editar .cursor/mcp.json e remover a entrada "postgres"
```

### Se você usa apenas PostgreSQL local:

Mantenha apenas `postgres-local`, remova `postgres` (Prisma).

### Se você precisa de Redis:

1. Inicie o Redis: `docker compose up -d redis`
2. Adicione a configuração de `mcp.optional.json` para `mcp.json`

---

## 📊 Matriz de Decisão

| Servidor | Essencial? | Quando Usar | Config Atual |
|----------|------------|-------------|--------------|
| **filesystem** | ✅ Sim | Sempre | ✅ Ativo |
| **postgres-local** | ✅ Sim | Sempre | ✅ Ativo |
| **openapi** | 🔶 Sim | Desenvolvimento API | ✅ Ativo |
| **postgres** (Prisma) | 🔶 Depende | Se usa Prisma Cloud | ✅ Ativo |
| **redis** | ⚠️ Não | Cache/Tempo Real | ⚠️ Opcional |
| **s3** | ⚠️ Não | Storage de arquivos | ⚠️ Opcional |
| **qdrant** | ⚠️ Não | Busca semântica | ⚠️ Opcional |

---

## ✅ Conclusão

**Configuração mínima recomendada:**
- filesystem (essencial)
- postgres-local (essencial)
- openapi (recomendado)

**Configuração atual está adequada** para desenvolvimento completo, mas pode ser otimizada removendo servidores que você não usa.

---
**Última atualização:** 2025-12-18
**Versão do mcp.json:** 2.3

