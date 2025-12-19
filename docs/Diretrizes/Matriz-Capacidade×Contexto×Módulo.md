# Matriz Capacidade × Contexto × Módulo

> **Este documento conecta estratégia, arquitetura e código.**
> Ele existe para garantir que toda capacidade tenha lugar claro no sistema e que nenhum módulo exista sem propósito.
>
> **📌 Para visão geral completa e controle absoluto, consulte o [Centro de Comando](./Centro-de-Comando-Controle-Absoluto.md)**

---

## 1. Princípio Fundamental

**Nada é implementado sem saber:**

* Qual capacidade está sendo atendida
* Em qual contexto ela vive
* Em quais módulos ela se materializa

> Código sem capacidade definida é desperdício. Capacidade sem dono é risco.

---

## 2. Objetivo da Matriz

Esta matriz serve para:

* Evitar sobreposição de responsabilidades
* Guiar criação e evolução de módulos
* Permitir delegação segura de trabalho
* Facilitar uso de IA sem gerar caos

---

## 3. Estrutura da Matriz

Cada linha da matriz representa **uma capacidade**.

Cada capacidade deve responder obrigatoriamente:

* **Capacidade**: o que o sistema faz
* **Classificação**: Core / Negócio / Suporte / Técnica
* **Contexto(s)**: bounded context responsável
* **Módulo(s)**: onde o código vive
* **Tipo de Implementação**: domínio / aplicação / infra
* **Nível de Maturidade**: inicial / controlada / escalável / estratégica

---

## 4. Exemplo de Matriz (Modelo)

| Capacidade                         | Classe  | Contexto    | Módulo              | Tipo      | Maturidade  | Dependências                    |
| ---------------------------------- | ------- | ----------- | ------------------- | --------- | ----------- | ------------------------------- |
| Gerenciar Estrutura Organizacional | Core    | Organização | organization-domain | Domínio   | Estratégica | Nenhuma (Core)                  |
| Controle de Acesso Contextual      | Core    | Segurança   | access-control      | Domínio   | Escalável   | organization-domain             |
| Notificações Contextuais           | Negócio | Comunicação | notifications       | Aplicação | Controlada  | organization-domain, audit-log   |
| Auditoria de Ações                 | Core    | Governança  | audit-log           | Infra     | Escalável   | organization-domain             |
| Gerenciar Departamentos            | Core    | Organização | organization-domain | Domínio   | Estratégica | Nenhuma (Core)                  |
| Gerenciar Usuários e Funcionários  | Negócio | Organização | user-management     | Aplicação | Escalável   | organization-domain, access-control |
| Emitir Relatórios                 | Suporte | Relatórios  | reporting           | Aplicação | Controlada  | organization-domain, audit-log   |

> **Importante:** Esta tabela deve existir de forma real no projeto (arquivo CSV, JSON ou banco), não apenas conceitual. Deve ser versionada junto com o código.

### 4.1 Legenda de Classificações

* **Core**: Capacidade central que diferencia o produto. Nunca terceirizada.
* **Negócio**: Capacidade operacional essencial para o dia a dia.
* **Suporte**: Capacidade que aumenta eficiência, mas não diferencia.
* **Técnica**: Capacidade infraestrutural necessária para o sistema funcionar.

### 4.2 Legenda de Maturidade

* **Inicial**: Existe, mas é frágil. Requer cuidado ao evoluir.
* **Controlada**: Funciona de forma previsível. Pode ser usada com confiança.
* **Escalável**: Suporta crescimento sem refatoração estrutural.
* **Estratégica**: Diferencia o produto e é mantida com máxima atenção.

---

## 5. Regras de Governança (Obrigatórias)

### 5.1 Toda Capacidade Tem Dono

* Um contexto principal
* Um módulo responsável

> Se não há dono, a capacidade é inválida.

---

### 5.2 Módulo sem Capacidade é Eliminável

* Se um módulo não atende nenhuma capacidade clara
* Ele deve ser removido ou absorvido

> Módulo existe para servir capacidade, não o contrário.

---

### 5.3 Capacidade Não Pode Ser Fragmentada Arbitrariamente

* Uma capacidade pode ter vários módulos
* Mas a regra central vive em um único contexto

> Fragmentação sem governo gera inconsistência.

---

## 6. Uso da Matriz no Dia a Dia

Antes de qualquer mudança, responder:

* Qual linha da matriz será afetada?
* A maturidade muda?
* O contexto continua correto?

Se não conseguir responder, **não altere o código**.

---

## 7. Uso da Matriz para Escala de Equipe

A matriz permite:

* Distribuir trabalho por capacidade
* Isolar times por contexto
* Reduzir conflitos de código

> Pessoas trabalham em capacidades, não em arquivos.

---

## 8. Uso da Matriz com IA (Regra Crítica)

Antes de qualquer prompt para IA, **sempre incluir**:

1. **Capacidade**: Qual capacidade está sendo trabalhada (ex: "Gerenciar Departamentos")
2. **Contexto**: Bounded context responsável (ex: "Organização")
3. **Módulo**: Módulo onde o código deve viver (ex: "organization-domain")
4. **Tipo**: Domínio / Aplicação / Infra
5. **Limites**: Proibir criação fora desses limites

### Exemplo de Prompt Correto

```
Trabalhando na capacidade "Gerenciar Departamentos":
- Contexto: Organização
- Módulo: organization-domain
- Tipo: Domínio
- Maturidade: Estratégica

Criar entidade Department seguindo DDD e as regras do contexto Organização.
NÃO criar em outros módulos. NÃO criar lógica fora do domínio.
```

