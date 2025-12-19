# 📚 Diretrizes de Desenvolvimento - MORINA

> **Documentação completa de governança, arquitetura e desenvolvimento do sistema MORINA.**
> Este conjunto de documentos fornece controle absoluto, visão geral completa e processos claros para desenvolvimento e deploy.

---

## 🎯 Objetivo

Estes documentos garantem:

- ✅ **Controle absoluto** sobre decisões arquiteturais
- ✅ **Visão geral completa** do sistema
- ✅ **Processos claros** para desenvolvimento
- ✅ **Prevenção de problemas** antes que ocorram
- ✅ **Resposta rápida** a emergências

---

## 📋 Status Atual do Sistema

> **⚠️ REVISÃO CRÍTICA REALIZADA (2025-01-19):**  
> Consulte [REVISAO-COMPLETA-FASES-MELHORIAS.md](./REVISAO-COMPLETA-FASES-MELHORIAS.md) para análise detalhada de todas as fases.  
> **Progresso Real:** 60% (não 65% como documentado anteriormente)  
> **155 melhorias identificadas** | **207 sprints estimados**

### ✅ Design System Implementado

O sistema já possui um **Design System completo e funcional**:

- ✅ **Design Tokens** (`packages/ui/src/theme/design-tokens.ts`)
  - Cores semânticas (primary, success, warning, danger)
  - Tipografia (Inter, escala completa)
  - Espaçamento (escala 8px)
  - Border radius, shadows, breakpoints
  
- ✅ **Componentes Reutilizáveis** (`packages/ui/src/components/`)
  - Button, Input, Select, Textarea
  - FormField, Checkbox, Tooltip
  - GlassCard, Alert, Badge
  - TreeView, Popover, DropdownMenu

- ✅ **Temas** (Dark/Light)
  - Suporte completo a temas
  - Variáveis CSS customizadas
  - Theme Provider implementado

**Localização:** `packages/ui/`  
**Documentação:** `docs/DESIGN_SYSTEM_*.md`

### ✅ Telas e Módulos Implementados

Muitas telas já foram criadas e estão em uso:

- ✅ **Fichas de Custo de Aviamentos** (padrão de referência)
  - Formulário completo com validação
  - Workflow de aprovação
  - Versionamento e auditoria
  - Upload de arquivos
  
- ✅ **Gestão de Usuários**
  - CRUD completo
  - Perfis e permissões
  - Estrutura organizacional
  
- ✅ **Gestão de Organizações**
  - Multi-tenant
  - Configurações por empresa
  
- ✅ **Dashboard**
  - Métricas e KPIs
  - Ações rápidas
  - Atividade recente

**Padronização:** O formato da tela de **Ficha de Custo de Aviamentos** está sendo usado como padrão para novas telas, garantindo consistência visual e funcional.

### ✅ Controle de Acesso (RBAC + ABAC + PBAC)

O sistema implementa **três níveis de controle de acesso**:

- ✅ **RBAC (Role-Based Access Control)**
  - Define **o que o usuário pode fazer** (módulos, telas, ações)
  - Baseado em Roles (papéis) e Permissions (permissões)
  - Hierarquia: Role → Permission → Action
  
- ✅ **ABAC (Attribute-Based Access Control)**
  - Define **em quais dados o usuário pode atuar**
  - Baseado em atributos (departamento, setor, organização)
  - Filtragem de dados por contexto organizacional
  
- ✅ **PBAC (Policy-Based Access Control)**
  - Define **sob quais condições e aprovações**
  - Workflows de aprovação
  - Regras de negócio condicionais
  - Políticas de acesso dinâmicas

**Implementação:** `apps/api/src/modules/permissions/`  
**Schema:** `apps/api/prisma/schema.prisma` (models: Role, Permission, PositionPermission, etc.)

---

## 📖 Documentos Disponíveis (Ordem de Implementação)

> **📌 IMPORTANTE:** Os documentos estão organizados na **ordem de implementação recomendada**.  
> Consulte o [Roadmap de Implementação](./Roadmap-Implementação-Priorizado.md) para ver o status de cada fase.

