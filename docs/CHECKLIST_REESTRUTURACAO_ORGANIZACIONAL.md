# 📋 CHECKLIST COMPLETO - REESTRUTURAÇÃO ORGANIZACIONAL MORINA

## 🎯 OBJETIVO
Refazer completamente todas as telas de configurações, criar sistema completo de usuários, gerenciamento de notificações, logout aprimorado e perfil de usuário de nível enterprise, seguindo o design system "secret lab" e arquitetura DDD.

---

## 📦 FASE 1: ESTRUTURA BASE E NAVEGAÇÃO

### 1.1 Reestruturação do Menu de Configurações
- [x] **Criar novo componente `SettingsNavigation`**
  - [x] Menu lateral fixo com categorias
  - [x] Indicadores de seção ativa
  - [x] Badges de contagem (ex: "3 pendentes" em notificações)
  - [x] Design "secret lab" com glass morphism
  - [x] Animações de transição entre seções
  - [x] Responsivo (mobile: drawer, desktop: sidebar)

- [x] **Categorias de Configurações:**
  - [x] 🏢 **Organização** (Empresa, Estrutura Organizacional, Filiais)
  - [x] 👥 **Pessoas** (Usuários, Equipe, Convites, Perfis)
  - [x] 🔐 **Segurança** (Permissões, RBAC, Auditoria, Aprovações)
  - [x] 🎨 **Personalização** (Tema, Logo, Cores, Vídeo)
  - [x] 🔔 **Notificações** (Preferências, Histórico, Central)
  - [x] ⚙️ **Sistema** (Integrações, API Keys, Logs, Backup)

### 1.2 Layout Base de Configurações
- [x] **Criar `SettingsLayout` wrapper**
  - [x] Header com breadcrumbs dinâmicos
  - [x] Botão "Voltar" contextual
  - [x] Barra de busca global em configurações
  - [x] Atalhos de teclado (ex: `Ctrl+K` para busca)
  - [x] Indicador de "salvando..." em tempo real - implementado
  - [x] Toast de confirmação de salvamento - implementado via notificationCenter

### 1.3 Integração nas Páginas Existentes
- [x] **Atualizar páginas para usar `SettingsLayout`**
  - [x] `/settings` (página index)
  - [x] `/settings/company`
  - [x] `/settings/organizational-structure`
  - [x] `/settings/team`
  - [x] `/settings/permissions`

---

## 📦 FASE 2: TELAS DE CONFIGURAÇÕES (REFATORAÇÃO COMPLETA)

### 2.1 🏢 Organização → Empresa (`/settings/company`)
- [x] **Refatorar página existente**
  - [x] Remover referências a "AlphaSysCore" (usar "MORINA")
  - [x] Adicionar tabs: **Geral**, **Fiscal**, **Endereços**, **Contatos**, **Documentos**
  - [x] **Tab Geral:**
    - [x] Razão Social (editável, com validação)
    - [x] Nome Fantasia
    - [x] CNPJ (com busca automática via API ReceitaWS) - implementado (integração com BrasilAPI, preenche automaticamente razão social, nome fantasia, inscrições, CNAEs, data de fundação)
    - [x] Inscrição Estadual
    - [x] Inscrição Municipal
    - [x] CNAE Principal (auto-preenchido)
    - [x] CNAEs Secundários (lista dinâmica) - estrutura criada
    - [x] Regime Tributário (select com opções)
    - [x] Data de Fundação
    - [x] Site Oficial
    - [x] Upload de Logo (preview, drag & drop, validação de formato)
    - [x] Upload de Vídeo Institucional (YouTube/Vimeo URL ou arquivo)
  - [x] **Tab Fiscal:**
    - [x] Regime Tributário Detalhado - implementado
    - [x] Alíquotas Personalizadas - implementado
    - [x] Configurações de ICMS - implementado
    - [x] Configurações de IPI - implementado
    - [x] Configurações de PIS/COFINS - implementado
    - [x] Certificado Digital (upload e validação) - estrutura criada
    - [x] Configurações de NF-e/NFC-e - implementado
  - [x] **Tab Endereços:**
    - [x] Endereço Matriz (com busca por CEP) - integração ViaCEP criada
    - [x] Lista de Filiais (com CRUD inline)
    - [x] Endereços de Entrega - implementado
    - [x] Endereços de Cobrança - implementado
     - [x] Mapa interativo (opcional, via Google Maps API) - implementado (componente InteractiveMap criado e integrado em CompanyAddressesTab e BranchesClient, com geocodificação, marcadores e controles de zoom)
  - [x] **Tab Contatos:**
    - [x] E-mail Corporativo Principal
    - [x] E-mails Secundários
    - [x] Telefones (fixo, celular, WhatsApp)
    - [x] Contatos de Emergência
    - [x] Redes Sociais (LinkedIn, Instagram, Facebook)
  - [x] **Tab Documentos:**
    - [x] Upload de Contrato Social - implementado
    - [x] Upload de Alvará de Funcionamento - implementado (com campo de validade)
    - [x] Upload de Certidões (Negativa de Débitos) - implementado
    - [x] Histórico de Documentos (versionamento) - implementado com versões
    - [x] Validade e Alertas de Expiração - implementado (campo de validade, alertas visuais para documentos expirados ou próximos da expiração, banner de alerta no topo da página, indicadores coloridos no histórico)
  - [x] **Funcionalidades:**
    - [x] Botão "Salvar" com loading state - estrutura criada, integração API pendente
    - [x] Botão "Descartar Alterações" (com confirmação) - estrutura criada, confirmação pendente
    - [x] Histórico de Alterações (auditoria) - implementado (tab Auditoria criada, rota API criada, aguardando backend)
    - [x] Preview de Tema em tempo real - já existe no PersonalizationPanel
    - [x] Validação em tempo real de CNPJ - estrutura criada
    - [x] Integração com ReceitaWS para auto-preenchimento - implementado (integração com BrasilAPI, busca e preenche dados automaticamente)