> **Regra absoluta:** IA sem limite vira gerador de entropia. Sempre referenciar a matriz.

---

## 9. Evolução Controlada

Quando uma capacidade crescer, seguir este fluxo:

1. **Avaliar impacto na matriz**
   * A capacidade precisa de novo módulo?
   * Precisa separar em novo contexto?
   * A maturidade muda?

2. **Atualizar a matriz primeiro**
   * Adicionar/modificar linha na matriz
   * Documentar dependências
   * Validar com equipe

3. **Implementar código**
   * Seguir a matriz atualizada
   * Respeitar limites definidos
   * Manter consistência

4. **Validar após implementação**
   * Verificar se código reflete a matriz
   * Atualizar maturidade se necessário

> **Regra de ouro:** Primeiro governa, depois implementa. Matriz sempre precede código.

### 9.1 Quando Separar Capacidade

Uma capacidade deve ser separada quando:

* Tem responsabilidades distintas e independentes
* Pode evoluir em ritmos diferentes
* Tem contextos de negócio diferentes
* A fragmentação melhora a manutenibilidade

> Separar por razões técnicas apenas (ex: "performance") não é suficiente.

---

## 10. Manutenção da Matriz

A matriz deve ser mantida como artefato vivo:

* **Atualização contínua**: Toda nova capacidade = nova linha
* **Revisão periódica**: Mensal ou a cada sprint
* **Versionamento**: Matriz versionada junto com código
* **Acessibilidade**: Fácil consulta por toda equipe

### 10.1 Responsabilidades

* **Arquiteto/Tech Lead**: Validação de novas capacidades e classificação
* **Desenvolvedores**: Atualização ao criar/modificar módulos
* **Product Owner**: Validação de capacidades de negócio

### 10.2 Como Criar a Matriz Inicial

Se você está criando a matriz pela primeira vez, siga o processo:

1. **Fazer inventário completo** seguindo o **[Guia de Inventário e Mapeamento](./Guia-Inventário-Mapeamento-Sistema.md)**
2. **Identificar todas as capacidades** existentes no sistema
3. **Mapear para contextos e módulos** usando o inventário
4. **Classificar e documentar** usando os templates deste documento

> **Importante:** Não crie a matriz do zero. Sempre parta do inventário do sistema existente.

### 10.3 Formato de Armazenamento da Matriz

A matriz deve ser mantida em formato estruturado para facilitar consulta e versionamento:

**Opção 1: Arquivo JSON** (recomendado para automação)
```json
{
  "version": "1.0.0",
  "lastUpdated": "2024-01-15",
  "capabilities": [
    {
      "id": "CAP-001",
      "name": "Gerenciar Estrutura Organizacional",
      "classification": "Core",
      "context": "Organization",
      "module": "organization-domain",
      "type": "Domain",
      "maturity": "Strategic",
      "dependencies": [],
      "owner": "tech-lead",
      "createdAt": "2024-01-01"
    }
  ]
}
```

**Opção 2: Arquivo CSV** (recomendado para edição manual)
```csv
ID,Capacidade,Classe,Contexto,Módulo,Tipo,Maturidade,Dependências,Responsável
CAP-001,Gerenciar Estrutura Organizacional,Core,Organização,organization-domain,Domínio,Estratégica,,tech-lead
```

**Opção 3: Banco de Dados** (para projetos grandes)
* Tabela `capabilities` com todas as colunas
* Versionamento via timestamps
* Histórico de mudanças

> **Recomendação:** Começar com JSON, evoluir para banco quando necessário.

### 10.3 Processo de Atualização

1. **Criar branch** para atualização da matriz
2. **Atualizar arquivo** (JSON/CSV)
3. **Validar** com arquiteto/tech lead
4. **Commit** com mensagem clara: `docs: atualiza matriz - adiciona capacidade X`
5. **Revisar** em PR antes de merge

### 10.4 Integração com Outros Documentos

Esta matriz se relaciona com:

* **[Mapa de Capacidades](./Mapa-Capacidades-Sistema-(Capability Map).md)**: Define O QUE cada capacidade faz
* **[Mapa de Contextos](./Mapa de Contextos-Núcleo-Domínio-Governança-Dependências.md)**: Define limites e relacionamentos
* **[Diretiva de Governança](./Diretiva-Autoanálise-Governança-Técnica-do-Sistema.md)**: Define COMO implementar

> Consulte estes documentos antes de adicionar/modificar capacidades na matriz.

---

## 11. Métricas e Indicadores

Para acompanhar a saúde da matriz:

* **Cobertura**: % de capacidades mapeadas vs. funcionalidades do sistema
* **Maturidade média**: Média dos níveis de maturidade das capacidades Core
* **Dependências**: Número de dependências entre capacidades (quanto menor, melhor)
* **Atualização**: Última atualização da matriz (não deve passar de 30 dias)

### 11.1 Dashboard Sugerido

Manter dashboard simples com:
- Total de capacidades por classificação
- Distribuição de maturidade
- Gráfico de dependências
- Histórico de mudanças

---

## 12. Regra Final

> **A matriz é o mapa do sistema em operação.**
> **Se ela estiver errada, o sistema estará errado.**

Este documento deve ser:

* Mantido atualizado
* Consultado antes de qualquer decisão relevante
* Tratado como artefato crítico do projeto
* Revisado periodicamente (mensal ou a cada sprint)

Qualquer violação deve ser **consciente, documentada e excepcional**.
