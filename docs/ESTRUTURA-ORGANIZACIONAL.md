
---


## 1. Visão do Domínio – Organização & Acesso

Objetivo deste domínio:

* Representar **quem é a empresa (tenant)**
* Como ela se divide (**filiais, departamentos, setores, times**)
* Quem são as pessoas (**usuários, cargos, perfis**),
* O que cada um pode ou não fazer (**permissões e workflows**),
* E como isso muda por **segmento de negócio** (infantil, adulto, uniforme, EPI).

Nada no sistema existe fora desse contexto. Tudo referencia `tenant_id`.

---

## 2. Processo de alto nível (fluxo organizacional)

Em texto direto:

1. **Criar Tenant (Empresa)**
2. Cadastrar **filiais**
3. Definir **departamentos** da empresa
4. Detalhar **setores** dentro de cada departamento
5. Cadastrar **cargos**
6. Criar **perfis de acesso (roles)**
7. Definir **permissões por perfil**
8. Cadastrar **usuários** e atribuir:

   * tenant
   * filial
   * departamento/setor
   * cargo
   * perfis de acesso
9. Definir **políticas de workflow** (quem aprova o quê, em qual ordem)
10. Configurar **segmentos de negócio ativos** para o tenant (infantil, EPI, etc.)

Isso garante que qualquer tela, qualquer API, qualquer ação no ERP esteja **contextualizada**.

---

## 3. Modelo de Dados – Entidades e Campos

Vou assumir tipos em um estilo genérico (pense Postgres):

* `uuid`
* `text`
* `varchar(…)`
* `integer`
* `boolean`
* `timestamp`
* `jsonb`

### 3.1 `tenant` – Empresa / Grupo

Representa o dono do ambiente.

**Tabela: `tenants`**

* `id` (uuid, PK)
* `nome_fantasia` (varchar(255), NOT NULL)
* `razao_social` (varchar(255), NOT NULL)
* `cnpj` (varchar(18), UNIQUE, nullable se exterior)
* `inscricao_estadual` (varchar(20), nullable)
* `pais` (varchar(2), ISO)
* `moeda_padrao` (varchar(3), ISO currency)
* `regime_tributario` (varchar(50)) – simples, presumido, real, etc.
* `segmentos_ativos` (jsonb) – ex: `["INFANTIL","UNIFORME","EPI"]`
* `plano` (varchar(50)) – plano do ERP, se SaaS
* `ativo` (boolean, default true)
* `data_criacao` (timestamp)
* `data_ativacao` (timestamp)
* `data_encerramento` (timestamp, nullable)
* `config_org` (jsonb) – configs avançadas (ex: uso de times, hierarquia extra)

---

### 3.2 `filial` – Unidade (fábrica, loja, CD)

**Tabela: `filiais`**

* `id` (uuid, PK)
* `tenant_id` (uuid, FK -> tenants.id)
* `nome` (varchar(255))
* `tipo` (varchar(50)) – `FABRICA`, `LOJA`, `CD`, `ESCRITORIO`
* `codigo_interno` (varchar(20))
* `cnpj` (varchar(18), nullable)
* `inscricao_estadual` (varchar(20), nullable)
* `endereco` (jsonb) – logradouro, numero, bairro, cidade, uf, cep
* `telefone` (varchar(20))
* `email` (varchar(255))
* `ativo` (boolean, default true)
* `data_criacao` (timestamp)

---

### 3.3 `departamento`

Macro unidade funcional.

**Tabela: `departamentos`**

* `id` (uuid, PK)
* `tenant_id` (uuid, FK)
* `filial_id` (uuid, FK, nullable) – pode ser global ou específico da filial
* `nome` (varchar(100)) – `COMERCIAL`, `JURIDICO`, `PCP`, `PRODUCAO`, etc.
* `codigo` (varchar(20))
* `descricao` (text)
* `tipo` (varchar(50)) – para agrupar: `CORE`, `SUPORTE`, `GESTAO`
* `ativo` (boolean, default true)
* `ordem_exibicao` (integer) – para UI, sidebar, dashboards

---

### 3.4 `setor`

Subdivisão do departamento. Ex.: Corte, Costura, CLM, CRM, PDV.

**Tabela: `setores`**

* `id` (uuid, PK)
* `tenant_id` (uuid, FK)
* `departamento_id` (uuid, FK -> departamentos.id)
* `filial_id` (uuid, FK -> filiais.id, nullable)
* `nome` (varchar(100)) – ex.: `CORTE`, `COSTURA`, `CLM`, `CRM`, `PDV`
* `codigo` (varchar(20))
* `descricao` (text)
* `tipo_setor` (varchar(50)) – `OPERACIONAL`, `GESTAO`, `ANALITICO`
* `ativo` (boolean, default true)
* `ordem_exibicao` (integer)

---

### 3.5 `cargo`

Função ocupada por usuário.

**Tabela: `cargos`**

