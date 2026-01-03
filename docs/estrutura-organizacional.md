# FUNDAMENTOS ESTRUTURAIS – MORINA

### Diretriz Oficial para o Cursor

### Construção Prioritária da Base Corporativa Antes de Módulos Funcionais

---

# 🧭 Objetivo

Garantir que o Cursor construa **primeiro a fundação corporativa universal**, necessária para sustentar todos os módulos funcionais da aplicação corporativa interna Morina.

Sem essa base:  
❌ não existe multiempresa  
❌ não existe permissão  
❌ não existe fluxo entre departamentos  
❌ não existe auditoria  
❌ não existe identidade corporativa  
❌ não existe DDD consistente

Com essa base:  
✔ 100% escalável  
✔ governança sólida  
✔ todos os módulos plug-and-play  
✔ estrutura organizacional viva  
✔ IA integrada em cada setor

---

# 📌 ORDEM OBRIGATÓRIA DE CONSTRUÇÃO

1. **Cadastro de Empresa** (com busca automática por CNPJ)
2. **Configurações da Empresa**
3. **Tema da Empresa** (logo, cores, vídeo)
4. **Cadastro de Departamentos**
5. **Cadastro de Setores**
6. **Cadastro de Cargos**
7. **Cadastro de Permissões (RBAC base)**
8. **Cadastro de Usuários / Funcionários** (com busca automática por CPF)
9. **Matriz de Permissões (RBAC por cargo/setor/departamento)**
10. **Auditoria e Versionamento Interno**
11. **Eventos Base do Domínio**
12. **Somente depois disso → Módulos finais (PCP, Corte, Produção, Financeiro, Qualidade etc.)**

---

# 🔥 1. CADASTRO DE EMPRESA

### Dados obrigatórios

- Razão Social
- Nome Fantasia
- CNPJ
- Inscrição Estadual
- Inscrição Municipal
- CNAE
- Regime Tributário
- Endereço completo
- E-mail corporativo
- Telefone
- Responsável legal
- Logo da empresa
- Vídeo institucional (YouTube/Vimeo)

### Busca Automática por CNPJ

O sistema deve integrar-se para preencher automaticamente:

- Razão Social
- Nome Fantasia
- Endereço busca automática por cep
- Situação cadastral
- CNAE principal
- Atividades secundárias

### Entidades DDD

- `Empresa`
- `Filial`
- `ConfiguracaoEmpresa`
- `TemaEmpresa`

---

# 🔥 2. ESTRUTURA ORGANIZACIONAL

### Hierarquia base

Empresa

> Departamento
>
> > Setor
> >
> > > Cargo
> > >
> > > > Permissões

### 2.1 Cadastro de Departamento

- Nome
- Sigla
- Responsável
- Finalidade
- Data de criação

### 2.2 Cadastro de Setor

- Nome
- Departamento vinculado
- Responsável
- Política interna
- Atribuições

### 2.3 Cadastro de Cargo

- Nome
- Senioridade
- Responsabilidades
- Ações permitidas
- KPIs

### Entidades

- `Departamento`
- `Setor`
- `Cargo`
- `PermissaoCargo`

---

# 🔥 3. CADASTRO DO FUNCIONÁRIO / USUÁRIO

### Inputs obrigatórios

- Nome completo
- CPF
- RG
- Data de nascimento
- Email corporativo
- Telefone
- Endereço
- Cargo
- Setor
- Departamento
- Filial
- Data de admissão
- Status

### Busca automática por CPF

Deve preencher:

- Nome
- Data de nascimento
- Situação

### Entidades

- `Usuario`
- `Funcionario`
- `PerfilUsuario`
- `Acesso`

---

# 🔥 4. RBAC – PAPÉIS & PERMISSÕES

### Papéis fundamentais

- Super Administrador Morina
- Administrador da Empresa
- Gestor
- Supervisor
- Analista
- Operador
- Auditor
- Visualizador

Cada papel deve ter:

- Ações (Criar/Editar/Excluir/Aprovar/Reprovar/Visualizar/Configurar)
- Acesso a módulos específicos
- Regras de restrição
- Logs obrigatórios