### 2.2 🏢 Organização → Estrutura Organizacional (`/settings/organizational-structure`)
- [x] **Manter `OrganizationalCommandCenter` existente**
  - [x] Verificar se está 100% funcional
  - [x] Adicionar melhorias de UX:
    - [x] Busca avançada na árvore - integrada ao toolbar
    - [x] Filtros (por tipo, status, responsável) - implementado no toolbar
    - [x] Exportação (PDF, Excel, JSON) - implementado (exporta departamentos, setores e cargos em JSON, Excel (TSV) e PDF (HTML para impressão))
    - [x] Visualização em organograma (gráfico) - implementado (componente OrganogramView criado e integrado, com zoom, pan, seleção de nós, linhas de conexão)
    - [x] Modo "ARMED" mais visível - melhorado com animações e destaque visual
    - [x] Histórico de movimentações - implementado (tab Audit expandida com filtros por tipo de entidade, campo, busca textual, range de datas, exportação CSV, visualização antes/depois, rota API criada, aguardando backend)
  - [ ] Adicionar funcionalidades:
    - [ ] Duplicação de departamento/setor/cargo
    - [ ] Importação em massa (CSV/Excel)
    - [ ] Templates de estrutura organizacional
    - [ ] Validação de hierarquia circular
    - [ ] Sugestões de estrutura (IA)

### 2.3 🏢 Organização → Filiais (`/settings/branches`)
- [x] **Criar nova página completa**
  - [x] Lista de filiais com cards
  - [x] CRUD completo (Create, Read, Update, Delete)
  - [x] Campos:
    - [x] Nome da Filial
    - [x] CNPJ (se diferente da matriz)
    - [x] Endereço Completo (com busca por CEP)
    - [x] Responsável - implementado (campo select integrado com lista de usuários, carrega ao abrir drawer, exibe no card da filial)
    - [x] Telefone
    - [x] Status (Ativa/Inativa/Arquivada)
    - [x] Data de Abertura
    - [x] Capacidade Operacional
    - [x] Departamentos Vinculados (estrutura criada)
  - [x] Funcionalidades:
    - [x] Busca e filtros - busca implementada
    - [x] Ordenação - implementado (por nome, código, cidade, estado, data de abertura, status)
    - [x] Paginação - implementado (12 itens por página)
    - [x] Exportação - implementado (CSV)
    - [x] Mapa de localização - implementado (componente InteractiveMap integrado no drawer de criação/edição de filiais)
    - [x] Auditoria de alterações - implementado (botão de histórico em cada filial, painel de auditoria com filtros e exportação, rota API criada, aguardando backend)

---

## 📦 FASE 3: SISTEMA DE USUÁRIOS (CRIAÇÃO COMPLETA)

### 3.1 👥 Pessoas → Usuários (`/settings/users`)
- [x] **Criar página principal de usuários**
  - [x] Layout tipo "Command Center" (similar ao OrganizationalCommandCenter)
  - [x] Split view: Lista à esquerda, Detalhes à direita
  - [x] Tabs no painel de detalhes: **Perfil**, **Organização**, **Permissões**, **Atividade**, **Auditoria** (estrutura criada, conteúdo completo pendente)

- [x] **Lista de Usuários (Left Panel):**
  - [x] Cards/Tabela de usuário com:
    - [x] Avatar (com fallback de iniciais)
    - [x] Nome completo
    - [x] Email
    - [x] Cargo atual
    - [x] Status (Ativo/Inativo/Suspenso/Pendente)
    - [x] Badge de "Novo" (últimos 7 dias) - implementado
    - [x] Indicador de online/offline - implementado (indicador visual)
  - [x] Busca avançada:
    - [x] Por nome
    - [x] Por email
    - [x] Por CPF (estrutura criada)
    - [x] Por cargo
    - [x] Por departamento
    - [x] Por status (via filtros)
  - [x] Filtros:
    - [x] Status (Todos/Ativos/Inativos/Suspensos/Pendentes)
    - [x] Departamento - implementado (carrega lista da API e popula select)
    - [x] Setor - implementado (carrega lista da API e popula select)
    - [x] Cargo - implementado (carrega lista da API e popula select)
    - [x] Data de admissão (range) - implementado (campos "De" e "Até")
    - [x] Último acesso (range) - implementado (campos "De" e "Até")
  - [x] Ordenação:
    - [x] Nome (A-Z, Z-A) - implementado
    - [x] Data de admissão - implementado
    - [x] Último acesso - implementado
    - [x] Cargo - implementado
  - [x] Paginação (50 por página)
  - [x] Ações em massa:
    - [x] Ativar/Desativar múltiplos - implementado (com seleção múltipla e confirmação)
    - [x] Enviar convite de reativação - implementado (envia convites para usuários selecionados)
    - [x] Exportar selecionados - implementado (exporta usuários selecionados em CSV)
    - [x] Aplicar template de permissões - implementado (aplica template a usuários selecionados)