### 🗺️ Visão Rápida da Ordem de Implementação

```
FASE 0: Fundamentos (⚠️ 85% - REVISADO)
  └── Arquitetura, Infraestrutura, Processos
  └── ❌ Gaps: Monitoramento, Logs, Security Scanning

FASE 1: Base Organizacional (⚠️ 70% - REVISADO)
  └── Empresa, Departamentos, Setores, Cargos
  └── ❌ CRÍTICO: Subdepartamento ausente

FASE 2: Controle de Acesso (⚠️ 75% - REVISADO)
  └── RBAC ✅ | ABAC ✅ | PBAC ⚠️ (incompleto)
  └── ❌ CRÍTICO: PBAC incompleto

FASE 3: Design System (⚠️ 60% - REVISADO)
  └── Tokens, Componentes, Temas
  └── ❌ CRÍTICO: Validação, Animações, A11y ausentes

FASE 4: Telas Base (⚠️ 70% - REVISADO)
  └── Dashboard, Usuários, Organizações, Fichas
  └── ❌ Gaps: Padronização incompleta

FASE 5: Melhorias UX/UI (⏳ 0%)
  └── Login Melhorado | Dashboard Boas-Vindas | Notificações

FASE 6: Recursos Avançados (⏳ 0%)
  └── Assinatura Digital | Mensageria Corporativa
```

**📋 Consulte [REVISAO-COMPLETA-FASES-MELHORIAS.md](./REVISAO-COMPLETA-FASES-MELHORIAS.md) para detalhes.**

**👉 Consulte o [Roadmap Completo](./Roadmap-Implementação-Priorizado.md) para detalhes.**

---

### 🗺️ [Roadmap de Implementação - Ordem Priorizada](./Roadmap-Implementação-Priorizado.md)

**Para:** Todos (Tech Lead, Product Owner, Desenvolvedores)  
**Quando usar:** Sempre - Para gerenciar o que está sendo feito e o que falta  
**Tempo de leitura:** 20-25 minutos

**Conteúdo:**
- Status geral de todas as fases
- Ordem de implementação priorizada
- Checklist de progresso
- Próximas ações recomendadas
- Métricas de progresso

**👉 Comece aqui para entender o que está feito e o que falta implementar.**

---

---

## 📚 Documentos por Fase de Implementação

### 🔥 FASE 0-4: Fundamentos e Base (✅ Implementado)

#### 1. 🎛️ [Centro de Comando - Controle Absoluto](./Centro-de-Comando-Controle-Absoluto.md)

**Para:** Todos (Tech Lead, Arquiteto, Desenvolvedores)  
**Quando usar:** Sempre - Primeiro documento a consultar  
**Tempo de leitura:** 15-20 minutos

**Conteúdo:**
- Dashboard executivo do sistema
- Matriz de autoridade (quem decide o quê)
- Procedimentos para erros graves
- Checklists de validação rápida
- Comandos de emergência
- Matriz de decisão rápida

**👉 Comece aqui para ter visão geral e controle.**

---

### 2. 🚀 [Guia de Desenvolvimento e Deploy para Produção](./Guia-Desenvolvimento-Deploy-Produção.md)

**Para:** Desenvolvedores, DevOps  
**Quando usar:** Diariamente - Manual de desenvolvimento  
**Tempo de leitura:** 30-40 minutos

**Conteúdo:**
- Fluxo completo de desenvolvimento (10 etapas)
- Práticas obrigatórias a adotar
- O que falta implementar (roadmap)
- Medidas preventivas
- Checklist completo para produção
- Processo de deploy passo a passo

**👉 Use este guia para desenvolvimento diário e deploy.**

---

### 3. 📊 [Matriz Capacidade × Contexto × Módulo](./Matriz-Capacidade×Contexto×Módulo.md)

**Para:** Arquiteto, Tech Lead, Desenvolvedores  
**Quando usar:** Antes de criar/modificar módulos  
**Tempo de leitura:** 20-25 minutos

