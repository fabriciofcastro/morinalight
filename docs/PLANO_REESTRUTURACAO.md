# PLANO DE REESTRUTURAÇÃO COMPLETA

## Morina ERP - Sistema Organizacional e Design System

---

## 1. ESTRUTURA ORGANIZACIONAL

### 1.1 Hierarquia Correta (Conforme Pesquisa)

```
Empresa (Organization - já existe)
  └── Departamento (Department)
       └── Subdepartamento (Subdepartment)
            └── Setor (Sector)
                 └── Cargo (Position/Role)
```

### 1.2 Modelo de Dados (Prisma Schema)

**Remover:**

- ❌ OrganizationalUnit
- ❌ Team (equivalente errado)
- ❌ UnitMembership
- ❌ TeamMembership

**Manter/Criar:**

- ✅ Organization (já existe)
- ✅ Department (manter, ajustar)
- ✅ Subdepartment (NOVO)
- ✅ Sector (NOVO)
- ✅ Position/Role (NOVO - representa cargo)
- ✅ Membership (um modelo para todos os níveis)

### 1.3 Estrutura de Relacionamentos

```prisma
Organization
  ├── departments: Department[]
  └── organizationalMemberships: OrganizationalMembership[]

Department
  ├── organization: Organization
  ├── parentDepartment: Department? (para hierarquia dentro de departamentos)
  ├── subdepartments: Subdepartment[]
  ├── sectors: Sector[] (direto, se não houver subdepartamento)
  └── memberships: DepartmentMembership[]

Subdepartment
  ├── department: Department
  ├── parentSubdepartment: Subdepartment? (hierarquia)
  ├── subdepartments: Subdepartment[] (filhos)
  ├── sectors: Sector[]
  └── memberships: SubdepartmentMembership[]

Sector
  ├── subdepartment: Subdepartment? (se houver)
  ├── department: Department? (direto, se não houver subdepartamento)
  ├── parentSector: Sector? (hierarquia)
  ├── sectors: Sector[] (filhos)
  ├── positions: Position[]
  └── memberships: SectorMembership[]

Position (Cargo)
  ├── sector: Sector
  ├── memberships: PositionMembership[]
  └── metadata (responsabilidades, requisitos, etc)
```

---

## 2. DESIGN SYSTEM - REDESIGN COMPLETO

### 2.1 Problemas Identificados no Design Atual

1. **Cores hardcoded** - não usa design tokens consistentemente
2. **Falta hierarquia visual** clara
3. **Componentes inconsistentes** entre páginas
4. **Falta de estados visuais** (loading, error, success)
5. **Spacing inconsistente**
6. **Tipografia mal aplicada**
7. **Falta feedback visual** nas interações

### 2.2 Novo Design System - Princípios

#### 2.2.1 Paleta de Cores Moderna

**Primary (Ação Principal)**

- Base: `hsl(227, 100%, 58%)` (azul vibrante)
- Hover: `hsl(227, 100%, 52%)`
- Active: `hsl(227, 100%, 48%)`
- Disabled: `hsl(227, 30%, 65%)`

**Semantic Colors**

- Success: `hsl(158, 72%, 48%)` (verde)
- Warning: `hsl(45, 100%, 55%)` (amarelo)
- Danger: `hsl(0, 82%, 58%)` (vermelho)
- Info: `hsl(200, 95%, 58%)` (ciano)

**Surface Colors**

- Background: `hsl(222, 28%, 10%)`
- Surface: `hsl(222, 22%, 14%)`
- Elevated: `hsl(222, 20%, 18%)`
- Overlay: `hsl(0, 0%, 100% / 0.04)`
- Border: `hsl(0, 0%, 100% / 0.08)`

#### 2.2.2 Tipografia

**Font Stack**

- Display: `'DM Sans', 'Inter', system-ui`
- Body: `'Inter', system-ui`

**Escala Tipográfica**

