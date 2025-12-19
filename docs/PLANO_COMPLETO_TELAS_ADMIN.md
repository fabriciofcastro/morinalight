# Plano Completo - Todas as Telas do Sidebar Administrativo

## 📋 Visão Geral

Este documento apresenta um plano robusto e avançado para criar do zero **TODAS as telas do sidebar administrativo**, seguindo o padrão de design system das telas de fichas-custo (list e new) como referência.

**Objetivo:** Criar um sistema completo, sofisticado e de alto nível para todas as funcionalidades administrativas com todos os recursos disponíveis.

---

## 🎯 Escopo Completo do Projeto

### Todas as Telas do Sidebar Administrativo

#### 1. **Dados da Empresa** (`/admin/company/edit`)
- Edição de dados cadastrais e fiscais
- Configurações da empresa
- Tema e branding

#### 2. **Filiais** (`/admin/branches`)
- Lista de filiais
- Criar/Editar/Visualizar filiais
- Gerenciar membros
- Configurações por filial

#### 3. **Departamentos** (`/admin/departments`)
- Lista de departamentos
- Criar/Editar/Visualizar departamentos
- Gerenciar membros
- Gerenciar permissões
- Hierarquia organizacional

#### 4. **Setores** (`/admin/sectors`)
- Lista de setores
- Criar/Editar/Visualizar setores
- Gerenciar membros
- Gerenciar permissões
- Relacionamento com departamentos

#### 5. **Cargos** (`/admin/positions`)
- Lista de cargos
- Criar/Editar/Visualizar cargos
- Gerenciar membros
- Gerenciar permissões
- Relacionamento com setores

#### 6. **Perfis de Acesso** (`/admin/roles`)
- Lista de perfis
- Criar/Editar/Visualizar perfis
- Gerenciar permissões por perfil
- Templates de perfis

#### 7. **Permissões** (`/admin/permissions`)
- Lista de permissões
- Criar/Editar permissões
- Categorização por módulo
- Gerenciamento granular

#### 8. **Matriz de Permissões** (`/admin/permissions/matrix`)
- Visão completa de permissões
- Trace por usuário
- Ações por camada
- Visualização matricial

#### 9. **Aprovações RBAC** (`/admin/permissions/approvals`)
- Fila de mudanças sensíveis
- Workflow de aprovação
- Histórico de aprovações
- Notificações

#### 10. **Segmentos** (`/admin/business-segments`)
- Lista de segmentos de negócio
- Criar/Editar/Visualizar segmentos
- Ativar/Desativar segmentos
- Configurações por segmento

#### 11. **Workflows** (`/admin/workflow-policies`)
- Lista de políticas de aprovação
- Criar/Editar/Visualizar workflows
- Configurar regras
- Histórico de execuções

#### 12. **Realtime Lab** (`/admin/realtime-lab`)
- Diagnóstico de mensageria
- Eventos em tempo real
- RBAC em tempo real
- Monitoramento avançado

#### 13. **Usuários** (`/admin/users`)
- Lista de usuários
- Criar/Editar/Visualizar usuários
- Gerenciar permissões
- Histórico de atividades
- Sessões ativas
- Importação/Exportação

---

## 🏗️ Arquitetura e Estrutura Completa

### Estrutura de Diretórios Geral

