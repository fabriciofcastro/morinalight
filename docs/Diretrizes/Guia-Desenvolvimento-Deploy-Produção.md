# Guia de Desenvolvimento e Deploy para Produção

> **Este documento define COMO desenvolver daqui para frente, O QUE adotar, O QUE falta e O QUE antecipar preventivamente.**
> Use este guia como referência diária para garantir qualidade, segurança e sucesso em produção.

---

## 1. Objetivo

Este guia fornece:

- ✅ **Processo completo** de desenvolvimento do início ao deploy
- ✅ **Práticas obrigatórias** a serem adotadas
- ✅ **Checklist de produção** completo
- ✅ **Medidas preventivas** para evitar problemas
- ✅ **Integração** com todos os documentos de diretrizes

> **Este é o seu manual de desenvolvimento. Consulte sempre antes de começar qualquer tarefa.**

---

## 1.1 Status Atual do Sistema

### ✅ Design System Disponível

O sistema já possui um **Design System completo** em `packages/ui/`:

**Componentes Disponíveis:**
- `Button`, `Input`, `Select`, `Textarea`
- `FormField`, `Checkbox`, `Tooltip`
- `GlassCard`, `Alert`, `Badge`
- `TreeView`, `Popover`, `DropdownMenu`

**Design Tokens:**
- Cores semânticas (primary, success, warning, danger)
- Tipografia (Inter, escala completa)
- Espaçamento (escala 8px)
- Temas (Dark/Light)

**👉 Use os componentes existentes antes de criar novos!**

### ✅ Padrão de Telas

O formato da tela **Ficha de Custo de Aviamentos** está sendo usado como **padrão de referência**:

**Estrutura Padrão:**
- Header com título e descrição
- Formulário com validação em tempo real
- Auto-save com indicador visual
- Workflow de aprovação
- Versionamento e auditoria
- Upload de arquivos integrado

**Localização:** `apps/web/src/app/(app)/fichas-custo/`

**👉 Siga este padrão ao criar novas telas similares!**

### ✅ Controle de Acesso Multi-Camadas

O sistema implementa **RBAC + ABAC + PBAC**:

**RBAC (Role-Based):**
- Define **o que** o usuário pode fazer
- Módulos, telas, ações permitidas
- Baseado em Roles e Permissions

**ABAC (Attribute-Based):**
- Define **em quais dados** pode atuar
- Filtragem por departamento, setor, organização
- Contexto organizacional

**PBAC (Policy-Based):**
- Define **sob quais condições** e aprovações
- Workflows de aprovação
- Regras de negócio condicionais

**Implementação:** `apps/api/src/modules/permissions/`

---

## 2. Fluxo Completo de Desenvolvimento

### 2.1 Fluxograma do Processo

```
┌─────────────────────────────────────────────────────────┐
│              INÍCIO DE UMA TAREFA                       │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │ 1. CONSULTAR DIRETRIZES      │
    │    - Centro de Comando       │
    │    - Diretiva de Governança  │
    │    - Matriz Capacidades      │
    └──────────────┬───────────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │ 2. EXECUTAR AUTOANÁLISE      │
    │    - Análise de Existência   │
    │    - Análise de Localização  │
    │    - Análise de Impacto      │
    └──────────────┬───────────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │ 3. PLANEJAR IMPLEMENTAÇÃO     │
    │    - Identificar capacidade  │
    │    - Mapear módulo/contexto   │
    │    - Criar ADR se necessário  │
    └──────────────┬───────────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │ 4. DESENVOLVER               │
    │    - Seguir padrões          │
    │    - Escrever testes         │
    │    - Documentar código       │
    └──────────────┬───────────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │ 5. VALIDAR LOCALMENTE        │
    │    - Testes passando         │
    │    - Linter OK               │
    │    - Type check OK           │
    └──────────────┬───────────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │ 6. CODE REVIEW               │
    │    - PR descritivo            │
    │    - Revisão de pares         │
    │    - Aprovação necessária     │
    └──────────────┬───────────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │ 7. CI/CD PIPELINE            │
    │    - Testes automatizados     │
    │    - Security scan            │
    │    - Build                    │
    └──────────────┬───────────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │ 8. DEPLOY STAGING            │
    │    - Smoke tests              │
    │    - Validação manual         │
    └──────────────┬───────────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │ 9. DEPLOY PRODUÇÃO            │
    │    - Blue-Green deploy        │
    │    - Monitoramento            │
    │    - Rollback se necessário   │
    └──────────────┬───────────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │ 10. PÓS-DEPLOY               │
    │     - Monitorar métricas     │
    │     - Validar funcionalidade  │
    │     - Documentar mudanças     │
    └──────────────────────────────┘
```

