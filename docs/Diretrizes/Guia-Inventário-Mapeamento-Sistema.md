# Guia de Inventário e Mapeamento do Sistema

> **Este documento explica COMO descobrir e mapear tudo que existe no sistema.**
> Use este guia para criar o inventário completo: módulos, capacidades, contextos, relacionamentos e status atual.
>
> **📌 Após o mapeamento, atualize o [Centro de Comando](./Centro-de-Comando-Controle-Absoluto.md) com os dados coletados.**

---

## 1. Objetivo

Criar um **mapa completo e atualizado** de:

- O que existe no sistema
- Onde cada coisa está localizada
- Como se relacionam entre si
- Status atual de cada componente

> **Sem este mapa, não é possível manter os outros documentos atualizados.**

---

## 2. Princípio Fundamental

**O código é a fonte da verdade.**
O mapeamento parte do código existente, não de suposições.

> Antes de mapear, descubra. Antes de documentar, verifique.

---

## 3. Processo de Inventário (Passo a Passo)

### Fase 1: Descoberta de Módulos e Estrutura

#### 3.1 Mapear Estrutura de Pastas

**Objetivo:** Entender a organização física do código.

**Ações:**

1. Listar todas as pastas principais (`apps/`, `packages/`)
2. Identificar cada módulo/pacote
3. Documentar propósito de cada um

**Template de Documentação:**

```markdown
## Estrutura de Módulos

| Caminho                       | Nome               | Tipo      | Propósito                     | Status   |
| ----------------------------- | ------------------ | --------- | ----------------------------- | -------- |
| apps/api                      | API Backend        | Aplicação | Backend Fastify               | ✅ Ativo |
| apps/web                      | Frontend Web       | Aplicação | Frontend Next.js              | ✅ Ativo |
| packages/catalogo-domain      | Domínio Catálogo   | Domínio   | Regras de negócio do catálogo | ✅ Ativo |
| packages/catalogo-application | Aplicação Catálogo | Aplicação | Casos de uso do catálogo      | ✅ Ativo |
```

**Ferramentas:**

```bash
# Listar estrutura
find . -type d -maxdepth 3 -not -path '*/node_modules/*' -not -path '*/.git/*'

# Contar arquivos por módulo
find apps/api/src -name "*.ts" | wc -l
find apps/web/src -name "*.tsx" | wc -l
```

#### 3.2 Identificar Entidades de Domínio

**Objetivo:** Descobrir todas as entidades principais do sistema.

**Ações:**

1. Buscar arquivos de schema (Prisma, Zod)
2. Buscar classes de domínio (Entity, Aggregate)
3. Listar todas as entidades encontradas

**Template:**

```markdown
## Entidades de Domínio

| Entidade   | Módulo              | Contexto     | Status   | Relacionamentos     |
| ---------- | ------------------- | ------------ | -------- | ------------------- |
| Company    | organization-domain | Organization | ✅ Ativo | -                   |
| Department | organization-domain | Organization | ✅ Ativo | Company             |
| User       | user-domain         | Security     | ✅ Ativo | Company, Department |
```

**Ferramentas:**

```bash
# Buscar schemas Prisma
grep -r "model " apps/api/prisma/schema.prisma

# Buscar classes Entity
grep -r "class.*extends Entity" packages/*/src

# Buscar schemas Zod
find . -name "*.ts" -exec grep -l "z.object" {} \;
```

#### 3.3 Mapear APIs e Endpoints

**Objetivo:** Descobrir todas as rotas e contratos públicos.

**Ações:**

1. Buscar rotas no backend (Fastify routes)
2. Buscar API routes no frontend (Next.js)
3. Documentar cada endpoint

**Template:**

```markdown
## Endpoints da API

| Método | Rota                        | Módulo           | Capacidade      | Status   |
| ------ | --------------------------- | ---------------- | --------------- | -------- |
| GET    | /api/organization/companies | organization-api | Listar empresas | ✅ Ativo |
| POST   | /api/organization/companies | organization-api | Criar empresa   | ✅ Ativo |
| GET    | /api/users                  | user-api         | Listar usuários | ✅ Ativo |
```

**Ferramentas:**

```bash
# Buscar rotas Fastify
grep -r "\.get\|\.post\|\.put\|\.delete" apps/api/src

# Buscar rotas Next.js
find apps/web/src/app/api -name "route.ts" -exec cat {} \;
```

#### 3.4 Identificar Eventos de Domínio

**Objetivo:** Descobrir todos os eventos publicados e consumidos.

**Ações:**

1. Buscar classes de eventos
2. Buscar publicações de eventos
3. Buscar handlers de eventos

**Template:**

```markdown
## Eventos de Domínio

| Evento            | Publicado por       | Consumido por           | Payload                   | Status   |
| ----------------- | ------------------- | ----------------------- | ------------------------- | -------- |
| CompanyCreated    | organization-domain | audit, notifications    | { companyId, name }       | ✅ Ativo |
| UserCreated       | user-domain         | audit, notifications    | { userId, email }         | ✅ Ativo |
| DepartmentUpdated | organization-domain | security, notifications | { departmentId, changes } | ✅ Ativo |
```