```
apps/web/src/app/(app)/admin/
├── company/
│   └── edit/
│       └── page.tsx
├── branches/
│   ├── page.tsx
│   ├── new/
│   │   └── page.tsx
│   └── [branchId]/
│       ├── page.tsx
│       ├── edit/
│       │   └── page.tsx
│       └── members/
│           └── page.tsx
├── departments/
│   ├── page.tsx
│   ├── new/
│   │   └── page.tsx
│   └── [departmentId]/
│       ├── page.tsx
│       ├── edit/
│       │   └── page.tsx
│       ├── members/
│       │   └── page.tsx
│       └── permissions/
│           └── page.tsx
├── sectors/
│   ├── page.tsx
│   ├── new/
│   │   └── page.tsx
│   └── [sectorId]/
│       ├── page.tsx
│       ├── edit/
│       │   └── page.tsx
│       ├── members/
│       │   └── page.tsx
│       └── permissions/
│           └── page.tsx
├── positions/
│   ├── page.tsx
│   ├── new/
│   │   └── page.tsx
│   └── [positionId]/
│       ├── page.tsx
│       ├── edit/
│       │   └── page.tsx
│       ├── members/
│       │   └── page.tsx
│       └── permissions/
│           └── page.tsx
├── roles/
│   ├── page.tsx
│   ├── new/
│   │   └── page.tsx
│   └── [roleId]/
│       ├── page.tsx
│       ├── edit/
│       │   └── page.tsx
│       └── permissions/
│           └── page.tsx
├── permissions/
│   ├── page.tsx
│   ├── new/
│   │   └── page.tsx
│   ├── [permissionId]/
│   │   └── page.tsx
│   ├── matrix/
│   │   └── page.tsx
│   └── approvals/
│       └── page.tsx
├── business-segments/
│   ├── page.tsx
│   ├── new/
│   │   └── page.tsx
│   └── [segmentId]/
│       ├── page.tsx
│       └── edit/
│           └── page.tsx
├── workflow-policies/
│   ├── page.tsx
│   ├── new/
│   │   └── page.tsx
│   └── [policyId]/
│       ├── page.tsx
│       └── edit/
│           └── page.tsx
├── realtime-lab/
│   └── page.tsx
└── users/
    ├── page.tsx
    ├── new/
    │   └── page.tsx
    ├── import/
    │   └── page.tsx
    ├── export/
    │   └── page.tsx
    └── [userId]/
        ├── page.tsx
        ├── edit/
        │   └── page.tsx
        ├── permissions/
        │   └── page.tsx
        ├── activity/
        │   └── page.tsx
        ├── sessions/
        │   └── page.tsx
        └── audit/
            └── page.tsx

apps/web/src/components/admin/
├── company/
│   └── company-edit-client.tsx
├── branches/
│   ├── branches-list-client.tsx
│   ├── branch-form-client.tsx
│   ├── branch-detail-client.tsx
│   └── branch-members-manager.tsx
├── departments/
│   ├── departments-list-client.tsx
│   ├── department-form-client.tsx
│   ├── department-detail-client.tsx
│   ├── department-members-manager.tsx
│   └── department-permissions-manager.tsx
├── sectors/
│   ├── sectors-list-client.tsx
│   ├── sector-form-client.tsx
│   ├── sector-detail-client.tsx
│   ├── sector-members-manager.tsx
│   └── sector-permissions-manager.tsx
├── positions/
│   ├── positions-list-client.tsx
│   ├── position-form-client.tsx
│   ├── position-detail-client.tsx
│   ├── position-members-manager.tsx
│   └── position-permissions-manager.tsx
├── roles/
│   ├── roles-list-client.tsx
│   ├── role-form-client.tsx
│   ├── role-detail-client.tsx
│   └── role-permissions-manager.tsx
├── permissions/
│   ├── permissions-list-client.tsx
│   ├── permission-form-client.tsx
│   ├── permission-detail-client.tsx
│   ├── permissions-matrix-client.tsx
│   └── permissions-approvals-client.tsx
├── business-segments/
│   ├── segments-list-client.tsx
│   ├── segment-form-client.tsx
│   └── segment-detail-client.tsx
├── workflow-policies/
│   ├── workflows-list-client.tsx
│   ├── workflow-form-client.tsx
│   └── workflow-detail-client.tsx
├── realtime-lab/
│   └── realtime-lab-client.tsx
└── users/
    ├── users-list-client.tsx
    ├── users-form-client.tsx
    ├── users-detail-client.tsx
    └── [outros componentes já listados anteriormente]

apps/web/src/hooks/
├── use-branches.ts
├── use-branch.ts
├── use-departments.ts
├── use-department.ts
├── use-sectors.ts
├── use-sector.ts
├── use-positions.ts
├── use-position.ts
├── use-roles.ts
├── use-role.ts
├── use-permissions.ts
├── use-permission.ts
├── use-business-segments.ts
├── use-business-segment.ts
├── use-workflow-policies.ts
├── use-workflow-policy.ts
└── [hooks de usuários já listados]
```

---

## 📐 Design System - Padrões de Referência

### Baseado em: `fichas-custo/list` e `fichas-custo/new`

#### Componentes Futuristas Padrão

1. **Header Futurista** (todas as telas)
2. **Inputs Futuristas** (FuturisticInput, FuturisticSelect, FuturisticTextarea)
3. **Cards com Glass Morphism**
4. **Filtros Avançados Colapsáveis**
5. **Visualização Grid/Lista**
6. **Animações com framer-motion**
7. **Badges de Status**
8. **Ações em Massa**
9. **Paginação**
10. **Estados Vazios**

---

## ✅ CHECKLIST COMPLETO - FASE 1: INFRAESTRUTURA BASE

### 1.1 Setup Inicial Global
- [ ] Criar estrutura de diretórios completa para todas as telas
- [ ] Criar arquivos base (page.tsx) para todas as rotas
- [ ] Configurar metadata e SEO para cada página
- [ ] Verificar todas as rotas no sidebar
- [ ] Criar tipos TypeScript globais
- [ ] Criar schemas Zod globais
- [ ] Configurar PageBackground em todas as telas

### 1.2 Hooks Customizados Globais
- [ ] Criar hooks para cada entidade (branches, departments, sectors, positions, roles, permissions, etc.)
- [ ] Padronizar estrutura de hooks (list, get, create, update, delete)
- [ ] Implementar paginação padrão
- [ ] Implementar filtros padrão
- [ ] Implementar loading states
- [ ] Implementar error handling
- [ ] Implementar cache/refetch

### 1.3 Componentes Base Reutilizáveis
- [ ] `FuturisticInput` (já existe em fichas-custo, extrair para componente global)
- [ ] `FuturisticSelect` (já existe em fichas-custo, extrair para componente global)
- [ ] `FuturisticTextarea` (já existe em fichas-custo, extrair para componente global)
- [ ] `StatusBadge` - Badge de status genérico
- [ ] `EntityCard` - Card genérico para grid view
- [ ] `EntityTableRow` - Linha de tabela genérica
- [ ] `AdvancedFilters` - Componente de filtros reutilizável
- [ ] `EntityStats` - Estatísticas genéricas
- [ ] `BulkActionsBar` - Barra de ações em massa
- [ ] `Pagination` - Componente de paginação
- [ ] `EmptyState` - Estado vazio genérico
- [ ] `LoadingState` - Estado de loading genérico

---

## ✅ CHECKLIST COMPLETO - FASE 2: DADOS DA EMPRESA (`/admin/company/edit`)

### 2.1 Estrutura Base
- [ ] Criar `apps/web/src/app/(app)/admin/company/edit/page.tsx`
- [ ] Criar `apps/web/src/components/admin/company/company-edit-client.tsx`
- [ ] Implementar layout com PageBackground
- [ ] Adicionar metadata

### 2.2 Header Futurista
- [ ] Ícone Building2
- [ ] Título "Dados da Empresa"
- [ ] Subtítulo "Configurações cadastrais e fiscais"
- [ ] Bordas decorativas
- [ ] Background com gradiente

