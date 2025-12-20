# Exemplos de Uso - PBAC (Policy-Based Access Control)

Este documento mostra exemplos práticos de como usar o PolicyService implementado.

## 1. Configurando uma Política

### Exemplo 1: Aprovação de Ficha de Custo baseada em valor

```typescript
// Criar política via API
POST /organizational-structure/workflow-policies
{
  "orgId": "uuid-da-organizacao",
  "module": "FICHA_CUSTO",
  "flowType": "APROVAR",
  "active": true,
  "config": {
    "conditions": {
      "valor": { "$gte": 10000 },  // Valor >= R$ 10.000
      "status": "ENVIADA_PARA_APROVACAO"
    },
    "approvalsRequired": 2,
    "approverRoles": ["GERENTE", "DIRETOR"]
  }
}
```

### Exemplo 2: Aprovação condicional por departamento

```typescript
{
  "orgId": "uuid-da-organizacao",
  "module": "FICHA_CUSTO",
  "flowType": "APROVAR",
  "active": true,
  "config": {
    "conditions": {
      "valor": { "$gte": 5000 },
      "departmentId": { "$in": ["dept-aviam", "dept-corte"] }  // Apenas estes departamentos
    },
    "approvalsRequired": 1,
    "approverRoles": ["SUPERVISOR"]
  }
}
```

## 2. Verificando Políticas (API)

```typescript
// Verificar se ação pode ser executada
POST /organizational-structure/policies/verify
Headers:
  x-org-id: uuid-da-organizacao

Body:
{
  "module": "FICHA_CUSTO",
  "flowType": "APROVAR",
  "context": {
    "workflowId": "ficha-123",
    "valor": 15000,
    "status": "ENVIADA_PARA_APROVACAO",
    "departmentId": "dept-aviam"
  }
}

Response:
{
  "allowed": true,
  "applicablePolicies": [
    {
      "id": "policy-123",
      "module": "FICHA_CUSTO",
      "flowType": "APROVAR"
    }
  ]
}

// Se não permitido:
{
  "allowed": false,
  "reason": "Condições não atendidas: valor deve ser maior ou igual a 10000",
  "failedConditions": [
    {
      "policyId": "policy-123",
      "condition": "valor deve ser maior ou igual a 10000"
    }
  ]
}
```

## 3. Usando no Backend (Use Case)

```typescript
import { PolicyService } from "../domain/services/policy-service";
import type { WorkflowPolicyRepository } from "../domain/repositories/workflow-policy-repository";

export class AprovarFichaCustoUseCase {
  private policyService: PolicyService;

  constructor(
    private fichaRepository: FichaCustoRepository,
    workflowPolicyRepository: WorkflowPolicyRepository,
    private orgId: string,
  ) {
    this.policyService = new PolicyService(workflowPolicyRepository);
  }

  async execute(input: { fichaId: string; userId: string }) {
    const ficha = await this.fichaRepository.findById(input.fichaId);

    // Verificar política PBAC
    const policyCheck = await this.policyService.canExecute(
      this.orgId,
      "FICHA_CUSTO",
      "APROVAR",
      {
        workflowId: ficha.id,
        valor: ficha.totalCustos.toNumber(),
        status: ficha.status,
        departmentId: ficha.departmentId,
      },
    );

    if (!policyCheck.allowed) {
      throw new Error(
        `Aprovação não permitida: ${policyCheck.reason}. ` +
          (policyCheck.approvalsNeeded
            ? `Aprovações necessárias: ${policyCheck.approvalsNeeded}`
            : ""),
      );
    }

    // Aprovar ficha
    ficha.aprovar(input.userId);
    await this.fichaRepository.save(ficha);
  }
}
```

## 4. Operadores de Condições Suportados

### Operadores Numéricos

```typescript
{
  "valor": { "$gt": 10000 },    // Maior que
  "valor": { "$gte": 10000 },   // Maior ou igual
  "valor": { "$lt": 5000 },     // Menor que
  "valor": { "$lte": 5000 }     // Menor ou igual
}
```

### Operadores de Igualdade

```typescript
{
  "status": "APROVADO",         // Igualdade direta
  "status": { "$eq": "APROVADO" },  // Igualdade explícita
  "status": { "$ne": "REJEITADO" }  // Diferente
}
```

### Operadores de Array

```typescript
{
  "departmentId": { "$in": ["dept-1", "dept-2"] },      // Está em array
  "departmentId": { "$nin": ["dept-3", "dept-4"] }      // Não está em array
}
```

### Operador de Existência

```typescript
{
  "observacoes": { "$exists": true },   // Campo deve existir
  "observacoes": { "$exists": false }   // Campo não deve existir
}
```

## 5. Múltiplas Condições

As condições são avaliadas com AND (todas devem ser verdadeiras):

```typescript
{
  "conditions": {
    "valor": { "$gte": 10000 },
    "status": "ENVIADA_PARA_APROVACAO",
    "departmentId": { "$in": ["dept-1", "dept-2"] }
  }
}
```

Todas as condições acima devem ser verdadeiras para a política ser aplicável.

## 6. Políticas Múltiplas

Se houver múltiplas políticas ativas para o mesmo módulo/flowType, todas devem ser satisfeitas:

- Se alguma política falhar, a ação não é permitida
- Todas as políticas aplicáveis devem passar

## 7. Fallback quando Não Há Políticas

Se não houver políticas configuradas para um módulo/flowType:
- Retorna `{ allowed: true }`
- O controle cai para RBAC/ABAC apenas

## 8. Ordem de Avaliação

1. **RBAC** - Verificar permissões e roles do usuário
2. **ABAC** - Filtrar dados por organização/departamento/setor
3. **PBAC** - Verificar políticas e condições (PolicyService)

Se qualquer nível falhar, a ação não é permitida.