---

## 3. Práticas Obrigatórias a Adotar

### 3.1 Antes de Começar a Codar

#### ✅ Checklist Obrigatório

- [ ] **Consultei o Centro de Comando?**
  - Verificar status atual do sistema
  - Verificar autoridade para decisão
  - Consultar matriz de decisão rápida

- [ ] **Executei autoanálise completa?**
  - Isso já existe? (buscar no código)
  - Onde deve viver? (consultar Matriz)
  - Qual o impacto? (mapear dependências)

- [ ] **Identifiquei a capacidade?**
  - Qual capacidade estou trabalhando?
  - É Core, Negócio, Suporte ou Técnica?
  - Qual a maturidade atual?

- [ ] **Validei módulo e contexto?**
  - Módulo correto identificado?
  - Contexto correto validado?
  - Sem violação de limites?

- [ ] **Criei ADR se necessário?**
  - Mudança arquitetural significativa?
  - Violação de regra (com justificativa)?
  - Nova capacidade Core?

### 3.2 Durante o Desenvolvimento

#### ✅ Padrões de Código Obrigatórios

**Backend:**
- [ ] **DDD aplicado corretamente**
  - Regras de negócio no Domain
  - Use Cases na Application
  - Repositórios na Infrastructure

- [ ] **Validação com Zod**
  - Todos os inputs validados
  - Schemas reutilizáveis
  - Mensagens de erro claras

- [ ] **Eventos de domínio**
  - Ações importantes geram eventos
  - Eventos imutáveis
  - Handlers documentados

- [ ] **Auditoria obrigatória**
  - Ações críticas auditadas
  - Contexto organizacional incluído
  - Logs estruturados

- [ ] **Tratamento de erros**
  - Erros padronizados (AppError)
  - Sanitização em produção
  - Request ID tracking

**Frontend:**
- [ ] **Componentes reutilizáveis**
  - Se aparece 2x, vira componente
  - Classificação: Atômico/Composto/Container
  - Storybook para componentes complexos

- [ ] **Design System**
  - Usar tokens de design
  - Nunca cores hardcoded
  - Consistência visual

- [ ] **Validação de formulários**
  - Zod schemas no frontend
  - Feedback claro ao usuário
  - Validação no backend também

- [ ] **Estado e performance**
  - Hooks reutilizáveis
  - Debounce/throttle quando necessário
  - Lazy loading de componentes

#### ✅ Testes Obrigatórios

**Cobertura Mínima:**
- [ ] **Unit Tests**: > 80% para código crítico
- [ ] **Integration Tests**: Fluxos principais
- [ ] **E2E Tests**: Funcionalidades críticas
- [ ] **Testes de segurança**: Validações de acesso

**O que testar:**
- [ ] Regras de negócio (Domain)
- [ ] Casos de uso (Application)
- [ ] Validações (Zod schemas)
- [ ] Fluxos críticos (E2E)
- [ ] Tratamento de erros

### 3.3 Antes do Commit

#### ✅ Checklist de Qualidade

- [ ] **Código limpo**
  - Sem código comentado
  - Sem console.log
  - Sem código órfão

- [ ] **Linter passando**
  ```bash
  pnpm lint
  ```

- [ ] **Type check passando**
  ```bash
  pnpm type-check
  ```

- [ ] **Testes passando**
  ```bash
  pnpm test
  ```

- [ ] **Build funcionando**
  ```bash
  pnpm build
  ```

- [ ] **Documentação atualizada**
  - Código complexo documentado
  - ADR criado se necessário
  - README atualizado se aplicável

### 3.4 Pull Request

#### ✅ Checklist de PR

- [ ] **Título descritivo**
  - Formato: `[tipo] descrição curta`
  - Exemplo: `[feat] Adiciona validação de CNPJ`

- [ ] **Descrição completa**
  - O que foi feito?
  - Por que foi feito?
  - Como testar?
  - Screenshots (se UI)

- [ ] **Referências**
  - Issue relacionada
  - ADR se aplicável
  - Documentos consultados

- [ ] **Checklist de validação**
  - [ ] Testes adicionados
  - [ ] Documentação atualizada
  - [ ] Breaking changes documentados
  - [ ] Compatibilidade validada

