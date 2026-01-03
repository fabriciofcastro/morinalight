# Centro de Comando - Controle Absoluto do Sistema

> **Este é o documento central para controle, visão geral e resposta a emergências.**
> Consulte este documento para ter visão completa do sistema e saber exatamente o que fazer em qualquer situação.

---

## 1. Objetivo

Este documento fornece:

- ✅ **Visão geral completa** do sistema em um só lugar
- ✅ **Controle absoluto** sobre todas as decisões arquiteturais
- ✅ **Procedimentos claros** para erros graves e emergências
- ✅ **Checklists** para validação rápida
- ✅ **Referências rápidas** para todos os documentos

> **Este é o seu painel de controle. Consulte sempre antes de decisões críticas.**
>
> **📌 Para processo completo de desenvolvimento e deploy, consulte o [Guia de Desenvolvimento e Deploy](./Guia-Desenvolvimento-Deploy-Produção.md)**

---

## 1.1 Recursos Disponíveis

### ✅ Design System Implementado

**Localização:** `packages/ui/`

**Componentes:** Button, Input, Select, FormField, GlassCard, Alert, Badge, Tooltip, etc.  
**Design Tokens:** Cores, tipografia, espaçamento, temas  
**Documentação:** `docs/DESIGN_SYSTEM_*.md`

**👉 Use componentes existentes antes de criar novos!**

### ✅ Telas e Padrões

**Telas Implementadas:**

- Fichas de Custo de Aviamentos (padrão de referência)
- Gestão de Usuários
- Gestão de Organizações
- Dashboard

**Padrão de Tela:** Ficha de Custo de Aviamentos (`apps/web/src/app/(app)/fichas-custo/`)

**👉 Siga o padrão ao criar novas telas!**

### ✅ Controle de Acesso (RBAC + ABAC + PBAC)

**RBAC:** Define **o que** pode fazer (módulos, telas, ações)  
**ABAC:** Define **em quais dados** pode atuar (filtragem por contexto)  
**PBAC:** Define **sob quais condições** (workflows, aprovações)

**Implementação:** `apps/api/src/modules/permissions/`

---

## 2. Visão Geral do Sistema (Status Atual)

### 2.1 Dashboard Executivo

**Última Atualização:** [Atualizar mensalmente]

| Métrica                     | Valor                                      | Status | Tendência |
| --------------------------- | ------------------------------------------ | ------ | --------- |
| **Total de Módulos**        | X                                          | ✅     | ↗️        |
| **Total de Capacidades**    | Y                                          | ✅     | ↗️        |
| **Total de Contextos**      | Z                                          | ✅     | →         |
| **Capacidades Core**        | W                                          | ✅     | →         |
| **Maturidade Média (Core)** | [Inicial/Controlada/Escalável/Estratégica] | ⚠️     | ↗️        |
| **Cobertura de Testes**     | X%                                         | ✅     | ↗️        |
| **Dívida Técnica**          | [Baixa/Média/Alta]                         | ⚠️     | ↘️        |

### 2.2 Mapa Rápido do Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    MORINA SYSTEM                         │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  CORE DOMAIN (Núcleo do Negócio)                         │
│  ├── Organization (Estrutura Organizacional)            │
│  ├── Security (Controle de Acesso)                       │
│  └── Audit (Auditoria e Rastreabilidade)                │
│                                                           │
│  SUPPORTING DOMAIN (Suporte)                             │
│  ├── Notifications (Notificações)                        │
│  ├── Reporting (Relatórios)                             │
│  └── Catalog (Catálogo)                                  │
│                                                           │
│  GENERIC DOMAIN (Infraestrutura)                         │
│  ├── Authentication (Autenticação Técnica)               │
│  └── FileStorage (Armazenamento)                          │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### 2.3 Status por Módulo