**Ferramentas:**

```bash
# Buscar classes de eventos
grep -r "class.*Event" packages/*/src

# Buscar publicações
grep -r "eventBus.publish\|eventEmitter.emit" .

# Buscar handlers
grep -r "subscribe\|on(" packages/*/src
```

---

### Fase 2: Mapear Capacidades

#### 3.5 Identificar Capacidades Existentes

**Objetivo:** Descobrir O QUE o sistema faz (não COMO).

**Processo:**

1. Analisar cada módulo e perguntar: "O que este módulo permite fazer?"
2. Agrupar funcionalidades relacionadas
3. Classificar como Core/Negócio/Suporte/Técnica

**Template:**

```markdown
## Capacidades Identificadas

| Capacidade              | Classificação | Módulos Envolvidos                    | Status   | Maturidade |
| ----------------------- | ------------- | ------------------------------------- | -------- | ---------- |
| Gerenciar Empresas      | Core          | organization-domain, organization-api | ✅ Ativo | Controlada |
| Gerenciar Departamentos | Core          | organization-domain, organization-api | ✅ Ativo | Controlada |
| Gerenciar Usuários      | Negócio       | user-domain, user-api                 | ✅ Ativo | Inicial    |
| Autenticação            | Técnica       | auth-module                           | ✅ Ativo | Escalável  |
```

**Perguntas para Identificar:**

- O que o usuário pode fazer com este módulo?
- Qual problema de negócio este módulo resolve?
- Esta funcionalidade diferencia o produto?

---

### Fase 3: Mapear Contextos e Relacionamentos

#### 3.6 Identificar Bounded Contexts

**Objetivo:** Descobrir os contextos delimitados do sistema.

**Processo:**

1. Agrupar módulos relacionados por domínio de negócio
2. Identificar modelos únicos de cada contexto
3. Mapear comunicação entre contextos

**Template:**

```markdown
## Bounded Contexts

| Contexto     | Tipo    | Módulos                               | Modelos Principais          | Status   |
| ------------ | ------- | ------------------------------------- | --------------------------- | -------- |
| Organization | Core    | organization-domain, organization-api | Company, Department, Sector | ✅ Ativo |
| Security     | Core    | user-domain, auth-module              | User, Role, Permission      | ✅ Ativo |
| Catalog      | Negócio | catalogo-domain, catalogo-application | Product, Category           | ✅ Ativo |
```

#### 3.7 Mapear Dependências e Relacionamentos

**Objetivo:** Entender como os módulos se relacionam.

**Processo:**

1. Analisar imports entre módulos
2. Identificar dependências diretas
3. Mapear comunicação (eventos, APIs, contratos)

**Template:**

```markdown
## Relacionamentos entre Módulos

| Módulo A      | Tipo de Relação | Módulo B            | Método        | Status     |
| ------------- | --------------- | ------------------- | ------------- | ---------- |
| user-api      | Depende de      | organization-domain | Import direto | ⚠️ Revisar |
| notifications | Consome         | organization-domain | Eventos       | ✅ OK      |
| security      | Depende de      | organization-domain | API interna   | ✅ OK      |
```

**Ferramentas:**

```bash
# Analisar imports
grep -r "from.*organization" packages/user-domain/src

# Buscar dependências no package.json
grep -r "\"@morina/" packages/*/package.json
```

---

### Fase 4: Documentar Status e Gaps

#### 3.8 Identificar Código Órfão

**Objetivo:** Encontrar código não utilizado.

**Ações:**

1. Buscar funções/componentes sem referências
2. Identificar endpoints não documentados
3. Encontrar módulos sem uso

**Ferramentas:**

```bash
# Usar ferramentas de análise estática
npx depcheck
npx unimported
```

#### 3.9 Identificar Gaps Arquiteturais

**Objetivo:** Encontrar violações das diretrizes.

**Checklist:**

- [ ] Há módulos sem capacidade definida?
- [ ] Há dependências circulares?
- [ ] Há acesso direto entre contextos?
- [ ] Há lógica de negócio fora do domínio?
- [ ] Há eventos não documentados?

---

## 4. Template de Inventário Completo

Use este template para documentar o inventário completo:

```markdown
# Inventário do Sistema - [Data]

## 1. Visão Geral

- **Total de Módulos:** X
- **Total de Capacidades:** Y
- **Total de Contextos:** Z
- **Última Atualização:** YYYY-MM-DD

## 2. Módulos

[Usar template da seção 3.1]

## 3. Entidades

[Usar template da seção 3.2]

## 4. APIs

[Usar template da seção 3.3]

## 5. Eventos

[Usar template da seção 3.4]

## 6. Capacidades

[Usar template da seção 3.5]

## 7. Contextos

[Usar template da seção 3.6]

## 8. Relacionamentos

[Usar template da seção 3.7]

## 9. Problemas Identificados

- [ ] Problema 1: Descrição e impacto
- [ ] Problema 2: Descrição e impacto

## 10. Próximos Passos

- [ ] Ação 1
- [ ] Ação 2
```

