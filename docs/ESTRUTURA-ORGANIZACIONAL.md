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
   - tenant
   - filial
   - departamento/setor
   - cargo
   - perfis de acesso

9. Definir **políticas de workflow** (quem aprova o quê, em qual ordem)
10. Configurar **segmentos de negócio ativos** para o tenant (infantil, EPI, etc.)

Isso garante que qualquer tela, qualquer API, qualquer ação no ERP esteja **contextualizada**.

---

## 3. Modelo de Dados – Entidades e Campos

Vou assumir tipos em um estilo genérico (pense Postgres):

- `uuid`
- `text`
- `varchar(…)`
- `integer`
- `boolean`
- `timestamp`
- `jsonb`

### 3.1 `tenant` – Empresa / Grupo

Representa o dono do ambiente.

**Tabela: `tenants`**

- `id` (uuid, PK)
- `nome_fantasia` (varchar(255), NOT NULL)
- `razao_social` (varchar(255), NOT NULL)
- `cnpj` (varchar(18), UNIQUE, nullable se exterior)
- `inscricao_estadual` (varchar(20), nullable)
- `pais` (varchar(2), ISO)
- `moeda_padrao` (varchar(3), ISO currency)
- `regime_tributario` (varchar(50)) – simples, presumido, real, etc.
- `segmentos_ativos` (jsonb) – ex: `["INFANTIL","UNIFORME","EPI"]`
- `plano` (varchar(50)) – plano do ERP, se SaaS
- `ativo` (boolean, default true)
- `data_criacao` (timestamp)
- `data_ativacao` (timestamp)
- `data_encerramento` (timestamp, nullable)
- `config_org` (jsonb) – configs avançadas (ex: uso de times, hierarquia extra)

---

### 3.2 `filial` – Unidade (fábrica, loja, CD)

**Tabela: `filiais`**

- `id` (uuid, PK)
- `tenant_id` (uuid, FK -> tenants.id)
- `nome` (varchar(255))
- `tipo` (varchar(50)) – `FABRICA`, `LOJA`, `CD`, `ESCRITORIO`
- `codigo_interno` (varchar(20))
- `cnpj` (varchar(18), nullable)
- `inscricao_estadual` (varchar(20), nullable)
- `endereco` (jsonb) – logradouro, numero, bairro, cidade, uf, cep
- `telefone` (varchar(20))
- `email` (varchar(255))
- `ativo` (boolean, default true)
- `data_criacao` (timestamp)

---

### 3.3 `departamento` – Unidade Funcional

**Tabela: `departamentos`**

- `id` (uuid, PK)
- `tenant_id` (uuid, FK → tenants.id)
- `nome` (varchar(255), NOT NULL)
- `descricao` (text, nullable)
- `gerente_id` (uuid, FK → usuarios.id, nullable)
- `ativo` (boolean, default true)
- `data_criacao` (timestamp)
- `deletado_em` (timestamp, nullable) – soft delete

---

### 3.4 `setor` – Subdivisão do Departamento

**Tabela: `setores`**

- `id` (uuid, PK)
- `departamento_id` (uuid, FK → departamentos.id)
- `nome` (varchar(255), NOT NULL)
- `descricao` (text, nullable)
- `responsavel_id` (uuid, FK → usuarios.id, nullable)
- `ativo` (boolean, default true)
- `data_criacao` (timestamp)
- `deletado_em` (timestamp, nullable)

---

### 3.5 `cargo` – Função / Posição

**Tabela: `cargos`**

- `id` (uuid, PK)
- `tenant_id` (uuid, FK → tenants.id)
- `titulo` (varchar(255), NOT NULL)
- `descricao` (text, nullable)
- `salario_minimo` (numeric, nullable)
- `salario_maximo` (numeric, nullable)
- `ativo` (boolean, default true)
- `data_criacao` (timestamp)
- `deletado_em` (timestamp, nullable)

---

### 3.6 `perfil_acesso` (Role)

**Tabela: `perfis_acesso`**

- `id` (uuid, PK)
- `tenant_id` (uuid, FK → tenants.id)
- `nome` (varchar(255), NOT NULL) – ex: "Gerente", "Operador"
- `descricao` (text, nullable)
- `herdavel` (boolean, default false) – se herda permissões de outro perfil
- `ativo` (boolean, default true)
- `data_criacao` (timestamp)
- `deletado_em` (timestamp, nullable)

---

### 3.7 `permissao` – Recurso + Ação

**Tabela: `permissoes`**

- `id` (uuid, PK)
- `recurso` (varchar(100), NOT NULL) – ex: `crm.lead`, `pedido.criar`
- `acao` (varchar(50), NOT NULL) – ex: `view`, `create`, `edit`, `delete`
- `descricao` (text, nullable)
- `critico` (boolean, default false) – requer aprovação?
- `data_criacao` (timestamp)