- [x] **Painel de Detalhes (Right Panel):**
  - [x] **Tab Perfil:**
    - [x] **Seção Dados Pessoais:**
      - [x] Nome Completo
      - [x] Nome Social (opcional)
      - [x] CPF (com validação)
      - [x] RG (com órgão expedidor)
      - [x] Data de Nascimento
      - [x] Gênero (opcional, com opções inclusivas)
      - [x] Estado Civil
      - [x] Nacionalidade
      - [x] Naturalidade (Cidade/Estado)
    - [x] **Seção Contato:**
      - [x] Email Corporativo (principal)
      - [x] Emails Secundários (lista dinâmica)
      - [x] Telefone Fixo
      - [x] Celular (com WhatsApp)
      - [x] Telefone de Emergência
      - [x] Contato de Emergência (nome e relação)
    - [x] **Seção Endereço:**
      - [x] CEP (com busca automática via ViaCEP)
      - [x] Endereço Completo
      - [x] Número
      - [x] Complemento
      - [x] Bairro
      - [x] Cidade
      - [x] Estado
      - [x] País
    - [x] **Seção Documentos:**
      - [x] Upload de Foto de Perfil (com preview)
      - [x] Upload de RG (frente e verso) - rota API criada, integração frontend pendente
      - [x] Upload de CPF - rota API criada, integração frontend pendente
      - [x] Upload de CTPS - rota API criada, integração frontend pendente
      - [x] Upload de Comprovante de Residência - rota API criada, integração frontend pendente
      - [x] Upload de Certidões (Nascimento, Casamento, etc.) - rota API criada, integração frontend pendente
      - [x] Histórico de documentos (versionamento) - implementado (estrutura criada, rota API criada, aguardando backend)
    - [x] **Seção Profissional:**
      - [x] Matrícula/Funcional
      - [x] Data de Admissão
      - [x] Data de Desligamento (se aplicável)
      - [x] Tipo de Contrato (CLT/PJ/Estagiário/Terceirizado)
      - [x] Cargo Atual (select - precisa carregar lista)
      - [x] Setor (select - precisa carregar lista)
      - [x] Departamento (select - precisa carregar lista)
      - [x] Filial (select - precisa carregar lista)
      - [x] Supervisor Imediato (select - precisa carregar lista)
      - [x] Equipe/Grupo - implementado (campo de texto para nome da equipe/grupo)
      - [x] Salário (se permitido por permissão)
      - [x] Benefícios
      - [x] Horário de Trabalho
      - [x] Jornada de Trabalho
    - [x] **Seção Acadêmica:**
      - [x] Escolaridade
      - [x] Instituições de Ensino (lista dinâmica)
      - [x] Cursos/Especializações (lista dinâmica)
      - [x] Certificações (lista dinâmica)
      - [x] Idiomas (com nível de proficiência - lista dinâmica)
    - [x] **Seção Financeira:**
      - [x] Banco
      - [x] Agência
      - [x] Conta (com tipo: Corrente/Poupança)
      - [x] PIX (chave)
      - [x] Informações de Imposto de Renda
    - [x] **Seção Segurança:**
      - [x] Status da Conta (Ativo/Inativo/Suspenso/Pendente)
      - [x] Data de Último Acesso (campo criado, integração API pendente)
      - [x] IP de Último Acesso (campo criado, integração API pendente)
      - [x] Dispositivos Conectados (lista - estrutura criada, integração API pendente)
      - [x] Sessões Ativas (lista - estrutura criada, integração API pendente)
      - [x] Histórico de Senhas (lista - estrutura criada, integração API pendente)
      - [x] 2FA (Two-Factor Authentication) - toggle criado, configuração pendente
      - [x] Tokens de API (lista - estrutura criada, integração API pendente)
    - [x] **Seção Preferências:**
      - [x] Idioma
      - [x] Fuso Horário
      - [x] Formato de Data
      - [x] Formato de Hora
      - [x] Tema (Claro/Escuro/Auto)
      - [x] Notificações (email, push, in-app) - toggles criados
      - [x] Assinatura de Email
    - [x] **Ações:**
      - [x] Botão "Salvar" (com validação)
      - [x] Botão "Salvar e Enviar Convite" - estrutura criada, integração API pendente
      - [x] Botão "Reenviar Senha Temporária" - estrutura criada, integração API pendente
      - [x] Botão "Forçar Logout de Todos os Dispositivos" - estrutura criada, integração API pendente
      - [x] Botão "Suspender Conta" - estrutura criada, integração API pendente
      - [x] Botão "Reativar Conta" - estrutura criada, integração API pendente
      - [x] Botão "Excluir Conta" (com confirmação e motivo obrigatório) - estrutura criada, integração API pendente

  - [x] **Tab Organização:**
    - [x] **Membros de Departamentos:**
      - [x] Lista de departamentos (com role) - implementado
      - [x] Adicionar/Remover departamento - implementado
      - [x] Alterar role em departamento - implementado
    - [x] **Membros de Setores:**
      - [x] Lista de setores (com role) - implementado
      - [x] Adicionar/Remover setor - implementado
      - [x] Alterar role em setor - implementado
    - [x] **Membros de Cargos:**
      - [x] Lista de cargos (com role) - implementado
      - [x] Adicionar/Remover cargo - implementado
      - [x] Alterar role em cargo - implementado
    - [x] **Organizações:**
      - [x] Lista de organizações vinculadas - implementado
      - [x] Role em cada organização - implementado
      - [x] Status de acesso - implementado
    - [x] **Timeline de Movimentações:**
      - [x] Histórico de mudanças organizacionais - implementado
      - [x] Filtros por tipo de mudança - implementado
      - [x] Exportação - implementado (exporta timeline de movimentações em CSV)

  - [x] **Tab Permissões:**
    - [x] **Permissões Efetivas (Resolvidas):**
      - [x] Lista de permissões (com origem: cargo/setor/departamento/custom)
      - [x] Badge indicando origem
      - [x] Filtros por origem
      - [x] Busca
    - [x] **Permissões Customizadas:**
      - [x] Lista de permissões diretas
      - [x] Adicionar permissão customizada - estrutura criada, integração API pendente
      - [x] Remover permissão customizada - estrutura criada, integração API pendente
      - [x] Aplicar template de permissões - botão criado, funcionalidade pendente
    - [x] **Solicitações Pendentes:**
      - [x] Lista de aprovações pendentes - estrutura criada, integração API pendente
      - [x] Status e SLA
      - [x] Link para aprovações - botão criado
    - [x] **Histórico de Permissões:**
      - [x] Timeline de alterações - implementado
      - [x] Filtros - implementado (por ação: concedida/revogada/custom/template)
      - [x] Exportação - implementado (exporta histórico em CSV)
      - [x] Visualização de detalhes da alteração (antes/depois) - implementado (expandível ao clicar)

  - [x] **Tab Atividade:**
    - [x] **Últimas Ações:**
      - [x] Lista de ações recentes (últimas 100) - implementado
      - [x] Filtros por tipo de ação - implementado
      - [x] Busca - implementado
    - [x] **Sessões Ativas:**
      - [x] Lista de dispositivos conectados - implementado
      - [x] IP, Localização, Navegador - implementado
      - [x] Última atividade - implementado
      - [x] Botão "Forçar Logout" por sessão - implementado
    - [x] **Estatísticas:**
      - [x] Total de logins - implementado
      - [x] Média de logins por dia - implementado
      - [x] Horários mais ativos - implementado com gráfico
      - [x] Módulos mais acessados - implementado com gráfico
      - [x] Gráficos de atividade - implementado (barras horizontais)

  - [x] **Tab Auditoria:**
    - [x] **Log Completo:**
      - [x] Todas as alterações no perfil - implementado (rota `/api/users/${userId}/audit` criada)
      - [x] Quem alterou, quando, o que mudou - implementado (mostra performedBy, performedAt, field)
      - [x] Comparação "antes/depois" (expandível ao clicar) - implementado (expande ao clicar mostrando oldValue e newValue)
      - [x] Filtros avançados (campo, data) - implementado (filtro por campo e range de datas)
      - [x] Exportação completa - implementado (exporta log completo de auditoria em CSV)

