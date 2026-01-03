# Lista de Moldes Liberados — Pré-Ficha Técnica

## 1. Contexto e Propósito

A **Lista de Moldes Liberados** é um artefato técnico-industrial utilizado **antes da Ficha Técnica definitiva** e **independente da Ficha de Custo de Aviamentos**.

Seu objetivo é formalizar a **avaliação da peça piloto**, consolidando informações técnicas, responsáveis e evidências, para decidir se o modelo está apto a seguir para:

- produção piloto
- criação da ficha técnica oficial

Este documento substitui o processo manual (caderno + conferência verbal) por um **sistema simples, robusto, rastreável e 100% auditável**.

---

## 2. Princípios de Projeto (Não Negociáveis)

- Separação total de custos e finanças
- Governança técnica clara
- Responsabilidade nominal
- Fluxo controlado por status
- Logs imutáveis (append-only)
- Nenhuma edição sem rastreabilidade

---

## 3. Entidade Central: Pré-Ficha Técnica (Molde Liberado)

Representa a análise técnica de um molde aplicado à peça piloto.

### 3.1 Identificação Geral

- ID único (UUID ou sequencial)
- Código da peça
- Nome da peça piloto
- Categoria
- Versão do molde
- Data e hora de criação (automática)
- Status atual

---

### 3.2 Responsáveis Técnicos

- Estilista
- Modelista
- Piloteiro
- Liberado por (perfil autorizado)

**Regra:** após liberação, os responsáveis tornam-se imutáveis.

---

### 3.3 Evidências Visuais

- Foto obrigatória da peça piloto
- Possibilidade de múltiplas fotos
- Metadados: usuário, data, hora

**Regra:** sem foto não é possível salvar nem submeter.

---

## 4. Dados Técnicos do Molde

### 4.1 Tecidos

Cada molde pode conter **N tecidos**, cada um com:

- Tipo (principal, forro, entretela, etc.)
- Nome / especificação
- Consumo
- Largura
- Quantidade de partes
- Observações técnicas

**Regra:** consumo e largura são obrigatórios quando o tecido existe.

---

### 4.2 Grade de Tamanhos

- PP, P, M, G, GG (configurável)
- A grade governa consumo e insumos

**Regra:** insumos variáveis exigem grade preenchida.

---

### 4.3 Insumos Técnicos (Não Financeiros)

Cada insumo possui:

- Descrição
- Quantidade base (ex: 1x, 2x)
- Consumo por tamanho
- Unidade de medida (cm, unidade, metro)
- Observações técnicas

**Regra forte:** insumo sem unidade ou consumo não pode ser salvo.

---

## 5. Observações e Ajustes

Para manter o processo **rápido e simples**, os campos abaixo são **estruturados e opcionais**, porém recomendados.

### 5.1 Observações Técnicas

- Campo de texto livre
- Uso para detalhes não cobertos por campos estruturados

### 5.2 Observações da Oficina

- Campo curto e objetivo
- Focado em costura, encaixe e viabilidade prática

### 5.3 Alteração Técnica (quando aplicável)

- Check simples: houve alteração em relação à versão anterior? (SIM / NÃO)
- Se SIM, campo obrigatório:
  - O que mudou (texto curto)

> **Regra:** alteração após aprovação gera nova versão automaticamente.

---



## 6. Workflow e Status

### 6.1 Fluxo Enxuto de Aprovação (3 Etapas)

O fluxo foi desenhado para **não atrasar o preenchimento** e ainda garantir governança.

1. **Preenchimento Técnico (Estilo / Modelagem)**
2. **Revisão da Ficha Técnica**
3. **Aval Final da Alta Gerência**

---

### 6.2 Status Permitidos

- **RASCUNHO** - Pré-ficha em preenchimento inicial
- **SUBMETIDA_PARA_REVISAO_TECNICA** - Enviada para avaliação técnica
- **EM_REVISAO_FICHA_TECNICA** - Sendo revisada pelo responsável técnico
- **APROVADA_TECNICAMENTE** - Aprovada na revisão técnica
- **AGUARDANDO_AVAL_DIRETORIA** - Aguardando aprovação da alta gerência
- **LIBERADA_PARA_PRODUCAO_PILOTO** - Aprovada e liberada para produção piloto
- **REPROVADA** - Reprovada em qualquer etapa

---

### 6.3 Regras de Transição

**Transições permitidas:**