**Tabela de ligação: `perfis_permissoes`**

- `id` (uuid, PK)
- `perfil_id` (uuid, FK → perfis_acesso.id)
- `permissao_id` (uuid, FK → permissoes.id)
- `data_atribuicao` (timestamp)

---

### 3.8 `usuario` – Pessoa / Account

**Tabela: `usuarios`**

- `id` (uuid, PK)
- `tenant_id` (uuid, FK → tenants.id)
- `email` (varchar(255), NOT NULL, UNIQUE per tenant)
- `cpf` (varchar(14), nullable, UNIQUE globally)
- `nome_completo` (varchar(255), NOT NULL)
- `cargo_id` (uuid, FK → cargos.id, nullable)
- `filial_id` (uuid, FK → filiais.id, nullable)
- `status` (varchar(50)) – `ATIVO`, `INATIVO`, `SUSPENSO`
- `data_nascimento` (date, nullable)
- `telefone` (varchar(20), nullable)
- `ativo` (boolean, default true)
- `ultimo_acesso` (timestamp, nullable)
- `data_criacao` (timestamp)
- `criado_por` (uuid, FK → usuarios.id)
- `deletado_em` (timestamp, nullable)

**Tabela de ligação: `usuarios_perfis`**

- `id` (uuid, PK)
- `usuario_id` (uuid, FK → usuarios.id)
- `perfil_id` (uuid, FK → perfis_acesso.id)
- `data_atribuicao` (timestamp)
- UNIQUE(usuario_id, perfil_id)

**Tabela de ligação: `usuarios_setores`**

- `id` (uuid, PK)
- `usuario_id` (uuid, FK → usuarios.id)
- `setor_id` (uuid, FK → setores.id)
- `ativo` (boolean, default true)
- `data_atribuicao` (timestamp)
- UNIQUE(usuario_id, setor_id)

---

### 3.9 `segmento_negocio`

**Tabela: `segmentos_negocio`**

- `id` (uuid, PK)
- `nome` (varchar(100), NOT NULL, UNIQUE) – ex: `INFANTIL`, `UNIFORME`, `EPI`
- `descricao` (text, nullable)
- `ativo` (boolean, default true)

**Tabela: `tenants_segmentos`**

- `id` (uuid, PK)
- `tenant_id` (uuid, FK → tenants.id)
- `segmento_id` (uuid, FK → segmentos_negocio.id)
- `regras_especiais` (jsonb) – ex: `{"requer_certificacao": true}`
- `ativo` (boolean, default true)
- `data_ativacao` (timestamp)
- UNIQUE(tenant_id, segmento_id)

---

### 3.10 `politica_workflow`

**Tabela: `politicas_workflow`**

- `id` (uuid, PK)
- `tenant_id` (uuid, FK → tenants.id)
- `nome` (varchar(255), NOT NULL)
- `recurso` (varchar(100), NOT NULL) – ex: `pedido`, `orcamento`
- `acao` (varchar(50), NOT NULL) – ex: `criar`, `aprovar`
- `ordem_aprovacao` (jsonb) – array de `{perfil_id, opcional: bool}`
- `ativo` (boolean, default true)
- `data_criacao` (timestamp)

---

## 4. Relacionamentos ER (Diagrama Mental)

```plaintext
tenants (1) ──── (n) filiais
tenants (1) ──── (n) departamentos
tenants (1) ──── (n) cargos
tenants (1) ──── (n) perfis_acesso
tenants (1) ──── (n) usuarios
tenants (1) ──── (n) politicas_workflow

departamentos (1) ──── (n) setores
setores (1) ──── (n) usuarios_setores ──── (n) usuarios

usuarios (1) ──── (n) usuarios_perfis ──── (n) perfis_acesso
perfis_acesso (1) ──── (n) perfis_permissoes ──── (n) permissoes

segmentos_negocio (1) ──── (n) tenants_segmentos ──── (n) tenants
```

---

## 5. Eventos de Domínio – Organização

- `TenantCreated`
- `FilialCreated`
- `DepartamentoCreated`
- `UserCreated`
- `UserRoleAssigned`
- `UserDeactivated`
- `WorkflowPolicyUpdated`

---

## 6. Índices Críticos (Performance)

```sql
CREATE INDEX idx_usuarios_tenant ON usuarios(tenant_id);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_filiais_tenant ON filiais(tenant_id);
CREATE INDEX idx_departamentos_tenant ON departamentos(tenant_id);
CREATE INDEX idx_setores_departamento ON setores(departamento_id);
CREATE INDEX idx_usuarios_perfis ON usuarios_perfis(usuario_id);
CREATE INDEX idx_perfis_permissoes ON perfis_permissoes(perfil_id);
```