**Conteúdo:**
- Estrutura da matriz
- Regras de governança
- Uso com IA
- Evolução controlada
- Formato de armazenamento

**👉 Consulte antes de criar ou modificar qualquer módulo.**

---

### 4. 🗺️ [Mapa de Capacidades do Sistema](./Mapa-Capacidades-Sistema-(Capability Map).md)

**Para:** Product Owner, Arquiteto, Tech Lead  
**Quando usar:** Para definir O QUE o sistema faz  
**Tempo de leitura:** 25-30 minutos

**Conteúdo:**
- Classificação de capacidades (Core/Negócio/Suporte/Técnica)
- Níveis de maturidade
- Relação entre capacidades e domínios
- Governança de evolução
- Template para documentar novas capacidades

**👉 Use para identificar e classificar capacidades do sistema.**

---

### 5. 🏗️ [Mapa de Contextos - Núcleo Domínio - Governança](./Mapa de Contextos-Núcleo-Domínio-Governança-Dependências.md)

**Para:** Arquiteto, Tech Lead  
**Quando usar:** Para definir limites e relacionamentos  
**Tempo de leitura:** 30-35 minutos

**Conteúdo:**
- Core Domain (Núcleo do Negócio)
- Bounded Contexts
- Governança de dependências
- Comunicação entre módulos
- Template para documentar novos contextos

**👉 Use para validar limites arquiteturais e relacionamentos.**

---

### 6. ⚖️ [Diretiva de Autoanálise e Governança Técnica](./Diretiva-Autoanálise-Governança-Técnica-do-Sistema.md)

**Para:** Todos os desenvolvedores  
**Quando usar:** Antes de QUALQUER mudança no código  
**Tempo de leitura:** 35-40 minutos

**Conteúdo:**
- Fluxo obrigatório de autoanálise
- Análise de existência, localização e impacto
- Diretriz de evolução
- Governança de criação de código
- Template de ADR
- Processo de revisão periódica

**👉 Use antes de qualquer mudança no sistema.**

---

### 7. 🔍 [Guia de Inventário e Mapeamento do Sistema](./Guia-Inventário-Mapeamento-Sistema.md)

**Para:** Arquiteto, Tech Lead, Desenvolvedores  
**Quando usar:** Para mapear o que existe no sistema  
**Tempo de leitura:** 40-45 minutos

**Conteúdo:**
- Processo de inventário passo a passo
- Templates para documentar descobertas
- Ferramentas e scripts úteis
- Processo de manutenção contínua

**👉 Use para descobrir e mapear tudo que existe no sistema.**

---

#### 13. 🔐 [Controle de Acesso - RBAC, ABAC e PBAC](./Controle-Acesso-RBAC-ABAC-PBAC.md)

**Status:** ✅ Implementado (RBAC/ABAC completo, PBAC parcial)  
**Prioridade:** 🔥 Crítica  
**Dependências:** FASE 1

**Para:** Arquiteto, Tech Lead, Desenvolvedores Backend, Security Engineers  
**Quando usar:** Para entender e implementar controle de acesso multi-camadas  
**Tempo de leitura:** 40-45 minutos

**Conteúdo:**
- Visão geral dos três níveis (RBAC, ABAC, PBAC)
- RBAC: Define o que pode fazer (módulos, telas, ações)
- ABAC: Define em quais dados pode atuar (filtragem por contexto)
- PBAC: Define sob quais condições (workflows, aprovações)
- Implementação técnica (schemas, services, use cases)
- Integração dos três níveis
- Exemplos práticos de uso
- Configuração e gestão
- Checklist de implementação

**👉 Use para implementar controle de acesso robusto e granular no sistema.**

---

### ⚡ FASE 5: Melhorias UX/UI (⏳ Em Planejamento)

#### 8. 🎨 [Análise UX/UI - Login e Autenticação](./Análise-UX-UI-Login-Autenticação.md)

**Status:** ⏳ Planejado  
**Prioridade:** ⚡ Alta  
**Dependências:** FASE 4

