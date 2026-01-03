# Sistema de Fichas de Custo de Aviamentos

## 1. Contexto e Objetivo

Este sistema digitaliza e formaliza um processo historicamente manual (caderno → planilha → conferência gerencial), garantindo **confiabilidade, rastreabilidade, auditoria completa e prevenção de fraudes**.

A ficha de custo de aviamentos representa o **documento oficial de cálculo da peça piloto**, validado contra notas fiscais e aprovado pela gerência.

O sistema substitui definitivamente o papel e o Excel, tornando-se a **fonte única da verdade**.

---

## 2. Princípios Inegociáveis

- 100% auditável (quem, quando, o quê)
- Nenhuma alteração sem rastreabilidade
- Aprovação formal obrigatória
- Notificações automáticas à gerência
- Regras de negócio rígidas
- Dados confiáveis > velocidade

---

## 3. Entidades de Domínio

### 3.1 Ficha de Custo de Aviamentos (Aggregate Root)

Representa uma ficha completa, equivalente à ficha física assinada.

**Campos essenciais**

- ID único (sequencial, imutável)
- Referência da peça
- Nome / código da peça
- Categoria
- Departamento responsável: **Aviamentos e Insumos**
- Setor responsável: **Fichas de Custo** (setor dentro do departamento Aviamentos e Insumos)
- Data de criação
- Usuário criador
- Status
- Foto da peça (obrigatória no cadastro)
- Lista de insumos
- Totais calculados

---

### 3.2 Insumo

Item que compõe o custo da peça piloto.

**Campos**

- Descrição do insumo
- Tipo (aviamento, serviço, terceirização, etc.)
- Fornecedor
- Nota fiscal (número, data, valor)
- Quantidade
- Unidade de medida
- Custo unitário
- Custo total (calculado)

---

### 3.3 Fornecedor

- Nome
- CNPJ
- Contato
- Observações

---

### 3.4 Usuário

- Nome
- Email
- Departamento: Aviamentos e Insumos (ou outro conforme responsabilidade)
- Setor: Fichas de Custo (ou outro conforme responsabilidade)
- Cargo (Position)
- Perfis RBAC: Analista de Fichas, Supervisor de Aviamentos, Gerente, Financeiro, Auditor

---

## 4. Status da Ficha (Workflow Obrigatório)

O status substitui a assinatura física.

- **RASCUNHO** → Em preenchimento
- **ENVIADA PARA CONFERÊNCIA** → Notifica gerência
- **APROVADA** → Ficha válida e congelada
- **REPROVADA** → Retorna para ajustes

### Regras

- Apenas gerência pode aprovar/reprovar
- Ficha aprovada torna-se imutável
- Reprovação exige justificativa obrigatória

---

## 5. Regras de Negócio Críticas

### 5.1 Confiabilidade de Dados

- Campos obrigatórios não podem ser vazios
- Quantidade > 0
- Custo unitário ≥ 0
- Nota fiscal obrigatória para cada insumo

### 5.2 Prevenção de Fraudes

- Nenhum campo financeiro editável após aprovação
- Todas as alterações geram log
- Logs não podem ser apagados
- IDs sequenciais e não reutilizáveis

---

## 6. Auditoria e Eventos de Domínio

### 6.1 Auditoria (Obrigatória)

Cada evento gera um registro:

- Criação da ficha
- Alteração de qualquer campo
- Envio para conferência
- Aprovação
- Reprovação

**Log contém**

- Data/hora
- Usuário (com departamento, setor e cargo)
- Ação
- Estado anterior
- Estado novo
- IP e contexto

### 6.2 Eventos de Domínio (DDD)

Seguindo a arquitetura DDD do MORINA, o sistema deve publicar os seguintes eventos:

- `FichaCustoCriada` - Dispara quando uma nova ficha é criada
- `FichaCustoAtualizada` - Dispara quando uma ficha é atualizada
- `FichaCustoEnviadaConferencia` - Dispara quando enviada para aprovação
- `FichaCustoAprovada` - Dispara quando aprovada pela gerência
- `FichaCustoReprovada` - Dispara quando reprovada
- `BoletoAnexadoFicha` - Dispara quando um boleto é anexado
- `BoletoPagoFicha` - Dispara quando um boleto é marcado como pago