### 2.3 Formulário de Dados Cadastrais
- [ ] Seção "Dados Cadastrais"
  - [ ] Razão Social (FuturisticInput, obrigatório)
  - [ ] Nome Fantasia (FuturisticInput, opcional)
  - [ ] CNPJ (FuturisticInput, obrigatório, máscara, validação)
  - [ ] Inscrição Estadual (FuturisticInput, opcional)
  - [ ] Inscrição Municipal (FuturisticInput, opcional)
- [ ] Seção "Endereço"
  - [ ] CEP (FuturisticInput, máscara, busca automática)
  - [ ] Logradouro (FuturisticInput)
  - [ ] Número (FuturisticInput)
  - [ ] Complemento (FuturisticInput, opcional)
  - [ ] Bairro (FuturisticInput)
  - [ ] Cidade (FuturisticInput)
  - [ ] Estado (FuturisticSelect)
  - [ ] País (FuturisticSelect, default: Brasil)
- [ ] Seção "Contato"
  - [ ] Telefone (FuturisticInput, máscara)
  - [ ] Email (FuturisticInput, validação)
  - [ ] Website (FuturisticInput, opcional)

### 2.4 Formulário de Dados Fiscais
- [ ] Seção "Dados Fiscais"
  - [ ] Regime Tributário (FuturisticSelect)
  - [ ] CNAE Principal (FuturisticInput, máscara)
  - [ ] CNAEs Secundários (multi-select)
  - [ ] Simples Nacional (checkbox)
  - [ ] Data de Abertura (FuturisticInput, type="date")
  - [ ] Capital Social (FuturisticInput, máscara monetária)

### 2.5 Configurações de Tema
- [ ] Seção "Branding"
  - [ ] Upload de Logo
  - [ ] Preview do logo
  - [ ] Cores primárias (color picker)
  - [ ] Cores secundárias (color picker)
  - [ ] Upload de vídeo de apresentação (opcional)

### 2.6 Validação e Ações
- [ ] Validação de CNPJ (algoritmo)
- [ ] Busca automática de CEP
- [ ] Validação de email
- [ ] Botão "Salvar" (gradiente, glow)
- [ ] Botão "Cancelar"
- [ ] Feedback de sucesso/erro

---

## ✅ CHECKLIST COMPLETO - FASE 3: FILIAIS (`/admin/branches`)

### 3.1 Lista de Filiais
- [ ] Criar `apps/web/src/app/(app)/admin/branches/page.tsx`
- [ ] Criar `apps/web/src/components/admin/branches/branches-list-client.tsx`
- [ ] Header futurista com stats
- [ ] Barra de busca futurista
- [ ] Filtros avançados:
  - [ ] Status (ativo/inativo)
  - [ ] Data de criação
  - [ ] Cidade/Estado
  - [ ] Ordenação
- [ ] Toggle Grid/Lista
- [ ] Visualização em Grid:
  - [ ] Card de filial
  - [ ] Nome, código, endereço
  - [ ] Status badge
  - [ ] Número de membros
  - [ ] Ações (Ver, Editar)
- [ ] Visualização em Lista:
  - [ ] Tabela responsiva
  - [ ] Colunas: Nome, Código, Endereço, Status, Membros, Ações
  - [ ] Checkbox para seleção
- [ ] Ações em massa:
  - [ ] Ativar/Desativar
  - [ ] Excluir
  - [ ] Exportar
- [ ] Paginação
- [ ] Botão "Nova Filial"

### 3.2 Criar/Editar Filial
- [ ] Criar `apps/web/src/app/(app)/admin/branches/new/page.tsx`
- [ ] Criar `apps/web/src/components/admin/branches/branch-form-client.tsx`
- [ ] Formulário completo:
  - [ ] Nome (obrigatório)
  - [ ] Código (obrigatório, único)
  - [ ] Endereço completo
  - [ ] Telefone
  - [ ] Email
  - [ ] Status
  - [ ] Observações
- [ ] Validação completa
- [ ] Botões de ação

### 3.3 Detalhes da Filial
- [ ] Criar `apps/web/src/app/(app)/admin/branches/[branchId]/page.tsx`
- [ ] Criar `apps/web/src/components/admin/branches/branch-detail-client.tsx`
- [ ] Tabs:
  - [ ] Informações
  - [ ] Membros
  - [ ] Configurações
- [ ] Ações rápidas
- [ ] Histórico de mudanças

### 3.4 Gerenciar Membros
- [ ] Criar `apps/web/src/app/(app)/admin/branches/[branchId]/members/page.tsx`
- [ ] Lista de membros
- [ ] Adicionar membro
- [ ] Remover membro
- [ ] Atribuir cargo na filial

---

## ✅ CHECKLIST COMPLETO - FASE 4: DEPARTAMENTOS (`/admin/departments`)

### 4.1 Lista de Departamentos
- [ ] Criar `apps/web/src/app/(app)/admin/departments/page.tsx`
- [ ] Criar `apps/web/src/components/admin/departments/departments-list-client.tsx`
- [ ] Header futurista com stats:
  - [ ] Total de departamentos
  - [ ] Departamentos ativos
  - [ ] Total de membros
  - [ ] Total de setores
- [ ] Barra de busca
- [ ] Filtros avançados:
  - [ ] Status
  - [ ] Data de criação
  - [ ] Ordenação
- [ ] Toggle Grid/Lista
- [ ] Visualização em Grid:
  - [ ] Card de departamento
  - [ ] Nome, código
  - [ ] Status badge
  - [ ] Número de setores
  - [ ] Número de membros
  - [ ] Ações (Ver, Editar, Permissões)
