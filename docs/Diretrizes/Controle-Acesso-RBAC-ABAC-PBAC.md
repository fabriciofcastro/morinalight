# Controle de Acesso - RBAC, ABAC e PBAC

> **Documentação completa sobre os três níveis de controle de acesso implementados no sistema MORINA.**
> RBAC define o que pode fazer, ABAC define em quais dados pode atuar, PBAC define sob quais condições.

---

## 1. Visão Geral

### 1.1 Os Três Níveis de Controle

O sistema MORINA implementa **três camadas complementares** de controle de acesso:

```
┌─────────────────────────────────────────────────────────┐
│                    CONTROLE DE ACESSO                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  RBAC (Role-Based)                                        │
│  └─ O QUE pode fazer?                                    │
│     • Módulos acessíveis                                  │
│     • Telas disponíveis                                   │
│     • Ações permitidas                                    │
│                                                           │
│  ABAC (Attribute-Based)                                   │
│  └─ EM QUAIS DADOS pode atuar?                           │
│     • Filtragem por organização                           │
│     • Filtragem por departamento                          │
│     • Filtragem por setor                                 │
│     • Contexto organizacional                              │
│                                                           │
│  PBAC (Policy-Based)                                      │
│  └─ SOB QUAIS CONDIÇÕES?                                  │
│     • Workflows de aprovação                              │
│     • Regras de negócio condicionais                      │
│     • Políticas dinâmicas                                  │
│     • Validações contextuais                              │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Objetivo

Garantir que cada usuário tenha acesso **apenas ao que precisa**, **apenas aos dados permitidos** e **apenas quando as condições forem atendidas**.

---

## 2. RBAC - Role-Based Access Control

### 2.1 O Que É

**RBAC** define **o que o usuário pode fazer** no sistema:
- Quais módulos pode acessar
- Quais telas pode visualizar
- Quais ações pode executar (criar, editar, excluir, aprovar, etc.)

### 2.2 Estrutura

```
User
  └── Roles (Papéis)
       └── Permissions (Permissões)
            └── Actions (Ações)
```

**Exemplo:**
```
Usuário: João Silva
  └── Role: Gerente de Vendas
       └── Permission: CATALOGO_PRODUTO_EDIT
            └── Actions: [CREATE, UPDATE, DELETE]
```

### 2.3 Implementação

#### **Schema Prisma:**

```prisma
model Role {
  id          String   @id @default(uuid())
  code        String   @unique // GERENTE_VENDAS
  name        String
  description String?
  orgId       String?
  
  permissions RolePermission[]
  users       UserRole[]
}

model Permission {
  id          String   @id @default(uuid())
  code        String   @unique // CATALOGO_PRODUTO_EDIT
  name        String
  description String?
  module      String   // CATALOGO, CRM, PCP
  level       String   // READ, WRITE, ADMIN
  
  roles RolePermission[]
}

model RolePermission {
  roleId       String
  permissionId String
  
  role       Role       @relation(fields: [roleId], references: [id])
  permission Permission @relation(fields: [permissionId], references: [id])
  
  @@id([roleId, permissionId])
}

model UserRole {
  userId    String
  roleId    String
  
  user User @relation(fields: [userId], references: [id])
  role Role @relation(fields: [roleId], references: [id])
  
  @@id([userId, roleId])
}
```

#### **Verificação de Permissão:**

```typescript
// apps/api/src/modules/permissions/application/use-cases/verificar-permission.use-case.ts

export class VerificarPermissionUseCase {
  async execute(userId: string, permissionCode: string): Promise<boolean> {
    // 1. Buscar roles do usuário
    const userRoles = await this.userRoleRepository.findByUserId(userId);
    
    // 2. Buscar permissões de cada role
    const permissions = await this.rolePermissionRepository
      .findByRoleIds(userRoles.map(ur => ur.roleId));
    
    // 3. Verificar se permissão existe
    return permissions.some(p => p.code === permissionCode);
  }
}
```

### 2.4 Exemplos de Uso

#### **Backend (Middleware):**

```typescript
// Verificar se usuário tem permissão
app.get('/api/produtos', 
  requirePermission('CATALOGO_PRODUTO_VIEW'),
  async (req, res) => {
    // Apenas usuários com permissão chegam aqui
  }
);
```

#### **Frontend (Hook):**

```typescript
// Verificar permissão no componente
const { hasPermission } = usePermissions();

