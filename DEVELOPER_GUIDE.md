# 📘 MorinaLight - Developer Guide

Bem-vindo ao guia de desenvolvimento do MorinaLight. Este documento serve como referência central para a arquitetura, padrões e fluxos de trabalho do projeto.

---

## 🏗 Arquitetura

O projeto utiliza uma arquitetura **Modular Monolith** com forte ênfase em **Domain-Driven Design (DDD)** e **Event-Driven Architecture (EDA)**.

### Estrutura de Diretórios (apps/web)

- `src/app`: Rotas e Pages (Next.js App Router)
- `src/components`: Componentes React (UI, Features)
- `src/lib`: Core da aplicação
  - `/patterns`: Implementações de Design Patterns (Strategy, Adapter, etc.)
  - `/repositories`: Camada de acesso a dados (Repository Pattern)
  - `/services`: Serviços de domínio
  - `/events`: Event Bus e Handlers
  - `/auth`: RBAC, ABAC, Guards

---

## 🎨 Design Patterns

Implementamos uma série de padrões para garantir manutenibilidade e escalabilidade. Consulte `DESIGN_PATTERNS_GUIDE.md` para detalhes técnicos.

1. **Repository**: Abstração do Prisma ORM.
2. **Strategy**: Pagamentos, Autenticação, Notificações.
3. **Adapter**: Integração com sistemas legados (e.g., Gateways de Pagamento).
4. **Observer/Event-Bus**: Desacoplamento de módulos via eventos.
5. **Decorator**: Funcionalidades transversais (Auditoria, Cache).
6. **Command**: Encapsulamento de ações complexas (Transações).
7. **Memento**: Gestão de histórico e snapshots (Configurações).
8. **Chain of Responsibility**: Pipelines de middleware.
9. **Prototype**: Clonagem de estruturas complexas (Templates de Produtos).

### Padrões de Frontend

- **Compound Components**: UI flexível (`GlassDropdown`).
- **Container/Presenter**: Separação de Lógica e View (`AclForm` vs `AclFormView`).
- **Custom Hooks**: Reutilização de lógica (`usePermission`).

---

## 🛠 Fluxo de Desenvolvimento

### Criando uma Nova Feature

1. **Defina o Modelo**: Atualize `schema.prisma`.
2. **Crie o Repository**: Estenda `AbstractRepository` em `src/lib/repositories`.
3. **Defina Eventos**: Registre novos eventos em `src/lib/events`.
4. **Implemente a UI**:
   - Use componentes `Glass*` em `src/components/ui/futuristic`.
   - Separe Container e Presenter se a lógica for complexa.
5. **Adicione Permissões**: Atualize `ability.ts` ou políticas ABAC.

### Testes

- Execute testes unitários para patterns e services:
  ```bash
  npx jest apps/web/src/lib/patterns/__tests__
  ```

---

## 🔒 Segurança

- **RBAC**: Controle baseado em Roles (ADMIN, MANAGER, USER).
- **ABAC**: Controle baseado em Atributos (Time, IP, Location).
- **Audit**: Todas as ações críticas são logadas automaticamente via Decorators ou Event Listeners.

---

## 🚀 Deployment

O projeto está configurado para deploy em ambientes Node.js ou Vercel.
Certifique-se de configurar as variáveis de ambiente essenciais: `DATABASE_URL`, `NEXTAuth_SECRET`, etc.

---

**Equipe MorinaLight**
_Construindo o futuro, hoje._