- [ ] Visualização em Lista:
  - [ ] Tabela com todas as informações
  - [ ] Checkbox para seleção
- [ ] Ações em massa
- [ ] Paginação
- [ ] Botão "Novo Departamento"

### 4.2 Criar/Editar Departamento
- [ ] Criar `apps/web/src/app/(app)/admin/departments/new/page.tsx`
- [ ] Criar `apps/web/src/components/admin/departments/department-form-client.tsx`
- [ ] Formulário:
  - [ ] Nome (obrigatório)
  - [ ] Código (obrigatório, único)
  - [ ] Descrição (FuturisticTextarea)
  - [ ] Status (FuturisticSelect)
  - [ ] Observações (FuturisticTextarea, opcional)
- [ ] Validação
- [ ] Botões de ação

### 4.3 Detalhes do Departamento
- [ ] Criar `apps/web/src/app/(app)/admin/departments/[departmentId]/page.tsx`
- [ ] Criar `apps/web/src/components/admin/departments/department-detail-client.tsx`
- [ ] Tabs:
  - [ ] Informações
  - [ ] Setores (lista de setores do departamento)
  - [ ] Membros
  - [ ] Permissões
  - [ ] Histórico
- [ ] Ações rápidas

### 4.4 Gerenciar Membros do Departamento
- [ ] Criar `apps/web/src/app/(app)/admin/departments/[departmentId]/members/page.tsx`
- [ ] Lista de membros
- [ ] Adicionar membro (busca de usuários)
- [ ] Remover membro
- [ ] Atribuir cargo no departamento

### 4.5 Gerenciar Permissões do Departamento
- [ ] Criar `apps/web/src/app/(app)/admin/departments/[departmentId]/permissions/page.tsx`
- [ ] Criar `apps/web/src/components/admin/departments/department-permissions-manager.tsx`
- [ ] Lista de permissões agrupadas por módulo
- [ ] Checkboxes para conceder/negar
- [ ] Aplicar template
- [ ] Visualizar permissões efetivas

---

## ✅ CHECKLIST COMPLETO - FASE 5: SETORES (`/admin/sectors`)

### 5.1 Lista de Setores
- [ ] Criar `apps/web/src/app/(app)/admin/sectors/page.tsx`
- [ ] Criar `apps/web/src/components/admin/sectors/sectors-list-client.tsx`
- [ ] Header futurista com stats:
  - [ ] Total de setores
  - [ ] Setores ativos
  - [ ] Total de membros
  - [ ] Total de cargos
- [ ] Barra de busca
- [ ] Filtros avançados:
  - [ ] Departamento (select com busca)
  - [ ] Status
  - [ ] Data de criação
  - [ ] Ordenação
- [ ] Toggle Grid/Lista
- [ ] Visualização em Grid:
  - [ ] Card de setor
  - [ ] Nome, código
  - [ ] Departamento (badge)
  - [ ] Status badge
  - [ ] Número de cargos
  - [ ] Número de membros
  - [ ] Ações (Ver, Editar, Permissões)
- [ ] Visualização em Lista
- [ ] Ações em massa
- [ ] Paginação
- [ ] Botão "Novo Setor"

### 5.2 Criar/Editar Setor
- [ ] Criar `apps/web/src/app/(app)/admin/sectors/new/page.tsx`
- [ ] Criar `apps/web/src/components/admin/sectors/sector-form-client.tsx`
- [ ] Formulário:
  - [ ] Departamento (FuturisticSelect com busca, obrigatório)
  - [ ] Nome (obrigatório)
  - [ ] Código (obrigatório, único no departamento)
  - [ ] Descrição (FuturisticTextarea)
  - [ ] Status (FuturisticSelect)
  - [ ] Observações (FuturisticTextarea, opcional)
- [ ] Validação
- [ ] Botões de ação

### 5.3 Detalhes do Setor
- [ ] Criar `apps/web/src/app/(app)/admin/sectors/[sectorId]/page.tsx`
- [ ] Criar `apps/web/src/components/admin/sectors/sector-detail-client.tsx`
- [ ] Tabs:
  - [ ] Informações
  - [ ] Departamento (link para departamento)
  - [ ] Cargos (lista de cargos do setor)
  - [ ] Membros
  - [ ] Permissões
  - [ ] Histórico
- [ ] Ações rápidas

### 5.4 Gerenciar Membros do Setor
- [ ] Criar `apps/web/src/app/(app)/admin/sectors/[sectorId]/members/page.tsx`
- [ ] Lista de membros
- [ ] Adicionar membro
- [ ] Remover membro
- [ ] Atribuir cargo no setor

### 5.5 Gerenciar Permissões do Setor
- [ ] Criar `apps/web/src/app/(app)/admin/sectors/[sectorId]/permissions/page.tsx`
- [ ] Criar `apps/web/src/components/admin/sectors/sector-permissions-manager.tsx`
- [ ] Mesma estrutura do gerenciador de permissões de departamento

---

## ✅ CHECKLIST COMPLETO - FASE 6: CARGOS (`/admin/positions`)

### 6.1 Lista de Cargos
- [ ] Criar `apps/web/src/app/(app)/admin/positions/page.tsx`
- [ ] Criar `apps/web/src/components/admin/positions/positions-list-client.tsx`
- [ ] Header futurista com stats:
  - [ ] Total de cargos
  - [ ] Cargos ativos
  - [ ] Total de membros
- [ ] Barra de busca
- [ ] Filtros avançados:
  - [ ] Setor (select com busca)
  - [ ] Departamento (select com busca, filtra setores)
  - [ ] Status
  - [ ] Data de criação
  - [ ] Ordenação