---

## 4. O Que Falta Implementar (Roadmap)

### 4.1 Prioridade CRÍTICA (Fazer Agora)

#### ✅ Fundação Organizacional (Base)
- [ ] **Cadastro de Empresa**
  - Busca automática por CNPJ
  - Validação completa
  - Integração com APIs externas

- [ ] **Estrutura Organizacional Completa**
  - Departamentos
  - Subdepartamentos
  - Setores
  - Cargos
  - Hierarquia validada

- [ ] **RBAC Base**
  - Permissões por cargo
  - Matriz de permissões
  - Controle de acesso contextual

- [ ] **Auditoria Base**
  - Rastreamento de ações
  - Histórico imutável
  - Contexto organizacional

#### ✅ Infraestrutura de Produção
- [ ] **Health Checks Completos**
  - Database
  - Redis
  - Disk space
  - Memory

- [ ] **Monitoramento**
  - Prometheus configurado
  - Grafana dashboards
  - Alertas críticos

- [ ] **Logs Estruturados**
  - Centralização
  - Busca eficiente
  - Retenção configurada

### 4.2 Prioridade ALTA (Próximas 2-4 semanas)

#### ✅ Qualidade e Testes
- [ ] **Cobertura de testes > 80%**
  - Unit tests completos
  - Integration tests críticos
  - E2E tests principais

- [ ] **Performance**
  - Load testing
  - Otimizações identificadas
  - Cache strategy definida

#### ✅ Segurança
- [ ] **Security scanning automatizado**
  - SAST (CodeQL)
  - Dependency scanning
  - Container scanning

- [ ] **Secrets management**
  - Variáveis de ambiente seguras
  - Rotação de credenciais
  - Acesso controlado

### 4.3 Prioridade MÉDIA (Próximo mês)

#### ✅ Observabilidade
- [ ] **Distributed Tracing**
  - Jaeger configurado
  - Traces em produção
  - Análise de latência

- [ ] **Business Metrics**
  - Métricas de negócio
  - Dashboards executivos
  - Alertas de negócio

#### ✅ DevOps
- [ ] **GitOps**
  - ArgoCD ou Flux
  - Deploy automatizado
  - Rollback automático

- [ ] **Feature Flags**
  - Sistema de feature flags
  - Deploy gradual
  - A/B testing

### 4.4 Prioridade BAIXA (Backlog)

- [ ] Chaos Engineering
- [ ] Multi-region support
- [ ] Disaster recovery automatizado
- [ ] Performance optimization avançada

---

## 5. Medidas Preventivas (Antecipar Problemas)

### 5.1 Prevenção de Bugs em Produção

#### ✅ Validações Múltiplas
- [ ] **Frontend**: Validação imediata (UX)
- [ ] **Backend**: Validação obrigatória (Segurança)
- [ ] **Database**: Constraints quando possível
- [ ] **Nunca confiar apenas no frontend**

#### ✅ Tratamento de Erros Robusto
- [ ] **Try-catch em operações críticas**
- [ ] **Fallbacks para serviços externos**
- [ ] **Circuit breakers para integrações**
- [ ] **Retry com exponential backoff**

#### ✅ Testes de Carga
- [ ] **Load testing antes de deploy**
- [ ] **Identificar gargalos**
- [ ] **Validar limites de escalabilidade**

### 5.2 Prevenção de Problemas de Segurança

#### ✅ Validação de Entrada
- [ ] **Sanitização de inputs**
- [ ] **SQL injection prevention** (Prisma ajuda)
- [ ] **XSS prevention** (React escapa por padrão)
- [ ] **CSRF protection**

#### ✅ Autenticação e Autorização
- [ ] **Tokens seguros** (JWT com expiração)
- [ ] **Refresh tokens** implementados
- [ ] **RBAC validado em cada endpoint**
- [ ] **Rate limiting** configurado

#### ✅ Secrets e Credenciais
- [ ] **Nunca commitar secrets**
- [ ] **Usar variáveis de ambiente**
- [ ] **Rotação periódica**
- [ ] **Acesso mínimo necessário**

### 5.3 Prevenção de Problemas de Performance

#### ✅ Otimizações Preventivas
- [ ] **Cache strategy definida**
  - O que cachear?
  - TTL apropriado?
  - Invalidação correta?