* `id` (uuid, PK)
* `tenant_id` (uuid, FK)
* `nome` (varchar(100)) – ex.: “Gestor Comercial”, “Operador Corte”
* `codigo` (varchar(20))
* `descricao` (text)
* `senioridade` (varchar(50)) – `JUNIOR`, `PLENO`, `SENIOR`
* `salario_base` (numeric, nullable – opcional se integrar RH)
* `ativo` (boolean)

---

### 3.6 `perfil_acesso` (role)

**Tabela: `perfis_acesso`**

* `id` (uuid, PK)
* `tenant_id` (uuid, FK)
* `nome` (varchar(100)) – `ADMIN`, `GESTOR_COMERCIAL`, `OPERADOR_PDV`
* `codigo` (varchar(50))
* `descricao` (text)
* `escopo` (varchar(50)) – `GLOBAL`, `FILIAL`, `DEPARTAMENTO`, `SETOR`
* `ativo` (boolean)

---

### 3.7 `permissao`

Pode ser granular (tipo `crm.lead.view`, `crm.lead.edit`).

**Tabela: `permissoes`**

* `id` (uuid, PK)
* `codigo` (varchar(100), UNIQUE) – ex.: `CRM_LEAD_VIEW`
* `nome` (varchar(150))
* `descricao` (text)
* `modulo` (varchar(50)) – `CRM`, `CLM`, `PCP`, `PDV`, etc.
* `nivel` (varchar(50)) – `READ`, `WRITE`, `ADMIN`

**Tabela de ligação: `perfis_permissoes`**

* `perfil_id` (uuid, FK -> perfis_acesso.id)
* `permissao_id` (uuid, FK -> permissoes.id)
* PK composta (`perfil_id`, `permissao_id`)

---

### 3.8 `usuario`

**Tabela: `usuarios`**

* `id` (uuid, PK)
* `tenant_id` (uuid, FK)
* `nome` (varchar(150))
* `email` (varchar(255), UNIQUE dentro do tenant)
* `senha_hash` (varchar(255))
* `telefone` (varchar(20))
* `cargo_id` (uuid, FK -> cargos.id)
* `filial_id` (uuid, FK -> filiais.id, default principal)
* `ativo` (boolean)
* `ultimo_login` (timestamp)
* `data_criacao` (timestamp)

**Ligação usuários ↔ perfis**

Tabela: `usuarios_perfis`

* `usuario_id` (uuid, FK -> usuarios.id)
* `perfil_id` (uuid, FK -> perfis_acesso.id)
* PK composta

**Ligação usuários ↔ setores (atribuição funcional)**

Tabela: `usuarios_setores`

* `usuario_id` (uuid, FK)
* `setor_id` (uuid, FK)
* PK composta

---

### 3.9 `segmento_negocio` e `config_segmento`

**Tabela: `segmentos_negocio`**

* `id` (uuid, PK)
* `codigo` (varchar(50)) – `INFANTIL`, `ADULTO`, `UNIFORME`, `EPI`
* `descricao` (text)
* `ativo` (boolean)

**Tabela: `tenants_segmentos`**

* `tenant_id` (uuid, FK)
* `segmento_id` (uuid, FK)
* `configuracao` (jsonb) – regras específicas do segmento (ex.: obrigatoriedade de certificações em EPI)
* PK composta

---

### 3.10 `politica_workflow` (aprovadores, regras)

**Tabela: `politicas_workflow`**

* `id` (uuid, PK)
* `tenant_id` (uuid)
* `modulo` (varchar(50)) – `CRM`, `PRE_VENDA`, `CLM`, `PCP`, etc.
* `tipo_fluxo` (varchar(50)) – `APROVACAO_PROPOSTA`, `APROVACAO_CONTRATO`
* `config` (jsonb) – DSL com etapas, aprovadores (perfil/cargo/setor)
* `ativo` (boolean)

---

## 4. Relacionamentos ER (resumidos)

Em texto direto:

* `tenant` 1–N `filiais`
* `tenant` 1–N `departamentos`
* `departamento` 1–N `setores`
* `tenant` 1–N `cargos`
* `tenant` 1–N `usuarios`
* `usuario` N–N `perfis_acesso`
* `perfil_acesso` N–N `permissoes`
* `usuario` N–N `setores`
* `tenant` N–N `segmentos_negocio`
* `tenant` 1–N `politicas_workflow`

Se algo que você está criando não encaixa nessas ligações: **sinal de fumaça**.

---

## 5. Eventos de Domínio – Organização

### 5.1 Lista de eventos essenciais

* `TenantCreated`
* `TenantUpdated`
* `FilialCreated`
* `DepartamentoCreated`
* `SetorCreated`
* `CargoCreated`
* `UserCreated`
* `UserDeactivated`
* `UserRoleChanged`
* `WorkflowPolicyUpdated`
* `TenantSegmentsUpdated`

### 5.2 Exemplo de payload – `UserCreated`