**Consumidores potenciais dos eventos**:

- Módulo de Financeiro (atualização de contas a pagar)
- Módulo de Compras (previsão de necessidade de insumos)
- Dashboard Executivo (atualização de métricas)
- Sistema de Notificações (disparo de notificações)

---

## 7. Notificações (Central de Notificações)

### Eventos que geram notificação

- Ficha enviada para conferência → Gerência (Departamento responsável pela aprovação)
- Ficha aprovada → Setor Fichas de Custo (Departamento Aviamentos e Insumos)
- Ficha reprovada → Setor Fichas de Custo (Departamento Aviamentos e Insumos)
- Ajuste solicitado → Setor Fichas de Custo (Departamento Aviamentos e Insumos)
- **Ficha aprovada disponível para Financeiro** → Departamento Financeiro & Controladoria
- **Boleto anexado ou alterado** → Departamento Financeiro & Controladoria e Gerência

### Características

- Notificações persistentes
- Histórico consultável
- Não podem ser apagadas

---

## 8. Interface — Campos e Inputs

### Dados Gerais da Ficha

- Referência da peça (input texto)
- Nome / código da peça (input texto)
- Categoria (select)
- Foto da peça (upload obrigatório)

### Insumos (Tabela Dinâmica)

- Descrição
- Fornecedor
- Nota fiscal
- Quantidade
- Unidade
- Custo unitário
- Total (calculado)

### Resumo

- Total de custos
- Custo final da peça piloto

---

## 9. Integração com Financeiro

### Objetivo

Permitir que o setor financeiro consulte valores aprovados e realize o pagamento de boletos **com base em dados confiáveis e auditados**.

### Regras de Acesso

- Financeiro **não edita** fichas de custo
- Financeiro **consulta somente fichas APROVADAS**
- Valores financeiros são sempre derivados da ficha aprovada

### Anexo de Boletos

Cada ficha pode conter **um ou mais boletos anexados**, vinculados aos insumos ou ao fornecedor.

**Campos do Boleto**

- Arquivo (PDF / imagem)
- Fornecedor
- Valor do boleto
- Data de vencimento
- Código de barras / linha digitável
- Status do pagamento (PENDENTE, PAGO)

### Regras de Negócio Financeiras

- Valor do boleto **não pode exceder** o valor aprovado na ficha
- Boleto só pode ser anexado após aprovação da ficha
- Alteração ou exclusão de boleto gera log e notificação

---

## 10. Listas e Cadastros

### Lista de Fichas

- Foto da peça (thumbnail)
- Referência
- Nome da peça
- Categoria
- Status
- Valor total aprovado
- Data

### Visão do Financeiro

- Referência
- Fornecedor
- Valor aprovado
- Valor em boletos
- Diferença (alerta automático)
- Status de pagamento

---

## 11. Arquitetura Recomendada

- Frontend: Next.js
- Backend: Nest.js
- Banco: PostgreSQL
- Autenticação: JWT + RBAC
- Armazenamento de arquivos: Object Storage (S3 compatível)
- Logs imutáveis (append-only)

---

## 12. Governança e Responsabilidades (RACI)

Cada ficha possui responsáveis claramente definidos conforme a estrutura organizacional:

- **Responsável pela criação**: Usuário do Setor "Fichas de Custo" do Departamento "Aviamentos e Insumos"
- **Responsável pela aprovação**: Usuário com permissão de aprovação (geralmente Gerência/Supervisão)
- **Responsável financeiro**: Usuário do Departamento "Financeiro & Controladoria"

Essas responsabilidades são registradas e exibidas na ficha, não podendo ser removidas. O sistema deve vincular automaticamente baseado na estrutura organizacional da empresa (Department → Sector → Position).

---

## 13. Bloqueios Temporais e Controle de Edição

- Ficha enviada para conferência: **edição bloqueada**
- Ficha reprovada: edição liberada **somente nos campos indicados**
- Ficha aprovada: **bloqueio definitivo após X dias**

Qualquer tentativa de alteração fora das regras gera erro e log.