if (hasPermission('CATALOGO_PRODUTO_EDIT')) {
  return <EditButton />;
}
```

---

## 3. ABAC - Attribute-Based Access Control

### 3.1 O Que É

**ABAC** define **em quais dados o usuário pode atuar**:
- Filtragem por organização (multi-tenant)
- Filtragem por departamento
- Filtragem por setor
- Filtragem por atributos específicos

### 3.2 Estrutura

```
User
  └── Attributes (Atributos)
       ├── Organization (orgId)
       ├── Department (departmentId)
       ├── Sector (sectorId)
       └── Position (positionId)
```

**Exemplo:**
```
Usuário: Maria Santos
  └── Attributes:
       • orgId: "org-123"
       • departmentId: "dept-vendas"
       • sectorId: "sector-norte"
       
  → Pode ver apenas dados da organização "org-123"
  → Pode editar apenas dados do departamento "dept-vendas"
  → Pode aprovar apenas dados do setor "sector-norte"
```

### 3.3 Implementação

#### **Schema Prisma:**

```prisma
model User {
  id        String   @id @default(uuid())
  email     String
  orgId     String   // Filtro por organização
  
  // Atributos organizacionais
  memberships OrganizationMembership[]
  departmentMemberships DepartmentMembership[]
  sectorMemberships     SectorMembership[]
  positionMemberships   PositionMembership[]
}

model OrganizationMembership {
  userId String
  orgId  String
  
  user         User         @relation(fields: [userId], references: [id])
  organization Organization @relation(fields: [orgId], references: [id])
  
  @@id([userId, orgId])
}
```

#### **Filtragem Automática:**

```typescript
// apps/api/src/core/tenant/tenant-context.middleware.ts

export function requireTenantContext() {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = req.user?.userId;
    const orgId = req.headers['x-org-id'] as string;
    
    // Validar se usuário pertence à organização
    const membership = await organizationMembershipRepository
      .findByUserAndOrg(userId, orgId);
    
    if (!membership) {
      return reply.status(403).send({ error: 'Acesso negado' });
    }
    
    // Adicionar contexto ao request
    req.tenant = {
      orgId,
      userId,
      departmentId: membership.departmentId,
      sectorId: membership.sectorId,
    };
  };
}
```

#### **Repository com Filtro Automático:**

```typescript
// Exemplo: Buscar produtos apenas da organização do usuário
export class PrismaProdutoRepository {
  async findAll(tenant: TenantContext): Promise<Produto[]> {
    return prisma.produto.findMany({
      where: {
        orgId: tenant.orgId, // Filtro automático por organização
        // Filtro adicional por departamento (se necessário)
        ...(tenant.departmentId && {
          departmentId: tenant.departmentId,
        }),
      },
    });
  }
}
```

### 3.4 Exemplos de Uso

#### **Backend (Query Automática):**

```typescript
// Todos os produtos retornados são automaticamente filtrados por orgId
app.get('/api/produtos', 
  requireTenantContext(),
  async (req, res) => {
    const produtos = await produtoRepository.findAll(req.tenant);
    // Apenas produtos da organização do usuário
    return res.send(produtos);
  }
);
```

#### **Frontend (Context Provider):**

```typescript
// Contexto de tenant é injetado automaticamente
const { orgId, departmentId } = useTenant();

// Todas as requisições incluem x-org-id no header
const produtos = await api.get('/produtos');
// Retorna apenas produtos da organização atual
```

---

## 4. PBAC - Policy-Based Access Control

### 4.1 O Que É

**PBAC** define **sob quais condições e aprovações** o usuário pode executar ações:
- Workflows de aprovação
- Regras de negócio condicionais
- Políticas dinâmicas baseadas em contexto
- Validações antes de permitir ação

### 4.2 Estrutura

```
Action
  └── Policy (Política)
       ├── Conditions (Condições)
       ├── Approvals (Aprovações)
       └── Rules (Regras)
```

**Exemplo:**
```
Ação: Aprovar Ficha de Custo
  └── Policy:
       • Condição: Status = "enviada_para_conferencia"
       • Condição: Valor > R$ 10.000 → Requer aprovação de 2 gestores
       • Condição: Valor <= R$ 10.000 → Aprovação de 1 gestor
       • Regra: Apenas gestores do departamento "Aviamentos"
