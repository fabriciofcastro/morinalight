# Mapa de Contextos, Núcleo do Domínio e Governança de Dependências

> **Este documento define como o sistema é dividido, quem manda em quem e onde cada regra de negócio deve existir.**
> Ele existe para evitar crescimento caótico, acoplamento indevido e refatorações destrutivas.
>
> **📌 Para visão geral completa e controle absoluto, consulte o [Centro de Comando](./Centro-de-Comando-Controle-Absoluto.md)**

---

## 1. Princípio Fundamental

**Nem todo módulo é igual.**
Alguns são críticos para o negócio, outros são apenas suporte.

> O erro clássico é tratar tudo como igual. Isso mata a escalabilidade.

---

## 2. Core Domain (Núcleo do Negócio)

### Definição

O **Core Domain** é onde vive aquilo que, se quebrar ou estiver errado, o produto perde valor. **É o diferencial competitivo do sistema.**

### Neste sistema, o Core Domain é composto por:

#### 2.1 Estrutura Organizacional

- Hierarquia: Empresa → Departamento → Subdepartamento → Setor → Cargo
- Regras de negócio específicas da organização
- Suporte multiempresa com isolamento completo
- **Bounded Context:** `Organization`

#### 2.2 Controle de Acesso Contextual

- Autorização baseada em empresa, unidade, papel e contexto
- RBAC granular e contextual
- Isolamento de dados por organização
- **Bounded Context:** `Security` / `AccessControl`

#### 2.3 Regras de Hierarquia e Autoridade

- Aplicação de subordinação
- Validação de fluxos hierárquicos
- Regras de aprovação baseadas em posição
- **Bounded Context:** `Organization` (parte do core)

#### 2.4 Auditoria e Rastreamento de Ações

- Rastreamento completo de ações
- Histórico imutável
- Suporte a compliance
- **Bounded Context:** `Governance` / `Audit`

> **Regra absoluta:** Nada depende do Core Domain exceto ele mesmo. Core Domain não depende de nada externo (exceto infraestrutura técnica básica).

---

## 3. Domínios de Suporte

São domínios necessários, mas não estratégicos.

### Exemplos:

- Notificações
- Relatórios
- Integrações externas
- Exportações

### Regras

- Nunca contêm regra central de negócio
- Podem ser substituídos sem reescrever o sistema
- Dependem do Core Domain, nunca o contrário

---

## 4. Domínios Genéricos

Domínios comuns a qualquer sistema.

### Exemplos:

- Autenticação técnica
- Envio de e-mail
- Upload de arquivos
- Logs técnicos

> Se esse domínio existir em qualquer empresa, ele não é Core.

---

## 5. Bounded Contexts (Contextos Delimitados)

Cada domínio vive em um **Bounded Context** próprio. **Cada contexto é um mundo isolado com suas próprias regras.**

### Regras obrigatórias:

- **Cada contexto tem seu próprio modelo**
  - Mesmo conceito pode ter nomes diferentes em contextos diferentes
  - Exemplo: "User" em Security ≠ "Employee" em Organization

- **Nenhum contexto acessa diretamente o banco de outro**
  - Não há JOINs entre bancos de contextos diferentes
  - Não há acesso direto a tabelas de outro contexto

- **Comunicação ocorre via:**
  - **Eventos de domínio** (preferencial)
  - **Contratos explícitos** (APIs versionadas)
  - **Shared Kernel** (apenas quando absolutamente necessário e documentado)

### Exemplo de Isolamento:

```
Contexto: Organization
├── Modelo: Department, Subdepartment, Sector, Position
├── Banco: organization_db
└── API: /api/organization/*

Contexto: Security
├── Modelo: User, Role, Permission, AccessPolicy
├── Banco: security_db
└── API: /api/security/*

Comunicação: Eventos (UserCreated, DepartmentUpdated)
```

> **Regra crítica:** Compartilhar entidade entre contextos é falha grave. Cada contexto tem seu próprio modelo, mesmo que represente o mesmo conceito de negócio.

---

## 6. Mapa de Contextos (Relacionamentos)

### Tipos permitidos de relacionamento:

#### 6.1 Upstream / Downstream

- **Upstream**: Contexto que fornece dados/regras
- **Downstream**: Contexto que consome dados/regras
- **Direção:** Downstream → Upstream (dependência)

```
Organization (Upstream)
    ↓
Security (Downstream) - precisa de dados de Organization
```

#### 6.2 Customer / Supplier

- **Supplier**: Fornece serviço/contrato
- **Customer**: Consome serviço/contrato
- **Contrato explícito** entre ambos

