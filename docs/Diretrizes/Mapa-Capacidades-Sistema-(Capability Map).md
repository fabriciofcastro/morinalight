# Mapa de Capacidades do Sistema (Capability Map)

> **Este documento define O QUE o sistema faz, não COMO é implementado.**
> Ele conecta estratégia de negócio, arquitetura e evolução técnica.
>
> **📌 Para visão geral completa e controle absoluto, consulte o [Centro de Comando](./Centro-de-Comando-Controle-Absoluto.md)**

---

## 1. Princípio Fundamental

**Capacidade é diferente de funcionalidade.**
Funcionalidade muda. Capacidade permanece.

> Código muda com tecnologia. Capacidade muda apenas quando o negócio muda.

---

## 2. Objetivo do Mapa de Capacidades

Este mapa existe para:

- Guiar decisões arquiteturais
- Priorizar evolução do sistema
- Evitar crescimento técnico sem valor de negócio
- Permitir reestruturações sem perder identidade do produto

---

## 3. Regras de Uso

- Capacidades não conhecem tecnologia
- Capacidades não conhecem módulos
- Capacidades não conhecem telas

> Se citar framework, banco ou linguagem, **não é capacidade**.

---

## 4. Classificação das Capacidades

### 4.1 Capacidades Centrais (Core Capabilities)

Sustentam o valor principal do produto. **São o diferencial competitivo.**

#### Lista de Capacidades Core:

- **Gerenciar Estrutura Organizacional**
  - Criar e manter hierarquia: Empresa → Departamento → Subdepartamento → Setor → Cargo
  - Aplicar regras de negócio específicas da organização
  - Suportar multiempresa com isolamento completo

- **Aplicar Hierarquia e Autoridade**
  - Definir relações de subordinação
  - Aplicar regras de autorização baseadas em posição
  - Validar fluxos de aprovação hierárquicos

- **Controlar Acesso Contextual**
  - Autorização baseada em empresa, unidade, papel e contexto
  - Isolamento de dados por organização
  - RBAC granular e contextual

- **Garantir Auditoria e Rastreabilidade**
  - Rastrear todas as ações relevantes
  - Manter histórico imutável
  - Suportar compliance e governança

> **Regra absoluta:** Essas capacidades nunca são terceirizadas nem tratadas como detalhe. São o coração do sistema.

---

### 4.2 Capacidades de Negócio

Apoiam a operação e execução do dia a dia. **Essenciais para operação, mas não diferenciam o produto.**

#### Lista de Capacidades de Negócio:

- **Gerenciar Usuários e Funcionários**
  - Cadastro e manutenção de usuários
  - Associação com estrutura organizacional
  - Gestão de perfis e papéis

- **Executar Fluxos de Aprovação**
  - Definir workflows de aprovação
  - Roteamento baseado em hierarquia
  - Controle de estados de aprovação

- **Emitir Notificações Contextuais**
  - Notificações baseadas em contexto organizacional
  - Canais múltiplos (email, push, in-app)
  - Personalização por empresa

- **Controlar Estados e Ciclos de Vida**
  - Gerenciar transições de estado
  - Validar regras de transição
  - Histórico de mudanças de estado

> Essas capacidades podem evoluir e melhorar, mas não são o diferencial do produto.

---

### 4.3 Capacidades de Suporte

Aumentam eficiência, mas não diferenciam o produto. **Podem ser substituídas sem impacto no core.**

#### Lista de Capacidades de Suporte:

- **Relatórios**
  - Geração de relatórios padrão
  - Exportação de dados
  - Dashboards básicos

- **Exportações**
  - Exportação em múltiplos formatos
  - Agendamento de exportações
  - Integração com sistemas externos

- **Integrações**
  - APIs para integração
  - Webhooks
  - Conectores com sistemas terceiros

- **Comunicação Externa**
  - Envio de emails
  - SMS
  - Integração com serviços de comunicação

> Essas capacidades podem ser terceirizadas ou substituídas sem afetar o core do sistema.

---

### 4.4 Capacidades Técnicas

Existem para sustentar o sistema. **Necessárias, mas não agregam valor de negócio direto.**

#### Lista de Capacidades Técnicas:

- **Autenticação Técnica**
  - Login/logout
  - Gerenciamento de sessão
  - Tokens e refresh tokens

- **Observabilidade**
  - Logs estruturados
  - Métricas de sistema
  - Tracing distribuído

- **Monitoramento**
  - Health checks
  - Alertas de sistema
  - Performance monitoring

- **Deploy e Recuperação**
  - CI/CD
  - Backup e restore
  - Disaster recovery

> Essas capacidades são infraestruturais. Podem usar soluções prontas sem comprometer o produto.

---

## 5. Nível de Maturidade das Capacidades

Cada capacidade deve ser classificada:

- **Inicial**: existe, mas é frágil
- **Controlada**: funciona de forma previsível
- **Escalável**: suporta crescimento
- **Estratégica**: diferencia o produto

> Não se escala o que ainda é frágil.

### 5.1 Critérios de Maturidade

#### Inicial

- [ ] Funcionalidade básica implementada
- [ ] Testes básicos existem
- [ ] Documentação mínima
- [ ] Pode quebrar com mudanças

#### Controlada

- [ ] Testes cobrem casos principais
- [ ] Documentação atualizada
- [ ] Comportamento previsível
- [ ] Pode ser usada com confiança

#### Escalável

- [ ] Testes cobrem casos edge
- [ ] Performance validada
- [ ] Suporta crescimento sem refatoração
- [ ] Monitoramento implementado

#### Estratégica