- [ ] Toggle Grid/Lista
- [ ] Visualização em Grid:
  - [ ] Card de cargo
  - [ ] Nome, código
  - [ ] Setor e Departamento (badges)
  - [ ] Status badge
  - [ ] Número de membros
  - [ ] Ações (Ver, Editar, Permissões)
- [ ] Visualização em Lista
- [ ] Ações em massa
- [ ] Paginação
- [ ] Botão "Novo Cargo"

### 6.2 Criar/Editar Cargo
- [ ] Criar `apps/web/src/app/(app)/admin/positions/new/page.tsx`
- [ ] Criar `apps/web/src/components/admin/positions/position-form-client.tsx`
- [ ] Formulário:
  - [ ] Setor (FuturisticSelect com busca, obrigatório)
  - [ ] Nome (obrigatório)
  - [ ] Código (obrigatório, único no setor)
  - [ ] Descrição (FuturisticTextarea)
  - [ ] Status (FuturisticSelect)
  - [ ] Observações (FuturisticTextarea, opcional)
- [ ] Validação
- [ ] Botões de ação

### 6.3 Detalhes do Cargo
- [ ] Criar `apps/web/src/app/(app)/admin/positions/[positionId]/page.tsx`
- [ ] Criar `apps/web/src/components/admin/positions/position-detail-client.tsx`
- [ ] Tabs:
  - [ ] Informações
  - [ ] Setor e Departamento (links)
  - [ ] Membros
  - [ ] Permissões
  - [ ] Histórico
- [ ] Ações rápidas

### 6.4 Gerenciar Membros do Cargo
- [ ] Criar `apps/web/src/app/(app)/admin/positions/[positionId]/members/page.tsx`
- [ ] Lista de membros
- [ ] Adicionar membro
- [ ] Remover membro

### 6.5 Gerenciar Permissões do Cargo
- [ ] Criar `apps/web/src/app/(app)/admin/positions/[positionId]/permissions/page.tsx`
- [ ] Criar `apps/web/src/components/admin/positions/position-permissions-manager.tsx`
- [ ] Mesma estrutura dos outros gerenciadores

---

## ✅ CHECKLIST COMPLETO - FASE 7: PERFIS DE ACESSO (`/admin/roles`)

### 7.1 Lista de Perfis
- [ ] Criar `apps/web/src/app/(app)/admin/roles/page.tsx`
- [ ] Criar `apps/web/src/components/admin/roles/roles-list-client.tsx`
- [ ] Header futurista com stats:
  - [ ] Total de perfis
  - [ ] Perfis ativos
  - [ ] Perfis do sistema
  - [ ] Perfis customizados
- [ ] Barra de busca
- [ ] Filtros avançados:
  - [ ] Tipo (sistema/customizado)
  - [ ] Status
  - [ ] Ordenação
- [ ] Toggle Grid/Lista
- [ ] Visualização em Grid:
  - [ ] Card de perfil
  - [ ] Nome, descrição
  - [ ] Tipo badge (Sistema/Customizado)
  - [ ] Número de permissões
  - [ ] Número de usuários
  - [ ] Ações (Ver, Editar, Permissões)
- [ ] Visualização em Lista
- [ ] Ações em massa
- [ ] Paginação
- [ ] Botão "Novo Perfil"

### 7.2 Criar/Editar Perfil
- [ ] Criar `apps/web/src/app/(app)/admin/roles/new/page.tsx`
- [ ] Criar `apps/web/src/components/admin/roles/role-form-client.tsx`
- [ ] Formulário:
  - [ ] Nome (obrigatório)
  - [ ] Descrição (FuturisticTextarea)
  - [ ] Tipo (Sistema/Customizado, select)
  - [ ] Status (FuturisticSelect)
- [ ] Seção de Permissões:
  - [ ] Lista de permissões agrupadas por módulo
  - [ ] Checkboxes
  - [ ] Aplicar template
- [ ] Validação
- [ ] Botões de ação

### 7.3 Detalhes do Perfil
- [ ] Criar `apps/web/src/app/(app)/admin/roles/[roleId]/page.tsx`
- [ ] Criar `apps/web/src/components/admin/roles/role-detail-client.tsx`
- [ ] Tabs:
  - [ ] Informações
  - [ ] Permissões
  - [ ] Usuários (lista de usuários com este perfil)
  - [ ] Histórico
- [ ] Ações rápidas

### 7.4 Gerenciar Permissões do Perfil
- [ ] Criar `apps/web/src/app/(app)/admin/roles/[roleId]/permissions/page.tsx`
- [ ] Criar `apps/web/src/components/admin/roles/role-permissions-manager.tsx`
- [ ] Interface completa de permissões

---

## ✅ CHECKLIST COMPLETO - FASE 8: PERMISSÕES (`/admin/permissions`)

### 8.1 Lista de Permissões
- [ ] Criar `apps/web/src/app/(app)/admin/permissions/page.tsx`
- [ ] Criar `apps/web/src/components/admin/permissions/permissions-list-client.tsx`
- [ ] Header futurista com stats:
  - [ ] Total de permissões
  - [ ] Permissões por módulo
  - [ ] Permissões ativas
- [ ] Barra de busca
- [ ] Filtros avançados:
  - [ ] Módulo (select)
  - [ ] Categoria (select)
  - [ ] Status
  - [ ] Ordenação
- [ ] Visualização em Grid:
  - [ ] Card de permissão
  - [ ] ID da permissão (code)
  - [ ] Nome
  - [ ] Descrição
  - [ ] Módulo (badge)
  - [ ] Categoria (badge)
  - [ ] Ações (Ver, Editar)
- [ ] Visualização em Lista
- [ ] Agrupamento por módulo
- [ ] Paginação
- [ ] Botão "Nova Permissão"

