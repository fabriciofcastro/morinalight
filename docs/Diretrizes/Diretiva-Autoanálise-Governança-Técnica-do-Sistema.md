# Diretiva de Autoanálise e Governança Técnica do Sistema

> **Este documento rege qualquer modificação, melhoria ou criação dentro do sistema existente.**
> Nada deve ser implementado sem cumprir integralmente este fluxo.
>
> **📌 Para visão geral completa, controle absoluto e procedimentos de emergência, consulte o [Centro de Comando](./Centro-de-Comando-Controle-Absoluto.md)**

---

## 1. Princípio Fundamental (Lei Máxima do Sistema)

**O sistema existente é a fonte da verdade.**
Nada é criado assumindo ausência. Tudo parte do pressuposto de que _algo já existe_.

> **Regra de ouro:** antes de criar, provar que não existe. Antes de alterar, provar impacto. Antes de remover, provar irrelevância.

---

## 2. Fluxo Obrigatório de Autoanálise (Checklist Inviolável)

Antes de qualquer ação, o Cursor/IA/Dev **DEVE responder internamente** às perguntas abaixo. **Este checklist é inviolável.**

### Fluxograma de Decisão:

```
Iniciar mudança
    ↓
[Análise de Existência]
    ├─ Existe? → Usar/Estender existente
    └─ Não existe? → Continuar
    ↓
[Análise de Localização]
    ├─ Módulo correto? → Continuar
    └─ Módulo errado? → Parar e reavaliar
    ↓
[Análise de Impacto]
    ├─ Impacto mapeado? → Continuar
    └─ Impacto desconhecido? → Parar e investigar
    ↓
Implementar
```

### 2.1 Análise de Existência

**Perguntas obrigatórias:**

- Isso já existe? (buscar no código)
- Existe algo semelhante? (buscar por funcionalidade similar)
- Existe uma abstração genérica que cobre esse caso? (verificar padrões)

**Ações baseadas na resposta:**

- **Se existe:** Usar, estender ou adaptar o existente
- **Se existe similar:** Avaliar se pode generalizar
- **Se não existe:** Prosseguir com criação

> **Regra de ouro:** Se existir algo similar: **extender > adaptar > configurar**. Nunca duplicar.

### Exemplo Prático:

```
Situação: Preciso criar validação de CPF

Análise de Existência:
1. Buscar "CPF" no código → Encontrei função validateCPF em utils
2. Verificar se atende meu caso → Sim, mas preciso de validação com máscara
3. Decisão: Estender função existente ao invés de criar nova
```

---

### 2.2 Análise de Localização

**Perguntas obrigatórias:**

- Em qual módulo isso pertence? (consultar Matriz Capacidade × Contexto × Módulo)
- Esse módulo é dono dessa responsabilidade? (verificar limites do contexto)
- Estou violando limites de contexto? (consultar Mapa de Contextos)

**Validação:**

- Consultar **[Matriz Capacidade × Contexto × Módulo](./Matriz-Capacidade×Contexto×Módulo.md)**
- Consultar **[Mapa de Contextos](./Mapa de Contextos-Núcleo-Domínio-Governança-Dependências.md)**
- Verificar se a responsabilidade está no módulo correto

> **Regra crítica:** Responsabilidade fora do módulo correto é falha arquitetural. Corrigir antes de implementar.

### Exemplo Prático:

```
Situação: Preciso criar lógica de validação de hierarquia de departamentos

Análise de Localização:
1. Consultar Matriz → "Gerenciar Estrutura Organizacional" → Módulo: organization-domain
2. Verificar contexto → Contexto: Organization
3. Validar limites → A lógica de hierarquia pertence ao domínio Organization
4. Decisão: Implementar em organization-domain, não em user-management
```

---

### 2.3 Análise de Impacto (Obrigatória)

**Responder explicitamente (documentar respostas):**

- Que módulos podem ser impactados? (listar todos)
- Que fluxos de negócio podem quebrar? (mapear dependências)
- Que eventos serão afetados? (listar eventos publicados/consumidos)
- Há contratos públicos envolvidos? (API, eventos, filas)
- Há testes que precisam ser atualizados? (cobertura de impacto)

**Checklist de Impacto:**