| Módulo              | Status   | Saúde       | Última Atualização | Responsável |
| ------------------- | -------- | ----------- | ------------------ | ----------- |
| organization-domain | ✅ Ativo | 🟢 Saudável | YYYY-MM-DD         | [Nome]      |
| user-domain         | ✅ Ativo | 🟡 Atenção  | YYYY-MM-DD         | [Nome]      |
| catalogo-domain     | ✅ Ativo | 🟢 Saudável | YYYY-MM-DD         | [Nome]      |
| api-backend         | ✅ Ativo | 🟢 Saudável | YYYY-MM-DD         | [Nome]      |
| web-frontend        | ✅ Ativo | 🟢 Saudável | YYYY-MM-DD         | [Nome]      |

**Legenda:**

- 🟢 Saudável: Funcionando perfeitamente
- 🟡 Atenção: Requer monitoramento
- 🔴 Crítico: Ação imediata necessária

---

## 3. Controle Absoluto - Decisões Arquiteturais

### 3.1 Matriz de Autoridade

| Decisão                   | Autoridade     | Aprovação Necessária                 |
| ------------------------- | -------------- | ------------------------------------ |
| Criar novo módulo         | Tech Lead      | ✅ Sim (ADR obrigatório)             |
| Criar novo contexto       | Arquiteto      | ✅ Sim (ADR + revisão)               |
| Modificar Core Domain     | Arquiteto + PO | ✅ Sim (ADR + aprovação)             |
| Adicionar capacidade Core | Arquiteto + PO | ✅ Sim (ADR + aprovação)             |
| Modificar API pública     | Tech Lead      | ✅ Sim (Versionamento)               |
| Criar novo evento         | Tech Lead      | ⚠️ Documentar (ADR se significativo) |
| Refatoração estrutural    | Tech Lead      | ✅ Sim (ADR obrigatório)             |
| Remover código            | Desenvolvedor  | ⚠️ Validar impacto                   |

### 3.2 Processo de Decisão Rápida

**Para qualquer mudança arquitetural:**

```
1. Consultar este documento (Centro de Comando)
   ↓
2. Verificar autoridade necessária (seção 3.1)
   ↓
3. Executar autoanálise (Diretiva de Governança)
   ↓
4. Criar ADR se necessário (Template em Diretiva)
   ↓
5. Obter aprovação conforme matriz
   ↓
6. Implementar seguindo diretrizes
   ↓
7. Atualizar documentação
```

### 3.3 Regras de Ouro (Não Negociáveis)

> ⚠️ **VIOLAÇÕES DESTAS REGRAS SÃO PROIBIDAS SEM ADR E APROVAÇÃO EXPLÍCITA**

1. **Core Domain não depende de nada externo** (exceto infra básica)
2. **Nenhum contexto acessa banco de outro contexto diretamente**
3. **Regras de negócio NUNCA em controllers/hooks/componentes**
4. **Toda capacidade tem dono** (contexto + módulo)
5. **Módulo sem capacidade é eliminável**
6. **API pública não quebra** (sempre versionar)
7. **Eventos são imutáveis** (nova necessidade = novo evento)

---

## 4. Visão Geral Completa - Documentos de Referência

### 4.1 Mapa de Documentos

| Documento                                                                              | Propósito                         | Quando Consultar                    |
| -------------------------------------------------------------------------------------- | --------------------------------- | ----------------------------------- |
| **[Matriz Capacidade × Contexto × Módulo](./Matriz-Capacidade×Contexto×Módulo.md)**    | Mapear ONDE cada capacidade vive  | Antes de criar/modificar módulo     |
| **[Mapa de Capacidades](./Mapa-Capacidades-Sistema-(Capability Map).md)**              | Definir O QUE o sistema faz       | Antes de criar nova feature         |
| **[Mapa de Contextos](./Mapa de Contextos-Núcleo-Domínio-Governança-Dependências.md)** | Definir limites e relacionamentos | Antes de criar novo contexto        |
| **[Diretiva de Governanoça](./Diretiva-Autoanálise-Governança-Técnica-do-Sistema.md)** | COMO implementar mudanças         | Antes de qualquer mudança           |
| **[Guia de Inventário](./Guia-Inventário-Mapeamento-Sistema.md)**                      | Descobrir o que existe            | Para mapeamento inicial/atualização |