**Para:** Designers, Product Managers, Desenvolvedores Frontend  
**Quando usar:** Para melhorar experiência de login e autenticação  
**Tempo de leitura:** 30-35 minutos

**Conteúdo:**
- Análise da tela de login atual
- Proposta de melhorias para dois tipos de usuários
- Fluxo para representantes
- Campos do pedido de venda
- Checklist de implementação

**👉 Use para entender e implementar melhorias de UX/UI no login.**

---

#### 9. 📐 [Mockups - Login e Portal de Representantes](./Mockups-Login-Representantes.md)

**Status:** ⏳ Planejado  
**Prioridade:** ⚡ Alta  
**Dependências:** FASE 4, Documento 8

**Para:** Designers, Desenvolvedores Frontend  
**Quando usar:** Para visualizar as melhorias propostas  
**Tempo de leitura:** 20-25 minutos

**Conteúdo:**
- Mockups visuais de todas as telas
- Estados e feedback
- Paleta de cores
- Animações e transições
- Versão mobile

**👉 Use como referência visual para implementação.**

---

### ⚡ FASE 6: Recursos Avançados (⏳ Em Planejamento)

#### 10. ✍️ [Assinatura Digital - Validade Jurídica](./Assinatura-Digital-Validade-Jurídica.md)

**Status:** ⏳ Planejado  
**Prioridade:** ⚡ Média  
**Dependências:** FASE 4, FASE 5

**Para:** Arquiteto, Tech Lead, Equipe Jurídica, Desenvolvedores  
**Quando usar:** Para implementar assinatura digital juridicamente válida  
**Tempo de leitura:** 45-50 minutos

**Conteúdo:**
- Marco legal brasileiro (ICP-Brasil, Lei 14.063/2020)
- Tipos de assinatura digital e validade jurídica
- Requisitos técnicos e legais
- Arquitetura proposta
- Fluxo de assinatura de pedidos de venda
- Soluções disponíveis (ICP-Brasil, DocuSign, própria)
- Implementação faseada (MVP → TSA → ICP-Brasil)
- Exemplos de código
- Custos estimados

**👉 Use para planejar e implementar assinatura digital válida judicialmente.**

---

#### 11. 🎨 [Dashboard - Boas-Vindas Personalizada](./Dashboard-Boas-Vindas-Personalizada.md)

**Status:** ⏳ Planejado  
**Prioridade:** ⚡ Alta  
**Dependências:** FASE 4

**Para:** Designers, Desenvolvedores Frontend, Product Managers  
**Quando usar:** Para implementar tela de boas-vindas personalizada na dashboard  
**Tempo de leitura:** 35-40 minutos

**Conteúdo:**
- Análise da dashboard atual
- Proposta de welcome banner personalizado
- Widget de informações do tempo (clima)
- Informações contextuais por tipo de usuário
- Dashboard condicional para usuários sem acesso completo
- Arquitetura e componentes necessários
- Mockups e layouts
- Exemplos de código completos
- Checklist de implementação faseada

**👉 Use para melhorar a experiência do usuário na dashboard com informações personalizadas e relevantes.**

---

#### 12. 💬 [Sistema de Mensageria Corporativa - BigTech](./Sistema-Mensageria-Corporativa-BigTech.md)

**Status:** ⏳ Planejado  
**Prioridade:** ⚡ Média  
**Dependências:** FASE 4, FASE 5

**Para:** Arquiteto, Tech Lead, Desenvolvedores Full-Stack, Product Managers  
**Quando usar:** Para implementar sistema de mensageria corporativa interno (substituir WhatsApp)  
**Tempo de leitura:** 60-70 minutos

**Conteúdo:**
- Visão executiva e objetivos
- Arquitetura de alto nível (microserviços, WebSocket, Redis, PostgreSQL)
- Modelo de dados completo (Prisma schema)
- Recursos e funcionalidades (mensagens, canais, grupos, threads, reações)
- Arquitetura técnica detalhada (Messaging Service, Realtime Gateway)
- Segurança e compliance (LGPD, criptografia, auditoria)
- Performance e escalabilidade (otimizações, sharding, cache)
- Interface do usuário (UI/UX, componentes React)
- Mobile apps (React Native, PWA)
- Integrações (internas e externas)
- Monitoramento e observabilidade
- Roadmap de implementação (4 fases)
- Custos estimados
- Comparação com Slack, Teams, WhatsApp