```
Audit (Supplier)
    ↓ (contrato: AuditService)
Notifications (Customer) - consome serviço de auditoria
```

#### 6.3 Event-driven

- Comunicação assíncrona via eventos
- Baixo acoplamento
- **Preferencial** para comunicação entre contextos

```
Organization → [DepartmentCreated event] → Security
Organization → [DepartmentUpdated event] → Notifications
```

### Tipos proibidos:

- **Dependência circular**
  - Contexto A depende de B, B depende de A
  - **Solução:** Extrair dependência comum ou usar eventos

- **Acesso direto a modelos internos**
  - Importar entidade de outro contexto
  - Acessar banco de outro contexto diretamente
  - **Solução:** Usar eventos ou contratos explícitos

### Exemplo de Mapa Completo:

```
Core Domain:
├── Organization (independente)
├── Security (depende de Organization)
└── Audit (independente, usado por todos)

Supporting Domain:
├── Notifications (depende de Organization, Audit)
└── Reporting (depende de Organization, Audit)

Generic Domain:
├── Authentication (independente)
└── FileStorage (independente)
```

---

## 7. Governança de Dependências (Regra de Direção)

### Direção obrigatória (Dependency Rule):

```
Interface (UI/API)
    ↓
Application (Use Cases)
    ↓
Domain (Business Logic)
    ↓
Infrastructure (DB, External Services)
```

### Regras detalhadas:

- **Camadas externas dependem das internas**
  - Interface pode usar Application
  - Application pode usar Domain
  - Infrastructure pode usar Domain
  - **Nunca o contrário**

- **Domínio não conhece framework**
  - Domain não importa Express, React, Prisma
  - Domain não conhece HTTP, REST, GraphQL
  - Domain é puro TypeScript/JavaScript

- **Infra conhece domínio, nunca o contrário**
  - Infrastructure implementa interfaces do Domain
  - Domain define contratos, Infrastructure implementa
  - Domain não sabe se usa PostgreSQL, MongoDB ou arquivo

### Exemplo de Violação (ERRADO):

```typescript
// ❌ ERRADO: Domain importando Infrastructure
import { PrismaClient } from "@prisma/client"; // Domain não deve conhecer Prisma

// ❌ ERRADO: Domain importando Application
import { CreateUserUseCase } from "../application"; // Domain não deve conhecer Use Cases
```

### Exemplo Correto:

```typescript
// ✅ CORRETO: Domain define interface
// domain/repositories/IUserRepository.ts
export interface IUserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
}

// ✅ CORRETO: Infrastructure implementa
// infrastructure/repositories/UserRepository.ts
import { IUserRepository } from "@/domain/repositories";
import { PrismaClient } from "@prisma/client"; // OK aqui

export class UserRepository implements IUserRepository {
  // implementação usando Prisma
}
```

> **Regra crítica:** Se quebrar essa regra, criou dívida técnica estrutural. Refatoração será necessária.

---

## 8. Comunicação Entre Módulos

### Preferência de comunicação (ordem de prioridade):

#### 8.1 Eventos (Preferencial)

- Comunicação assíncrona
- Baixo acoplamento
- Fácil escalabilidade

```typescript
// Módulo A publica evento
eventBus.publish(new DepartmentCreatedEvent(departmentId));

// Módulo B escuta evento
eventBus.subscribe(DepartmentCreatedEvent, (event) => {
  // reage ao evento
});
```

#### 8.2 Casos de uso explícitos

- Quando precisa de resposta síncrona
- Contrato bem definido
- Versionamento explícito

```typescript
// Módulo B expõe caso de uso
class ValidateUserAccessUseCase {
  async execute(userId: string, resource: string): Promise<boolean> {
    // lógica
  }
}

// Módulo A chama caso de uso
const hasAccess = await validateUserAccessUseCase.execute(userId, resource);
```

#### 8.3 APIs internas versionadas

- Última opção
- Quando eventos não são suficientes
- Sempre versionadas

```typescript
// API interna versionada
GET /api/v1/internal/security/validate-access?userId=123&resource=departments
```

### Proibido:

- **Importar service de outro módulo diretamente**

  ```typescript
  // ❌ ERRADO
  import { UserService } from "@/modules/security/services";
  ```

- **Compartilhar estado**

  ```typescript
  // ❌ ERRADO: Estado compartilhado
  export const sharedState = { users: [] };
  ```

- **Acesso direto a banco de outro módulo**
  ```typescript
  // ❌ ERRADO
  const users = await prisma.user.findMany(); // de outro módulo
  ```

