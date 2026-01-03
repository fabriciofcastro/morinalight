Reconstrução Completa do Frontend - Sistema Corporativo Morina
Objetivo
Reconstruir o frontend do sistema Morina do zero, removendo todas as implementações atuais que foram desenvolvidas de forma inadequada. O novo sistema será baseado em:

Pesquisa de UX corporativo moderno (2024 best practices)
Estrutura real do backend (endpoints e módulos existentes)
Design System existente (mantendo coerência visual)
Regras de negócio documentadas (comissões de representantes)
User Review Required
IMPORTANT

Remoção Completa do Frontend Atual

Este plano envolve a remoção completa de todas as páginas e componentes do sistema atual em /apps/web/src/app, exceto o Design System em /packages/ui. Isso significa:

Todas as páginas em (app)/\* serão removidas
Todas as rotas de API client serão removidas
Hooks e utilitários específicos do sistema serão removidos
Apenas o login será mantido temporariamente como referência
O sistema será reconstruído do zero seguindo as melhores práticas de UX corporativo.

WARNING

Mudanças Significativas na Arquitetura

O novo sistema seguirá uma arquitetura diferente:

Autenticação moderna: SSO-ready, passwordless-ready, MFA-ready
Dashboard modular: Card-based layout com widgets customizáveis
Role-based personalization: Interface adaptada ao papel do usuário
Progressive disclosure: Informações em camadas, do resumo ao detalhe
Real-time updates: Integração com WebSocket para notificações
Pesquisa de UX - Principais Descobertas
Padrões de Autenticação Moderna (2024)
Passwordless Authentication

Biometria, hardware tokens, OTPs, magic links
Reduz superfície de ataque e melhora satisfação do usuário
Multi-Factor Authentication (MFA)

Camadas adicionais de segurança
Implementação sem fricção
Single Sign-On (SSO)

Login único para múltiplas aplicações
Essencial para ambientes corporativos
Otimização do Fluxo de Login

Campos mínimos
Labels claros e CTAs óbvios
Validação instantânea
Mensagens de erro específicas e úteis
Toggle de visibilidade de senha
Suporte a password managers
"Keep me signed in" para dispositivos confiáveis
Padrões de Dashboard Corporativo (2024)
Design Orientado a Ação

Não apenas exibir dados, mas encorajar decisões
KPIs selecionados cuidadosamente
Visualizações intuitivas
Layouts Card-Based e Tile-Based

Informações em cards visuais distintos
Customizáveis pelo usuário
Exemplos: Jira, Xero, QuickBooks
Módulos e Widgets Customizáveis

Usuário seleciona métricas preferidas
Diversos tipos de visualização
Progressive Disclosure

Equilíbrio entre simplicidade e profundidade analítica
Drill-down de resumo para detalhes
Navegação em camadas
Layouts Adaptáveis por Papel

Dashboard dinâmico baseado no papel do usuário
Executivos veem KPIs de alto nível
Operações veem métricas de processo em tempo real
Feeds de Dados em Tempo Real

Informações atualizadas
Alertas automatizados
Interfaces Conversacionais

Integração com modelos de linguagem natural
Consultas mais intuitivas
Módulos do Backend Identificados

1. Auth (/auth)
   POST /auth/login - Login com email/senha
   POST /auth/register - Registro de novo usuário
   Retorna: token JWT, dados do usuário, organizações
2. Users (/users)
   GET /users - Listar usuários
   POST /users - Criar usuário
   PUT /users/:id - Atualizar usuário
   DELETE /users/:id - Deletar usuário
3. Organizations (/organizations)
   GET /organizations - Listar organizações do usuário
   GET /organizations/:id/members - Listar membros
   POST /organizations/:id/invites - Convidar membros
   GET /organizations/:id/invites - Listar convites
4. Organizational Structure (/organizational-structure)
   Departments: CRUD de departamentos + membros
   Sectors: CRUD de setores + membros
   Positions: CRUD de cargos + membros
   Teams: CRUD de times + membros
   Organizational Units: CRUD de unidades organizacionais + membros
5. Permissions (/permissions)
   GET /permissions/user/:userId - Permissões do usuário
   GET /permissions/audit - Log de auditoria
   Templates de permissões por cargo/setor/departamento
6. Clients (/clientes)
   GET /clientes - Listar clientes
   GET /representantes - Listar representantes
   GET /comissoes - Listar comissões
   Sistema de comissões com workflow complexo
