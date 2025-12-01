# Revisão da Arquitetura do Sistema

## 1. Estrutura Organizacional e Usuários

### Estado Atual
- **Modelos:** `User`, `Organization`, `OrganizationMembership`.
- **Hierarquia:** `Department` -> `Sector` -> `Position`.
- **Relacionamentos:** Usuários podem pertencer a múltiplos níveis (departamento, setor, cargo) através de tabelas de membership específicas (`DepartmentMembership`, etc.).

### Análise
A estrutura é robusta e permite uma modelagem fiel de organogramas complexos. A separação entre a associação à organização (`OrganizationMembership`) e a posição na hierarquia (`PositionMembership`) é excelente para flexibilidade.

### Pontos de Atenção
- **Complexidade:** A gestão de tantos níveis de associação pode tornar as queries de permissão pesadas.
- **Onboarding:** Não há um campo explícito para "Aceite de Termos" no modelo de `User` ou `OrganizationMembership`. Recomendo adicionar `termsAcceptedAt` e `termsVersion` para rastreabilidade jurídica, conforme solicitado na regra de negócio.

## 2. Permissões e RBAC

### Estado Atual
- **Modelos:** `PositionPermission`, `SectorPermission`, `DepartmentPermission`.
- **Mecanismo:** Permissões são atribuídas a cargos, setores ou departamentos.
- **Definição:** O campo `permissionId` é uma `String`, sugerindo que as permissões são definidas via código (hardcoded strings) ou em um serviço externo, pois não há uma tabela `Permission` no schema.

### Recomendações
1.  **Tabela de Permissões:** Criar um model `Permission` para listar todas as permissões disponíveis no sistema (ex: `name`, `description`, `group`). Isso facilita a gestão e a criação de interfaces de administração de roles.
2.  **Herança:** O sistema deve definir claramente a regra de precedência. Se um usuário tem permissão negada no Setor mas concedida no Cargo, qual prevalece? (Geralmente a mais específica vence).
3.  **Cache:** Devido à granularidade, o cálculo de permissões em tempo real pode ser custoso. Implementar cache de permissões na sessão do usuário (`auth-client.ts` já prepara o terreno para isso).

## 3. Autenticação e Segurança

### Estado Atual
- **Auth:** JWT via `auth-client.ts` e `auth.ts`.
- **Sessão:** Armazena token, user e organizações.

### Melhorias Necessárias
- **MFA:** Não identificado suporte a Múltiplo Fator de Autenticação no schema. Para um sistema financeiro/comissões, é altamente recomendado.
- **Logs de Auditoria:** `OrganizationAuditLog` e outros logs de auditoria existem, o que é ótimo. Garantir que o IP e User Agent sejam capturados em todas as ações críticas (login, contestação, alteração de comissão).

## 4. Próximos Passos Sugeridos

1.  **Migration:** Adicionar campos de aceite de termos (`termsAcceptedAt`, `termsVersion`) no `User`.
2.  **Migration:** Criar model `Permission` para centralizar as definições.
3.  **Backend:** Implementar middleware de resolução de permissões que considere a hierarquia (Org -> Dept -> Setor -> Cargo).
4.  **Frontend:** Criar tela de "Meus Termos" onde o usuário pode ver o que aceitou.