> **Regra:** Se precisa de comunicação síncrona, use casos de uso. Se pode ser assíncrona, use eventos.

---

## 9. Evolução Segura de Domínios

### Qualquer mudança estrutural exige:

- Avaliação de impacto no mapa de contextos
- Verificação de contratos afetados
- Plano de compatibilidade

> Evolução sem mapa é aposta, não engenharia.

### 9.1 Quando Criar Novo Bounded Context

Criar novo contexto quando:

- **Responsabilidades distintas**: O novo domínio tem regras de negócio próprias e independentes
- **Modelos diferentes**: O mesmo conceito precisa de representação diferente
- **Evolução independente**: Precisa evoluir em ritmo diferente de outros contextos
- **Equipes diferentes**: Times diferentes trabalham no domínio
- **Escalabilidade**: Precisa escalar independentemente

**NÃO criar novo contexto quando:**

- Apenas por organização de código (use módulos)
- Por questões técnicas (performance, etc.)
- Sem responsabilidades de negócio distintas

### 9.2 Template para Documentar Novo Contexto

```markdown
## Contexto: [Nome]

**Tipo:** Core / Supporting / Generic
**Data de Criação:** YYYY-MM-DD
**Responsável:** [Nome/Role]

### Responsabilidades

- Responsabilidade 1
- Responsabilidade 2

### Modelos Principais

- Entidade1: [descrição]
- Entidade2: [descrição]

### Relacionamentos

- **Upstream de:** [contextos que dependem deste]
- **Downstream de:** [contextos dos quais depende]
- **Comunica via:** Eventos / APIs / Contratos

### Contratos Públicos

- API: `/api/[contexto]/*`
- Eventos: [Lista de eventos publicados]
- Eventos consumidos: [Lista de eventos consumidos]

### Regras de Isolamento

[Regras específicas deste contexto]
```

### 9.3 Processo de Criação de Novo Contexto

1. **Propor** novo contexto (ADR)
2. **Validar** necessidade (arquiteto/tech lead)
3. **Documentar** usando template acima
4. **Atualizar** mapa de contextos
5. **Implementar** isolamento completo
6. **Validar** comunicação com outros contextos

---

## 10. Regra de Ouro para Escala

> **Quando o sistema crescer, os contextos protegem o negócio.**
> **Quando a equipe crescer, as regras protegem o sistema.**

Este documento garante que o crescimento seja:

- Modular
- Controlado
- Reversível

---

## 11. Integração com Outros Documentos

Este mapa se relaciona com:

- **[Mapa de Capacidades](./Mapa-Capacidades-Sistema-(Capability Map).md)**: Define O QUE o sistema faz
- **[Matriz Capacidade × Contexto × Módulo](./Matriz-Capacidade×Contexto×Módulo.md)**: Conecta capacidades com contextos
- **[Diretiva de Governança](./Diretiva-Autoanálise-Governança-Técnica-do-Sistema.md)**: Define COMO implementar respeitando limites

### Fluxo de Uso:

1. **Identificar capacidade** (Mapa de Capacidades)
2. **Mapear para contexto** (este documento)
3. **Validar limites e dependências** (este documento)
4. **Implementar seguindo diretrizes** (Diretiva de Governança)

---

## 12. Como Criar o Mapa Inicial

Se você está criando o mapa de contextos pela primeira vez:

1. **Fazer inventário completo** seguindo o **[Guia de Inventário e Mapeamento](./Guia-Inventário-Mapeamento-Sistema.md)**
2. **Identificar todos os módulos** e agrupar por domínio de negócio
3. **Mapear relacionamentos** entre módulos (imports, eventos, APIs)
4. **Validar isolamento** de cada contexto
5. **Documentar** usando os templates deste documento

> **Regra:** O mapa de contextos deve refletir a realidade do código, não uma arquitetura ideal.

---

## 13. Encerramento (Disciplina Arquitetural)

Este mapa não é teórico. **É a fundação arquitetural do sistema.**

Ele deve ser:

- **Revisado periodicamente** (mensal ou a cada sprint)
- **Usado para validar decisões** (antes de criar novo módulo)
- **Respeitado antes de qualquer nova feature** (validar limites)
- **Consultado em refatorações** (evitar quebrar isolamento)

### Checklist Antes de Criar Novo Módulo:

- [ ] Identifiquei o contexto onde este módulo vive?
- [ ] Validei se não viola limites de outros contextos?
- [ ] Defini como este módulo se comunica com outros?
- [ ] Verifiquei a direção de dependências?
- [ ] Documentei o relacionamento no mapa?

Qualquer violação deve ser **intencional, documentada e rara**.