---

## 14. Justificativas Obrigatórias

- Reprovação exige justificativa textual obrigatória
- Correções após reprovação exigem justificativa
- Justificativas fazem parte do histórico auditável

---

## 15. Versionamento de Fichas

- Cada alteração gera uma nova versão da ficha
- Versões são comparáveis (antes × depois)
- Nenhuma versão pode ser apagada

---

## 16. Documentos Anexos Padronizados

Todos os documentos devem possuir tipo definido:

- Foto da peça (obrigatória)
- Nota fiscal
- Boleto
- Comprovante de pagamento

Uploads sem tipo não são permitidos.

---

## 17. Alertas Preventivos Automáticos

O sistema deve gerar alertas para:

- Boleto próximo do vencimento
- Valor pago maior que valor aprovado
- Ficha parada por mais de X dias
- Fornecedor com alto índice de reprovação

---

## 18. Dashboard Executivo

Indicadores mínimos:

- Taxa de reprovação
- Tempo médio de aprovação
- Custo médio por categoria
- Diferença entre valor aprovado × pago
- Fornecedores com maior incidência de problemas

---

## 19. Exportação Oficial de Documentos

- Geração de PDF da ficha aprovada
- Identificador único e hash do documento
- Rodapé indicando origem do sistema

---

## 20. Perfis de Acesso (RBAC)

Os perfis seguem a estrutura organizacional multi-tenant do MORINA:

- **Analista de Fichas de Custo** (Setor: Fichas de Custo / Departamento: Aviamentos e Insumos): criar e editar fichas em rascunho
- **Supervisor de Aviamentos** (Departamento: Aviamentos e Insumos): aprovar/reprovar fichas do setor
- **Gerente** (nível departamental ou superior): aprovar e reprovar fichas, acessar relatórios
- **Financeiro** (Departamento: Financeiro & Controladoria): consultar valores aprovados e gerenciar boletos (somente fichas aprovadas)
- **Auditor**: leitura total de todas as fichas e logs
- **Administrador**: gestão de cadastros, parâmetros e configurações do módulo

**Nota**: As permissões são atribuídas através de Positions (Cargos) vinculados a Setores, conforme o sistema RBAC corporativo do MORINA.

---

## 21. Estrutura Organizacional Relacionada

### 21.1 Hierarquia no MORINA

Conforme a estrutura organizacional oficial do projeto:

```
Empresa (Organization)
  └── Departamento: Aviamentos e Insumos
       └── Setor: Fichas de Custo
            └── Cargos (Positions): Analista de Fichas, Supervisor de Fichas
```

### 21.2 Relacionamentos

- **Departamento**: "Aviamentos e Insumos"
  - Responsável pelo gerenciamento geral de aviamentos e insumos
  - Outros setores dentro deste departamento: Controle de Entradas, Conferência, Requisição, Baixa por OP, Auditoria de Perdas
- **Setor**: "Fichas de Custo"
  - Setor específico responsável pelo cadastro, controle e aprovação de fichas de custo
  - Vinculado ao Departamento "Aviamentos e Insumos"
  - Pode ter múltiplos cargos (Positions) associados

- **Integração com outros departamentos**:
  - **Financeiro & Controladoria**: Consulta fichas aprovadas e gerencia boletos
  - **Gerência/Supervisão**: Aprovação e reprovação de fichas
  - **Compras**: Pode utilizar dados das fichas aprovadas para planejamento de compras

### 21.3 Dependências de Módulos

O módulo de Fichas de Custo depende de:

- Estrutura Organizacional completa (Department, Sector, Position)
- Sistema de Usuários e RBAC
- Central de Notificações
- Sistema de Auditoria
- Gestão de Documentos/Arquivos

---

## 22. Consideração Final

Este sistema consolida um processo crítico da empresa em um fluxo **seguro, auditável, confiável e orientado a governança**, eliminando riscos operacionais, financeiros e jurídicos.

Ele deve ser tratado como **ativo estratégico** da organização e está completamente integrado à estrutura organizacional multi-tenant do MORINA, seguindo os princípios de DDD, eventos de domínio e RBAC corporativo.