- xs: 12px / 18px (0.75rem)
- sm: 14px / 20px (0.875rem)
- base: 16px / 24px (1rem)
- lg: 18px / 26px (1.125rem)
- xl: 20px / 28px (1.25rem)
- 2xl: 24px / 32px (1.5rem)
- 3xl: 30px / 38px (1.875rem)
- 4xl: 36px / 44px (2.25rem)

**Pesos**

- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

#### 2.2.3 Spacing System

Base: 4px (0.25rem)

```
0: 0px
1: 4px    (0.25rem)
2: 8px    (0.5rem)
3: 12px   (0.75rem)
4: 16px   (1rem)
5: 20px   (1.25rem)
6: 24px   (1.5rem)
8: 32px   (2rem)
10: 40px  (2.5rem)
12: 48px  (3rem)
16: 64px  (4rem)
20: 80px  (5rem)
24: 96px  (6rem)
```

#### 2.2.4 Border Radius

- none: 0px
- sm: 6px
- md: 10px
- lg: 14px
- xl: 20px
- 2xl: 28px
- full: 9999px

#### 2.2.5 Shadows

```
sm:  0 2px 8px  hsl(0 0% 0% / 0.12)
md:  0 4px 16px hsl(0 0% 0% / 0.16)
lg:  0 8px 24px hsl(0 0% 0% / 0.20)
xl:  0 16px 48px hsl(0 0% 0% / 0.24)
inner: inset 0 2px 4px hsl(0 0% 0% / 0.10)
```

#### 2.2.6 Glass Morphism (Efeito Moderno)

```
background: hsl(222 22% 14% / 0.85)
backdrop-filter: blur(20px) saturate(180%)
border: 1px solid hsl(0 0% 100% / 0.10)
box-shadow:
  0 8px 32px hsl(0 0% 0% / 0.20),
  inset 0 1px 0 hsl(0 0% 100% / 0.15)
```

---

## 3. COMPONENTES - REDESIGN

### 3.1 Componentes Base

#### Button

- Variants: primary, secondary, ghost, danger
- Sizes: sm, md, lg
- States: default, hover, active, disabled, loading
- Icon support (left/right)

#### Input

- Variants: default, error, success
- Sizes: sm, md, lg
- States: default, focus, disabled
- Label, hint, error message

#### Card

- Glass morphism
- With/without header
- With/without footer
- Hover effects

#### Badge

- Variants: default, success, warning, danger, info
- Sizes: sm, md

#### Modal/Dialog

- Backdrop blur
- Smooth animations
- Focus trap
- Keyboard navigation

#### Table

- Striped rows
- Hover effects
- Sortable headers
- Responsive

#### Form Components

- FormField (wrapper)
- FormInput
- FormSelect
- FormTextarea
- FormCheckbox
- FormRadio
- FormSwitch

### 3.2 Componentes Complexos

#### DataTable

- Sorting
- Filtering
- Pagination
- Row selection
- Actions column

#### TreeView (para estrutura organizacional)

- Expand/collapse
- Drag & drop (opcional)
- Selection
- Context menu

#### Dashboard Cards

- Metric cards
- Chart cards
- Action cards
- Status cards

---

## 4. DASHBOARD - REDESIGN COMPLETO

### 4.1 Estrutura

```
Header
  └── Título + Breadcrumb + Actions

Metrics Grid (4 colunas)
  ├── Card 1: Total de Empresas
  ├── Card 2: Total de Departamentos
  ├── Card 3: Total de Usuários
  └── Card 4: Atividades Recentes

Main Content (2 colunas)
  ├── Coluna 1 (2/3)
  │   ├── Atividades Recentes (lista)
  │   └── Gráfico de Atividades
  └── Coluna 2 (1/3)
      ├── Ações Rápidas
      └── Notificações

Footer
  └── Status + Links
```

### 4.2 Características Visuais

- **Background**: Gradiente sutil + padrão geométrico
- **Cards**: Glass morphism com hover effects
- **Gráficos**: Cores do design system, animações suaves
- **Interatividade**: Feedback visual imediato
- **Responsivo**: Mobile-first, breakpoints claros