**👉 Use para planejar e implementar sistema de mensageria corporativa de nível BigTech, substituindo WhatsApp para comunicação empresarial.**

---

### ⚡ FASE 5: Melhorias UX/UI (⏳ Em Planejamento)

#### 8. 🎨 [Análise UX/UI - Login e Autenticação](./Análise-UX-UI-Login-Autenticação.md)

**Status:** ⏳ Planejado  
**Prioridade:** ⚡ Alta  
**Dependências:** FASE 4

**Para:** Designers, Product Managers, Desenvolvedores Frontend  
**Quando usar:** Para melhorar experiência de login e autenticação  
**Tempo de leitura:** 30-35 minutos

**Conteúdo:**
- Análise da tela de login atual
- Proposta de melhorias para dois tipos de usuários
- Fluxo para representantes
- Campos do pedido de venda
- Checklist de implementação

**👉 Use para entender e implementar melhorias de UX/UI no login.**

---

#### 9. 📐 [Mockups - Login e Portal de Representantes](./Mockups-Login-Representantes.md)

**Status:** ⏳ Planejado  
**Prioridade:** ⚡ Alta  
**Dependências:** FASE 4, Documento 8

**Para:** Designers, Desenvolvedores Frontend  
**Quando usar:** Para visualizar as melhorias propostas  
**Tempo de leitura:** 20-25 minutos

**Conteúdo:**
- Mockups visuais de todas as telas
- Estados e feedback
- Paleta de cores
- Animações e transições
- Versão mobile

**👉 Use como referência visual para implementação.**

---

#### 11. 🎨 [Dashboard - Boas-Vindas Personalizada](./Dashboard-Boas-Vindas-Personalizada.md)

**Status:** ⏳ Planejado  
**Prioridade:** ⚡ Alta  
**Dependências:** FASE 4

**Para:** Designers, Desenvolvedores Frontend, Product Managers  
**Quando usar:** Para implementar tela de boas-vindas personalizada na dashboard  
**Tempo de leitura:** 35-40 minutos

**Conteúdo:**
- Análise da dashboard atual
- Proposta de welcome banner personalizado
- Widget de informações do tempo (clima)
- Informações contextuais por tipo de usuário
- Dashboard condicional para usuários sem acesso completo
- Arquitetura e componentes necessários
- Mockups e layouts
- Exemplos de código completos
- Checklist de implementação faseada

**👉 Use para melhorar a experiência do usuário na dashboard com informações personalizadas e relevantes.**

---

### ⚡ FASE 6: Recursos Avançados (⏳ Em Planejamento)

#### 10. ✍️ [Assinatura Digital - Validade Jurídica](./Assinatura-Digital-Validade-Jurídica.md)

**Status:** ⏳ Planejado  
**Prioridade:** ⚡ Média  
**Dependências:** FASE 4, FASE 5

**Para:** Arquiteto, Tech Lead, Equipe Jurídica, Desenvolvedores  
**Quando usar:** Para implementar assinatura digital juridicamente válida  
**Tempo de leitura:** 45-50 minutos

**Conteúdo:**
- Marco legal brasileiro (ICP-Brasil, Lei 14.063/2020)
- Tipos de assinatura digital e validade jurídica
- Requisitos técnicos e legais
- Arquitetura proposta
- Fluxo de assinatura de pedidos de venda
- Soluções disponíveis (ICP-Brasil, DocuSign, própria)
- Implementação faseada (MVP → TSA → ICP-Brasil)
- Exemplos de código
- Custos estimados

**👉 Use para planejar e implementar assinatura digital válida judicialmente.**

---

#### 12. 💬 [Sistema de Mensageria Corporativa - BigTech](./Sistema-Mensageria-Corporativa-BigTech.md)

