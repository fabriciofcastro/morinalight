1. Princípio número 1 (grave isso)

Frontend grande NÃO escala por componentes. Escala por domínio.

Se você organiza por components, você já perdeu.

2. Arquitetura correta (padrão enterprise)
✅ Feature / Domain-Driven Frontend (obrigatório)
src/
 ├─ app/                # bootstrap, providers, rotas
 ├─ domains/            # ou features
 │   ├─ billing/
 │   │   ├─ application/
 │   │   ├─ domain/
 │   │   ├─ infrastructure/
 │   │   └─ ui/
 │   ├─ users/
 │   └─ orders/
 ├─ shared/
 │   ├─ ui/
 │   ├─ hooks/
 │   ├─ lib/
 │   └─ types/


👉 DDD no frontend não é moda, é sobrevivência.

3. Separação de responsabilidades (sem isso vira caos)
🔹 Domain

Regras de negócio

Entidades

Value Objects

Nunca importa React

🔹 Application

Casos de uso

Orquestra fluxos

Coordena domínio + infra

🔹 Infrastructure

API clients

Adapters

Mapeamento DTO ↔ Domain

🔹 UI

Componentes burros

Hooks de orquestração

Zero regra de negócio

Opinião firme:
👉 Regra de negócio em componente é erro arquitetural.

4. Estado em sistemas grandes (a maior fonte de bugs)
🔹 Classificação obrigatória

Estado de servidor → TanStack Query

Estado de UI global → Zustand

Estado local → useState / useReducer

🚫 Redux só se:

múltiplos bounded contexts

regras de sincronização complexas

time maduro

5. Comunicação entre domínios
🔹 Nunca importe domínio dentro de outro

Use:

Events

Ports & Adapters

Facade Pattern

// application/events
UserCreatedEvent
OrderPaidEvent


👉 Isso reduz acoplamento e permite evolução independente.

6. Patterns obrigatórios em projetos grandes
🔸 Adapter Pattern

Isola API instável.

🔸 State Reducer Pattern

Controle total de estados complexos.

🔸 Compound Components

APIs limpas para componentes críticos.

🔸 Factory Pattern

Criação de objetos de domínio.

7. Performance em escala (sem romantismo)

Code splitting por domínio

Lazy loading agressivo

Virtualização (react-virtual)

Memoização consciente

🚫 useMemo mal usado é bug disfarçado de otimização.

8. Testes (não negociável)
Pirâmide realista

Unitários → domínio e aplicação

Integração → hooks + API mock

E2E → fluxos críticos (Playwright)

Opinião direta:
👉 Sem testes, refactor é loteria.

9. Governança de time grande

ESLint com regras arquiteturais

Absolute imports

Code owners por domínio

ADRs (Architecture Decision Records)

Frontend sem governança vira legado em 6 meses.

10. Micro-frontends (use com cautela)

Só use se:

times independentes

deploy desacoplado

contratos bem definidos

Caso contrário:
👉 monólito modular bem feito é superior.

11. Mentalidade correta

Frontend grande não quebra por falta de libs.
Quebra por acoplamento mal pensado.

Se quiser, posso:

desenhar arquitetura completa enterprise

adaptar isso ao Next.js App Router

alinhar Frontend + Backend Nest.js (DDD puro)

revisar decisões técnicas como CTO faria

Diga o tamanho do sistema, quantidade de times e modelo de deploy.