---

# 🔥 5. CONFIGURAÇÕES GLOBAIS

Cada empresa deve ter seu centro de configurações:

- Fuso horário
- Idioma
- Moeda
- Regime tributário
- Políticas internas
- SLA por departamento
- Parâmetros de numeração
- Tema (cores, fontes, logo, dark/light, vídeo fundo)

---

# 🔥 6. AUDITORIA E VERSIONAMENTO

### Log obrigatório

- Quem fez
- O que fez
- Antes
- Depois
- IP
- Timestamp
- Canal (web, mobile, api)

### Registro de eventos

- `EmpresaRegistrada`
- `DepartamentoCriado`
- `CargoAtribuido`
- `UsuarioCriado`
- `LoginRealizado`
- `PermissaoAlterada`

---

# 🔥 7. EVENTOS BASE DO DOMÍNIO

Deve existir antes de qualquer módulo avançado:

- `EmpresaCriada`
- `EmpresaConfigurada`
- `DepartamentoCriado`
- `SetorCriado`
- `CargoCriado`
- `UsuarioRegistrado`
- `PermissaoAtualizada`
- `AuditoriaRegistrada`

---

# 🧩 8. DIRETRIZ DE EXECUÇÃO PARA O CURSOR

O Cursor deve:

- Criar **todos os cadastros base completos**
- Criar modelos DDD sólidos
- Criar endpoints padrão
- Criar validações Zod
- Criar sistema RBAC completo
- Criar primeiros eventos de domínio
- Criar testes iniciais
- Criar documentação automática
- Garantir escalabilidade multiempresa

---

# 🎯 Resultado Final Esperado

Com este documento aplicado, o Cursor será capaz de:

- Construir toda a base corporativa sólida
- Criar os módulos superiores sem retrabalho
- Organizar departamentos e fluxos
- Integrar IA em cada ponto
- Garantir rastreabilidade e governança
- Criar qualquer módulo futuro plug-and-play

Este arquivo é a fundação oficial da Morina.

✅ 2. .cursorignore (versão otimizada para turborepo)
txt
Copiar código

# Ignorar dependências

node_modules/
pnpm-lock.yaml
package-lock.json
yarn.lock

# Ignorar builds

dist/
build/
out/
.next/
.vercel/

# Ignorar arquivos temporários

.DS_Store
Thumbs.db
_.log
_.tmp
\*.cache

# Ignorar configs sensíveis

.env
.env.\*
!.env.example

# Ignorar artefatos

_.zip
_.tar
\*.tar.gz

# Ignorar sistema operacional

.idea/
.vscode/
_.swp
_.swo

# Ignorar outputs gerados

coverage/
tmp/

# Ignorar pastas de infra opcional

terraform/
ansible/
helm/

# Ignorar pacotes externos

apps/webx/.next
apps/webx/out
apps/api/dist
apps/admin-api/dist

# 3. Regra MCP – mcp-estrutura-organizacional.json

Este arquivo faz o Cursor carregar automaticamente o documento de fundamentos toda vez que você abrir o repositório.

json
Copiar código
{
"version": "1.0",
"name": "estrutura-organizacional-morina",
"description": "Carrega automaticamente a estrutura organizacional base para orientar o Cursor no desenvolvimento.",
"load_on_start": true,
"files": [
{
"path": "./FUNDAMENTOS_ESTRUTURA_ORGANIZACIONAL_MORINA.md",
"purpose": "context",
"required": true
}
],
"rules": {
"priority": "high",
"context_strategy": "always_include",
"instructions": [
"Sempre considerar o documento de fundamentos antes de gerar qualquer tela, módulo, API ou fluxo.",
"Priorize a construção do cadastro de empresa, departamentos, setores, cargos, usuários e RBAC.",
"Nunca gerar módulos avançados sem validar primeiro a fundação organizacional descrita.",
"A arquitetura deve seguir estritamente DDD, eventos de domínio e RBAC corporativo definido."
]
}
}

📘 Diretriz Oficial – Estrutura Organizacional Corporativa (Para uso no Cursor)