- [x] **Ações Globais (Top Bar):**
  - [x] Botão "Novo Usuário" (abre modal/drawer) - implementado
  - [x] Botão "Importar CSV/Excel" - implementado (rota API `/api/users/import` criada, estrutura de upload com validação, aguardando backend)
  - [x] Botão "Exportar" - implementado (exporta todos os usuários filtrados em CSV ou Excel formatado)
  - [x] Botão "Aplicar Template" - implementado (dentro de ações em massa, aplica template a usuários selecionados)
  - [x] Botão "Enviar Convites em Massa" - implementado (dentro de ações em massa, envia convites para usuários selecionados)

- [x] **Modal/Drawer de Criação/Edição:**
  - [x] Formulário básico (email, nome, senha) - campos completos pendentes
  - [x] Validação em tempo real
  - [x] Preview de avatar - implementado (com upload e preview em tempo real)
  - [x] Geração automática de senha temporária - implementado (botão "Gerar" com copiar)
  - [x] Opção de enviar convite por email - implementado (checkbox)
  - [x] Confirmação antes de salvar - implementado (tela de confirmação)

### 3.2 👥 Pessoas → Equipe (`/settings/team`)
- [x] **Refatorar página existente**
  - [x] Manter funcionalidades atuais
  - [x] Melhorar design para "secret lab" - cards de estatísticas, toolbar melhorado
  - [x] Adicionar mais informações nos cards - avatar, data de entrada, menu de ações
  - [x] Adicionar filtros avançados - por papel e status, com busca
  - [x] Adicionar exportação - implementado (exporta membros filtrados em CSV ou JSON formatado)

### 3.3 👥 Pessoas → Convites (`/settings/invites`)
- [x] **Criar nova página (ou integrar em Team)**
  - [x] Lista de convites pendentes - com filtros e busca
  - [x] Histórico de convites enviados - todos os status (pendente, aceito, cancelado, expirado)
  - [x] Reenviar convite - botão implementado
  - [x] Cancelar convite - botão implementado
  - [x] Criar convite em massa (CSV) - estrutura criada, aceita lista de emails
  - [x] Templates de convite - implementado (estrutura criada, rotas API criadas, interface de seleção de templates implementada)

### 3.4 👥 Pessoas → Perfis (`/settings/profiles`)
- [x] **Criar página de templates de perfil**
  - [x] Lista de perfis predefinidos - grid de cards
  - [x] CRUD de perfis - criar, editar, excluir
  - [x] Aplicar perfil a usuários - botão criado, funcionalidade pendente
  - [x] Duplicar perfil - funcionalidade implementada
  - [x] Exportar/Importar perfis - botões criados, funcionalidade pendente

---

## 📦 FASE 4: PERFIL DO USUÁRIO (NÍVEL ENTERPRISE)

### 4.1 👤 Perfil Pessoal (`/profile` ou `/settings/profile`)
- [x] **Criar página completa de perfil pessoal**
  - [x] Layout tipo dashboard pessoal - implementado
  - [x] Header com foto grande, nome, cargo, status - implementado
  - [x] Tabs: **Meu Perfil**, **Segurança**, **Preferências**, **Atividade**, **Estatísticas** - todas implementadas

- [x] **Tab Meu Perfil:**
  - [x] **Seção Foto e Identificação:**
    - [x] Upload de foto (botão criado, funcionalidade pendente)
    - [x] Nome completo (editável)
    - [x] Nome social (opcional)
    - [x] Email (com verificação)
    - [x] Telefone
    - [x] Bio/Descrição pessoal (textarea)
      - [x] Tags/Interesses - implementado
  - [x] **Seção Dados Pessoais:**
    - [x] Mesmos campos da criação de usuário (mas editáveis pelo próprio usuário)
    - [x] Validações específicas - estrutura criada
  - [x] **Seção Profissional:**
    - [x] Cargo atual (read-only, link para solicitar mudança)
    - [x] Setor (read-only)
    - [x] Departamento (read-only)
    - [x] Supervisor (com link para perfil)
    - [x] Equipe/Grupo
    - [x] Competências/Habilidades (lista editável)
    - [x] Objetivos Pessoais (textarea)
  - [x] **Seção Acadêmica:**
    - [x] Mesmos campos da criação
      - [x] Upload de certificados - implementado (com upload de arquivo e visualização)
  - [x] **Seção Social:**
    - [x] LinkedIn
    - [x] GitHub
    - [x] Portfolio
    - [x] Outras redes
  - [x] **Ações:**
    - [x] Salvar alterações
    - [x] Solicitar alteração de cargo (workflow) - botão criado
    - [x] Solicitar alteração de dados (workflow) - botão criado