### 4.2 Fluxo de Uso dos Documentos

```
┌─────────────────────────────────────────────────┐
│         NOVA FEATURE / MUDANÇA                   │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │ 1. Consultar Centro de       │
    │    Comando (este documento)  │
    └──────────────┬───────────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │ 2. Verificar autoridade      │
    │    necessária (seção 3.1)    │
    └──────────────┬───────────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │ 3. Executar autoanálise       │
    │    (Diretiva de Governança)   │
    └──────────────┬───────────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │ 4. Identificar capacidade     │
    │    (Mapa de Capacidades)      │
    └──────────────┬───────────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │ 5. Mapear para contexto/     │
    │    módulo (Matriz)            │
    └──────────────┬───────────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │ 6. Validar limites            │
    │    (Mapa de Contextos)        │
    └──────────────┬───────────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │ 7. Implementar seguindo       │
    │    diretrizes                 │
    └──────────────┬───────────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │ 8. Atualizar documentação     │
    └───────────────────────────────┘
```

---

## 5. Procedimentos para Erros Graves

### 5.1 Classificação de Severidade

| Severidade     | Descrição                          | Tempo de Resposta      | Ação      |
| -------------- | ---------------------------------- | ---------------------- | --------- |
| **🔴 CRÍTICO** | Sistema inoperante, dados em risco | Imediato (< 15 min)    | Seção 5.2 |
| **🟠 ALTO**    | Funcionalidade crítica quebrada    | Urgente (< 1 hora)     | Seção 5.3 |
| **🟡 MÉDIO**   | Funcionalidade importante afetada  | Importante (< 4 horas) | Seção 5.4 |
| **🟢 BAIXO**   | Problema não crítico               | Normal (< 1 dia)       | Seção 5.5 |

### 5.2 Procedimento CRÍTICO (Sistema Inoperante)

**Sintomas:**

- Sistema não responde
- Banco de dados inacessível
- Erro 500 em massa
- Perda de dados detectada
- Segurança comprometida

**Ações Imediatas (Ordem de Execução):**

#### Passo 1: Isolar o Problema (2 minutos)

```bash
# 1. Verificar health checks
curl http://localhost:3000/health
curl http://localhost:3000/api/health

# 2. Verificar logs de erro
tail -f logs/error.log | grep -i "error\|fatal\|critical"

# 3. Verificar status dos serviços
docker ps
docker-compose ps
```

#### Passo 2: Contenção (5 minutos)

```bash
# Se necessário, isolar serviço problemático
docker-compose stop [servico-problema]

# Ativar modo de manutenção (se aplicável)
# Redirecionar tráfego para backup (se disponível)
```

#### Passo 3: Diagnóstico (5 minutos)

```bash
# Verificar métricas
# - CPU, Memória, Disco
# - Conexões de banco
# - Taxa de erro

# Analisar logs recentes
grep -i "error\|exception\|fatal" logs/*.log | tail -100

# Verificar último deploy
git log --oneline -5
```

#### Passo 4: Decisão (3 minutos)

**Opção A: Rollback Imediato**

```bash
# Se problema foi causado por deploy recente
./deploy/rollback.sh

# Ou manualmente
git checkout [commit-anterior]
docker-compose up -d --build
```

**Opção B: Hotfix**

```bash
# Se problema é conhecido e tem solução rápida
# Aplicar hotfix e fazer deploy de emergência
```

**Opção C: Escalação**

```bash
# Se problema é complexo e requer investigação
# Notificar equipe completa
# Ativar procedimento de escalação
```

#### Passo 5: Comunicação