---

## 5. ANÁLISE DE PÁGINAS EXISTENTES

### 5.1 Páginas a Revisar

1. ✅ Dashboard (`/dashboard`)
2. ✅ Clientes (`/clientes`)
3. ✅ Produtos (`/products`)
4. ✅ Fornecedores (`/suppliers`)
5. ✅ Usuários (`/users`)
6. ✅ Organizações (`/organizations`)
7. ✅ Representantes (`/representantes`)
8. ✅ Comissões (`/comissoes`)
9. ✅ Estrutura Organizacional (`/settings/organizational-structure`)
10. ✅ Permissões (`/settings/permissions`)
11. ✅ Team (`/settings/team`)
12. ✅ Company Settings (`/settings/company`)

### 5.2 Problemas Identificados

1. **Inconsistência visual** entre páginas
2. **Formulários** sem validação visual adequada
3. **Tabelas** sem estilização moderna
4. **Botões** com estilos diferentes
5. **Feedback** de ações insuficiente
6. **Loading states** ausentes
7. **Empty states** não tratados
8. **Error states** básicos

### 5.3 Melhorias Necessárias

#### Por Página

**Dashboard**

- [ ] Métricas reais da API
- [ ] Gráficos interativos
- [ ] Atividades recentes
- [ ] Quick actions destacadas

**Clientes**

- [ ] Filtros avançados
- [ ] Busca em tempo real
- [ ] Exportação de dados
- [ ] Visualização em cards/grid

**Produtos**

- [ ] Preview de imagens
- [ ] Categorias visuais
- [ ] Estoque em tempo real
- [ ] Filtros por status

**Estrutura Organizacional**

- [ ] Tree view visual
- [ ] Drag & drop (opcional)
- [ ] Filtros por nível
- [ ] Exportação da estrutura

---

## 6. PLANO DE IMPLEMENTAÇÃO

### Fase 1: Schema e Backend (PRIORITÁRIO)

- [ ] Atualizar Prisma schema
- [ ] Criar migrations
- [ ] Atualizar repositórios
- [ ] Atualizar use cases
- [ ] Atualizar rotas HTTP

### Fase 2: Design System Base

- [ ] Criar/atualizar design tokens
- [ ] Criar componentes base
- [ ] Criar utilitários de estilo
- [ ] Documentação de componentes

### Fase 3: Componentes Complexos

- [ ] DataTable
- [ ] TreeView
- [ ] Form components
- [ ] Dashboard cards

### Fase 4: Páginas

- [ ] Dashboard
- [ ] Estrutura Organizacional
- [ ] Demais páginas (em ordem de prioridade)

### Fase 5: Testes e Refinamentos

- [ ] Testes visuais
- [ ] Testes de usabilidade
- [ ] Ajustes finais
- [ ] Documentação

---

## 7. CRITÉRIOS DE QUALIDADE

### Design

- ✅ Consistência visual em 100% das páginas
- ✅ Design tokens usados corretamente
- ✅ Responsividade em todos os breakpoints
- ✅ Acessibilidade (WCAG 2.1 AA)

### Código

- ✅ TypeScript strict mode
- ✅ Componentes reutilizáveis
- ✅ Código limpo e documentado
- ✅ Performance otimizada

### UX

- ✅ Feedback visual em todas as ações
- ✅ Estados de loading claros
- ✅ Mensagens de erro úteis
- ✅ Navegação intuitiva

---

## 8. PRÓXIMOS PASSOS IMEDIATOS

1. ✅ Criar este plano (CONCLUÍDO)
2. ⏳ Atualizar Prisma schema com estrutura correta
3. ⏳ Criar novos componentes base do design system
4. ⏳ Refazer dashboard completamente
5. ⏳ Refazer página de estrutura organizacional

---

**Última atualização**: 2024-12-19
**Status**: Em planejamento → Pronto para implementação
