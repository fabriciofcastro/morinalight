# Testes do Catálogo Avançado

## Testes Criados

### Testes Unitários (packages/catalogo-application/tests/)

1. **atualizar-produto.use-case.test.ts**
   - Testa atualização de nome, SKU, categoria e múltiplos campos
   - Valida erros quando produto não existe

2. **criar-variante.use-case.test.ts**
   - Testa criação de variações com atributos, preço e estoque
   - Valida erro quando produto não existe
   - Valida erro quando SKU já existe

3. **criar-categoria.use-case.test.ts**
   - Testa criação de categorias simples e hierárquicas
   - Valida erro quando slug já existe
   - Valida erro quando parent não existe

### Testes de Integração HTTP (apps/api/tests/catalogo/)

1. **catalog-advanced.route.test.ts**
   - Testa rotas de atualização de produto com SKU e categoria
   - Testa CRUD completo de categorias
   - Testa CRUD completo de variações de produto

## Como Executar os Testes

### Testes Unitários
```bash
cd packages/catalogo-application
pnpm test
```

### Testes de Integração
```bash
cd apps/api
pnpm test tests/catalogo/catalog-advanced.route.test.ts
```

## Validação Manual das Rotas

### 1. Criar Categoria
```bash
curl -X POST http://localhost:3333/catalogo/categorias \
  -H "Content-Type: application/json" \
  -H "x-org-id: org-123" \
  -H "x-user-id: user-123" \
  -d '{
    "name": "Roupas",
    "slug": "roupas",
    "description": "Categoria de roupas"
  }'
```

### 2. Listar Categorias
```bash
curl http://localhost:3333/catalogo/categorias \
  -H "x-org-id: org-123" \
  -H "x-user-id: user-123"
```

### 3. Criar Produto com SKU e Categoria
```bash
curl -X POST http://localhost:3333/catalogo/produtos \
  -H "Content-Type: application/json" \
  -H "x-org-id: org-123" \
  -H "x-user-id: user-123" \
  -d '{
    "nome": "Camiseta",
    "descricao": "Camiseta básica",
    "sku": "CAM-001",
    "categoryId": "<categoria-id>"
  }'
```

### 4. Atualizar Produto
```bash
curl -X PUT http://localhost:3333/catalogo/produtos/<produto-id> \
  -H "Content-Type: application/json" \
  -H "x-org-id: org-123" \
  -H "x-user-id: user-123" \
  -d '{
    "nome": "Camiseta Atualizada",
    "sku": "CAM-001-UPD",
    "categoryId": "<categoria-id>"
  }'
```

### 5. Criar Variação
```bash
curl -X POST http://localhost:3333/catalogo/produtos/<produto-id>/variantes \
  -H "Content-Type: application/json" \
  -H "x-org-id: org-123" \
  -H "x-user-id: user-123" \
  -d '{
    "sku": "CAM-M-AZUL",
    "nome": "Camiseta M Azul",
    "atributos": {
      "tamanho": "M",
      "cor": "azul"
    },
    "preco": 49.99,
    "estoque": 10
  }'
```

### 6. Listar Variações
```bash
curl http://localhost:3333/catalogo/produtos/<produto-id>/variantes \
  -H "x-org-id: org-123" \
  -H "x-user-id: user-123"
```

### 7. Atualizar Variação
```bash
curl -X PUT http://localhost:3333/catalogo/variantes/<variante-id> \
  -H "Content-Type: application/json" \
  -H "x-org-id: org-123" \
  -H "x-user-id: user-123" \
  -d '{
    "nome": "Camiseta M Azul Escuro",
    "preco": 59.99,
    "estoque": 15
  }'
```

## Notas

- Todos os testes foram criados seguindo o padrão dos testes existentes
- Os testes de integração HTTP usam repositórios in-memory para isolamento
- Há um problema conhecido com a configuração do vitest que precisa ser resolvido (arquivos .js vs .ts)
- As rotas estão funcionais e podem ser testadas manualmente via curl ou Postman