```json
{
  "event_name": "UserCreated",
  "tenant_id": "TENANT_123",
  "aggregate_id": "USER_456",
  "timestamp": "2025-12-01T14:00:00Z",
  "data": {
    "usuario_id": "USER_456",
    "nome": "João Silva",
    "email": "joao@empresa.com",
    "cargo_id": "CARGO_GESTOR_COMERCIAL",
    "filial_id": "FILIAL_SP",
    "perfis": ["GESTOR_COMERCIAL"],
    "setores": ["CRM", "PRE_VENDA"],
    "ativo": true
  },
  "metadata": {
    "executado_por": "USER_ADMIN_1",
    "source": "admin_panel"
  }
}
```

---

## 6. APIs – Endpoints REST desse domínio

Sugestão de namespace: `/api/org/*`

### 6.1 Tenants

* `GET /api/org/tenants` – lista
* `GET /api/org/tenants/:id`
* `POST /api/org/tenants`
* `PUT /api/org/tenants/:id`
* `DELETE /api/org/tenants/:id` (normalmente soft delete)

### 6.2 Filiais

* `GET /api/org/filiais`
* `GET /api/org/filiais/:id`
* `POST /api/org/filiais`
* `PUT /api/org/filiais/:id`
* `DELETE /api/org/filiais/:id`

### 6.3 Departamentos

* `GET /api/org/departamentos`
* `POST /api/org/departamentos`
* `PUT /api/org/departamentos/:id`

### 6.4 Setores

* `GET /api/org/setores`
* `POST /api/org/setores`
* `PUT /api/org/setores/:id`

### 6.5 Cargos

* `GET /api/org/cargos`
* `POST /api/org/cargos`
* `PUT /api/org/cargos/:id`

### 6.6 Perfis & Permissões

* `GET /api/org/perfis`
* `POST /api/org/perfis`
* `PUT /api/org/perfis/:id`
* `GET /api/org/permissoes`
* `POST /api/org/perfis/:id/permissoes` (atribuir lista de permissões)

### 6.7 Usuários

* `GET /api/org/usuarios`
* `GET /api/org/usuarios/:id`
* `POST /api/org/usuarios`
* `PUT /api/org/usuarios/:id`
* `PATCH /api/org/usuarios/:id/desativar`
* `PATCH /api/org/usuarios/:id/perfis`
* `PATCH /api/org/usuarios/:id/setores`

### 6.8 Segmentos & Workflow

* `GET /api/org/segmentos`
* `POST /api/org/tenants/:tenantId/segmentos` (ativar/desativar)
* `GET /api/org/workflows`
* `POST /api/org/workflows`
* `PUT /api/org/workflows/:id`

---

## 7. Regras de negócio invariantes (se violar, deu merda)

1. **Todo registro tem `tenant_id`**, SEM exceção (multi-tenant de verdade).
2. Usuário **não escolhe `tenant_id` no payload** – vem do token/contexto.
3. Nenhuma ação de negócio (CRM, Pedido, CLM etc.) pode existir sem:

   * `tenant_id`
   * `usuario_id` válido
   * relacionamento com filial/departamento/setor coerente
4. Não pode existir:

   * `setor` órfão (sem `departamento`)
   * `departamento` órfão (sem `tenant`)
   * `usuario` sem **pelo menos um perfil**
5. Toda permissão deve ser inferida de `perfil` + `permissoes`, nunca “no braço” em usuário.

Se você perceber no seu código:

* “permiteAcesso = true/false” direto no usuário
  → está saindo do trilho.

---

## 8. IA / Automação dentro desse domínio

Esse domínio é perfeito para:

* Analisar excesso de privilégios
* Sugerir cargos/perfis com base no histórico de ações
* Detectar usuário com risco (ex.: mesmo usuário com acesso a financeiro + TI + CLM)
* Sugerir estrutura padrão de departamentos/setores por segmento (ex.: empresa de EPI sempre com Jurídico/CLM mais forte)

---

## 9. Métricas e Dashboards desse domínio

### Para Gestor de TI / Admin

* nº usuários ativos por filial
* nº usuários sem login nos últimos X dias
* nº permissões críticas por usuário
* mapa de estrutura: árvore tenant → filiais → departamentos → setores

### Para CEO

* visão consolidada: quantas filiais ativas, quantos departamentos/setores operando, quantos usuários por área.

---

## 10. Dica de Estrutura de Código (Nest.js)

Sugestão de módulo:

`/backend/services/org-service/src`

* `org.module.ts`
* `controllers/`

  * `tenants.controller.ts`
  * `filiais.controller.ts`
  * `departamentos.controller.ts`
  * `setores.controller.ts`
  * `usuarios.controller.ts`
  * `perfis.controller.ts`
* `services/`

  * `tenants.service.ts`
  * `filiais.service.ts`
  * `usuarios.service.ts`
  * `perfis.service.ts`
* `entities/`

  * `tenant.entity.ts`
  * `filial.entity.ts`
  * `departamento.entity.ts`
  * `setor.entity.ts`
  * `usuario.entity.ts`
  * `perfil.entity.ts`
  * `permissao.entity.ts`
* `events/`

  * `user-created.event.ts`
  * `tenant-created.event.ts`
* `dto/`

  * `create-usuario.dto.ts`
  * `update-usuario.dto.ts`
  * etc.

---