- [ ] Módulos dependentes identificados
- [ ] Fluxos de negócio mapeados
- [ ] Eventos afetados listados
- [ ] Contratos públicos identificados
- [ ] Testes impactados mapeados
- [ ] Plano de migração definido (se necessário)

> **Regra absoluta:** Se não conseguir mapear impacto, **a mudança é proibida**. Investigar mais antes de prosseguir.

### Exemplo Prático:

```
Situação: Vou modificar estrutura de Department

Análise de Impacto:
1. Módulos impactados:
   - organization-domain (dono)
   - security (usa Department para acesso)
   - notifications (notifica mudanças)

2. Fluxos que podem quebrar:
   - Criação de departamento
   - Validação de hierarquia
   - Controle de acesso baseado em departamento

3. Eventos afetados:
   - DepartmentCreated
   - DepartmentUpdated

4. Contratos públicos:
   - GET /api/organization/departments
   - POST /api/organization/departments

5. Decisão: Criar versão nova da API, manter compatibilidade
```

---

## 3. Diretriz de Evolução (Nunca Substituição Abrupta)

O sistema **evolui por camadas**, nunca por ruptura. **Evolução gradual e controlada.**

### Ordem correta (Estratégia de Migração):

#### Fase 1: Preparação

1. **Criar nova versão (paralela)**
   - Nova implementação ao lado da antiga
   - Não remover código antigo ainda
   - Manter compatibilidade

#### Fase 2: Transição

2. **Redirecionar gradualmente uso**
   - Migrar consumidores um por um
   - Usar feature flags quando possível
   - Monitorar cada migração

#### Fase 3: Validação

3. **Monitorar comportamento**
   - Métricas de performance
   - Logs de erro
   - Feedback dos usuários

#### Fase 4: Deprecação

4. **Deprecar explicitamente**
   - Marcar código antigo como deprecated
   - Documentar data de remoção
   - Avisar consumidores

#### Fase 5: Remoção

5. **Remover apenas após validação**
   - Todos os consumidores migrados
   - Período de deprecação respeitado
   - Testes confirmando estabilidade

### Exemplo de Evolução:

```typescript
// Fase 1: Nova versão paralela
class DepartmentServiceV2 {
  // nova implementação
}

// Fase 2: Feature flag
const useV2 = featureFlags.isEnabled("department-service-v2");
const service = useV2 ? new DepartmentServiceV2() : new DepartmentService();

// Fase 3: Monitoramento
// logs e métricas

// Fase 4: Deprecação
/**
 * @deprecated Use DepartmentServiceV2 instead
 * Will be removed in version 2.0.0
 */
class DepartmentService {
  // código antigo
}

// Fase 5: Remoção (após validação completa)
// Remover DepartmentService
```

> **Regra crítica:** Não existe refatoração silenciosa. Toda mudança estrutural é explícita, documentada e gradual.

---

## 4. Governança de Criação de Código

### 4.1 Proibição de Código Órfão

**Regras absolutas:**

- **Nenhuma função sem uso**
  - Se não é usada, não deve existir
  - Remover código morto regularmente
  - Usar ferramentas de análise estática

- **Nenhum componente sem Storybook** (quando aplicável)
  - Componentes reutilizáveis devem ter Storybook
  - Documentação visual do componente
  - Exemplos de uso

- **Nenhum endpoint sem caso de uso**
  - Todo endpoint deve ter caso de uso correspondente
  - Endpoint sem caso de uso = código morto
  - Validar antes de criar

### 4.2 Proibição de Lógica Espalhada

**Regras de negócio NÃO vivem em:**

- ❌ **Controllers** (apenas orquestração)
- ❌ **Hooks** (apenas lógica de apresentação)
- ❌ **Componentes visuais** (apenas renderização)
- ❌ **Services de aplicação** (apenas coordenação)

**Regras de negócio VIVEM em:**

- ✅ **Domain** (entidades, value objects, domain services)
- ✅ **Use Cases** (orquestração de regras de domínio)
- ✅ **Domain Events** (fatos de negócio)

### Exemplo de Violação (ERRADO):

```typescript
// ❌ ERRADO: Lógica de negócio no controller
@Controller("/departments")
class DepartmentController {
  @Post()
  async create(@Body() data: CreateDepartmentDto) {
    // ❌ Regra de negócio no controller
    if (data.parentId) {
      const parent = await this.repo.findById(data.parentId);
      if (parent.level >= 3) {
        throw new Error("Cannot create subdepartment beyond level 3");
      }
    }
    return this.repo.save(data);
  }
}
```