- [ ] **Database queries otimizadas**
  - Índices necessários
  - N+1 queries evitadas
  - Paginação implementada

- [ ] **Lazy loading**
  - Componentes React
  - Rotas Next.js
  - Imagens otimizadas

#### ✅ Monitoramento Proativo
- [ ] **Métricas de performance**
  - Latência p50, p95, p99
  - Throughput
  - Error rate

- [ ] **Alertas preventivos**
  - Antes de ficar crítico
  - Tendências identificadas
  - Ação antes do problema

### 5.4 Prevenção de Problemas de Deploy

#### ✅ Deploy Seguro
- [ ] **Blue-Green deployment**
  - Zero downtime
  - Rollback rápido
  - Validação antes de trocar

- [ ] **Smoke tests automáticos**
  - Health checks
  - Funcionalidades críticas
  - Validação pós-deploy

- [ ] **Feature flags**
  - Deploy gradual
  - Rollback instantâneo
  - A/B testing

#### ✅ Validação Pré-Deploy
- [ ] **Staging environment**
  - Testar antes de produção
  - Dados similares a produção
  - Validação completa

- [ ] **Checklist de produção**
  - Todos os itens validados
  - Aprovação necessária
  - Documentação atualizada

---

## 6. Checklist Completo para Produção

### 6.1 Pré-Deploy (Antes de Fazer Deploy)

#### ✅ Código
- [ ] Todos os testes passando (> 80% cobertura)
- [ ] Linter sem erros
- [ ] Type check sem erros
- [ ] Build funcionando
- [ ] Sem código órfão
- [ ] Sem console.log/debug
- [ ] Secrets não commitados

#### ✅ Arquitetura
- [ ] ADR criado (se necessário)
- [ ] Matriz atualizada
- [ ] Capacidade identificada
- [ ] Módulo/contexto validado
- [ ] Impacto mapeado
- [ ] Dependências validadas

#### ✅ Segurança
- [ ] Security scan passando
- [ ] Dependencies atualizadas
- [ ] Vulnerabilidades corrigidas
- [ ] RBAC validado
- [ ] Rate limiting configurado
- [ ] CORS configurado corretamente

#### ✅ Performance
- [ ] Queries otimizadas
- [ ] Cache configurado
- [ ] Lazy loading implementado
- [ ] Imagens otimizadas
- [ ] Bundle size validado

#### ✅ Observabilidade
- [ ] Logs estruturados
- [ ] Métricas implementadas
- [ ] Health checks funcionando
- [ ] Alertas configurados
- [ ] Tracing implementado (se aplicável)

#### ✅ Documentação
- [ ] Código documentado
- [ ] ADR criado (se necessário)
- [ ] README atualizado
- [ ] Changelog atualizado
- [ ] Breaking changes documentados

### 6.2 Deploy (Durante o Deploy)

#### ✅ Processo
- [ ] Backup realizado
- [ ] Staging validado
- [ ] Smoke tests passando
- [ ] Blue-Green deploy configurado
- [ ] Rollback plan pronto
- [ ] Equipe notificada

#### ✅ Validação
- [ ] Health checks passando
- [ ] Funcionalidades críticas testadas
- [ ] Performance dentro do esperado
- [ ] Sem erros nos logs
- [ ] Métricas normais

### 6.3 Pós-Deploy (Após Deploy)

#### ✅ Monitoramento (Primeiros 15 minutos)
- [ ] Health checks contínuos
- [ ] Error rate monitorado
- [ ] Latência monitorada
- [ ] Logs sendo analisados
- [ ] Alertas verificados

#### ✅ Validação (Primeira hora)
- [ ] Funcionalidades críticas validadas
- [ ] Performance validada
- [ ] Sem regressões detectadas
- [ ] Usuários não reportando problemas

#### ✅ Consolidação (Primeiras 24 horas)
- [ ] Métricas estáveis
- [ ] Sem incidentes
- [ ] Documentação finalizada
- [ ] Aprendizados documentados

---

## 7. Processo de Deploy para Produção

### 7.1 Preparação

```bash
# 1. Verificar branch
git checkout main
git pull origin main

# 2. Verificar status
git status
git log --oneline -5

# 3. Executar testes localmente
pnpm test
pnpm lint
pnpm type-check
pnpm build

# 4. Verificar checklist de produção
# (Seção 6.1)
```

### 7.2 Deploy Staging