- [ ] Notificar equipe (Slack/Email)
- [ ] Atualizar status page (se houver)
- [ ] Documentar incidente

#### Passo 6: Pós-Incidente

- [ ] Criar ADR documentando o problema
- [ ] Implementar prevenção
- [ ] Atualizar procedimentos
- [ ] Revisar com equipe

### 5.3 Procedimento ALTO (Funcionalidade Crítica Quebrada)

**Sintomas:**

- Feature crítica não funciona
- Performance degradada significativamente
- Erros frequentes em funcionalidade específica
- Integração externa quebrada

**Ações:**

1. **Identificar módulo afetado** (consultar Matriz)
2. **Verificar logs específicos** do módulo
3. **Isolar funcionalidade** (feature flag se possível)
4. **Investigar causa raiz**
5. **Aplicar correção** ou workaround
6. **Validar correção**
7. **Documentar** (ADR se necessário)

### 5.4 Procedimento MÉDIO (Funcionalidade Importante Afetada)

**Ações:**

1. Documentar problema
2. Priorizar na sprint
3. Investigar em horário comercial
4. Aplicar correção no próximo ciclo
5. Validar e documentar

### 5.5 Procedimento BAIXO (Problema Não Crítico)

**Ações:**

1. Adicionar ao backlog
2. Priorizar normalmente
3. Corrigir em ciclo regular

---

## 6. Checklist de Validação Rápida

### 6.1 Antes de Qualquer Mudança

- [ ] Consultei o Centro de Comando?
- [ ] Verifiquei minha autoridade para esta decisão?
- [ ] Executei autoanálise completa?
- [ ] Identifiquei a capacidade afetada?
- [ ] Validei o módulo/contexto correto?
- [ ] Mapeei impacto completo?
- [ ] Criei ADR (se necessário)?

### 6.2 Validação de Saúde do Sistema (Diária)

- [ ] Health checks passando?
- [ ] Taxa de erro < 1%?
- [ ] Latência p95 < 500ms?
- [ ] Sem alertas críticos?
- [ ] Logs sem erros graves?
- [ ] Banco de dados saudável?
- [ ] Cache funcionando?

### 6.3 Validação Arquitetural (Semanal)

- [ ] Matriz atualizada?
- [ ] Nenhum módulo órfão?
- [ ] Todas as capacidades têm dono?
- [ ] Sem dependências circulares?
- [ ] Contextos isolados corretamente?
- [ ] Eventos documentados?
- [ ] APIs versionadas?

### 6.4 Validação de Documentação (Mensal)

- [ ] Inventário atualizado?
- [ ] Mapas refletem código?
- [ ] ADRs criados para decisões relevantes?
- [ ] Documentação de APIs atualizada?
- [ ] Eventos documentados?
- [ ] Capacidades classificadas corretamente?

---

## 7. Comandos Rápidos de Emergência

### 7.1 Verificação de Saúde

```bash
# Health check completo
curl http://localhost:3000/health | jq

# Health check da API
curl http://localhost:3000/api/health | jq

# Status dos serviços
docker-compose ps

# Logs em tempo real
docker-compose logs -f --tail=100
```

### 7.2 Rollback

```bash
# Rollback automático
./deploy/rollback.sh

# Rollback manual
git checkout [commit]
docker-compose down
docker-compose up -d --build
```

### 7.3 Diagnóstico

```bash
# Verificar erros recentes
grep -i "error\|exception" logs/*.log | tail -50

# Verificar uso de recursos
docker stats

# Verificar conexões de banco
psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Verificar cache
redis-cli ping
redis-cli info stats
```

### 7.4 Monitoramento

```bash
# Iniciar monitoramento
./deploy/monitor.sh

# Ver métricas Prometheus (se configurado)
curl http://localhost:9090/api/v1/query?query=up
```

---

## 8. Integração com Guia de Desenvolvimento