### 8.2 Criar/Editar Permissão
- [ ] Criar `apps/web/src/app/(app)/admin/permissions/new/page.tsx`
- [ ] Criar `apps/web/src/components/admin/permissions/permission-form-client.tsx`
- [ ] Formulário:
  - [ ] ID da Permissão (code, obrigatório, único)
  - [ ] Nome (obrigatório)
  - [ ] Descrição (FuturisticTextarea)
  - [ ] Módulo (FuturisticSelect, obrigatório)
  - [ ] Categoria (FuturisticSelect)
  - [ ] Status (FuturisticSelect)
- [ ] Validação
- [ ] Botões de ação

### 8.3 Detalhes da Permissão
- [ ] Criar `apps/web/src/app/(app)/admin/permissions/[permissionId]/page.tsx`
- [ ] Criar `apps/web/src/components/admin/permissions/permission-detail-client.tsx`
- [ ] Informações completas
- [ ] Lista de usuários com esta permissão
- [ ] Lista de perfis com esta permissão
- [ ] Histórico de mudanças

---

## ✅ CHECKLIST COMPLETO - FASE 9: MATRIZ DE PERMISSÕES (`/admin/permissions/matrix`)

### 9.1 Estrutura Base
- [ ] Criar `apps/web/src/app/(app)/admin/permissions/matrix/page.tsx`
- [ ] Verificar se já existe `permission-matrix-client.tsx`
- [ ] Melhorar conforme necessário

### 9.2 Visualização Matricial
- [ ] Tabela com usuários nas linhas
- [ ] Permissões nas colunas
- [ ] Indicadores visuais (concedida/negada/herdada)
- [ ] Filtros por usuário
- [ ] Filtros por permissão
- [ ] Busca avançada
- [ ] Exportação da matriz

### 9.3 Trace de Permissões
- [ ] Visualização de origem (direta, cargo, setor, departamento)
- [ ] Cores diferentes por origem
- [ ] Tooltips com detalhes
- [ ] Visualização hierárquica

### 9.4 Ações por Camada
- [ ] Atribuir permissão direta
- [ ] Remover permissão
- [ ] Visualizar herança completa

---

## ✅ CHECKLIST COMPLETO - FASE 10: APROVAÇÕES RBAC (`/admin/permissions/approvals`)

### 10.1 Estrutura Base
- [ ] Criar `apps/web/src/app/(app)/admin/permissions/approvals/page.tsx`
- [ ] Verificar se já existe `permission-approvals-client.tsx`
- [ ] Melhorar conforme necessário

### 10.2 Fila de Aprovações
- [ ] Lista de solicitações pendentes
- [ ] Informações da solicitação:
  - [ ] Usuário/Entidade
  - [ ] Permissão
  - [ ] Ação (conceder/negar)
  - [ ] Solicitante
  - [ ] Data/hora
  - [ ] Motivo
- [ ] Filtros:
  - [ ] Status (pendente/aprovada/rejeitada)
  - [ ] Tipo de entidade
  - [ ] Data
- [ ] Ações:
  - [ ] Aprovar
  - [ ] Rejeitar
  - [ ] Ver detalhes

### 10.3 Workflow de Aprovação
- [ ] Modal de aprovação/rejeição
- [ ] Campo de motivo (obrigatório)
- [ ] Notificações automáticas
- [ ] Histórico completo

---

## ✅ CHECKLIST COMPLETO - FASE 11: SEGMENTOS (`/admin/business-segments`)

### 11.1 Lista de Segmentos
- [ ] Criar `apps/web/src/app/(app)/admin/business-segments/page.tsx`
- [ ] Criar `apps/web/src/components/admin/business-segments/segments-list-client.tsx`
- [ ] Header futurista com stats:
  - [ ] Total de segmentos
  - [ ] Segmentos ativos
  - [ ] Segmentos inativos
- [ ] Barra de busca
- [ ] Filtros avançados:
  - [ ] Status
  - [ ] Data de criação
  - [ ] Ordenação
- [ ] Toggle Grid/Lista
- [ ] Visualização em Grid:
  - [ ] Card de segmento
  - [ ] Nome, código
  - [ ] Status badge
  - [ ] Descrição
  - [ ] Ações (Ver, Editar, Ativar/Desativar)
- [ ] Visualização em Lista
- [ ] Ações em massa
- [ ] Paginação
- [ ] Botão "Novo Segmento"

### 11.2 Criar/Editar Segmento
- [ ] Criar `apps/web/src/app/(app)/admin/business-segments/new/page.tsx`
- [ ] Criar `apps/web/src/components/admin/business-segments/segment-form-client.tsx`
- [ ] Formulário:
  - [ ] Nome (obrigatório)
  - [ ] Código (obrigatório, único)
  - [ ] Descrição (FuturisticTextarea)
  - [ ] Status (FuturisticSelect)
  - [ ] Configurações específicas do segmento
- [ ] Validação
- [ ] Botões de ação

### 11.3 Detalhes do Segmento
- [ ] Criar `apps/web/src/app/(app)/admin/business-segments/[segmentId]/page.tsx`
- [ ] Criar `apps/web/src/components/admin/business-segments/segment-detail-client.tsx`
- [ ] Informações completas
- [ ] Configurações
- [ ] Histórico

---

## ✅ CHECKLIST COMPLETO - FASE 12: WORKFLOWS (`/admin/workflow-policies`)

### 12.1 Lista de Workflows
- [ ] Criar `apps/web/src/app/(app)/admin/workflow-policies/page.tsx`
- [ ] Criar `apps/web/src/components/admin/workflow-policies/workflows-list-client.tsx`
- [ ] Header futurista com stats:
  - [ ] Total de workflows
  - [ ] Workflows ativos
  - [ ] Workflows executados (últimos 30 dias)