```bash
# 1. Merge para develop (se aplicável)
# 2. CI/CD pipeline executa automaticamente
# 3. Validar em staging
curl https://staging.morina.com/health

# 4. Executar smoke tests
./deploy/strategies/smoke-tests.sh

# 5. Validar funcionalidades manualmente
```

### 7.3 Deploy Produção

```bash
# 1. Criar tag de release
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# 2. CI/CD pipeline executa automaticamente
# 3. Blue-Green deployment
./deploy/strategies/blue-green-deploy.sh

# 4. Monitorar deploy
./deploy/monitor.sh

# 5. Validar health checks
curl https://api.morina.com/health

# 6. Executar smoke tests
./deploy/strategies/smoke-tests.sh
```

### 7.4 Rollback (Se Necessário)

```bash
# 1. Detectar problema
# 2. Executar rollback
./deploy/rollback.sh

# Ou manualmente
git checkout [commit-anterior]
docker-compose down
docker-compose up -d --build

# 3. Validar rollback
curl https://api.morina.com/health
```

---

## 8. Integração com Documentos de Diretrizes

### 8.1 Quando Consultar Cada Documento

| Situação | Documento | Seção |
|----------|-----------|-------|
| Iniciar nova tarefa | Centro de Comando | Seção 2, 3 |
| Decisão arquitetural | Centro de Comando | Seção 3 |
| Erro grave | Centro de Comando | Seção 5 |
| Autoanálise | Diretiva de Governança | Seção 2 |
| Identificar capacidade | Mapa de Capacidades | Seção 4 |
| Mapear módulo | Matriz | Seção 3 |
| Validar contexto | Mapa de Contextos | Seção 5 |
| Mapear sistema | Guia de Inventário | Seção 3 |

### 8.2 Fluxo Integrado

```
Iniciar Desenvolvimento
    ↓
Consultar Centro de Comando
    ↓
Executar Autoanálise (Diretiva)
    ↓
Identificar Capacidade (Mapa)
    ↓
Mapear Módulo (Matriz)
    ↓
Validar Contexto (Mapa de Contextos)
    ↓
Desenvolver (este guia)
    ↓
Deploy (este guia)
```

---

## 9. Comandos Úteis

### 9.1 Desenvolvimento Local

```bash
# Instalar dependências
pnpm install

# Executar em desenvolvimento
pnpm dev

# Executar testes
pnpm test
pnpm test:watch
pnpm test:coverage

# Linter
pnpm lint
pnpm lint:fix

# Type check
pnpm type-check

# Build
pnpm build
```

### 9.2 Validação

```bash
# Health check local
curl http://localhost:3000/health

# Testes E2E
pnpm test:e2e

# Load testing
k6 run tests/load/script.js
```

### 9.3 Deploy

```bash
# Deploy staging
./deploy/deploy.sh staging

# Deploy produção
./deploy/deploy.sh production

# Rollback
./deploy/rollback.sh

# Monitoramento
./deploy/monitor.sh
```

---

## 10. Regras de Ouro (Não Negociáveis)

> ⚠️ **VIOLAÇÕES DESTAS REGRAS SÃO PROIBIDAS**

1. **Nunca fazer deploy sem testes passando**
2. **Nunca fazer deploy sem validação em staging**
3. **Nunca commitar secrets**
4. **Nunca fazer deploy direto em produção** (sempre via CI/CD)
5. **Nunca ignorar alertas críticos**
6. **Nunca fazer rollback sem validar causa**
7. **Sempre documentar breaking changes**
8. **Sempre validar impacto antes de mudanças grandes**

---

## 11. Manutenção Contínua

### 11.1 Revisões Periódicas

- **Diária**: Health checks, alertas
- **Semanal**: Métricas, performance
- **Mensal**: Revisão arquitetural, dívida técnica
- **Trimestral**: Revisão completa, roadmap

### 11.2 Atualização de Dependências

- **Semanal**: Verificar vulnerabilidades
- **Mensal**: Atualizar dependências menores
- **Trimestral**: Atualizar dependências maiores (com testes)

---

## 12. Regra Final

> **Este guia é seu manual de desenvolvimento.**
> **Siga sempre os processos definidos.**
> **Antecipe problemas, não reaja a eles.**

**Lembre-se:**
- ✅ Qualidade > Velocidade
- ✅ Prevenção > Correção
- ✅ Testes > Confiança
- ✅ Documentação > Memória

**Qualquer dúvida, consulte o Centro de Comando primeiro.**