(cole exatamente assim no Cursor para padronizar a construção da organização)

✅ Objetivo

Criar toda a Estrutura Organizacional Corporativa completa de uma empresa de médio/grande porte, com foco em confecção/moda, já preparada para ERP modular, workflows entre departamentos, eventos, auditoria, rastreabilidade e IA especializada.

A entrega deve incluir:

Hierarquia vertical completa

Relações horizontais (operações entre equipes)

Subdepartamentos

Responsabilidades

Entradas e saídas (insumos x entregáveis)

Atores, papéis e níveis de permissão

Fluxos de comunicação

Dependências

Domínios do DDD

Eventos publicados/consumidos

Entidades e agregados

A estrutura deve ser criada de forma corporativa, enxuta, sem frescura, mas extremamente profissional, robusta e escalável.

📂 1. Estrutura Raiz da Empresa (Organograma Macro)

Crie a estrutura principal com estes departamentos de nível 1:

Diretoria Geral

Financeiro & Controladoria

RH / Departamento Pessoal

Estilo & Desenvolvimento

Compras

Aviamentos e Insumos

Estoque

Planejamento e Controle de Produção (PCP)

Corte

Produção Interna

Produção Terceirizada / Oficinas

Qualidade

Logística

Comercial & Vendas

E-commerce

Marketing

TI / Infraestrutura / Segurança

Jurídico

Tributos & Fiscal

Suporte Interno e Helpdesk

Expedição

Backoffice Operacional

📂 2. Subdepartamentos Obrigatórios (Cursor deve gerar)
Exemplo:
✓ PCP deve conter obrigatoriamente:

Planejamento de Coleção

Mapa de Produção

Controle de OPs

Calendário Industrial

Gargalos e Capacidade

Previsão de Insumos

✓ Compras deve conter:

Cotação

Homologação de Fornecedores

Follow-up

Pedido de Compra

Auditoria de Custos

Integração com Estoque e Financeiro

O Cursor deve criar para cada departamento:

✔ Funções
✔ Subfunções
✔ Responsáveis
✔ KPIs
✔ Entradas e saídas
✔ Regras de negócio
✔ Pontos de integração
✔ Eventos do domínio

📘 3. Diretriz de Output (Formato da Entrega)

O Cursor deve entregar SEMPRE:

1. Organograma em formato Markdown

Estrutura completa em árvore

Níveis hierárquicos

Cargos

Relações

2. Domínio DDD de cada departamento

Bounded Context

Entidades

Aggregates

Value Objects

Eventos (Domain Events)

Casos de Uso

Políticas (Regras)

3. Fluxo Operacional

Processos chave

Interações entre departamentos

Ciclo de vida completo das operações

Quem informa quem

4. Níveis de Permissão

Administrador corporativo

Gestores

Supervisores

Analistas

Operadores

Visualizadores

5. Mapa de Dependências

Exemplo:

Corte depende do PCP + Estoque

Qualidade depende de Produção + Corte + Insumos

Financeiro depende de Compras + Comercial + Fiscal

🔎 4. Estratégia Técnica (para o Cursor gerar modelos prontos para ERP)

O Cursor deve criar para cada departamento:

1. Modelos de Dados (NestJS + Prisma mental model)

Tabelas/Entidades

Relacionamentos

Chaves naturais (quando existirem)

Audit fields (created_by, version, etc.)

Multitenancy-ready

2. APIs (conceito)

Endpoints essenciais

Processos críticos

Webhooks / Event Bus

Validações (Zod/DTOs)

3. Eventos do domínio

Exemplos reais:

AviamentoSolicitado

OPLiberada

CorteConcluido

ProdutoEnviadoParaOficina

RecebimentoFiscalRegistrado

QualidadeReprovada

FaturamentoAprovado

4. Integrações

API interna

Mensageria (Rabbit/Kafka)

IA interna (assistentes e automações)

🧠 5. IA Integrada (o Cursor deve mapear pontos onde IA entra)

Para cada departamento:

Sugestões de automação

Detecção de anomalias

Revisões automáticas

