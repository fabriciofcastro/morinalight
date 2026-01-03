# 📋 Auditoria Completa - Documentação

## Visão Geral

O sistema de auditoria completa foi implementado para rastrear todas as mudanças na estrutura organizacional (Departments, Subdepartments, Sectors, Positions) e suas relações.

## Arquitetura

```
Use Cases → AuditLogRepository → Prisma → Database
                ↓
          HTTP Route → Frontend
```

### Componentes

1. **OrganizationalStructureAuditLog**: Modelo de dados para logs de auditoria
2. **OrganizationalStructureAuditLogRepository**: Interface e implementação do repositório
3. **Use Cases**: Todos os use cases registram auditoria automaticamente
4. **HTTP Route**: Rota para listar e consultar logs de auditoria
5. **Frontend Component**: `OrganizationalAuditPanel` para visualização

## Funcionalidades Implementadas

### 1. Registro Automático de Auditoria

Todos os use cases de estrutura organizacional registram auditoria automaticamente:

#### Departments
- ✅ `CriarDepartmentUseCase` - action: "created"
- ✅ `AtualizarDepartmentUseCase` - action: "updated"
- ✅ `DeletarDepartmentUseCase` - action: "deleted"

#### Subdepartments
- ✅ `CriarSubdepartmentUseCase` - action: "created"
- ✅ `AtualizarSubdepartmentUseCase` - action: "updated"
- ✅ `DeletarSubdepartmentUseCase` - action: "deleted"

#### Sectors
- ✅ `CriarSectorUseCase` - action: "created"
- ✅ `AtualizarSectorUseCase` - action: "updated"
- ✅ `DeletarSectorUseCase` - action: "deleted"

#### Positions
- ✅ `CriarPositionUseCase` - action: "created"
- ✅ `AtualizarPositionUseCase` - action: "updated"
- ✅ `DeletarPositionUseCase` - action: "deleted"

#### Membros
- ✅ `AdicionarMembroDepartmentUseCase` - action: "member_added"
- ✅ `RemoverMembroDepartmentUseCase` - action: "member_removed"
- ✅ `AtualizarRoleMembroDepartmentUseCase` - action: "member_role_updated"
- ✅ `AdicionarMembroSectorUseCase` - action: "member_added"
- ✅ `RemoverMembroSectorUseCase` - action: "member_removed"
- ✅ `AtualizarRoleMembroSectorUseCase` - action: "member_role_updated"
- ✅ `AdicionarMembroPositionUseCase` - action: "member_added"
- ✅ `RemoverMembroPositionUseCase` - action: "member_removed"
- ✅ `AtualizarRoleMembroPositionUseCase` - action: "member_role_updated"

### 2. Estrutura de Dados

#### OrganizationalStructureAuditLog

```typescript
{
  id: string;
  orgId: string;
  entityType: "department" | "subdepartment" | "sector" | "position";
  entityId: string;
  action: string; // "created" | "updated" | "deleted" | "member_added" | "member_removed" | "member_role_updated"
  actorId: string; // ID do usuário que realizou a ação
  payload: Record<string, unknown> | null; // Dados adicionais da ação
  createdAt: Date;
}
```

#### Payload por Ação

**created/updated:**
```json
{
  "name": "Nome da entidade",
  "code": "Código",
  "departmentId": "...",
  "status": "ativo"
}
```

**deleted:**
```json
{
  "name": "Nome da entidade",
  "code": "Código"
}
```

**member_added/member_removed:**
```json
{
  "userId": "...",
  "role": "manager" | "member",
  "entityType": "department" | "sector" | "position",
  "entityId": "..."
}
```

### 3. API HTTP

#### GET /organizational-structure/audit-log

Lista logs de auditoria com filtros opcionais.

**Query Parameters:**
- `entityType` (opcional): "department" | "subdepartment" | "sector" | "position"
- `entityId` (opcional): UUID da entidade
- `action` (opcional): Tipo de ação
- `cursor` (opcional): Cursor para paginação
- `limite` (opcional): Número de itens por página (1-50, padrão: 20)
- `dataInicio` (opcional): Data inicial (ISO 8601)
- `dataFim` (opcional): Data final (ISO 8601)
- `search` (opcional): Busca textual