- [ ] Cobertura de testes completa
- [ ] Performance otimizada
- [ ] Documentação completa
- [ ] Diferencia o produto
- [ ] Máxima atenção em manutenção

### 5.2 Processo de Evolução de Maturidade

1. **Definir critérios** para próxima maturidade
2. **Implementar melhorias** necessárias
3. **Validar** com testes e métricas
4. **Atualizar** classificação na matriz
5. **Documentar** evolução (ADR se significativa)

---

## 6. Relação entre Capacidades e Domínios

### Princípios Fundamentais:

- **Uma capacidade pode atravessar domínios**
  - Exemplo: "Controlar Acesso Contextual" pode usar regras de Organização e Segurança

- **Um domínio pode conter várias capacidades**
  - Exemplo: Domínio "Organização" contém "Gerenciar Estrutura" e "Aplicar Hierarquia"

- **Capacidade nunca depende de implementação**
  - Capacidade é "O QUE", domínio é "ONDE"
  - Tecnologia muda, capacidade permanece

### Exemplo Prático:

```
Capacidade: "Gerenciar Departamentos"
├── Domínio: Organização (regras de negócio)
├── Aplicação: user-management (casos de uso)
└── Infra: database, events (suporte técnico)
```

> **Regra de ouro:** Domínio muda, capacidade permanece. Capacidade é o contrato com o negócio.

---

## 7. Governança de Evolução

Antes de criar algo novo, responder:

- Isso é uma nova capacidade?
- Ou apenas melhoria de uma existente?
- Essa capacidade é Core, Negócio ou Suporte?

> Criar capacidade sem valor claro é desperdício.

### 7.1 Template para Documentar Nova Capacidade

Ao identificar uma nova capacidade, documentar usando este template:

```markdown
## [Nome da Capacidade]

**Classificação:** Core / Negócio / Suporte / Técnica
**Maturidade Inicial:** Inicial / Controlada / Escalável / Estratégica
**Data de Criação:** YYYY-MM-DD
**Responsável:** [Nome/Role]

### Descrição

[O que esta capacidade faz, em linguagem de negócio]

### Justificativa

[Por que esta capacidade é necessária? Qual problema resolve?]

### Critérios de Sucesso

- [ ] Critério 1
- [ ] Critério 2

### Relacionamentos

- **Depende de:** [outras capacidades]
- **Usada por:** [outras capacidades]

### Notas de Implementação

[Observações técnicas relevantes]
```

### 7.2 Quando uma Capacidade Muda de Classificação

Uma capacidade pode evoluir de classificação quando:

- **Suporte → Negócio**: Passa a ser essencial para operação
- **Negócio → Core**: Torna-se diferencial competitivo
- **Core → Negócio**: Perde importância estratégica (raro)

**Processo de mudança:**

1. Documentar justificativa (ADR)
2. Atualizar matriz
3. Reavaliar dependências
4. Comunicar mudança à equipe

> Mudanças de classificação devem ser raras e bem justificadas.

---

## 8. Planejamento Baseado em Capacidade

### Ordem correta de evolução:

1. Fortalecer capacidades Core
2. Consolidar capacidades de Negócio
3. Automatizar capacidades de Suporte
4. Otimizar capacidades Técnicas

Nunca inverter essa ordem.

---

## 9. Capacidade como Contrato de Longo Prazo

- Código pode ser refeito
- Arquitetura pode mudar
- Tecnologia pode ser substituída

> A capacidade é o compromisso do sistema com o negócio.

---

## 10. Como Criar o Mapa Inicial

Se você está criando o mapa de capacidades pela primeira vez:

1. **Fazer inventário completo** seguindo o **[Guia de Inventário e Mapeamento](./Guia-Inventário-Mapeamento-Sistema.md)**
2. **Analisar cada módulo** e perguntar: "O que este módulo permite fazer?"
3. **Agrupar funcionalidades** relacionadas em capacidades
4. **Classificar** cada capacidade (Core/Negócio/Suporte/Técnica)
5. **Documentar** usando os templates deste documento

> **Importante:** Capacidades vêm do código existente, não de especificações. Analise o que o sistema FAZ, não o que deveria fazer.

---

## 11. Integração com Outros Documentos

Este mapa se relaciona diretamente com:

- **[Matriz Capacidade × Contexto × Módulo](./Matriz-Capacidade×Contexto×Módulo.md)**: Conecta capacidades com implementação
- **[Mapa de Contextos](./Mapa de Contextos-Núcleo-Domínio-Governança-Dependências.md)**: Define onde cada capacidade vive
- **[Diretiva de Governança](./Diretiva-Autoanálise-Governança-Técnica-do-Sistema.md)**: Define como implementar capacidades

### Fluxo de Uso:

1. **Definir capacidade** (este documento)
2. **Mapear para contexto e módulo** (Matriz)
3. **Validar limites e dependências** (Mapa de Contextos)
4. **Implementar seguindo diretrizes** (Diretiva de Governança)

---

## 12. Regra Final

> **Se não sabe qual capacidade está evoluindo, não deveria estar codando.**

Este mapa deve ser usado para:

- Priorizar backlog (Core primeiro, depois Negócio, depois Suporte)
- Avaliar impacto de mudanças (qual capacidade afeta?)
- Guiar decisões estratégicas (onde investir?)
- Validar novas features (é nova capacidade ou melhoria?)

### Checklist Antes de Codar:

- [ ] Identifiquei a capacidade que estou trabalhando?
- [ ] Sei a classificação (Core/Negócio/Suporte/Técnica)?
- [ ] Sei o nível de maturidade atual?
- [ ] Sei qual contexto/módulo implementa isso?

Qualquer exceção deve ser **consciente, rara e documentada**.