```

### 4.3 Implementação

#### **Schema Prisma:**

```prisma
model WorkflowPolicy {
  id          String   @id @default(uuid())
  orgId       String
  name        String
  description String?
  
  // Condições
  conditions  Json     // { valor: { $gt: 10000 }, status: "enviada" }
  
  // Aprovações necessárias
  approvalsRequired Int @default(1)
  approverRoles     String[] // ["GERENTE", "SUPERVISOR"]
  
  // Regras adicionais
  rules       Json?    // Regras customizadas
  
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Approval {
  id            String   @id @default(uuid())
  workflowId    String   // ID do workflow (ex: ficha de custo)
  policyId      String
  approverId    String
  status        ApprovalStatus @default(PENDING)
  comments      String?
  
  approvedAt    DateTime?
  rejectedAt    DateTime?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
}
```

#### **Service de Políticas:**

```typescript
// apps/api/src/modules/workflows/services/policy-service.ts

export class PolicyService {
  /**
   * Verifica se ação pode ser executada
   */
  async canExecute(
    action: string,
    context: ActionContext,
    tenant: TenantContext
  ): Promise<{ allowed: boolean; reason?: string; approvalsNeeded?: number }> {
    
    // 1. Buscar políticas aplicáveis
    const policies = await this.workflowPolicyRepository
      .findApplicable(action, context, tenant);
    
    // 2. Avaliar condições
    for (const policy of policies) {
      const conditionsMet = this.evaluateConditions(
        policy.conditions,
        context
      );
      
      if (!conditionsMet) {
        continue; // Política não aplicável
      }
      
      // 3. Verificar aprovações necessárias
      const approvals = await this.approvalRepository
        .findByWorkflowId(context.workflowId);
      
      const approvalsCount = approvals.filter(
        a => a.status === 'APPROVED'
      ).length;
      
      if (approvalsCount < policy.approvalsRequired) {
        return {
          allowed: false,
          reason: `Requer ${policy.approvalsRequired} aprovações`,
          approvalsNeeded: policy.approvalsRequired - approvalsCount,
        };
      }
    }
    
    return { allowed: true };
  }
  
  /**
   * Avalia condições da política
   */
  private evaluateConditions(
    conditions: Record<string, any>,
    context: ActionContext
  ): boolean {
    // Exemplo: { valor: { $gt: 10000 }, status: "enviada" }
    for (const [key, value] of Object.entries(conditions)) {
      const contextValue = context[key];
      
      if (typeof value === 'object' && value.$gt) {
        if (contextValue <= value.$gt) return false;
      } else if (contextValue !== value) {
        return false;
      }
    }
    
    return true;
  }
}
```

### 4.4 Exemplos de Uso

#### **Backend (Use Case com Política):**

```typescript
// apps/api/src/modules/fichas-custo/application/use-cases/aprovar-ficha.use-case.ts

export class AprovarFichaCustoUseCase {
  constructor(
    private fichaRepository: FichaCustoRepository,
    private policyService: PolicyService,
  ) {}
  
  async execute(input: AprovarFichaInput): Promise<void> {
    const ficha = await this.fichaRepository.findById(input.fichaId);
    
    // Verificar política de aprovação
    const policyCheck = await this.policyService.canExecute(
      'FICHA_CUSTO_APPROVE',
      {
        workflowId: ficha.id,
        valor: ficha.totalCustos.toNumber(),
        status: ficha.status,
        departmentId: ficha.departmentId,
      },
      input.tenant
    );
    
    if (!policyCheck.allowed) {
      throw new Error(
        `Aprovação não permitida: ${policyCheck.reason}. ` +
        `Aprovações necessárias: ${policyCheck.approvalsNeeded}`
      );
    }
    
    // Aprovar ficha
    ficha.aprovar(input.userId);
    await this.fichaRepository.save(ficha);
  }
}
```

#### **Frontend (Verificação de Ação):**

```typescript
// Verificar se pode aprovar antes de mostrar botão
const { canExecute } = usePolicy();

const canApprove = await canExecute('FICHA_CUSTO_APPROVE', {
  workflowId: ficha.id,
  valor: ficha.totalCustos,
  status: ficha.status,
});

if (canApprove.allowed) {
  return <ApproveButton />;
} else {
  return <Tooltip>Requer {canApprove.approvalsNeeded} aprovações</Tooltip>;
}
```

---

## 5. Integração dos Três Níveis

### 5.1 Fluxo Completo

```
┌─────────────────────────────────────────────────────────┐
│              REQUISIÇÃO DO USUÁRIO                       │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │ 1. RBAC: Pode fazer?         │
    │    • Verificar permissão     │
    │    • Verificar role          │
    └──────────────┬───────────────┘
                   │ ✅ Permitido
                   ▼
    ┌──────────────────────────────┐
    │ 2. ABAC: Em quais dados?     │
    │    • Filtrar por orgId       │
    │    • Filtrar por dept/setor  │
    └──────────────┬───────────────┘
                   │ ✅ Dados filtrados
                   ▼
    ┌──────────────────────────────┐
    │ 3. PBAC: Sob quais condições? │
    │    • Verificar políticas     │
    │    • Verificar aprovações    │
    └──────────────┬───────────────┘
                   │ ✅ Condições atendidas
                   ▼
    ┌──────────────────────────────┐
    │      AÇÃO EXECUTADA           │
    └──────────────────────────────┘
```

### 5.2 Exemplo Prático

**Cenário:** Usuário tenta aprovar uma Ficha de Custo

```typescript
// 1. RBAC: Verificar permissão
const hasPermission = await verificarPermissionUseCase.execute(
  userId,
  'FICHA_CUSTO_APPROVE'
);
if (!hasPermission) {
  throw new Error('Sem permissão para aprovar fichas');
}

// 2. ABAC: Filtrar dados (já aplicado automaticamente)
// Apenas fichas da organização do usuário são retornadas

// 3. PBAC: Verificar condições e aprovações
const policyCheck = await policyService.canExecute(
  'FICHA_CUSTO_APPROVE',
  {
    workflowId: fichaId,
    valor: ficha.totalCustos,
    status: ficha.status,
  },
  tenant
);
if (!policyCheck.allowed) {
  throw new Error(policyCheck.reason);
}

// 4. Executar ação
await aprovarFichaUseCase.execute({ fichaId, userId, tenant });
```

---

## 6. Configuração e Gestão

### 6.1 Criar Nova Permissão (RBAC)

```typescript
// 1. Adicionar permissão no banco
const permission = await prisma.permission.create({
  data: {
    code: 'CATALOGO_PRODUTO_EDIT',
    name: 'Editar Produtos',
    description: 'Permite editar produtos do catálogo',
    module: 'CATALOGO',
    level: 'WRITE',
  },
});

// 2. Associar a um role
await prisma.rolePermission.create({
  data: {
    roleId: 'role-gerente-vendas',
    permissionId: permission.id,
  },
});
```

### 6.2 Criar Nova Política (PBAC)

```typescript
// Criar política de aprovação
const policy = await prisma.workflowPolicy.create({
  data: {
    orgId: 'org-123',
    name: 'Aprovação de Fichas de Custo',
    description: 'Requer aprovações baseadas no valor',
    conditions: {
      valor: { $gt: 10000 },
      status: 'enviada_para_conferencia',
    },
    approvalsRequired: 2,
    approverRoles: ['GERENTE', 'SUPERVISOR'],
    active: true,
  },
});
```

---

## 7. Checklist de Implementação

### 7.1 RBAC

- [ ] Permissões definidas no banco
- [ ] Roles criados e associados a permissões
- [ ] Usuários associados a roles
- [ ] Middleware de verificação implementado
- [ ] Hook frontend para verificar permissões
- [ ] Componentes protegidos por permissão

### 7.2 ABAC

- [ ] Tenant context middleware implementado
- [ ] Repositories filtram por orgId automaticamente
- [ ] Headers de tenant configurados no frontend
- [ ] Validação de membership em todas as rotas
- [ ] Filtros por departamento/setor (se necessário)

### 7.3 PBAC

- [ ] WorkflowPolicy model criado
- [ ] Approval model criado
- [ ] PolicyService implementado
- [ ] Use cases verificam políticas antes de executar
- [ ] Frontend verifica condições antes de mostrar ações
- [ ] Sistema de aprovações implementado

---

## 8. Referências

- **Schema:** `apps/api/prisma/schema.prisma`
- **RBAC Implementation:** `apps/api/src/modules/permissions/`
- **ABAC Implementation:** `apps/api/src/core/tenant/`
- **PBAC Implementation:** `apps/api/src/modules/workflows/` (futuro)

---

**Última atualização:** 2025-01-19  
**Versão:** 1.0.0  
**Status:** Implementação em andamento