**Status:** ⏳ Planejado  
**Prioridade:** ⚡ Média  
**Dependências:** FASE 4, FASE 5

**Para:** Arquiteto, Tech Lead, Desenvolvedores Full-Stack, Product Managers  
**Quando usar:** Para implementar sistema de mensageria corporativa interno (substituir WhatsApp)  
**Tempo de leitura:** 60-70 minutos

**Conteúdo:**
- Visão executiva e objetivos
- Arquitetura de alto nível (microserviços, WebSocket, Redis, PostgreSQL)
- Modelo de dados completo (Prisma schema)
- Recursos e funcionalidades (mensagens, canais, grupos, threads, reações)
- Arquitetura técnica detalhada (Messaging Service, Realtime Gateway)
- Segurança e compliance (LGPD, criptografia, auditoria)
- Performance e escalabilidade (otimizações, sharding, cache)
- Interface do usuário (UI/UX, componentes React)
- Mobile apps (React Native, PWA)
- Integrações (internas e externas)
- Monitoramento e observabilidade
- Roadmap de implementação (4 fases)
- Custos estimados
- Comparação com Slack, Teams, WhatsApp

**👉 Use para planejar e implementar sistema de mensageria corporativa de nível BigTech, substituindo WhatsApp para comunicação empresarial.**

---

## 🗺️ Mapa de Uso por Situação

### Situação: "Preciso começar uma nova tarefa"
1. **[Centro de Comando](./Centro-de-Comando-Controle-Absoluto.md)** - Visão geral
2. **[Guia de Desenvolvimento](./Guia-Desenvolvimento-Deploy-Produção.md)** - Processo completo
3. **[Diretiva de Governança](./Diretiva-Autoanálise-Governança-Técnica-do-Sistema.md)** - Autoanálise

### Situação: "Preciso criar um novo módulo"
1. **[Centro de Comando](./Centro-de-Comando-Controle-Absoluto.md)** - Verificar autoridade
2. **[Matriz](./Matriz-Capacidade×Contexto×Módulo.md)** - Mapear capacidade
3. **[Mapa de Contextos](./Mapa de Contextos-Núcleo-Domínio-Governança-Dependências.md)** - Validar limites
4. **[Diretiva de Governança](./Diretiva-Autoanálise-Governança-Técnica-do-Sistema.md)** - Executar autoanálise

### Situação: "Preciso fazer deploy em produção"
1. **[Guia de Desenvolvimento](./Guia-Desenvolvimento-Deploy-Produção.md)** - Checklist de produção
2. **[Centro de Comando](./Centro-de-Comando-Controle-Absoluto.md)** - Comandos de deploy

### Situação: "Ocorreu um erro grave"
1. **[Centro de Comando](./Centro-de-Comando-Controle-Absoluto.md)** - Procedimentos de emergência
2. **[Guia de Desenvolvimento](./Guia-Desenvolvimento-Deploy-Produção.md)** - Rollback

### Situação: "Preciso mapear o sistema existente"
1. **[Guia de Inventário](./Guia-Inventário-Mapeamento-Sistema.md)** - Processo completo
2. **[Centro de Comando](./Centro-de-Comando-Controle-Absoluto.md)** - Atualizar dashboard

### Situação: "Preciso identificar uma capacidade"
1. **[Mapa de Capacidades](./Mapa-Capacidades-Sistema-(Capability Map).md)** - Classificação
2. **[Matriz](./Matriz-Capacidade×Contexto×Módulo.md)** - Mapear para módulo

---

## 🔄 Fluxo Integrado Completo