- [ ] Barra de busca
- [ ] Filtros avançados:
  - [ ] Status
  - [ ] Tipo
  - [ ] Data de criação
  - [ ] Ordenação
- [ ] Toggle Grid/Lista
- [ ] Visualização em Grid:
  - [ ] Card de workflow
  - [ ] Nome, descrição
  - [ ] Status badge
  - [ ] Tipo
  - [ ] Número de execuções
  - [ ] Ações (Ver, Editar, Executar)
- [ ] Visualização em Lista
- [ ] Ações em massa
- [ ] Paginação
- [ ] Botão "Nova Política"

### 12.2 Criar/Editar Workflow
- [ ] Criar `apps/web/src/app/(app)/admin/workflow-policies/new/page.tsx`
- [ ] Criar `apps/web/src/components/admin/workflow-policies/workflow-form-client.tsx`
- [ ] Formulário:
  - [ ] Nome (obrigatório)
  - [ ] Descrição (FuturisticTextarea)
  - [ ] Tipo (FuturisticSelect)
  - [ ] Regras de aprovação
  - [ ] Aprovadores (multi-select)
  - [ ] Condições
  - [ ] Status (FuturisticSelect)
- [ ] Editor visual de regras (opcional)
- [ ] Validação
- [ ] Botões de ação

### 12.3 Detalhes do Workflow
- [ ] Criar `apps/web/src/app/(app)/admin/workflow-policies/[policyId]/page.tsx`
- [ ] Criar `apps/web/src/components/admin/workflow-policies/workflow-detail-client.tsx`
- [ ] Tabs:
  - [ ] Informações
  - [ ] Regras
  - [ ] Histórico de Execuções
  - [ ] Estatísticas
- [ ] Ações rápidas

---

## ✅ CHECKLIST COMPLETO - FASE 13: REALTIME LAB (`/admin/realtime-lab`)

### 13.1 Estrutura Base
- [ ] Criar `apps/web/src/app/(app)/admin/realtime-lab/page.tsx`
- [ ] Criar `apps/web/src/components/admin/realtime-lab/realtime-lab-client.tsx`
- [ ] Layout com múltiplas seções

### 13.2 Diagnóstico de Mensageria
- [ ] Monitor de eventos em tempo real
- [ ] Lista de eventos recentes
- [ ] Filtros por tipo de evento
- [ ] Visualização de payload
- [ ] Estatísticas de mensageria

### 13.3 Eventos em Tempo Real
- [ ] Stream de eventos
- [ ] Filtros avançados
- [ ] Pausar/Retomar stream
- [ ] Exportar eventos
- [ ] Busca de eventos

### 13.4 RBAC em Tempo Real
- [ ] Monitor de mudanças de permissões
- [ ] Eventos de RBAC
- [ ] Trace de permissões
- [ ] Alertas de mudanças sensíveis

### 13.5 Monitoramento Avançado
- [ ] Métricas de performance
- [ ] Gráficos em tempo real
- [ ] Alertas e notificações
- [ ] Logs detalhados

---

## ✅ CHECKLIST COMPLETO - FASE 14: USUÁRIOS (`/admin/users`)

### 14.1 Lista de Usuários
- [ ] Criar `apps/web/src/app/(app)/admin/users/page.tsx`
- [ ] Criar `apps/web/src/components/admin/users/users-list-client.tsx`
- [ ] **TODOS os itens da FASE 2 do plano anterior** (já detalhado)

### 14.2 Criar/Editar Usuário
- [ ] **TODOS os itens da FASE 3 do plano anterior** (já detalhado)

### 14.3 Detalhes do Usuário
- [ ] **TODOS os itens da FASE 4 do plano anterior** (já detalhado)

### 14.4 Funcionalidades Adicionais
- [ ] **TODOS os itens das FASES 5-11 do plano anterior** (já detalhado)

---

## ✅ CHECKLIST COMPLETO - FASE 15: INTEGRAÇÃO E POLISH FINAL

### 15.1 Integração com Sidebar
- [ ] Verificar todas as rotas no sidebar
- [ ] Adicionar ícones apropriados
- [ ] Verificar permissões de acesso
- [ ] Testar navegação entre telas

### 15.2 Consistência Visual
- [ ] Padronizar headers em todas as telas
- [ ] Padronizar formulários
- [ ] Padronizar cards
- [ ] Padronizar badges
- [ ] Padronizar botões
- [ ] Padronizar filtros

### 15.3 Performance
- [ ] Lazy loading de componentes
- [ ] Virtualização de listas grandes
- [ ] Debounce em buscas
- [ ] Cache de dados
- [ ] Otimização de re-renders
- [ ] Code splitting

### 15.4 Acessibilidade
- [ ] ARIA labels em todos os elementos
- [ ] Navegação por teclado
- [ ] Foco visível
- [ ] Contraste de cores
- [ ] Screen reader friendly
- [ ] Testes com leitores de tela

### 15.5 Responsividade
- [ ] Mobile first approach
- [ ] Breakpoints (sm, md, lg, xl, 2xl)
- [ ] Layout adaptativo
- [ ] Touch friendly
- [ ] Testes em diferentes dispositivos

### 15.6 Testes
- [ ] Testes unitários dos hooks
- [ ] Testes de componentes
- [ ] Testes de integração
- [ ] Testes E2E (opcional)
- [ ] Testes de acessibilidade

### 15.7 Documentação
- [ ] Comentários no código
- [ ] README específico para cada módulo
- [ ] Documentação de APIs
- [ ] Guia de uso
- [ ] Diagramas de fluxo