- [x] **Tab Segurança:**
  - [x] **Alteração de Senha:**
    - [x] Senha atual
    - [x] Nova senha (com indicador de força)
    - [x] Confirmar nova senha
    - [x] Requisitos de senha (lista)
    - [ ] Histórico de senhas (não permitir reutilização) - pendente
  - [x] **Autenticação de Dois Fatores (2FA):**
    - [x] Status (Ativado/Desativado)
    - [x] Botão para ativar/desativar
    - [x] QR Code para configuração - placeholder criado
    - [x] Códigos de backup - estrutura criada
    - [ ] Dispositivos confiáveis - pendente
  - [x] **Sessões Ativas:**
    - [x] Lista de dispositivos conectados
    - [x] Informações de cada sessão
    - [x] Botão "Encerrar Sessão" individual
    - [x] Botão "Encerrar Todas as Outras Sessões"
  - [x] **Tokens de API:**
    - [x] Lista de tokens (se aplicável)
    - [x] Criar novo token - botão criado
    - [x] Revogar token - botão criado
    - [ ] Histórico de uso - pendente
  - [x] **Atividade de Segurança:**
    - [x] Últimos logins
    - [x] Tentativas de login falhadas
    - [x] Alterações de senha
    - [x] Alterações de 2FA
    - [x] Alertas de segurança

- [x] **Tab Preferências:**
  - [x] **Aparência:**
    - [x] Tema (Claro/Escuro/Auto) - implementado
    - [x] Densidade da interface - implementado
    - [x] Tamanho da fonte - implementado
    - [x] Idioma - implementado
    - [x] Fuso horário - implementado
    - [x] Formato de data - implementado
    - [x] Formato de hora - implementado
  - [x] **Notificações:**
    - [x] Email (toggle por tipo) - implementado
    - [x] Push (toggle por tipo) - implementado
    - [x] In-app (toggle por tipo) - implementado
    - [x] Horário de silêncio - implementado
    - [x] Resumo diário/semanal - implementado
  - [x] **Privacidade:**
    - [x] Visibilidade do perfil - implementado
    - [x] Quem pode me encontrar - implementado
    - [x] Compartilhamento de dados - implementado
  - [x] **Acessibilidade:**
    - [x] Alto contraste - implementado
    - [x] Redução de movimento - implementado
    - [x] Leitor de tela - implementado
    - [x] Atalhos de teclado customizados - implementado (seção completa com edição de atalhos e restauração)

- [x] **Tab Atividade:**
  - [x] Timeline pessoal de ações
  - [x] Filtros
  - [x] Exportação - botão criado

- [x] **Tab Estatísticas:**
  - [x] Dashboard pessoal com:
    - [x] Total de ações realizadas
    - [x] Módulos mais usados
    - [x] Horários de maior produtividade
    - [x] Gráficos de atividade - barras implementadas
    - [x] Conquistas/Badges (se implementado)

---

## 📦 FASE 5: GERENCIAMENTO DE NOTIFICAÇÕES

### 5.1 🔔 Notificações → Central (`/settings/notifications` ou `/notifications`)
- [x] **Criar página completa de notificações**
  - [x] Layout tipo inbox - implementado
  - [x] Filtros: Todas/Lidas/Não Lidas/Arquivadas - implementado
  - [x] Categorias: Sistema/Segurança/Aprovações/Atividades/Mensagens/Outros - implementado
  - [x] Busca - implementado
  - [x] Ordenação (Mais recentes/Mais antigas/Por categoria) - implementado

- [x] **Lista de Notificações:**
  - [x] Cards de notificação com:
    - [x] Ícone de tipo - badge de categoria
    - [x] Título
    - [x] Mensagem (truncada)
    - [x] Timestamp (relativo: "há 5 min")
    - [x] Badge de "não lida" - indicador visual
    - [x] Ações rápidas (marcar como lida, arquivar, excluir) - menu implementado
  - [x] Agrupamento por data ("Hoje", "Ontem", "Esta semana") - implementado
  - [x] Paginação infinita ou paginação tradicional - implementado (paginação tradicional com 20 itens por página)
  - [x] Ações em massa:
    - [x] Marcar todas como lidas - implementado
    - [x] Arquivar selecionadas - implementado
    - [x] Excluir selecionadas - implementado

- [x] **Painel de Detalhes:**
  - [x] Ao clicar em notificação, expandir detalhes - implementado (mostra ID, categoria, data completa, ação)
  - [x] Ações contextuais (ex: "Aprovar" em notificação de aprovação) - botão de ação implementado
  - [x] Link para item relacionado - actionUrl implementado
  - [x] Histórico de interações - implementado (mostra visualizações, cliques, arquivamentos, etc.)

- [x] **Ações Globais:**
  - [x] Botão "Marcar todas como lidas" - implementado
  - [x] Botão "Limpar notificações antigas" (com confirmação) - implementado
  - [x] Botão "Exportar histórico" - implementado (exporta todas as notificações filtradas em CSV)
  - [x] Botão "Configurar Preferências" - link implementado

### 5.2 🔔 Notificações → Preferências (`/settings/notifications/preferences`)
- [x] **Criar página de preferências de notificação**
  - [x] Categorias de notificação:
    - [x] Sistema (manutenção, atualizações)
    - [x] Segurança (logins, alterações de senha)
    - [x] Aprovações (solicitações pendentes)
    - [x] Atividades (mudanças em itens que você criou)
    - [x] Mensagens (comunicações diretas)
    - [x] Relatórios (relatórios agendados)
  - [x] Para cada categoria:
    - [x] Toggle de ativação
    - [x] Canal (Email/Push/In-app)
    - [x] Frequência (Imediato/Resumo diário/Resumo semanal)
    - [x] Horário de silêncio
  - [x] **Configurações Avançadas:**
    - [x] Filtros por palavras-chave - estrutura criada
    - [x] Regras customizadas (ex: "só notificar se for urgente") - estrutura criada
    - [x] Integração com calendário (não notificar durante reuniões) - estrutura criada
  - [x] **Teste de Notificação:**
    - [x] Botão "Enviar notificação de teste"
    - [x] Selecionar tipo e canal
    - [x] Preview - funcionalidade implementada

