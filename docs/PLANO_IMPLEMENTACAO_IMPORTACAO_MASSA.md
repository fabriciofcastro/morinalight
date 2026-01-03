# 📥 Plano de Implementação - Importação em Massa de Fornecedores

## 🎯 Objetivo

Implementar sistema completo de importação em massa de fornecedores via CSV/Excel com validação, preview e processamento assíncrono.

---

## 📋 Funcionalidades

### 1. Upload e Validação

- [ ] Upload de arquivo (drag & drop + botão)
- [ ] Suporte a CSV, XLSX, XLS
- [ ] Validação de formato
- [ ] Limite de tamanho (ex: 10MB)
- [ ] Validação de encoding (UTF-8)

### 2. Mapeamento de Colunas

- [ ] Auto-detecção de colunas
- [ ] Mapeamento manual (se necessário)
- [ ] Preview do mapeamento
- [ ] Validação de campos obrigatórios

### 3. Preview e Validação

- [ ] Preview dos dados antes de importar
- [ ] Validação linha por linha
- [ ] Indicadores visuais (sucesso, erro, aviso)
- [ ] Contadores (total, válidos, inválidos)
- [ ] Filtros no preview (apenas erros, apenas válidos)

### 4. Processamento

- [ ] Processamento assíncrono (background job)
- [ ] Barra de progresso
- [ ] Notificação ao concluir
- [ ] Relatório detalhado de importação

### 5. Tratamento de Erros

- [ ] Validação de CNPJ
- [ ] Validação de email
- [ ] Validação de telefone
- [ ] Detecção de duplicatas
- [ ] Mensagens de erro claras

---

## 🏗️ Arquitetura

### Backend

#### 1. Endpoint de Upload

```
POST /api/suppliers/import/upload
- Recebe arquivo multipart/form-data
- Valida formato e tamanho
- Salva arquivo temporário
- Retorna jobId para acompanhamento
```

#### 2. Endpoint de Validação

```
POST /api/suppliers/import/validate
- Recebe jobId
- Processa arquivo (parsing)
- Valida dados
- Retorna preview com validações
```

#### 3. Endpoint de Importação

```
POST /api/suppliers/import/execute
- Recebe jobId e confirmação
- Processa importação em background
- Retorna status do job
```

#### 4. Endpoint de Status

```
GET /api/suppliers/import/status/:jobId
- Retorna status do job
- Progresso atual
- Resultados parciais
```

### Frontend

#### 1. Componente de Upload

- Drag & drop zone
- Botão de seleção
- Preview do arquivo selecionado
- Validação visual

#### 2. Componente de Mapeamento

- Tabela de colunas detectadas
- Dropdown para mapear campos
- Preview do mapeamento

#### 3. Componente de Preview

- Tabela com dados
- Indicadores de validação
- Filtros e busca
- Contadores

#### 4. Componente de Progresso

- Barra de progresso
- Status atual
- Log de atividades
- Botão de cancelar (se possível)

---

## 📦 Estrutura de Arquivos

### Backend

```
apps/api/src/modules/suppliers/
├── http/
│   └── suppliers-import.routes.ts      # Rotas de importação
├── services/
│   └── supplier-import.service.ts       # Lógica de importação
├── jobs/
│   └── import-suppliers.job.ts         # Job de processamento
└── utils/
    ├── csv-parser.ts                   # Parser de CSV
    ├── excel-parser.ts                 # Parser de Excel
    └── import-validator.ts              # Validador de dados
```

### Frontend

```
apps/web/src/app/(app)/fornecedores/
├── import/
│   ├── page.tsx                        # Página principal
│   └── components/
│       ├── upload-step.tsx            # Step 1: Upload
│       ├── mapping-step.tsx           # Step 2: Mapeamento
│       ├── preview-step.tsx           # Step 3: Preview
│       ├── progress-step.tsx          # Step 4: Progresso
│       └── result-step.tsx            # Step 5: Resultado
└── hooks/
    └── use-supplier-import.ts         # Hook de importação
```

---

## 🔧 Dependências

### Backend