---

## 🎨 Design Tokens e Estilos Globais

### Cores Padrão
- Primary: `hsl(var(--primary))`
- Accent: `hsl(var(--accent))`
- Success: `green-400`
- Danger: `red-400`
- Warning: `yellow-400`
- Info: `blue-400`

### Espaçamentos Padrão
- Container padding: `p-6` ou `p-8`
- Gap entre elementos: `gap-4` ou `gap-6`
- Border radius: `rounded-xl` ou `rounded-2xl`

### Efeitos Padrão
- Glass morphism: `bg-white/5 backdrop-blur-sm`
- Hover glow: `bg-linear-to-r from-blue-500/30 to-blue-400/30 blur-sm`
- Shadow: `shadow-2xl`
- Border: `border-white/10` ou `border-white/20`

---

## 📊 Padrões de Stats Cards (Header)

Todas as telas de lista devem ter stats cards no header:
- Total de registros
- Registros ativos
- Registros inativos (quando aplicável)
- Métricas específicas da entidade

---

## 🔄 Fluxos Principais Padronizados

### Fluxo de Criação (Todas as Entidades)
1. Usuário clica em "Novo [Entidade]"
2. Formulário é exibido
3. Preenchimento dos dados
4. Validação em tempo real
5. Submissão
6. Feedback de sucesso
7. Redirecionamento para detalhes

### Fluxo de Edição (Todas as Entidades)
1. Usuário clica em "Editar" na lista ou detalhes
2. Formulário pré-preenchido
3. Modificações
4. Validação
5. Submissão
6. Feedback
7. Atualização da lista

### Fluxo de Listagem (Todas as Entidades)
1. Carregamento inicial
2. Aplicação de filtros
3. Busca
4. Ordenação
5. Paginação
6. Seleção (quando aplicável)
7. Ações em massa (quando aplicável)

---

## 🚀 Priorização de Implementação

### Fase 1 (Crítico) - MVP Core
1. ✅ Usuários (lista, criar, editar, detalhes)
2. ✅ Departamentos (lista, criar, editar, detalhes)
3. ✅ Setores (lista, criar, editar, detalhes)
4. ✅ Cargos (lista, criar, editar, detalhes)

### Fase 2 (Importante) - Estrutura Organizacional
5. ✅ Filiais (lista, criar, editar, detalhes)
6. ✅ Dados da Empresa (edição)
7. ✅ Gerenciamento de Membros (todas as entidades)
8. ✅ Gerenciamento de Permissões (todas as entidades)

### Fase 3 (Essencial) - RBAC Completo
9. ✅ Perfis de Acesso (lista, criar, editar, detalhes)
10. ✅ Permissões (lista, criar, editar, detalhes)
11. ✅ Matriz de Permissões
12. ✅ Aprovações RBAC

### Fase 4 (Desejável) - Recursos Avançados
13. ✅ Segmentos
14. ✅ Workflows
15. ✅ Realtime Lab

---

## 📝 Notas de Implementação

### Padrões Obrigatórios
- ✅ Sempre usar componentes futuristas (FuturisticInput, FuturisticSelect)
- ✅ Sempre usar motion.div para animações
- ✅ Sempre usar glass morphism nos cards
- ✅ Sempre usar hover glow effects
- ✅ Sempre validar com Zod
- ✅ Sempre tratar erros adequadamente
- ✅ Sempre fornecer feedback visual
- ✅ Sempre verificar permissões

### Boas Práticas
- Componentes reutilizáveis
- Hooks customizados para lógica
- Separação de concerns
- TypeScript strict
- Validação no frontend e backend
- Tratamento de erros robusto
- Loading states em todas as operações assíncronas
- Estados vazios bem definidos

---

## ✅ Checklist Final de Qualidade Global

Antes de considerar completo, verificar para TODAS as telas:

- [ ] Seguem o design system
- [ ] Animações estão suaves
- [ ] Inputs têm hover glow
- [ ] Validações funcionam
- [ ] Erros são tratados
- [ ] Permissões são verificadas
- [ ] Rotas estão protegidas
- [ ] Performance está otimizada
- [ ] Responsividade está completa
- [ ] Acessibilidade está implementada
- [ ] Documentação está completa

---

## 📈 Métricas de Progresso

### Total de Telas: 13 módulos principais

1. ✅ Dados da Empresa - 1 tela
2. ✅ Filiais - 4 telas (lista, criar, editar, detalhes)
3. ✅ Departamentos - 5 telas (lista, criar, editar, detalhes, membros, permissões)
4. ✅ Setores - 5 telas (lista, criar, editar, detalhes, membros, permissões)
5. ✅ Cargos - 5 telas (lista, criar, editar, detalhes, membros, permissões)
6. ✅ Perfis de Acesso - 4 telas (lista, criar, editar, detalhes, permissões)
7. ✅ Permissões - 3 telas (lista, criar, editar, detalhes)
8. ✅ Matriz de Permissões - 1 tela
9. ✅ Aprovações RBAC - 1 tela
10. ✅ Segmentos - 3 telas (lista, criar, editar, detalhes)
11. ✅ Workflows - 3 telas (lista, criar, editar, detalhes)
12. ✅ Realtime Lab - 1 tela
13. ✅ Usuários - 10 telas (lista, criar, editar, detalhes, permissões, atividades, sessões, audit, import, export)

**Total estimado: ~50+ telas/componentes**

---

**Data de Criação:** 2025-12-11  
**Última Atualização:** 2025-12-11  
**Status:** 📋 Plano Completo - Pronto para Implementação  
**Escopo:** Todas as telas do Sidebar Administrativo