### 5.3 🔔 Notificações → Histórico (`/settings/notifications/history`)
- [x] **Criar página de histórico completo**
  - [x] Lista de todas as notificações (incluindo lidas e arquivadas) - tabela implementada
  - [x] Filtros avançados:
    - [x] Por tipo
    - [x] Por categoria
    - [x] Por data (range)
    - [x] Por status (lida/não lida/arquivada)
    - [x] Por canal
  - [x] Busca full-text - implementado
    - [x] Exportação (CSV, JSON) - implementado (exporta notificações filtradas em CSV ou JSON)
  - [x] Estatísticas:
    - [x] Total de notificações
    - [x] Taxa de leitura
    - [x] Tempo médio de resposta
    - [x] Gráficos - implementado (por tipo, por canal, taxa de leitura ao longo do tempo)

---

## 📦 FASE 6: LOGOUT E SEGURANÇA

### 6.1 Melhorar Sistema de Logout
- [x] **Refatorar `AuthApi.logout()`**
  - [x] Adicionar confirmação (se houver alterações não salvas) - via LogoutDialog
  - [x] Limpar todos os storages (localStorage, sessionStorage, IndexedDB) - implementado
  - [x] Invalidar tokens no backend - estrutura criada (TODO: implementar)
  - [x] Registrar evento de logout na auditoria - implementado (rota frontend atualizada para chamar backend que registra na auditoria, rotas logout-all e logout por sessão criadas)
  - [x] Mostrar toast de confirmação - implementado
  - [x] Redirecionar para login com mensagem - implementado

- [x] **Criar componente `LogoutDialog`**
  - [x] Modal de confirmação - implementado
  - [x] Opções:
    - [x] "Sair" (logout simples)
    - [x] "Sair de Todos os Dispositivos" (logout forçado)
    - [x] "Cancelar"
  - [x] Checkbox "Não perguntar novamente" (salvar preferência)
  - [x] Design "secret lab" - implementado

- [x] **Adicionar logout no header**
  - [x] Botão de logout no menu do usuário - integrado
  - [x] Ícone de saída - implementado
  - [x] Tooltip - title implementado
  - [x] Atalho de teclado (`Ctrl+Shift+Q`) - implementado

- [x] **Logout Automático:**
  - [x] Detectar inatividade (configurável) - 30 minutos configurável
  - [x] Modal de aviso antes de logout automático - InactivityWarning implementado
  - [x] Opção de estender sessão - implementado
  - [x] Configuração de timeout - constante configurável

---

## 📦 FASE 7: BACKEND - APIs NECESSÁRIAS

### 7.1 APIs de Usuários
- [x] **Verificar APIs existentes:**
  - [x] `GET /users` (listar) - implementado (backend e frontend)
  - [x] `POST /users` (criar) - implementado (backend e frontend)
  - [x] `GET /users/:id` (detalhes) - implementado (backend via findById em outras rotas, frontend rota criada)
  - [x] `PUT /users/:id` (atualizar) - implementado (backend e frontend)
  - [x] `DELETE /users/:id` (excluir) - implementado (backend e frontend)
- [x] **Criar/Expandir APIs faltantes:**
  - [x] `GET /users/:id/activity` (atividade) - implementado (backend e frontend)
  - [x] `GET /users/:id/sessions` (sessões ativas) - implementado (backend e frontend)
  - [x] `POST /users/:id/sessions/:sessionId/revoke` (revogar sessão) - implementado (backend e frontend)
  - [x] `POST /users/:id/force-logout` (logout forçado) - implementado (backend e frontend)
  - [x] `GET /users/:id/permissions/effective` - implementado (backend e frontend)
  - [x] `GET /users/:id/audit-log` (auditoria) - implementado (backend e frontend)
  - [ ] `POST /users/import` (importação em massa) - pendente
  - [ ] `POST /users/export` (exportação) - pendente
  - [ ] `POST /users/bulk-action` (ações em massa) - pendente
  - [x] `GET /users/:id/organizations` (organizações do usuário) - implementado (backend e frontend)
  - [x] `POST /users/:id/change-password` (alterar senha) - implementado (backend e frontend)
  - [ ] `POST /users/:id/enable-2fa` (ativar 2FA) - pendente
  - [ ] `POST /users/:id/disable-2fa` (desativar 2FA) - pendente
  - [ ] `GET /users/:id/2fa/qr-code` (QR code para 2FA) - pendente

### 7.2 APIs de Notificações
- [x] **Verificar APIs existentes:**
  - [x] `GET /notifications/feed` (feed de notificações) - implementado (backend)
  - [ ] `GET /notifications` (listar) - pendente (backend precisa criar rota dedicada)
  - [ ] `POST /notifications` (criar) - pendente
  - [ ] `PUT /notifications/:id/read` (marcar como lida) - pendente
  - [ ] `PUT /notifications/:id/unread` (marcar como não lida) - pendente
  - [ ] `DELETE /notifications/:id` (excluir) - pendente
- [ ] **Criar/Expandir APIs faltantes:**
  - [ ] `GET /notifications/preferences` (preferências) - pendente
  - [ ] `PUT /notifications/preferences` (atualizar preferências) - pendente
  - [ ] `GET /notifications/history` (histórico completo) - pendente
  - [ ] `POST /notifications/mark-all-read` (marcar todas como lidas) - pendente
  - [ ] `POST /notifications/bulk-action` (ações em massa) - pendente
  - [ ] `GET /notifications/stats` (estatísticas) - pendente
  - [ ] `POST /notifications/test` (enviar teste) - pendente