Dashboards preditivos

Enriquecimento inteligente

Roteamento automático

Exemplos práticos:

IA identifica falta de insumos

IA prevê atraso na produção

IA sugere reajuste de estoque mínimo

IA valida documentos fiscais

IA detecta desvios de custos

📌 6. Regras Rígidas que o Cursor deve seguir

Use isso como “guideline militar”:

Nada superficial. Sempre detalhar tudo profundamente.

Nunca repetir texto. Sempre expandir com profundidade.

Se faltar contexto, o Cursor deve completar com lógica corporativa.

Toda relação entre departamentos deve ser mapeada.

Nada de organograma raso. Tudo deve ser completo.

Sempre incluir visão DDD + Processo + IA.

Sempre entregar tudo em Markdown limpo.

Não mencionar “ERP” como produto—apenas “aplicação corporativa interna”.

A marca-guarda é Morina.

🎯 7. Resultado Esperado

Quando colar isso no Cursor, ele vai gerar automaticamente:

Organograma corporativo completo

Árvore hierárquica detalhada

Domínios e subdomínios

Entidades e agregados

Processos por departamento

Eventos do domínio

Dependências

Níveis de permissão

Solicitações automáticas

Estrutura preparada para NestJS + Next.js

Pontos de IA por módulo

Documentação profissional nível enterprise

📘 ESTRUTURA_ORGANIZACIONAL_MORINA.md
Diretriz Oficial para o Cursor – Construção da Estrutura Organizacional Completa da Empresa
🧭 Objetivo

Criar uma estrutura organizacional corporativa completa, cobrindo hierarquia, relações interdepartamentais, domínios DDD, processos, entidades, eventos, responsabilidades, KPIs, níveis de permissão e dependências — pronta para integração com aplicações corporativas internas Morina.

O Cursor deve gerar sistemas, documentos e modelos a partir deste blueprint.

1. ORGANOGRAMA CORPORATIVO – NÍVEL MACRO
   Diretoria Geral

Presidência

Assessoria Executiva

Comitê Estratégico

Financeiro & Controladoria
RH & Departamento Pessoal
Estilo & Desenvolvimento
Compras
Aviamentos e Insumos
Estoque
PCP – Planejamento & Controle
Corte
Produção Interna
Produção Terceirizada (Oficinas)
Qualidade
Logística
Expedição
Comercial & Vendas
E-commerce
Marketing
TI / Infraestrutura / Segurança
Jurídico
Tributos & Fiscal
Suporte Interno / Helpdesk
Backoffice Operacional

O Cursor deve gerar todos os departamentos acima com:

Funções

Subáreas

Relações operacionais

Eventos do domínio

KPIs

Casos de uso

Dependências

2. SUBDEPARTAMENTOS OBRIGATÓRIOS (POR ÁREA)
   2.1 PCP

Planejamento de Coleção

Lead Time de Produção

Mapa de Capacidade

Controle de OPs

Calendário Industrial

Programação Semanal

2.2 Compras

Cotação

Aprovação

Follow-up

Pedido de Compra

Auditoria de Custos

2.3 Aviamentos e Insumos

Controle de entradas

Conferência

Requisição

Baixa por OP

Auditoria de perdas

2.4 Produção Interna

Supervisão

Costura

Revisão

Movimentação entre células

Checklists operacionais

2.5 Terceirização

Cadastro de Oficinas

Envio para produção

Monitoramento

SLA

Retorno e conferência

2.6 Qualidade

Inspeção Processo

RNC

Auditoria final

Lacração

2.7 Financeiro

Contas a pagar

Contas a receber

Conciliação

Fluxo de caixa

Centro de custo

Rateios

3. ENTREGAS PADRÃO QUE O CURSOR DEVE GERAR
   3.1 Organograma em Árvore (Markdown)

Exemplo de estrutura esperada:

Diretoria Geral
├── Financeiro
│ ├── Contas a pagar
│ ├── Contas a receber
│ └── Controladoria
├── RH
├── Estilo
│ ├── Pesquisa
│ ├── Modelagem
│ └── Ficha técnica
├── PCP
│ ├── Planejamento
│ ├── Programação
│ └── Controle
...