### Exemplo Correto:

```typescript
// ✅ CORRETO: Regra no domínio
class Department extends Entity {
  static create(data: CreateDepartmentData, parent?: Department): Department {
    // Regra de negócio no domínio
    if (parent && parent.level >= 3) {
      throw new DomainError("Cannot create subdepartment beyond level 3");
    }
    return new Department(data);
  }
}

// ✅ CORRETO: Controller apenas orquestra
@Controller("/departments")
class DepartmentController {
  @Post()
  async create(@Body() data: CreateDepartmentDto) {
    return this.createDepartmentUseCase.execute(data);
  }
}
```

> **Regra de ouro:** Regra vive no domínio. Interface apenas orquestra.

---

## 5. Diretriz de Componentização (Frontend)

### Regra Absoluta

> **Se aparece duas vezes, vira componente.**

### Classificação obrigatória:

- Atômico (UI pura)
- Composto (combinação)
- Container (regra + dados)

Nenhuma tela cria lógica nova sem antes verificar:

- Existe hook reutilizável?
- Existe componente base?

---

## 6. Diretriz de Backend (Contratos e Domínio)

### 6.1 Contratos são imutáveis

- API pública não quebra
- Eventos não mudam payload

Nova necessidade = **nova versão**.

---

### 6.2 Eventos

- Evento representa fato ocorrido
- Evento não contém lógica
- Evento não é reutilizado para outro significado

---

## 7. Auditoria e Rastreabilidade (Obrigatória)

Toda ação relevante deve gerar:

- Evento de auditoria
- Log estruturado
- Contexto organizacional (empresa, unidade, usuário)

> Sem auditoria, a feature é considerada incompleta.

---

## 8. Documentação Viva (Sem Excesso, Sem Omissão)

### O que documentar:

- Decisões arquiteturais (ADR)
- Regras de negócio
- Contratos
- Limites de contexto

### O que NÃO documentar:

- Passo a passo trivial
- Código autoexplicativo

### 8.1 Template de ADR (Architecture Decision Record)

Toda decisão arquitetural relevante deve ser documentada como ADR:

```markdown
# ADR-XXXX: [Título da Decisão]

**Status:** Proposta / Aceita / Deprecada / Substituída
**Data:** YYYY-MM-DD
**Decisores:** [Lista de pessoas envolvidas]
**Tags:** [contexto, capacidade, módulo]

## Contexto

[Qual situação levou a esta decisão? Qual problema estamos resolvendo?]

## Decisão

[Qual decisão foi tomada?]

## Consequências

### Positivas

- Consequência positiva 1
- Consequência positiva 2

### Negativas

- Consequência negativa 1 (e como mitigar)

### Impactos

- **Capacidades afetadas:** [lista]
- **Contextos afetados:** [lista]
- **Módulos afetados:** [lista]

## Alternativas Consideradas

1. **Alternativa 1**: [por que foi rejeitada]
2. **Alternativa 2**: [por que foi rejeitada]

## Notas

[Observações adicionais, referências, etc.]
```

**Quando criar ADR:**

- Mudanças estruturais significativas
- Violação de regras arquiteturais (com justificativa)
- Decisões que afetam múltiplos módulos
- Escolhas tecnológicas importantes

### 8.2 Exemplo de Exceção Documentada

Quando for necessário violar uma regra, documentar assim:

```markdown
# ADR-0023: Acesso Direto Temporário entre Contextos

**Status:** Aceita (Temporária)
**Data:** 2024-01-15
**Decisores:** Tech Lead, Arquiteto

## Contexto

Necessitamos acesso direto entre Security e Organization para
validação de permissões em tempo real. A solução por eventos
adicionaria latência inaceitável.

## Decisão

Criar contrato explícito `IOrganizationQueryService` que Security
pode usar. Este contrato será versionado e mantido estável.

## Consequências

- **Positivas:** Latência reduzida, implementação mais simples
- **Negativas:** Acoplamento entre contextos (mitigado por contrato estável)

## Plano de Migração

- Fase 1: Implementar contrato (atual)
- Fase 2: Migrar para eventos assíncronos (Q2 2024)
- Fase 3: Remover contrato direto (Q3 2024)

## Violação de Regra

Esta decisão viola a regra de "Nenhum contexto acessa diretamente
o banco de outro" do Mapa de Contextos. Justificativa: necessidade
temporária de performance, com plano de migração definido.
```