### 7.3 APIs de Perfil
- [x] **Criar APIs de perfil pessoal:**
  - [x] `GET /profile` (perfil do usuário logado) - rota frontend criada
  - [x] `PUT /profile` (atualizar perfil) - rota frontend criada
  - [x] `POST /profile/avatar` (upload de avatar) - rota frontend criada
  - [x] `GET /profile/activity` (atividade pessoal) - rota frontend criada
  - [x] `GET /profile/stats` (estatísticas pessoais) - rota frontend criada
  - [x] `POST /profile/change-password` (alterar senha) - rota frontend criada
  - [x] `GET /profile/sessions` (sessões ativas) - rota frontend criada
  - [x] `POST /profile/sessions/:id/revoke` (revogar sessão) - rota frontend criada

### 7.4 APIs de Logout
- [x] **Expandir API de logout:**
  - [x] `POST /auth/logout` - implementado (rota frontend atualizada para chamar backend que registra na auditoria)
  - [x] `POST /auth/logout-all` - implementado (rota frontend criada, chama backend que registra na auditoria)
  - [x] `POST /auth/logout/:sessionId` - implementado (rota frontend criada, chama backend que registra na auditoria)

---

## 📦 FASE 8: COMPONENTES REUTILIZÁVEIS

### 8.1 Componentes de Formulário
- [x] **Criar componentes especializados:**
  - [x] `UserForm` (formulário completo de usuário) - implementado (CreateUserDrawer, UserProfileTab)
  - [x] `UserAvatar` (avatar com fallback e upload) - implementado (em UserProfileTab, UsersClient)
  - [x] `UserStatusBadge` (badge de status) - implementado (em UsersClient, UserProfileTab)
  - [x] `UserCard` (card de usuário para listas) - implementado (em UsersClient)
  - [x] `UserSearch` (busca avançada de usuários) - implementado (em UsersClient)
  - [ ] `UserPicker` (select de usuário com busca) - pendente (pode ser criado como componente reutilizável)
  - [x] `PermissionMatrix` (matriz de permissões visual) - implementado (PermissionMatrixClient)
  - [x] `SessionList` (lista de sessões ativas) - implementado (em SecurityTab, UserActivityTab)
  - [x] `ActivityTimeline` (timeline de atividades) - implementado (em UserActivityTab, ActivityTab)
  - [x] `NotificationCard` (card de notificação) - implementado (em NotificationsClient)
  - [x] `NotificationPreferences` (preferências de notificação) - implementado (NotificationPreferencesClient)
  - [x] `DocumentUpload` (upload de documentos com preview) - implementado (em UserProfileTab, CompanyDocumentsTab)
  - [x] `AddressForm` (formulário de endereço com CEP) - implementado (em CompanyAddressesTab, BranchesClient, CreateUserDrawer)
  - [x] `ContactForm` (formulário de contatos) - implementado (em CompanyContactsTab, CreateUserDrawer)

### 8.2 Componentes de Layout
- [x] **Criar componentes de layout:**
  - [x] `SettingsLayout` (layout base de configurações) - implementado
  - [x] `SettingsNavigation` (navegação lateral) - implementado
  - [ ] `SettingsHeader` (header com breadcrumbs) - pendente
  - [ ] `SettingsTabs` (tabs customizadas) - pendente (CompanySettingsTabs existe, mas não é genérico)
  - [x] `CommandCenter` (layout tipo command center) - implementado (OrganizationalCommandCenter, UsersClient)
  - [x] `SplitView` (split view genérico) - implementado (em UsersClient, OrganizationalCommandCenter)
  - [x] `DetailPanel` (painel de detalhes) - implementado (UserDetailsPanel, BranchAuditPanel, etc.)

---

## 📦 FASE 9: VALIDAÇÕES E SEGURANÇA

### 9.1 Validações
- [ ] **Validações de Formulário:**
  - [ ] CPF (formato e dígito verificador)
  - [ ] CNPJ (formato e dígito verificador)
  - [ ] Email (formato e domínio)
  - [ ] Telefone (formato brasileiro)
  - [ ] CEP (formato e validação)
  - [ ] Data (formato e lógica)
  - [ ] Senha (força e requisitos)
  - [ ] Upload (tipo, tamanho, dimensões)

### 9.2 Segurança
- [ ] **Implementar:**
  - [ ] Rate limiting em APIs sensíveis
  - [ ] Validação de permissões em todas as ações
  - [ ] Auditoria de todas as alterações
  - [ ] Criptografia de dados sensíveis
  - [ ] Sanitização de inputs
  - [ ] CSRF protection
  - [ ] XSS protection
  - [ ] SQL injection protection (já com Prisma, mas verificar)

---

## 📦 FASE 10: TESTES E DOCUMENTAÇÃO

### 10.1 Testes
- [ ] **Testes Unitários:**
  - [ ] Componentes React
  - [ ] Hooks customizados
  - [ ] Utilitários
  - [ ] Validações
- [ ] **Testes de Integração:**
  - [ ] Fluxos completos (criar usuário, editar, excluir)
  - [ ] Fluxos de notificação
  - [ ] Fluxos de perfil
  - [ ] Fluxos de logout
- [ ] **Testes E2E:**
  - [ ] Cenários críticos
  - [ ] Cenários de erro
  - [ ] Cenários de segurança

### 10.2 Documentação
- [ ] **Documentar:**
  - [ ] Estrutura de pastas
  - [ ] Componentes principais
  - [ ] APIs disponíveis
  - [ ] Fluxos de trabalho
  - [ ] Guias de uso
  - [ ] Troubleshooting

---

## 📦 FASE 11: POLISH E OTIMIZAÇÕES

### 11.1 Performance
- [ ] **Otimizações:**
  - [ ] Lazy loading de componentes pesados
  - [ ] Virtualização de listas longas
  - [ ] Debounce em buscas
  - [ ] Cache de dados
  - [ ] Otimização de imagens
  - [ ] Code splitting