4. DDD – DIRETRIZ DE DOMÍNIO

Para cada departamento, gerar:

Bounded Context

Independente

Coeso

Sem dependências circulares

Entidades

Exemplo:

OP

Aviamento

Requisição

Carga

Cobrança

Oficina

Aggregates

OP é aggregate root

Ficha Técnica é aggregate root

Requisição é aggregate root

Value Objects

Medidas

Grade

Cores

CNPJ/CPF

Status

Domain Services

Liberação de produção

Reservas de estoque

Criação de OP

Auditoria

Eventos do Domínio

Exemplos obrigatórios:

AviamentoSolicitado

OPLiberada

RecebimentoTerceiro

RNCEmitida

BaixaEstoqueEfetuada

FaturamentoAprovado

ChecklistQualidadeReprovado

5. PROCESSOS OPERACIONAIS POR DEPARTAMENTO (Cursor deve gerar)

Para cada departamento:

Entrada

Processo

Saída

Responsáveis

Impacto em outros setores

Regras obrigatórias

Fluxo reverso (exceções)

Exemplo – PCP:

Entrada: Coleção, previsão de vendas, estoque disponível

Processo: Planejamento, capacidade produtiva, programação semanal

Saída: OPs liberadas, mapa de produção

Interações: Corte, Estoque, Produção

6. MAPA DE DEPENDÊNCIAS

O Cursor deve criar:

Exemplo:

Corte depende de PCP + Estoque + Ficha Técnica

Produção depende de Corte + Insumos

Qualidade depende de Corte + Produção + Terceiros

Financeiro depende de Compras + Comercial + Fiscal

E-commerce depende de Estoque + Comercial + Logística

7. NÍVEIS DE PERMISSÃO

O Cursor deve mapear todos:

Super Administrador Corporativo (Morina)

Diretoria

Gestores de área

Supervisores

Analistas

Assistentes

Operadores

Leitura/Auditoria

Cada departamento deve ter:

Matriz de acesso

Ações permitidas

Ações negadas

Ações críticas com log obrigatório

8. INTEGRAÇÃO ENTRE DEPARTAMENTOS

O Cursor deve gerar:

Quais dados circulam entre áreas

Quem inicia o fluxo

Quem autoriza

Quem consome

Eventos que disparam ações

Exemplo:

Fluxo: Liberação de OP

Estilo finaliza ficha técnica

PCP planeja

PCP libera OP → evento OPLiberada

Corte recebe

Estoque reserva insumos

Corte progride

Produção inicia

9. IA ESPECIALIZADA – PONTOS DE APLICAÇÃO

Para cada departamento o Cursor deve gerar:

Oportunidades de automação

Sugestão de modelos (ex: classificação, previsão, anomalia)

IA para recomendação

IA para antecipação de atrasos

IA para auditoria documental

IA para classificação de itens

Exemplos concretos:

IA prevê atraso na produção

IA analisa curva ABC de fornecedores

IA identifica padrões anômalos de consumo de aviamento

IA sugere prioridade de corte

10. REGRAS MILITARES OBRIGATÓRIAS PARA O CURSOR

Produzir conteúdo profundo, nunca raso.

Nada genérico — sempre corporativo e aplicável.

Completar lacunas com lógica empresarial sólida.

Criar estrutura completa, sem deixar departamentos pela metade.

Gerar documento extensivo.

Não citar “ERP” — sempre usar “aplicação corporativa interna”.

Marca-guarda corporativa: Morina.

Sempre seguir DDD como norte.

Sempre otimizar para micro serviços/eventos.

Gerar sem repetições.

11. RESULTADO QUE O CURSOR DEVE ENTREGAR

Ao processar este documento, o Cursor deve gerar:

Organograma completo

Estrutura hierárquica formal

Subdepartamentos

Processos

Domínio DDD completo

Entidades, agregados, VOs

Eventos

Permissões

Dependências

Mapa de fluxos

Pontos de IA

Documentação corporativa robusta para ser usada diretamente no projeto Morina