Para processo completo de desenvolvimento:

1. **Consultar este documento** (Centro de Comando) para visão geral
2. **Seguir [Guia de Desenvolvimento e Deploy](./Guia-Desenvolvimento-Deploy-Produção.md)** para:
   - Processo completo de desenvolvimento
   - Checklist de produçãoo
   - Medidas preventivas
   - Comandos úteis

---

## 9. Matriz de Decisão Rápida

Use esta matriz para decisões comuns:

| Situação                      | Ação                                                                                                                      | Documento de Referência     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| Preciso criar novo módulo     | 1. Verificar se já existe<br>2. Identificar capacidade<br>3. Mapear para contexto<br>4. Criar ADR<br>5. Obter aprovação   | Matriz, Mapa de Contextos   |
| Preciso modificar Core Domain | 1. Criar ADR obrigatório<br>2. Obter aprovação Arquiteto+PO<br>3. Validar impacto completo<br>4. Implementar gradualmente | Mapa de Contextos, Diretiva |
| Preciso criar nova API        | 1. Verificar se já existe<br>2. Versionar corretamente<br>3. Documentar contrato<br>4. Implementar                        | Diretiva de Governança      |
| Encontrei código órfão        | 1. Verificar uso real<br>2. Se não usado, remover<br>3. Se usado, documentar                                              | Diretiva de Governança      |
| Preciso integrar módulos      | 1. Preferir eventos<br>2. Se síncrono, usar casos de uso<br>3. Nunca import direto                                        | Mapa de Contextos           |
| Sistema está lento            | 1. Verificar health checks<br>2. Analisar logs<br>3. Verificar recursos<br>4. Seguir procedimento ALTO                    | Seção 5.3                   |
| Sistema está fora do ar       | 1. Seguir procedimento CRÍTICO<br>2. Isolar problema<br>3. Rollback se necessário                                         | Seção 5.2                   |

---

## 10. Contatos e Escalação

### 9.1 Equipe de Emergência

| Papel             | Responsabilidade                | Contato   |
| ----------------- | ------------------------------- | --------- |
| **Arquiteto**     | Decisões arquiteturais críticas | [Contato] |
| **Tech Lead**     | Decisões técnicas, rollbacks    | [Contato] |
| **DevOps**        | Infraestrutura, deploy          | [Contato] |
| **Product Owner** | Priorização, aprovações         | [Contato] |

### 9.2 Canais de Comunicação

- **Emergência Crítica**: [Canal/Telefone]
- **Avisos Técnicos**: [Canal]
- **Decisões Arquiteturais**: [Canal]
- **Status de Sistema**: [URL Status Page]

---

## 11. Manutenção do Centro de Comando

### 10.1 Atualização Periódica

Este documento deve ser atualizado:

- **Diariamente**: Status de saúde (automático se possível)
- **Semanalmente**: Status de módulos, métricas
- **Mensalmente**: Dashboard executivo completo
- **Trimestralmente**: Revisão completa e validação

### 10.2 Responsabilidades

| Item                        | Responsável         | Frequência        |
| --------------------------- | ------------------- | ----------------- |
| Dashboard Executivo         | Tech Lead           | Mensal            |
| Status de Módulos           | Cada dono de módulo | Semanal           |
| Procedimentos de Emergência | DevOps + Tech Lead  | Quando necessário |
| Matriz de Autoridade        | Arquiteto           | Trimestral        |

---

## 12. Regra Final

> **Este documento é o seu painel de controle.**
> **Consulte sempre antes de decisões críticas.**
> **Mantenha atualizado para ter controle absoluto.**

**Lembre-se:**

- ✅ Visão geral → Consulte seção 2
- ✅ Controle → Consulte seção 3
- ✅ Erro grave → Consulte seção 5
- ✅ Decisão rápida → Consulte seção 8

**Qualquer dúvida, este documento deve ser o primeiro ponto de consulta.**