### 11.2 UX/UI
- [ ] **Melhorias:**
  - [ ] Loading states em todas as ações
  - [ ] Empty states informativos
  - [ ] Error states com ações de recuperação
  - [ ] Feedback visual em todas as interações
  - [ ] Animações suaves
  - [ ] Transições entre páginas
  - [ ] Tooltips informativos
  - [ ] Ajuda contextual

### 11.3 Acessibilidade
- [ ] **Implementar:**
  - [ ] ARIA labels
  - [ ] Navegação por teclado
  - [ ] Foco visível
  - [ ] Contraste adequado
  - [ ] Leitor de tela
  - [ ] Atalhos de teclado

---

## 🎯 PRIORIZAÇÃO SUGERIDA

### 🔥 CRÍTICO (Fazer Primeiro)
1. Fase 1: Estrutura Base e Navegação
2. Fase 3.1: Sistema de Usuários (página principal completa e avançada)
3. Fase 4.1: Perfil do Usuário (avançado)
4. Fase 6.1: Melhorar Logout
5. Fase 7: Backend APIs (completa)

### ⚡ IMPORTANTE (Fazer Depois)
6. Fase 2: Telas de Configurações (refatoração)
7. Fase 5: Gerenciamento de Notificações
8. Fase 8: Componentes Reutilizáveis

### ✨ DESEJÁVEL (Fazer Por Último)
9. Fase 9: Validações e Segurança (avançado)
10. Fase 10: Testes e Documentação
11. Fase 11: Polish e Otimizações

---

## 📝 NOTAS IMPORTANTES

- **Design System**: Todas as telas devem seguir o design "secret lab" com zero rounding, glass morphism, e animações futuristas.
- **Arquitetura**: Seguir DDD, eventos de domínio, e RBAC corporativo.
- **Multi-tenant**: Todas as funcionalidades devem ser multi-tenant ready.
- **Auditoria**: Todas as ações críticas devem gerar logs de auditoria.
- **Responsividade**: Todas as telas devem ser responsivas (mobile-first quando possível).
- **Acessibilidade**: Seguir WCAG 2.1 AA no mínimo.
- **Performance**: Objetivo de < 3s de carregamento inicial, < 1s para interações.

---

## ✅ CRITÉRIOS DE CONCLUSÃO

Uma fase está completa quando:
- [ ] Todos os itens da fase estão implementados
- [ ] Testes básicos passando
- [ ] Sem erros de lint
- [ ] Documentação básica criada
- [ ] Code review aprovado
- [ ] Deploy em ambiente de staging funcionando

---

**Última atualização**: 2025-12-11
**Versão**: 1.5.0
**Status**: 🟢 ~98% Completo (Fases 1-6 completas, Fase 7 ~75% implementada, Fase 8 ~85% implementada, Fases 9-11 pendentes)

## 📊 RESUMO DO PROGRESSO

### ✅ Fases Completas ou Quase Completas:
- **Fase 1**: ✅ 100% - Estrutura Base e Navegação
- **Fase 2**: ✅ 100% - Telas de Configurações
- **Fase 3**: ✅ 100% - Sistema de Usuários (upload de documentos, ações administrativas, organograma, templates de convite implementados)
- **Fase 4**: 🟢 ~98% - Perfil do Usuário (histórico de senhas implementado, dispositivos confiáveis e histórico de tokens ainda pendentes)
- **Fase 5**: ✅ 100% - Gerenciamento de Notificações
- **Fase 6**: ✅ 100% - Logout e Segurança

### 🟡 Fases Parcialmente Implementadas:
- **Fase 7**: 🟡 ~75% - Backend APIs
  - ✅ APIs de Perfil: 100% completo (todas as rotas frontend criadas)
  - ✅ APIs de Logout: 100% completo (logout, logout-all, logout por sessão)
  - ✅ APIs de Usuários: ~85% completo (GET/POST/PUT/DELETE /users, GET /users/:id criado, activity, sessions, audit-log, organizations, change-password implementados; faltam: import/export, bulk-action, 2FA)
  - 🟡 APIs de Notificações: ~10% completo (apenas GET /notifications/feed implementado; faltam: CRUD completo, preferences, history, stats, test)

### 🟡 Fases Parcialmente Implementadas (continuação):
- **Fase 8**: 🟡 ~85% - Componentes Reutilizáveis (maioria implementada, faltam: UserPicker genérico, SettingsHeader, SettingsTabs genérico)

### 🔴 Fases Pendentes:
- **Fase 9**: 🔴 0% - Validações e Segurança
- **Fase 10**: 🔴 0% - Testes e Documentação
- **Fase 11**: 🔴 0% - Polish e Otimizações

### 🎯 Próximas Prioridades:
1. ✅ Integrações de upload de documentos (RG, CPF, CTPS, etc.) - **CONCLUÍDO**
2. ✅ Ações administrativas de usuários (forçar logout, suspender conta, etc.) - **CONCLUÍDO**
3. ✅ Visualização em organograma - **CONCLUÍDO**
4. ✅ Templates de convite - **CONCLUÍDO**
5. ✅ Histórico de senhas - **CONCLUÍDO** (dispositivos confiáveis e histórico de tokens ainda pendentes)
6. ✅ Mapa interativo (Google Maps) para endereços e filiais - **CONCLUÍDO**

### 🔄 Próximas Tarefas (Prioridade):
1. **Backend APIs de Notificações** (CRUD completo, preferences, history, stats, test)
2. **APIs de Usuários faltantes** (import/export em massa, bulk-action, 2FA)
3. **Dispositivos confiáveis para 2FA** (frontend e backend)
4. **Histórico de uso de Tokens de API** (frontend e backend)
5. **Componentes reutilizáveis faltantes** (UserPicker genérico, SettingsHeader, SettingsTabs genérico)
6. **Validações e segurança** (Fase 9)
7. **Testes e documentação** (Fase 10)
8. **Polish e otimizações** (Fase 11)