---

## 5. Ferramentas e Scripts Úteis

### 5.1 Script de Análise Automática

Crie scripts para automatizar parte do mapeamento:

```bash
#!/bin/bash
# scripts/map-system.sh

echo "=== Mapeamento do Sistema ==="
echo ""

echo "1. Estrutura de Módulos:"
find . -type d -maxdepth 2 -name "src" | grep -E "(apps|packages)" | sort

echo ""
echo "2. Entidades Prisma:"
grep -h "model " apps/api/prisma/schema.prisma | sed 's/model //' | sed 's/ {.*//'

echo ""
echo "3. Rotas da API:"
grep -r "\.get\|\.post" apps/api/src --include="*.ts" | grep -o "'/[^']*'" | sort -u

echo ""
echo "4. Eventos:"
grep -r "class.*Event" packages/*/src --include="*.ts" | grep -o "class [A-Z][a-zA-Z]*Event" | sort -u
```

### 5.2 Análise de Dependências

```bash
# Analisar dependências entre pacotes
npx madge --circular --extensions ts,tsx packages/
npx madge --image deps.svg packages/
```

### 5.3 Busca de Padrões

```bash
# Buscar todos os use cases
find . -name "*UseCase.ts" -o -name "*use-case.ts"

# Buscar todos os repositórios
find . -name "*Repository.ts" -o -name "*repository.ts"

# Buscar todos os serviços
find . -name "*Service.ts" -o -name "*service.ts"
```

---

## 6. Processo de Manutenção Contínua

### 6.1 Atualização Periódica

**Frequência:** Mensal ou a cada sprint

**Checklist:**

- [ ] Novo módulo criado? → Adicionar ao inventário
- [ ] Nova entidade criada? → Adicionar ao mapeamento
- [ ] Novo endpoint criado? → Documentar na API
- [ ] Novo evento criado? → Adicionar aos eventos
- [ ] Nova capacidade identificada? → Atualizar matriz

### 6.2 Validação Automática

**Integrar no CI/CD:**

- Script que valida se novos módulos foram documentados
- Verificação se novos endpoints têm documentação
- Alerta se novo evento não está documentado

### 6.3 Revisão Trimestral

**Ações:**

1. Revisar inventário completo
2. Validar se código reflete documentação
3. Identificar gaps e inconsistências
4. Atualizar mapas e diretrizes

---

## 7. Integração com Outros Documentos

Este inventário alimenta:

1. **[Matriz Capacidade × Contexto × Módulo](./Matriz-Capacidade×Contexto×Módulo.md)**
   - Lista de capacidades
   - Mapeamento para módulos
   - Status de maturidade

2. **[Mapa de Capacidades](./Mapa-Capacidades-Sistema-(Capability Map).md)**
   - Classificação de capacidades
   - Relacionamentos entre capacidades

3. **[Mapa de Contextos](./Mapa de Contextos-Núcleo-Domínio-Governança-Dependências.md)**
   - Bounded contexts identificados
   - Relacionamentos entre contextos
   - Dependências mapeadas

4. **[Diretiva de Governança](./Diretiva-Autoanálise-Governança-Técnica-do-Sistema.md)**
   - Status atual do sistema
   - Gaps identificados
   - Problemas arquiteturais

---

## 8. Exemplo Prático: Mapeamento Inicial

### Passo 1: Executar Scripts de Descoberta

```bash
# Executar script de mapeamento
./scripts/map-system.sh > docs/inventario-inicial.txt

# Analisar dependências
npx madge --circular packages/ > docs/dependencias.txt
```

### Passo 2: Preencher Templates

Usar os templates das seções anteriores para documentar:

- Módulos encontrados
- Entidades identificadas
- APIs mapeadas
- Eventos descobertos

### Passo 3: Classificar e Organizar

- Agrupar por contexto
- Classificar capacidades
- Mapear relacionamentos

### Passo 4: Validar e Refinar

- Revisar com equipe
- Validar com código
- Refinar classificação

### Passo 5: Atualizar Documentos

- Atualizar Matriz
- Atualizar Mapas
- Criar ADRs para gaps encontrados

---

## 9. Regra Final

> **O inventário é o ponto de partida para toda governança.**
> **Sem saber o que existe, não é possível governar.**

Este documento deve ser:

- **Consultado antes de qualquer mapeamento**
- **Atualizado continuamente**
- **Usado como base para decisões arquiteturais**
- **Revisado periodicamente**

**Lembre-se:** O código é a fonte da verdade. O inventário reflete o código, não o contrário.
