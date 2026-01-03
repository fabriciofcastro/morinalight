# Diretrizes Estratégicas – Administração, Segurança e UX

## Visão Geral

Este documento consolida **todas as decisões, diretrizes e regras supremas** discutidas para o projeto, com foco em telas sidebar **Administração, Segurança (RBAC + ABAC), UX, Design System e Governança Técnica**.

O objetivo é simples e corporativo: **transformar o sistema em um produto enterprise, escalável, auditável e profissional**.

---

## 1. Princípios Supremos de Execução

### 1.1 Modelo de Trabalho

- **Uma missão = UMA task**
- Todos os ajustes, refactors e melhorias **devem acontecer dentro da mesma task**
- Criar múltiplas tasks para a mesma missão é **proibido**
- Governança > velocidade aparente

### 1.2 Regra de Ouro do Sistema

- Sem **telas primordiais funcionando**, **não existe sistema**
- Estabilidade funcional sempre vem antes de estética

### 1.3 Regra de Evolução

- **Melhorar o que já existe**
- **Nunca refazer do zero**, salvo impossibilidade técnica comprovada
- Regressões sem consulta são **inadmissíveis**

## 3. Padronização de Rotas

Todas as telas de cadastro devem seguir **obrigatoriamente**:

```
/branches
/branches/list
/branches/new
```

Aplica-se a:

- Usuários
- Perfis
- Fornecedores
- Produtos
- Clientes
- Estoque
- Qualquer entidade CRUD

---

## 4. Segurança & Controle de Acesso (RBAC + ABAC)

### 4.1 Decisão Arquitetural

- **Não unificar tudo em uma única tela**
- Agrupar conceitualmente em um **módulo de Segurança & Acesso**
- Separação garante escalabilidade, auditoria e clareza

---

### 4.2 Telas e Responsabilidades

#### 4.2.1 Perfis de Acesso

- Representam **quem o usuário é no sistema**
- Ex: Admin, Gestor, Operador, Auditor
- Vínculo direto com RBAC

#### 4.2.2 Permissões

- Ações atômicas do sistema
- Ex: `user.create`, `stock.adjust`, `order.approve`
- Base técnica de todo o controle de acesso

#### 4.2.3 Matriz de Permissões

- Visão operacional (Perfil × Permissão)
- Edição em massa
- Auditoria visual clara

#### 4.2.4 RBAC & Aprovações

- Hierarquia de decisões
- Fluxos de aprovação
- Delegações temporárias
- Aprovação por valor, impacto ou risco

#### 4.2.5 ABAC (Attribute-Based Access Control)

- Camada contextual de segurança
- Usa atributos como:
  - Usuário (cargo, setor)
  - Recurso (estado, tipo)
  - Ambiente (horário, filial)

**ABAC complementa o RBAC. Nunca substitui.**

---

### 4.3 Fluxo Correto de Autorização

```
Usuário
 → Perfil (RBAC)
 → Permissões
 → Matriz
 → Aprovação
 → ABAC (restrições finais)
```

---

## 5. UX / UI – Lei Suprema

### 5.1 Regras Obrigatórias

- Todos os elementos clicáveis **devem usar cursor-pointer**
- Estados visuais claros: hover, active, disabled
- UX não é opcional

### 5.2 Background Animado

- **Cada tela deve ter um background animado único**
- Referência: tela de login
- Animações devem ser:
  - único para cada tela



---

## 6. Core do Sistema – Estrutura Organizacional (FOCO PRINCIPAL)

### 6.0 Princípio Estratégico do Core

O **core do sistema** é a **estrutura organizacional e administrativa**. Nada de módulos periféricos antes disso.

Tudo que está no **Sidebar → Administração** constitui a **base estrutural** sobre a qual todo o ERP opera.

Sem essas telas completas, integradas e estáveis, **o sistema é incompleto**.

---

### 6.1 Telas Core do Sidebar – Administração

As telas abaixo **devem ser implementadas, refatoradas e detalhadas no plano**, seguindo rigorosamente o checklist por tela e documentando reaproveitamentos do projeto `erp-textil`.

---

#### 6.1.1 Empresa
- Objetivo: Entidade raiz do sistema
- Funcionalidades:
  - Dados legais
  - Configurações globais
  - Multi-empresa (preparação futura)
- Reaproveitamento esperado (erp-textil):
  - Estrutura de formulário
  - Validações

---

#### 6.1.2 Filiais
- Objetivo: Separação operacional
- Funcionalidades:
  - Vínculo com empresa
  - Endereço, status, timezone
- Reaproveitamento esperado:
  - Layout de listagem
  - Padrão de filtros

---

#### 6.1.3 Departamentos
- Objetivo: Organização macro
- Funcionalidades:
  - Vínculo com filial
  - Hierarquia simples
- Reaproveitamento esperado:
  - Tabela administrativa

---

#### 6.1.4 Setores
- Objetivo: Organização operacional
- Funcionalidades:
  - Vínculo com departamento
  - Regras para ABAC
- Reaproveitamento esperado:
  - Componentes de seleção encadeada

---

#### 6.1.5 Cargos
- Objetivo: Estrutura funcional
- Funcionalidades:
  - Vínculo com setor
  - Base para ABAC e permissões
- Reaproveitamento esperado:
  - Formulários avançados

---

#### 6.1.6 Fornecedores
- Objetivo: Cadeia de suprimentos
- Funcionalidades:
  - Dados fiscais
  - Categorias
  - Status