```json
{
  "papaparse": "^5.4.1", // Parser CSV
  "xlsx": "^0.18.5", // Parser Excel
  "multer": "^1.4.5-lts.1", // Upload de arquivos
  "bull": "^4.11.0", // Queue de jobs
  "ioredis": "^5.3.0" // Redis para queue
}
```

### Frontend

```json
{
  "react-dropzone": "^14.2.3", // Drag & drop
  "papaparse": "^5.4.1", // Parser CSV (client)
  "xlsx": "^0.18.5", // Parser Excel (client)
  "react-hot-toast": "^2.4.1" // Notificações
}
```

---

## 📝 Schema de Dados

### Template CSV/Excel

```csv
nome,cnpj,email,telefone,endereco,cidade,estado,cep,website,ramo_atividade,tipo_fornecedor,prazo_pagamento,condicao_pagamento,limite_credito
Fornecedor Exemplo,12345678000190,contato@exemplo.com,11999999999,Rua Exemplo 123,São Paulo,SP,01234567,https://exemplo.com,Textil,Fornecedor,30,Dinheiro,10000.00
```

### Campos Suportados

- **Obrigatórios**: nome, cnpj (ou document)
- **Opcionais**: email, telefone, endereco, cidade, estado, cep, website, ramo_atividade, tipo_fornecedor, prazo_pagamento, condicao_pagamento, limite_credito, contato_principal, cargo_contato, notas

---

## 🚀 Fluxo de Implementação

### Fase 1: Backend Básico

1. Criar endpoint de upload
2. Implementar parser CSV
3. Implementar parser Excel
4. Criar validador básico
5. Testes unitários

### Fase 2: Frontend Básico

1. Criar página de importação
2. Componente de upload
3. Componente de preview
4. Integração com backend
5. Testes de integração

### Fase 3: Validações Avançadas

1. Validação de CNPJ (ReceitaWS)
2. Validação de email
3. Validação de telefone
4. Detecção de duplicatas
5. Mensagens de erro claras

### Fase 4: Processamento Assíncrono

1. Configurar queue (Bull/Redis)
2. Criar job de processamento
3. Endpoint de status
4. Notificações
5. Relatório de importação

### Fase 5: Melhorias

1. Mapeamento automático inteligente
2. Correções sugeridas
3. Importação parcial (ignorar erros)
4. Template de exemplo
5. Histórico de importações

---

## 🧪 Casos de Teste

### Upload

- [ ] Upload de CSV válido
- [ ] Upload de Excel válido
- [ ] Upload de arquivo inválido (erro)
- [ ] Upload de arquivo muito grande (erro)
- [ ] Upload sem arquivo (erro)

### Validação

- [ ] Validação de CNPJ válido
- [ ] Validação de CNPJ inválido
- [ ] Validação de email válido
- [ ] Validação de email inválido
- [ ] Detecção de duplicata
- [ ] Campos obrigatórios faltando

### Importação

- [ ] Importação de 10 fornecedores válidos
- [ ] Importação de 100 fornecedores válidos
- [ ] Importação com alguns erros (parcial)
- [ ] Importação com muitos erros (falha)
- [ ] Importação de duplicatas (opção de merge)

---

## 📊 Métricas

### Performance

- Tempo de parsing (objetivo: < 1s para 1000 linhas)
- Tempo de validação (objetivo: < 5s para 1000 linhas)
- Tempo de importação (objetivo: < 30s para 1000 fornecedores)

### Qualidade

- Taxa de sucesso de importação (objetivo: > 95%)
- Precisão de detecção de duplicatas (objetivo: > 90%)
- Taxa de validação automática (objetivo: > 80%)

---

## 🔐 Segurança

- [ ] Validação de tipo MIME
- [ ] Limite de tamanho de arquivo
- [ ] Sanitização de dados
- [ ] Rate limiting no upload
- [ ] Autenticação obrigatória
- [ ] Permissão de importação (RBAC)
- [ ] Logs de auditoria

---

## 📚 Documentação

- [ ] Documentação da API (Swagger)
- [ ] Template de exemplo para download
- [ ] Guia de uso na interface
- [ ] Documentação de erros comuns
- [ ] FAQ

---

**Status**: Planejamento
**Prioridade**: Alta
**Estimativa**: 2-3 semanas