7. Suppliers (/suppliers)
   GET /suppliers - Listar fornecedores
   CRUD de fornecedores
8. Catalog (/catalogo)
   GET /catalogo/products - Listar produtos
   GET /catalogo/categories - Listar categorias
   GET /catalogo/variants - Listar variantes
   GET /catalogo/audit - Auditoria de alterações
9. Preficha (/preficha)
   GET /preficha - Listar pré-fichas
   POST /preficha - Criar pré-ficha
   POST /preficha/:id/encaminhar - Encaminhar
   POST /preficha/:id/aprovar - Aprovar
   POST /preficha/:id/rejeitar - Rejeitar
   POST /preficha/:id/comentarios - Adicionar comentário
10. Notifications (/notifications)
    GET /notifications - Listar notificações
    Sistema de notificações em tempo real via WebSocket
11. Company Settings (/company-settings)
    Configurações da empresa
    Proposed Changes
    Phase 1: Cleanup & Foundation
    [DELETE] Páginas do Sistema Atual
    Remove all current system pages except login (kept as reference):

apps/web/src/app/(app)/\* - All authenticated pages
Keep: apps/web/src/app/login/page.tsx (temporary reference)
[DELETE] API Client Routes
Remove all current API integration code:

apps/web/src/app/api/\* - All API routes
[DELETE] Hooks e Utilitários Específicos
Remove system-specific hooks that won't be reused:

apps/web/src/hooks/use-offline-sync.ts
Other system-specific hooks (to be identified)
[NEW]
base-structure.md
Document the new frontend architecture:

Folder structure
Routing strategy
State management approach
API integration patterns
Phase 2: Authentication & Onboarding
[NEW]
login-page.tsx
Modern login page following 2024 best practices:

Clean, minimal design using Design System
Email/password with toggle visibility
"Keep me signed in" option
Clear error messages
Prepared for SSO integration (placeholder)
Prepared for passwordless (placeholder)
Loading states and feedback
Responsive mobile-first design
[NEW]
register-page.tsx
Registration flow:

Minimal required fields
Instant validation
Terms acceptance (linking to business rules)
Organization creation or join flow
[NEW]
organization-selector.tsx
Organization selection after login (if user has multiple):

Card-based layout
Recent organizations first
Search/filter capability
[NEW]
auth-api-client.ts
API client for authentication:

Login, register, logout
Token management
Organization selection
Error handling
Phase 3: Dashboard Foundation
[NEW]
dashboard-layout.tsx
Main authenticated layout:

Top navigation bar
Sidebar navigation (collapsible)
User menu with organization switcher
Notification bell
Real-time connection status
Breadcrumbs
[NEW]
dashboard-page.tsx
Main dashboard with role-based widgets:

Card-based layout
Customizable widgets
Quick actions
Recent activity feed
KPIs based on user role
[NEW]
dashboard-widgets
Reusable dashboard widgets:

StatCard.tsx - KPI display
ActivityFeed.tsx - Recent activities
QuickActions.tsx - Common actions
NotificationWidget.tsx - Notifications preview
ChartWidget.tsx - Data visualization
Phase 4: Core Modules
Module: Users
[NEW]
users-list-page.tsx
Table with search, filter, sort
Pagination
Bulk actions
Create user button
[NEW]
user-form-dialog.tsx
Create/edit user modal
Form validation
Role assignment
[NEW]
users-api-client.ts
CRUD operations
List with filters
Module: Organizational Structure
[NEW]
org-structure-page.tsx
Tabbed interface: Departments, Sectors, Positions, Teams, Units
Tree/hierarchy visualization
Drag-and-drop reorganization (future)
[NEW]
department-management.tsx
CRUD for departments
Member assignment
Hierarchy display
[NEW]
structure-api-client.ts
All organizational structure endpoints
Module: Permissions
[NEW]
permissions-page.tsx
Permission templates
User permission assignment
Audit log viewer
[NEW]
permissions-api-client.ts
Permission management
Audit log retrieval
Module: Clients & Representatives
[NEW]
clients-page.tsx
Client list with advanced filters
Representative assignment
Commission tracking
[NEW]
representatives-page.tsx
Representative list
Commission dashboard
Performance metrics
[NEW]
commissions-page.tsx
Commission workflow management
Status tracking (Aguardando, Em análise, Aprovada, Contestada, Cancelada, Paga)
Contest system with chat
Approval/rejection flow
Monthly cycle enforcement (RN-CICLO-01, RN-CICLO-02)
Exception release by manager (RN-CICLO-04)
[NEW]
commission-detail-page.tsx
Full commission details
Document viewer
Chat/contest interface
Timeline of events
Audit trail
[NEW]
clients-api-client.ts
Clients, representatives, commissions CRUD
Module: Catalog
[NEW]
catalog-page.tsx
Product grid/list view toggle
Category navigation
Search and filters
Variant management
[NEW]
product-detail-page.tsx
Product details
Variant selector
Audit history
[NEW]
catalog-api-client.ts
Products, categories, variants, audit
Module: Preficha (Pre-registration)
[NEW]
preficha-page.tsx
Preficha list with status filters
Create new preficha
Workflow tracking
[NEW]
preficha-detail-page.tsx
Full preficha details
Workflow actions (encaminhar, aprovar, rejeitar)
Comments section
Audit trail
[NEW]
preficha-api-client.ts
Preficha CRUD and workflow
Module: Notifications
[NEW]
notifications-panel.tsx
Slide-out panel
Real-time updates via WebSocket
Mark as read
Filter by type
[NEW]
notifications-api-client.ts
Notifications list
Mark as read
WebSocket connection
Phase 5: Shared Components & Utilities
[NEW]
data-table.tsx
Reusable data table component:

Sorting, filtering, pagination
Column configuration
Bulk actions
Export functionality
[NEW]
page-header.tsx
Consistent page header:

Title, description
Action buttons
Breadcrumbs integration
[NEW]
empty-state.tsx
Empty state component:

Icon, title, description
Call-to-action button
[NEW]
api-client-base.ts
Base API client:

Axios/fetch wrapper
Token injection
Organization header injection
Error handling
Request/response interceptors
[NEW]
use-api-query.ts
React Query wrapper:

Standardized data fetching
Loading, error states
Caching strategy
Phase 6: Design System Integration
[MODIFY]
globals.css
Ensure consistent use of Design System tokens:

Remove ad-hoc color definitions
Use only Design System CSS variables
Corporate-appropriate color palette
Professional, not overly vibrant
Verification Plan
Automated Tests
Authentication Flow Tests

cd apps/web
pnpm test:e2e -- auth.spec.ts
Test login with valid credentials
Test login with invalid credentials
Test registration flow
Test organization selection
Test logout
API Client Unit Tests

cd apps/web
pnpm test -- api-clients
Test all API client methods
Test error handling
Test token injection
Test organization header injection
Component Tests

cd apps/web
pnpm test -- components
Test DataTable sorting, filtering, pagination
Test form validations
Test empty states
Manual Verification
Login Flow

Start dev server: cd apps/web && pnpm dev
Navigate to http://localhost:3000/login
Test login with valid credentials from backend
Verify token is stored
Verify redirect to dashboard
Verify organization selector appears if multiple orgs
Dashboard

Verify dashboard loads with appropriate widgets for user role
Verify navigation sidebar is functional
Verify organization switcher works
Verify notifications panel opens
Each Module

Navigate to each module page
Verify list views load data from backend
Verify create/edit forms work
Verify delete operations work
Verify search/filter/sort work
Commissions Workflow (Critical Business Logic)

Create a new commission
Verify monthly cycle enforcement (cannot create for past months)
Test contest flow
Test approval flow
Test rejection flow
Verify audit trail is complete
Preficha Workflow

Create a new preficha
Test encaminhar action
Test aprovar action
Test rejeitar action
Verify comments work
Real-time Notifications

Open two browser windows
Trigger a notification in one
Verify it appears in the other in real-time
Responsive Design

Test on mobile viewport (375px)
Test on tablet viewport (768px)
Test on desktop viewport (1920px)
Verify all layouts adapt appropriately
Design System Consistency

Visual inspection of all pages
Verify consistent use of colors, typography, spacing
Verify corporate, professional aesthetic
Verify no ad-hoc styling outside Design System
Backend Integration Verification

# Ensure backend is running

cd apps/api
pnpm dev

# In another terminal, run frontend

cd apps/web
pnpm dev

# Test all API endpoints are reachable

curl http://localhost:3000/api/health
Verify all frontend API calls successfully reach backend
Verify authentication works end-to-end
Verify organization context is properly sent
Verify error responses are handled gracefully