- **RASCUNHO → SUBMETIDA_PARA_REVISAO_TECNICA**
  - Requisitos: Foto obrigatória, dados técnicos mínimos preenchidos
  - Ação: Um clique
  - Notificação: Notifica responsável pela Ficha Técnica
  - Campos técnicos: Ainda editáveis

- **SUBMETIDA_PARA_REVISAO_TECNICA → EM_REVISAO_FICHA_TECNICA**
  - Ação: Exclusiva do responsável técnico
  - Notificação: Confirmação de início da revisão

- **EM_REVISAO_FICHA_TECNICA → APROVADA_TECNICAMENTE**
  - Ação: Aprovação técnica
  - Efeito: Congela campos técnicos (imutáveis)
  - Notificação: Notifica criador e alta gerência

- **EM_REVISAO_FICHA_TECNICA → REPROVADA**
  - Requisito: Justificativa obrigatória (mínimo 10 caracteres)
  - Efeito: Retorna para RASCUNHO ou cria nova versão
  - Notificação: Notifica criador

- **APROVADA_TECNICAMENTE → AGUARDANDO_AVAL_DIRETORIA**
  - Ação: Automática após aprovação técnica
  - Notificação: Notifica Alta Gerência

- **AGUARDANDO_AVAL_DIRETORIA → LIBERADA_PARA_PRODUCAO_PILOTO**
  - Ação: Aprovação final da alta gerência
  - Efeito: Status final e irrevogável
  - Notificação: Notifica todos os envolvidos

- **AGUARDANDO_AVAL_DIRETORIA → REPROVADA**
  - Requisito: Justificativa obrigatória
  - Efeito: Retorna para RASCUNHO ou cria nova versão
  - Notificação: Notifica criador e responsáveis técnicos

**Regras gerais:**
- Somente perfis técnicos podem avaliar
- Aprovação congela a ficha (campos técnicos imutáveis)
- Reprovação exige justificativa obrigatória
- Reteste cria nova versão vinculada automaticamente

---

## 7. Auditoria e Logs

Cada evento gera log imutável contendo:

- Timestamp
- Usuário
- Ação executada
- Status anterior
- Status novo
- Justificativa (quando aplicável)

Logs nunca podem ser apagados ou alterados.

---

## 8. Notificações

Eventos que geram notificação:

- Submissão de molde
- Início de avaliação
- Aprovação para piloto
- Reprovação
- Reteste

Notificações são persistentes e auditáveis.

---

## 9. Perfis de Acesso (RBAC)

- Criador: submete molde
- Avaliador técnico: avalia e decide
- Produção piloto: consulta aprovados
- Auditor: leitura total + logs
- Administrador: parâmetros e cadastros

---

## 10. Versionamento

- Cada alteração gera nova versão
- Versões são comparáveis
- Nenhuma versão é descartada

---

## 11. Exportação Oficial

- Geração de PDF da Pré-Ficha aprovada
- Identificador único
- Hash de integridade

---

## 12. MVP Essencial

1. Cadastro da pré-ficha com foto
2. Workflow de status
3. Logs completos
4. Notificações
5. Exportação PDF

---

## 13. Melhorias Leves Alinhadas à Indústria

As melhorias abaixo **não aumentam tempo de preenchimento**, pois usam seleção rápida e automações.

### 13.1 Checklist Técnico Minimalista

Checklist com seleção SIM / NÃO:

- Molde veste corretamente
- Costura viável
- Insumos compatíveis
- Peça piloto aprovada visualmente

> Checklist aparece apenas na etapa de revisão.

---

### 13.2 Medidas Críticas (Opcional)

- Campo único para observações de medida
- Usado apenas se houver ajuste necessário

> Evita tabela longa e mantém simplicidade.

---

### 13.3 Conclusão da Avaliação da Peça Piloto

Campo obrigatório na aprovação:

- Resultado: APROVADA / REPROVADA
- Observação curta (se necessário)

---

### 13.4 Indicadores Automáticos (Sem Input Manual)

O sistema calcula automaticamente:

- Tempo de avaliação
- Quantidade de reprovações
- Taxa de aprovação por categoria

Nenhuma ação adicional do usuário.

---



## 14. Conclusão

A **Lista de Moldes Liberados** é o **gate técnico da produção**.

Separá-la de custos e finanças garante clareza de domínio, confiabilidade operacional e maturidade de processo.

Este documento deve ser tratado como **ativo estratégico da engenharia de produto**.