- Reaproveitamento esperado:
  - UX de cadastro

---

#### 6.1.7 Usuários
- Objetivo: Pessoas do sistema
- Funcionalidades:
  - Vínculo organizacional (empresa → filial → setor → cargo)
  - Upload de currículo (PDF/DOCX)
  - Perfis de acesso
- Reaproveitamento esperado:
  - Tela de usuário completa do erp-textil

---

#### 6.1.8 Perfis de Acesso
- Objetivo: Papel do usuário
- Funcionalidades:
  - Associação com permissões
- Reaproveitamento esperado:
  - Estrutura RBAC existente

---

#### 6.1.9 Permissões
- Objetivo: Ações do sistema
- Funcionalidades:
  - CRUD de permissões
- Reaproveitamento esperado:
  - Modelo de dados

---

#### 6.1.10 Matriz de Permissões
- Objetivo: Visão administrativa
- Funcionalidades:
  - Perfil × Permissão
  - Bulk update
- Reaproveitamento esperado:
  - Grid avançado

---

#### 6.1.11 Aprovação RBAC
- Objetivo: Governança
- Funcionalidades:
  - Fluxos de aprovação
  - Delegações
- Reaproveitamento esperado:
  - Fluxos existentes

---

#### 6.1.12 Segmentos
- Objetivo: Classificação de negócio
- Funcionalidades:
  - Vínculo com fornecedores, produtos e clientes
- Reaproveitamento esperado:
  - Cadastro simples adaptado

---

#### 6.1.13 Categorias
- Objetivo: Taxonomia do sistema
- Funcionalidades:
  - Uso transversal
- Reaproveitamento esperado:
  - Padrão CRUD

---

#### 6.1.14 Workflow
- Objetivo: Automatização de processos
- Funcionalidades:
  - Estados
  - Transições
  - Regras
- Reaproveitamento esperado:
  - Lógica de fluxo existente

---

#### 6.1.15 Realtime Lib
- Objetivo: Comunicação em tempo real
- Funcionalidades:
  - Notificações
  - Eventos
- Reaproveitamento esperado:
  - Infraestrutura base

---

## 6.2 Regra de Documentação de Reaproveitamento

Para **cada item acima**, deve ser registrado:
- Origem no `erp-textil`
- Arquivos ou componentes copiados
- Ajustes realizados
- Benefícios obtidos

Sem isso, **não há aceite da entrega**.

---

## 6.3 Análise de Documentos em @docs

Os documentos em `@docs` devem ser analisados para:
- Extrair regras de negócio
- Validar nomenclaturas
- Identificar fluxos existentes

Todo item aproveitado deve ser:
- Referenciado
- Adaptado
- Documentado

---

## 6. Telas Obrigatórias do Sistema

### 6.0 Regra de Detalhamento por Tela (OBRIGATÓRIA)

Para **cada tela criada ou refatorada**, deve existir uma seção clara documentando:

#### Checklist por Tela

- Sem esse detalhamento, a tela **não é considerada concluída**.

---



O plano deve contemplar explicitamente:

  Telas do sidebar => administração 

- Fornecedores
- Produtos
- Clientes
- Estoque
- Usuários (com upload de currículo)
- Gerenciamento avançado de notificações

### 6.1 Usuário – Currículo

- Upload PDF/DOCX
- Preview
- Versionamento&#x20;

---

## 7. Notificações – Módulo Avançado

Não é toast. É **sistema corporativo**.

Funcionalidades mínimas:

- Tipos e categorias
- Prioridade
- Canal (sistema / email / futuro push)
- Regras de disparo
- Histórico
- Arquivamento e expiração

---

## 8. Design System – Evolução Contínua

### 8.0 Regra Obrigatória de Reaproveitamento entre Projetos

Sempre que uma tela, fluxo ou componente for **copiado, inspirado ou adaptado** do projeto de referência:

```
/home/fabricio/projects/system/apps/erp-textil
```

**É obrigatório documentar explicitamente, dentro do plano e da própria tela**, os itens abaixo:

- O que foi reaproveitado integralmente
- O que foi adaptado
- O que foi descartado
- O que foi melhorado em relação ao projeto original

Essa rastreabilidade é **obrigatória** para garantir:

- Consistência arquitetural
- Evolução consciente do design system
- Evitar regressões e retrabalho
- Clareza para novos desenvolvedores

---

### 8.1 Princípios

- Evoluir sem quebrar consistência
- Design a serviço da operação

### 8.2 Melhorias Recomendadas

- Tokens semânticos (success, warning, danger, info)
- Componentes ricos:
  - Tabelas avançadas
  - Formulários progressivos
  - Modais com propósito claro
- Motion design funcional

---

## 9. Governança de Código e Commits

### 9.1 Regra de Transparência Técnica

Sempre que houver reaproveitamento de código, layout, UX ou lógica do projeto `erp-textil`, o commit deve:

- Referenciar explicitamente a tela de origem
- Explicar o motivo da adaptação
- Destacar melhorias aplicadas

Commits genéricos ou sem contexto são **inaceitáveis**.



- Nunca reverter commits sem consulta prévia
- Histórico é patrimônio do projeto
- Decisões arquiteturais devem ser documentadas

---

## 10. Conclusão Executiva

Este projeto **não é simples e não deve ser tratado como tal**.

As decisões aqui documentadas colocam o sistema no nível de:

- Produto enterprise
- Arquitetura madura
- UX/UI profissional
- Segurança auditável

**Seguir este documento não é opção. É diretriz estratégica.**