---

## 9. Segurança como Regra Sistêmica

### Diretrizes obrigatórias:

- Autorização baseada em contexto organizacional
- Nenhuma verificação apenas no frontend
- Nenhum acesso implícito

> Segurança é transversal, não feature.

---

## 10. Escalabilidade sem Reescrita

O sistema deve:

- Crescer por módulos
- Escalar por eventos
- Isolar falhas

### Princípios:

- Baixo acoplamento
- Alta coesão
- Dependência sempre aponta para o núcleo

---

## 11. Como Fazer o Mapeamento Inicial

Antes de aplicar as diretrizes de governança, é necessário conhecer o sistema:

1. **Executar inventário completo** seguindo o **[Guia de Inventário e Mapeamento](./Guia-Inventário-Mapeamento-Sistema.md)**
2. **Documentar tudo que existe** (módulos, entidades, APIs, eventos)
3. **Identificar gaps** e problemas arquiteturais
4. **Criar plano de correção** gradual
5. **Aplicar diretrizes** a partir do estado atual

> **Regra crítica:** Não assuma que algo não existe. Sempre verifique no código antes de criar.

---

## 12. Integração com Outros Documentos

Este documento se relaciona diretamente com:

- **[Mapa de Capacidades](./Mapa-Capacidades-Sistema-(Capability Map).md)**: Define O QUE implementar
- **[Matriz Capacidade × Contexto × Módulo](./Matriz-Capacidade×Contexto×Módulo.md)**: Define ONDE implementar
- **[Mapa de Contextos](./Mapa de Contextos-Núcleo-Domínio-Governança-Dependências.md)**: Define LIMITES ao implementar

### Fluxo Completo de Implementação:

```
1. Identificar capacidade (Mapa de Capacidades)
   ↓
2. Mapear para contexto/módulo (Matriz)
   ↓
3. Validar limites e dependências (Mapa de Contextos)
   ↓
4. Executar autoanálise (este documento)
   ├─ Análise de Existência
   ├─ Análise de Localização
   └─ Análise de Impacto
   ↓
5. Implementar seguindo diretrizes (este documento)
   ↓
6. Validar e documentar
```

---

## 13. Processo de Revisão Periódica

Este documento e os relacionados devem ser revisados:

- **Mensalmente**: Revisar matriz e validar atualizações
- **Trimestralmente**: Revisar mapa de capacidades e contextos
- **Semestralmente**: Revisão arquitetural completa

### 12.1 Checklist de Revisão Mensal

- [ ] Matriz atualizada com todas as novas capacidades?
- [ ] Maturidades das capacidades Core revisadas?
- [ ] Dependências ainda válidas?
- [ ] Código reflete a matriz?
- [ ] ADRs criados para decisões relevantes?

### 12.2 Checklist de Revisão Trimestral

- [ ] Novos contextos necessários?
- [ ] Capacidades mudaram de classificação?
- [ ] Relacionamentos entre contextos ainda válidos?
- [ ] Regras de governança ainda aplicáveis?
- [ ] Métricas de saúde do sistema?

### 12.3 Ações Corretivas

Quando revisão identificar problemas:

1. **Documentar** problema encontrado
2. **Priorizar** correção (baseado em impacto)
3. **Planejar** correção (ADR se necessário)
4. **Executar** correção gradual
5. **Validar** correção

---

## 14. Regra Final (Disciplina Arquitetural)

> **Velocidade sem controle cria caos.**
> **Controle sem evolução cria estagnação.**
> **Evolução sem disciplina cria dívida técnica.**

Este documento existe para garantir crescimento contínuo, previsível e seguro.

### Checklist Final Antes de Qualquer Mudança:

- [ ] Executei análise de existência?
- [ ] Validei localização correta?
- [ ] Mapeei impacto completo?
- [ ] Consultei documentos relacionados?
- [ ] Documentei decisões arquiteturais (ADR se necessário)?
- [ ] Segui estratégia de evolução gradual?
- [ ] Atualizei matriz/capacidades/contextos?

Qualquer exceção a estas regras **deve ser explícita, documentada e justificada** (via ADR).