**Response:**
```json
{
  "itens": [
    {
      "id": "...",
      "orgId": "...",
      "entityType": "department",
      "entityId": "...",
      "action": "created",
      "actorId": "...",
      "payload": { ... },
      "createdAt": "2025-01-19T10:00:00Z"
    }
  ],
  "proximoCursor": "..." // null se não houver mais itens
}
```

### 4. Frontend

#### OrganizationalAuditPanel

Componente React para visualizar logs de auditoria.

**Props:**
- `entityType` (opcional): Filtrar por tipo de entidade
- `entityId` (opcional): Filtrar por ID de entidade específica

**Funcionalidades:**
- Lista de logs com paginação
- Filtros por tipo de entidade, campo, data
- Busca textual
- Visualização detalhada de cada log
- Exportação de logs

## Uso

### No Backend

Os use cases registram auditoria automaticamente quando há mudanças:

```typescript
// Exemplo: CriarDepartmentUseCase
if (this.deps.auditLogRepository) {
  await this.deps.auditLogRepository.registrar({
    id: randomUUID(),
    orgId: department.dados.orgId,
    entityType: "department",
    entityId: department.departmentId,
    action: "created",
    actorId: this.deps.actorId,
    payload: {
      name: department.dados.name,
      code: department.dados.code,
      branchId: department.dados.branchId,
      parentId: department.dados.parentId,
    },
    createdAt: new Date(),
  });
}
```

### No Frontend

```tsx
import { OrganizationalAuditPanel } from "@/components/organizational-structure/OrganizationalAuditPanel";

// Visualizar todos os logs
<OrganizationalAuditPanel />

// Visualizar logs de um departamento específico
<OrganizationalAuditPanel 
  entityType="department" 
  entityId="department-id" 
/>
```

### Consultar via API

```bash
# Listar todos os logs
GET /organizational-structure/audit-log?limite=50

# Filtrar por tipo de entidade
GET /organizational-structure/audit-log?entityType=department

# Filtrar por entidade específica
GET /organizational-structure/audit-log?entityId=department-id

# Filtrar por período
GET /organizational-structure/audit-log?dataInicio=2025-01-01T00:00:00Z&dataFim=2025-01-31T23:59:59Z

# Buscar textual
GET /organizational-structure/audit-log?search=financeiro
```

## Banco de Dados

### Schema Prisma

```prisma
model OrganizationalStructureAuditLog {
  id         String   @id @default(uuid())
  orgId      String
  entityType String // "department" | "subdepartment" | "sector" | "position"
  entityId   String
  action     String // "created" | "updated" | "deleted" | "member_added" | "member_removed" | "member_role_updated"
  actorId    String
  payload    Json?
  createdAt  DateTime @default(now())

  organization Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)

  @@index([orgId, createdAt])
  @@index([orgId, entityType, entityId])
  @@index([entityType, entityId])
}
```

## Índices

Os seguintes índices foram criados para otimizar consultas:

1. `[orgId, createdAt]` - Consultas por organização e data
2. `[orgId, entityType, entityId]` - Consultas por entidade específica
3. `[entityType, entityId]` - Consultas por tipo e ID

## Próximos Passos

1. **Versionamento**: Adicionar versionamento de entidades (snapshots)
2. **Exportação**: Exportar logs em CSV/Excel
3. **Alertas**: Alertas para mudanças críticas
4. **Dashboard**: Dashboard de auditoria com métricas
5. **Retenção**: Política de retenção de logs antigos

## Troubleshooting

### Logs não aparecem

1. Verifique se `auditLogRepository` está configurado no módulo
2. Verifique se os use cases estão chamando `registrar()`
3. Verifique se há erros no console do servidor

### Performance

1. Use filtros para limitar resultados
2. Use paginação (cursor) para grandes volumes
3. Considere arquivar logs antigos

### Consultas Lentas

1. Verifique se os índices estão sendo usados
2. Considere adicionar índices adicionais se necessário
3. Use filtros de data para limitar escopo