## 6. APIs – Endpoints REST desse domínio

Sugestão de namespace: `/api/org/*`

### 6.1 Tenants

- `GET /api/org/tenants` – lista
- `GET /api/org/tenants/:id`
- `POST /api/org/tenants`
- `PUT /api/org/tenants/:id`
- `DELETE /api/org/tenants/:id` (normalmente soft delete)

### 6.2 Filiais

- `GET /api/org/filiais`
- `GET /api/org/filiais/:id`
- `POST /api/org/filiais`
- `PUT /api/org/filiais/:id`
- `DELETE /api/org/filiais/:id`

### 6.3 Departamentos

- `GET /api/org/departamentos`
- `POST /api/org/departamentos`
- `PUT /api/org/departamentos/:id`

### 6.4 Setores

- `GET /api/org/setores`
- `POST /api/org/setores`
- `PUT /api/org/setores/:id`

### 6.5 Cargos

- `GET /api/org/cargos`
- `POST /api/org/cargos`
- `PUT /api/org/cargos/:id`

### 6.6 Perfis & Permissões

- `GET /api/org/perfis`
- `POST /api/org/perfis`
- `PUT /api/org/perfis/:id`
- `GET /api/org/permissoes`
- `POST /api/org/perfis/:id/permissoes` (atribuir lista de permissões)

### 6.7 Usuários

- `GET /api/org/usuarios`
- `GET /api/org/usuarios/:id`
- `POST /api/org/usuarios`
- `PUT /api/org/usuarios/:id`
- `PATCH /api/org/usuarios/:id/desativar`
- `PATCH /api/org/usuarios/:id/perfis`
- `PATCH /api/org/usuarios/:id/setores`

### 6.8 Segmentos & Workflow

- `GET /api/org/segmentos`
- `POST /api/org/tenants/:tenantId/segmentos` (ativar/desativar)
- `GET /api/org/workflows`
- `POST /api/org/workflows`
- `PUT /api/org/workflows/:id`

---

## 7. Regras de negócio invariantes (se violar, deu merda)

1. **Todo registro tem `tenant_id`**, SEM exceção (multi-tenant de verdade).
2. Usuário **não escolhe `tenant_id` no payload** – vem do token/contexto.
3. Nenhuma ação de negócio (CRM, Pedido, CLM etc.) pode existir sem:
   - `tenant_id`
   - `usuario_id` válido
   - relacionamento com filial/departamento/setor coerente

4. Não pode existir:
   - `setor` órfão (sem `departamento`)
   - `departamento` órfão (sem `tenant`)
   - `usuario` sem **pelo menos um perfil**

5. Toda permissão deve ser inferida de `perfil` + `permissoes`, nunca “no braço” em usuário.

Se você perceber no seu código:

- “permiteAcesso = true/false” direto no usuário
  → está saindo do trilho.

---

## 8. IA / Automação dentro desse domínio

Esse domínio é perfeito para:

- Analisar excesso de privilégios
- Sugerir cargos/perfis com base no histórico de ações
- Detectar usuário com risco (ex.: mesmo usuário com acesso a financeiro + TI + CLM)
- Sugerir estrutura padrão de departamentos/setores por segmento (ex.: empresa de EPI sempre com Jurídico/CLM mais forte)

---

## 9. Métricas e Dashboards desse domínio

### Para Gestor de TI / Admin

- nº usuários ativos por filial
- nº usuários sem login nos últimos X dias
- nº permissões críticas por usuário
- mapa de estrutura: árvore tenant → filiais → departamentos → setores

### Para CEO

- visão consolidada: quantas filiais ativas, quantos departamentos/setores operando, quantos usuários por área.

---

## 10. Dica de Estrutura de Código (Nest.js)

Sugestão de módulo:

`/backend/services/org-service/src`

- `org.module.ts`
- `controllers/`
  - `tenants.controller.ts`
  - `filiais.controller.ts`
  - `departamentos.controller.ts`
  - `setores.controller.ts`
  - `usuarios.controller.ts`
  - `perfis.controller.ts`

- `services/`
  - `tenants.service.ts`
  - `filiais.service.ts`
  - `usuarios.service.ts`
  - `perfis.service.ts`

- `entities/`
  - `tenant.entity.ts`
  - `filial.entity.ts`
  - `departamento.entity.ts`
  - `setor.entity.ts`
  - `usuario.entity.ts`
  - `perfil.entity.ts`
  - `permissao.entity.ts`

- `events/`
  - `user-created.event.ts`
  - `tenant-created.event.ts`

- `dto/`
  - `create-usuario.dto.ts`
  - `update-usuario.dto.ts`
  - etc.

---