```
┌─────────────────────────────────────────────────────────┐
│         INÍCIO DE QUALQUER TAREFA                       │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────────┐
    │ 1. CONSULTAR CENTRO DE COMANDO       │
    │    - Visão geral                      │
    │    - Verificar autoridade             │
    │    - Consultar matriz de decisão     │
    └──────────────┬───────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────────┐
    │ 2. EXECUTAR AUTOANÁLISE              │
    │    (Diretiva de Governança)          │
    │    - Análise de Existência           │
    │    - Análise de Localização          │
    │    - Análise de Impacto              │
    └──────────────┬───────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────────┐
    │ 3. IDENTIFICAR CAPACIDADE            │
    │    (Mapa de Capacidades)             │
    │    - O que o sistema faz?            │
    │    - Classificação?                  │
    └──────────────┬───────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────────┐
    │ 4. MAPEAR PARA MÓDULO/CONTEXTO      │
    │    (Matriz + Mapa de Contextos)     │
    │    - Onde implementar?              │
    │    - Validar limites?               │
    └──────────────┬───────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────────┐
    │ 5. DESENVOLVER                       │
    │    (Guia de Desenvolvimento)         │
    │    - Seguir práticas obrigatórias    │
    │    - Escrever testes                 │
    │    - Documentar código               │
    └──────────────┬───────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────────┐
    │ 6. VALIDAR E DEPLOY                  │
    │    (Guia de Desenvolvimento)         │
    │    - Checklist de produção          │
    │    - Deploy seguro                   │
    │    - Monitoramento                   │
    └──────────────┬───────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────────┐
    │ 7. ATUALIZAR DOCUMENTAÇÃO            │
    │    - Matriz atualizada               │
    │    - Centro de Comando atualizado    │
    │    - ADR criado se necessário        │
    └──────────────────────────────────────┘
```

---

## 📋 Checklist Rápido

### Antes de Começar Qualquer Tarefa
- [ ] Consultei o Centro de Comando?
- [ ] Executei autoanálise completa?
- [ ] Identifiquei a capacidade?
- [ ] Validei módulo e contexto?

### Durante o Desenvolvimento
- [ ] Seguindo padrões de código?
- [ ] Testes escritos?
- [ ] Documentação atualizada?

### Antes do Deploy
- [ ] Checklist de produção completo?
- [ ] Testes passando?
- [ ] Security scan OK?
- [ ] ADR criado (se necessário)?

---

## 🎯 Regras de Ouro

> ⚠️ **NUNCA VIOLAR SEM ADR E APROVAÇÃO**

1. **Core Domain não depende de nada externo**
2. **Nenhum contexto acessa banco de outro contexto diretamente**
3. **Regras de negócio NUNCA em controllers/hooks/componentes**
4. **Toda capacidade tem dono** (contexto + módulo)
5. **API pública não quebra** (sempre versionar)
6. **Nunca fazer deploy sem testes passando**
7. **Nunca commitar secrets**

---

## 📞 Suporte e Dúvidas

### Dúvidas sobre:
- **Processo de desenvolvimento** → [Guia de Desenvolvimento](./Guia-Desenvolvimento-Deploy-Produção.md)
- **Decisões arquiteturais** → [Centro de Comando](./Centro-de-Comando-Controle-Absoluto.md)
- **Onde implementar** → [Matriz](./Matriz-Capacidade×Contexto×Módulo.md)
- **Erros graves** → [Centro de Comando - Seção 5](./Centro-de-Comando-Controle-Absoluto.md#5-procedimentos-para-erros-graves)

---

## 🔄 Manutenção

Estes documentos devem ser atualizados:

- **Diariamente**: Status de saúde (automático se possível)
- **Semanalmente**: Status de módulos, métricas
- **Mensalmente**: Dashboard executivo completo
- **Trimestralmente**: Revisão completa e validação

---

## 📚 Documentação Relacionada

- [`../MANIFESTO.md`](../MANIFESTO.md) - Princípios MORINA
- [`../DOCS_STANDARDS.md`](../DOCS_STANDARDS.md) - Padrões de documentação
- [`../estrutura-organizacional.md`](../estrutura-organizacional.md) - Fundação organizacional
- [`../PLANO_REESTRUTURACAO.md`](../PLANO_REESTRUTURACAO.md) - Plano de reestruturação

---

**Última atualização:** [Atualizar mensalmente]  
**Versão:** 1.0.0  
**Mantido por:** Equipe de Arquitetura MORINA

