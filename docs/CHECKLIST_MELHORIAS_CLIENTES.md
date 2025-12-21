# 📋 CHECKLIST COMPLETO - SISTEMA DE CLIENTES INSANO

## 🎯 Objetivo

Criar o sistema de clientes mais completo, avançado e sofisticado possível, com recursos de nível enterprise, analytics avançados, tempo real, IA/ML, e experiência de usuário excepcional.

---

## ✅ FASE 1: ESTRUTURA BASE E FUNCIONALIDADES ESSENCIAIS

### 1.1 Funcionalidades Base Implementadas

#### Visual e Interface
- [x] Background animado avançado
- [x] Visualização em cards e tabela
- [x] Modal de detalhes
- [x] Paginação
- [x] Estatísticas em tempo real

#### Validações e Máscaras
- [x] Validação CPF/CNPJ
- [x] Máscaras de input
- [x] Validação em tempo real com feedback visual

#### Exportação e Relatórios
- [x] Exportação CSV avançada
- [x] Exportação PDF formatada

#### Busca e Filtros
- [x] Filtros e busca básica
- [x] Busca por múltiplos campos simultaneamente
- [x] Integração BrasilAPI para CNPJ (preenchimento automático)
- [x] Integração ViaCEP para endereço (busca automática)

#### Gestão de Clientes
- [x] Histórico completo de interações (Timeline de auditoria)
- [x] Vincular representantes (formulário completo no modal)

#### Ações em Massa
- [x] Seleção múltipla
- [x] Ações em massa (ativar, desativar, deletar múltiplos)
- [x] Alterar status em massa

#### Recursos Inovadores de UX
- [x] Confetti Celebration - Animação ao salvar
- [x] Indicador de Progresso - Barra animada do formulário
- [x] Seções Colapsáveis - Organização inteligente (Dados Básicos, Contato, Endereço, Observações)
- [x] Atalhos de Teclado - Ctrl+S para salvar, Esc para cancelar
- [x] Estados de erro contextuais - Mensagens por campo
- [x] Animações suaves - Transições profissionais

---

## 📝 FASE 1B: FORMULÁRIO DE CADASTRO DE CLIENTES - RECURSOS AVANÇADOS

### 1B.1 Estrutura e Organização do Formulário

#### Layout e Navegação
- [x] Seções colapsáveis organizadas (Dados Básicos, Contato, Endereço, Observações)
- [x] Indicador de progresso visual animado
- [x] Atalhos de teclado (Ctrl+S para salvar, Esc para cancelar)
- [x] Wizard/stepper multi-etapas - Dividir em etapas guiadas ✅ IMPLEMENTADO
- [x] Salvar rascunho automático - Auto-save a cada X segundos ✅ IMPLEMENTADO (30 segundos, com indicador visual)
- [x] Histórico de rascunhos - Recuperar versões anteriores ✅ IMPLEMENTADO (múltiplas versões, modal de histórico, comparação entre versões)
- [x] Preview antes de salvar - Visualizar dados antes de confirmar ✅ IMPLEMENTADO
- [x] Modo de edição em linha - Editar campos inline sem abrir formulário completo ✅ IMPLEMENTADO (componente InlineEditField, edição direta na tabela de nome, email, telefone, cidade, estado)
- [x] Comparação antes/depois - Visualizar mudanças antes de salvar ✅ IMPLEMENTADO (componente de comparação entre versões)
- [x] Validação condicional - Campos que aparecem baseados em outros campos ✅ IMPLEMENTADO
- [ ] Formulário adaptativo - Campos mudam baseado em tipo de cliente

#### Experiência do Usuário
- [x] Validação em tempo real com feedback visual
- [x] Estados de erro contextuais por campo
- [x] Animações suaves de transição
- [x] Confetti celebration ao criar cliente
- [x] Auto-focus inteligente - Foco automático no campo Nome (apenas na criação)
- [x] Dicas contextuais - Textos de ajuda abaixo dos campos
- [x] Exemplos de preenchimento - Placeholders com exemplos reais
- [x] Sugestões inteligentes - Sugerir valores baseados em histórico ✅ IMPLEMENTADO (análise de padrões, sugestões de cidade/estado/email baseadas em histórico)
- [ ] Preenchimento por voz - Preencher campos via reconhecimento de voz
- [ ] Modo offline - Funcionar sem internet e sincronizar depois
- [x] Feedback de progresso - Mostrar o que falta preencher ✅ IMPLEMENTADO (com validação por etapa)
- [x] Salvamento incremental - Salvar seções conforme são preenchidas ✅ IMPLEMENTADO (auto-save salva tudo)

### 1B.2 Dados Básicos e Identificação

#### Identificação Principal
- [x] Nome completo / Razão Social
- [x] Tipo (Pessoa Física / Jurídica)
- [x] CPF/CNPJ com validação completa
- [x] Integração BrasilAPI para buscar dados por CNPJ
- [x] Inscrição Estadual (IE) - Campo implementado (validação por estado pendente)
- [x] Inscrição Municipal (IM) - Campo implementado
- [x] Nome Fantasia separado - Campo específico e destacado
- [x] Nome Social / Apelido
- [x] Data de Nascimento (PF) / Data de Fundação (PJ)
- [x] Sexo/Gênero (PF)
- [x] Estado Civil (PF)
- [x] Nacionalidade
- [x] Naturalidade (Cidade/Estado)
- [x] RG e Órgão Emissor
- [x] Validação de RG por estado
- [x] Título de Eleitor
- [x] Certidão de Casamento / Nascimento
- [x] Nome da Mãe (PF) - Para validações
- [x] Nome do Pai (PF)
- [x] Situação Cadastral na Receita Federal
- [x] Data de validade do documento
- [x] Foto/Logo do cliente - Campo URL implementado (upload pendente)
- [ ] Biometria facial (opcional) - Para identificação avançada

#### Validações Avançadas
- [x] Validação de CPF com algoritmo completo
- [x] Validação de CNPJ com algoritmo completo
- [ ] Verificação de CPF/CNPJ na Receita Federal (API)
- [x] Validação de inscrição estadual por estado
- [ ] Validação de inscrição municipal
- [ ] Verificação de duplicatas em tempo real
- [ ] Alertas de documentos vencidos/expirados
- [ ] Verificação de documentos bloqueados (SERASA, SPC)

### 1B.3 Informações de Contato

#### Contatos Múltiplos
- [x] Email principal
- [x] Telefone fixo
- [x] Celular
- [x] Email secundário
- [x] Email corporativo
- [x] Telefone comercial
- [x] WhatsApp Business
- [x] Telegram

- [ ] LinkedIn
- [ ] Facebook
- [ ] Instagram
- [ ] Twitter/X
- [ ] YouTube
- [x] Website - Campo implementado com validação de URL
- [ ] Blog
- [ ] Outros canais de comunicação

#### Gestão de Contatos
- [x] Lista de contatos múltiplos - Adicionar vários contatos ✅ IMPLEMENTADO (componente ContactsManager, schema ClienteContact, APIs completas)
- [x] Contato principal - Marcar contato principal ✅ IMPLEMENTADO (campo isPrincipal, desmarca outros automaticamente)
- [x] Horário preferencial de contato
- [x] Idioma preferido
- [x] Forma preferida de comunicação
- [ ] Restrições de contato (LGPD)
- [ ] Opt-in/Opt-out de marketing
- [ ] Histórico de contatos - Log de todas as comunicações

### 1B.4 Endereço e Localização

#### Endereço Completo
- [x] CEP com busca automática ViaCEP
- [x] Endereço (Logradouro)
- [x] Cidade
- [x] Estado (UF)
- [x] Número - Campo implementado
- [x] Complemento - Campo implementado (preenchido via CEP)
- [x] Bairro - Campo implementado (preenchido via CEP)
- [x] Ponto de referência
- [x] Coordenadas GPS (Latitude/Longitude)
- [x] Código IBGE da cidade
- [x] Código do município
- [x] Região (Norte, Sul, etc)
- [x] Zona (Urbana/Rural)

#### Endereços Múltiplos
- [ ] Endereço de correspondência - Diferente do principal
- [ ] Endereço comercial
- [ ] Endereço de entrega
- [ ] Endereço de cobrança
- [ ] Endereços adicionais - Lista de endereços
- [ ] Endereço preferencial para entrega
- [ ] Endereço preferencial para cobrança
- [ ] Mapa interativo - Visualizar localização no mapa
- [ ] Geolocalização automática - Obter coordenadas automaticamente
- [ ] Validação de CEP por região
- [ ] Sugestão de endereço completo via API
- [ ] Verificação de endereço válido

#### Integrações de Endereço
- [x] Integração ViaCEP para busca automática - Atualizado para preencher bairro e complemento
- [ ] Integração Google Maps API
- [ ] Integração OpenStreetMap
- [ ] Integração BrasilAPI para validação
- [ ] Busca reversa de coordenadas (reverse geocoding)

### 1B.5 Informações Fiscais e Financeiras

#### Dados Fiscais
- [ ] Regime Tributário (Simples, Presumido, Real)
- [ ] CNAE Principal - Código e descrição
- [ ] CNAEs Secundários - Lista de atividades
- [ ] Indicador de Inscrição Estadual (Contribuinte, Isento, etc)
- [ ] Inscrição SUFRAMA
- [ ] Certificado Digital - Upload e validade
- [ ] Data de validade do certificado
- [ ] CNPJ da matriz (se filial)
- [ ] Grupo de empresas - Vincular empresas relacionadas
- [ ] Histórico de mudanças fiscais

#### Informações Financeiras
- [ ] Limite de crédito
- [ ] Limite de compra a prazo
- [ ] Limite disponível
- [ ] Condições de pagamento preferenciais
- [ ] Prazo padrão de pagamento (dias)
- [ ] Forma de pagamento preferida
- [ ] Banco e agência (se necessário)
- [ ] Conta corrente
- [ ] Tipo de conta (Corrente, Poupança, etc)
- [ ] Chave PIX
- [ ] Histórico de pagamentos
- [ ] Score de crédito
- [ ] Rating de risco
- [ ] Classificação de inadimplência

### 1B.6 Informações Comerciais

#### Dados Comerciais
- [ ] Segmento de mercado
- [ ] Ramo de atividade
- [ ] Porte da empresa (Micro, Pequena, Média, Grande)
- [ ] Faturamento anual estimado
- [ ] Quantidade de funcionários
- [ ] Data do primeiro contato
- [ ] Origem do cliente (Indicação, Site, Facebook, etc)
- [ ] Canal de venda preferido
- [ ] Vendedor/Representante principal
- [ ] Taxa de desconto padrão
- [ ] Política de preços aplicável
- [ ] Categoria do cliente (A, B, C, D)
- [ ] Potencial de compra
- [ ] Ticket médio
- [ ] Frequência de compra

#### Histórico Comercial
- [ ] Primeira compra
- [ ] Última compra
- [ ] Total de compras
- [ ] Valor total em compras
- [ ] Produtos mais comprados
- [ ] Sazonalidade de compras
- [ ] Tendência de crescimento/queda

### 1B.7 Relacionamentos e Representantes

#### Representantes e Vendedores
- [x] Vincular representantes no modal de detalhes
- [ ] Lista de representantes no formulário
- [ ] Representante principal
- [ ] Percentual de comissão por representante
- [ ] Histórico de comissões
- [ ] Vendedor responsável
- [ ] Equipe de vendas
- [ ] Gerente de conta

#### Relacionamentos
- [ ] Clientes relacionados - Vincular outros clientes
- [ ] Tipo de relacionamento (Matriz/Filial, Grupo, etc)
- [ ] Fornecedores relacionados
- [ ] Parceiros comerciais
- [ ] Contatos de emergência
- [ ] Referências comerciais

### 1B.8 Documentos e Anexos

#### Gestão de Documentos
- [ ] Upload de documentos - Múltiplos arquivos
- [ ] Categorização de documentos
- [ ] Tipos de documento (RG, CPF, CNH, Contrato, etc)
- [ ] Data de emissão
- [ ] Data de validade
- [ ] Status do documento (Válido, Vencido, Pendente)
- [ ] Preview de documentos
- [ ] Download de documentos
- [ ] OCR de documentos - Extrair dados automaticamente
- [ ] Validação de documentos
- [ ] Histórico de versões de documentos
- [ ] Assinatura digital de documentos
- [ ] Notificações de documentos próximos ao vencimento

#### Tipos de Documentos Suportados
- [ ] RG, CPF, CNH
- [ ] Contratos
- [ ] Certidões
- [ ] Comprovantes
- [ ] Fotos
- [ ] Vídeos
- [ ] Outros arquivos

### 1B.9 Observações e Notas

#### Sistema de Notas
- [x] Campo de observações básico
- [ ] Notas múltiplas - Lista de notas
- [ ] Notas por categoria
- [ ] Notas com data e autor
- [ ] Notas privadas/públicas
- [ ] Notas com tags
- [ ] Busca em notas
- [ ] Anexos em notas
- [ ] Rich text editor para notas
- [ ] Notas com @mentions
- [ ] Notas com lembretes

#### Campos de Texto Avançados
- [ ] Rich text editor
- [ ] Markdown support
- [ ] Anexos inline
- [ ] Emojis e ícones
- [ ] Formatação de texto
- [ ] Listas e tabelas
- [ ] Links e referências

### 1B.10 Tags e Categorização

#### Sistema de Tags
- [x] Tags personalizadas - Criar tags customizadas ✅ IMPLEMENTADO (componente TagsInput, schema ClienteTag, APIs completas)
- [ ] Tags predefinidas - Tags padrão do sistema
- [x] Múltiplas tags - Adicionar várias tags ✅ IMPLEMENTADO
- [x] Cores para tags ✅ IMPLEMENTADO (cores hexadecimais, 8 cores padrão)
- [x] Integração no formulário ✅ IMPLEMENTADO (etapa dedicada no wizard)
- [x] Visualização de tags ✅ IMPLEMENTADO (tags exibidas nos cards e tabela)
- [ ] Hierarquia de tags
- [ ] Busca por tags
- [ ] Filtros por tags
- [ ] Tagging em massa

#### Categorização
- [ ] Categorias principais
- [ ] Subcategorias
- [ ] Segmentação automática
- [ ] Classificação por IA
- [ ] Grupos de clientes
- [ ] Listas de clientes

### 1B.11 Campos Customizáveis

#### Customização de Formulário
- [ ] Campos customizados - Adicionar campos próprios
- [ ] Tipos de campo customizados (Texto, Número, Data, Select, etc)
- [ ] Validações customizadas
- [ ] Campos obrigatórios customizados
- [ ] Reordenar campos
- [ ] Mostrar/ocultar campos
- [ ] Templates de formulário
- [ ] Versões de formulário por tipo de cliente

### 1B.12 Validações Avançadas

#### Validações em Tempo Real
- [x] Validação de CPF/CNPJ
- [x] Validação de email
- [x] Validação de CEP
- [x] Validação de estado (UF)
- [ ] Validação de telefone por região
- [ ] Validação de data de nascimento
- [ ] Validação de idade mínima/máxima
- [ ] Validação de formato de documento
- [ ] Validação de campos relacionados
- [ ] Validação condicional complexa
- [ ] Validação de duplicatas em tempo real
- [ ] Validação de integridade de dados
- [ ] Validação de consistência
- [ ] Validação de regras de negócio

#### Validações Externas
- [ ] Verificação de email válido (API)
- [ ] Verificação de telefone válido (API)
- [ ] Verificação de endereço válido (API)
- [ ] Verificação de documentos (API)
- [ ] Verificação de score de crédito
- [ ] Verificação de blacklist

### 1B.13 Integrações e Automações

#### Integrações de Dados
- [x] BrasilAPI para CNPJ
- [x] ViaCEP para CEP
- [ ] Integração com ReceitaWS
- [ ] Integração com SERASA
- [ ] Integração com SPC
- [ ] Integração com Google Maps
- [ ] Integração com CRM externo
- [ ] Integração com ERP
- [ ] Sincronização com sistemas externos
- [ ] Importação em massa de dados

#### Automações
- [ ] Preenchimento automático inteligente
- [ ] Sugestões baseadas em IA
- [ ] Validação automática de dados
- [ ] Enriquecimento de dados automático
- [ ] Classificação automática
- [ ] Segmentação automática
- [ ] Workflows automáticos baseados em campos
- [ ] Notificações automáticas
- [ ] Ações automáticas baseadas em validação

### 1B.14 Acessibilidade e Internacionalização

#### Acessibilidade
- [ ] Suporte a leitores de tela
- [ ] Navegação por teclado completa
- [ ] Alto contraste
- [ ] Tamanho de fonte ajustável
- [ ] Labels acessíveis
- [ ] ARIA labels
- [ ] Feedback sonoro (opcional)
- [ ] Modo de alto contraste

#### Internacionalização
- [ ] Multi-idioma
- [ ] Formatação por região
- [ ] Formatos de data por país
- [ ] Formatos de moeda
- [ ] Formatos de documento por país
- [ ] Validações por país
- [ ] Tradução dinâmica

### 1B.15 Recursos Avançados de UX

#### Feedback Visual
- [x] Animações suaves
- [x] Estados de loading
- [x] Mensagens de erro contextuais
- [x] Confetti celebration
- [ ] Skeleton loading
- [ ] Progressive disclosure
- [ ] Contextual help
- [ ] Guided tour
- [ ] Onboarding interativo
- [ ] Dicas inteligentes
- [ ] Sugestões contextuais

#### Performance
- [ ] Lazy loading de campos
- [ ] Debounce otimizado
- [ ] Cache de validações
- [ ] Otimização de re-renders
- [ ] Virtualização de listas
- [ ] Code splitting
- [ ] Bundle optimization

### 1B.16 Segurança e Privacidade

#### Segurança
- [ ] Criptografia de dados sensíveis
- [ ] Mascaramento de dados sensíveis
- [ ] Logs de auditoria de alterações
- [ ] Permissões granulares por campo
- [ ] Proteção contra XSS
- [ ] Proteção contra SQL Injection
- [ ] Rate limiting
- [ ] Validação server-side
- [ ] Sanitização de inputs

#### Privacidade (LGPD)
- [ ] Consentimento de dados
- [ ] Anonimização de dados
- [ ] Exclusão de dados
- [ ] Portabilidade de dados
- [ ] Histórico de consentimentos
- [ ] Campos de dados sensíveis marcados
- [ ] Política de retenção de dados
- [ ] Logs de acesso a dados

---

### 1.2 Melhorias de Design e UX

#### 1.2.1 Background e Animações
- [ ] Background interativo - Partículas que reagem ao mouse
- [ ] Efeito parallax - Camadas de profundidade no background
- [ ] Gradientes animados - Transições de cores suaves
- [ ] Efeito glassmorphism avançado - Blur dinâmico baseado no scroll
- [ ] Micro-interações - Animações em hover, click, focus
- [ ] Loading skeletons - Placeholders animados durante carregamento
- [ ] Transições de página - Animações ao mudar de visualização
- [ ] Efeito shimmer - Loading shimmer nos cards

#### 1.2.2 Visual e Layout
- [ ] Dark/Light mode toggle - Alternância de tema
- [ ] Temas personalizados - Múltiplos esquemas de cores
- [ ] Layout responsivo avançado - Breakpoints otimizados
- [ ] Grid adaptativo - Colunas dinâmicas baseadas no viewport
- [ ] Sticky header - Barra de ferramentas fixa no scroll
- [ ] Breadcrumbs - Navegação hierárquica
- [ ] Tooltips informativos - Dicas contextuais
- [ ] Badges de status animados - Pulsação sutil em status ativo

---

## 🔍 FASE 2: BUSCA E FILTROS AVANÇADOS

### 2.1 Busca Avançada

#### Funcionalidades de Busca
- [x] Busca por múltiplos campos (Nome, documento, email, endereço simultaneamente)
- [x] Integração BrasilAPI - Busca automática de dados por CNPJ
- [x] Integração ViaCEP - Busca automática de endereço por CEP
- [ ] Busca fuzzy - Tolerância a erros de digitação
- [ ] Busca por voz - Reconhecimento de voz (Web Speech API)
- [ ] Histórico de buscas - Salvar buscas recentes
- [ ] Busca salva - Favoritar buscas frequentes
- [ ] Autocomplete inteligente - Sugestões enquanto digita
- [ ] Busca por tags - Sistema de tags para clientes
- [ ] Busca por geolocalização - Filtrar por proximidade

### 2.2 Filtros Avançados

#### Tipos de Filtros
- [ ] Filtros múltiplos - Combinar vários filtros
- [ ] Filtros por data - Criado em, atualizado em, última interação
- [ ] Filtros por região - Estado, cidade, CEP
- [ ] Filtros por valor - Clientes com maior ticket médio
- [ ] Filtros salvos - Presets de filtros personalizados
- [ ] Filtros rápidos - Botões de filtro pré-configurados
- [ ] Filtro por representante - Clientes de um representante
- [ ] Filtro por comissão - Clientes com comissões pendentes

### 2.3 Ordenação

#### Funcionalidades de Ordenação
- [ ] Ordenação múltipla - Ordenar por vários campos
- [ ] Ordenação customizada - Salvar ordenações favoritas
- [ ] Ordenação por relevância - Algoritmo de relevância personalizado

---

## 📊 FASE 3: VISUALIZAÇÕES E GRÁFICOS

### 3.1 Dashboards e Métricas

#### KPIs e Métricas
- [ ] Dashboard de métricas - KPIs principais em cards
- [ ] Gráfico de crescimento - Evolução de clientes ao longo do tempo
- [ ] Gráfico de distribuição - Distribuição por tipo, status, região
- [ ] Heatmap de atividade - Mapa de calor de interações
- [ ] Gráfico de funil - Conversão de leads para clientes
- [ ] Análise de churn - Clientes inativos vs ativos
- [ ] Previsão de crescimento - Machine learning para previsões
- [ ] Comparativo temporal - Comparar períodos

### 3.2 Visualizações Alternativas

#### Tipos de Visualização
- [ ] Visualização em mapa - Mapa interativo com localização
- [ ] Visualização em timeline - Linha do tempo de interações
- [ ] Visualização em kanban - Board com colunas por status
- [ ] Visualização em calendário - Eventos e aniversários
- [ ] Visualização em árvore - Hierarquia de relacionamentos

---

## 📝 FASE 4: GESTÃO AVANÇADA DE CLIENTES

### 4.1 Informações Adicionais

#### Recursos de Informação
- [x] Histórico completo - Timeline de todas as interações
- [ ] Notas e anotações - Sistema de notas por cliente
- [ ] Anexos e documentos - Upload de documentos
- [ ] Tags personalizadas - Sistema de tags flexível
- [ ] Campos customizados - Campos adicionais configuráveis
- [ ] Relacionamentos - Vincular clientes relacionados
- [ ] Segmentação - Grupos e segmentos de clientes
- [ ] Score de cliente - Pontuação baseada em critérios

### 4.2 Representantes e Comissões

#### Funcionalidades de Comissões
- [x] Vincular representantes - Formulário completo para vincular representantes
- [ ] Histórico de comissões - Todas as comissões do cliente
- [ ] Cálculo automático - Cálculo de comissões em tempo real
- [ ] Relatório de comissões - Exportar relatório detalhado
- [ ] Comissões pendentes - Alertas de comissões não pagas

### 4.3 Comunicação

#### Canais de Comunicação
- [ ] Envio de emails - Enviar emails diretamente da plataforma
- [ ] Histórico de emails - Log de todos os emails enviados
- [ ] Templates de email - Templates personalizáveis
- [ ] SMS integration - Envio de SMS
- [ ] WhatsApp integration - Integração com WhatsApp Business
- [ ] Notificações push - Notificações em tempo real

---

## 🎯 FASE 5: AÇÕES EM MASSA AVANÇADAS

### 5.1 Operações em Lote

#### Funcionalidades de Massa
- [x] Seleção múltipla - Selecionar vários clientes
- [x] Ações em massa - Aplicar ações a múltiplos clientes
- [x] Alterar status em massa - Ativar/desativar múltiplos
- [x] Deletar em massa - Deletar múltiplos (com confirmação)
- [ ] Exportar selecionados - Exportar apenas selecionados
- [ ] Atribuir representante em massa - Vincular representante
- [ ] Aplicar tags em massa - Adicionar tags a vários
- [ ] Enviar email em massa - Campanhas de email

### 5.2 Seleção Inteligente

#### Recursos de Seleção
- [ ] Selecionar todos - Selecionar todos os resultados
- [ ] Selecionar por filtro - Selecionar baseado em filtros
- [ ] Selecionar por busca - Selecionar resultados da busca
- [ ] Desselecionar todos - Limpar seleção

---

## 📤 FASE 6: EXPORTAÇÃO E RELATÓRIOS AVANÇADOS

### 6.1 Formatos de Exportação

#### Tipos de Exportação
- [x] Exportar para PDF - Relatórios em PDF formatados
- [x] Exportar para CSV avançado - CSV com formatação
- [ ] Exportar para Excel - Planilhas Excel avançadas
- [ ] Exportar para JSON - Dados estruturados
- [ ] Exportar para XML - Formato XML
- [ ] Exportar selecionados - Exportar apenas itens selecionados
- [ ] Agendar exportação - Exportações automáticas periódicas

### 6.2 Relatórios

#### Tipos de Relatórios
- [ ] Relatório de clientes - Relatório completo
- [ ] Relatório de vendas - Vendas por cliente
- [ ] Relatório de comissões - Comissões detalhadas
- [ ] Relatório de atividade - Atividade dos clientes
- [ ] Relatórios customizados - Criar relatórios personalizados
- [ ] Relatórios agendados - Enviar relatórios por email
- [ ] Dashboard executivo - Visão geral para gestão

---

## 🔄 FASE 7: AUTOMAÇÕES E INTEGRAÇÕES

### 7.1 Automações

#### Workflows Automáticos
- [ ] Workflows automáticos - Ações automáticas baseadas em eventos
- [ ] Regras de negócio - Regras configuráveis
- [ ] Alertas inteligentes - Notificações baseadas em comportamento
- [ ] Sincronização automática - Sincronizar com sistemas externos
- [ ] Backup automático - Backup periódico dos dados

### 7.2 Integrações

#### APIs e Conexões
- [ ] API pública - API REST para integrações
- [ ] Webhooks - Notificações para sistemas externos
- [ ] Integração CRM - Conectar com CRMs populares
- [ ] Integração ERP - Sincronizar com ERPs
- [ ] Integração contábil - Exportar para sistemas contábeis
- [ ] Integração e-commerce - Sincronizar com lojas online
- [ ] Zapier/Make - Integrações sem código

---

## 🔐 FASE 8: SEGURANÇA E PERMISSÕES

### 8.1 Permissões Granulares

#### Controle de Acesso
- [ ] RBAC avançado - Controle de acesso por função
- [ ] Permissões por campo - Controlar acesso a campos específicos
- [ ] Permissões por ação - Criar, editar, deletar, visualizar
- [ ] Auditoria completa - Log de todas as ações
- [ ] Histórico de alterações - Versionamento de dados
- [ ] Aprovação de alterações - Workflow de aprovação
- [ ] Backup e restore - Sistema de backup

### 8.2 LGPD e Compliance

#### Conformidade Legal
- [ ] Anonimização de dados - Anonimizar dados sensíveis
- [ ] Exportação LGPD - Exportar dados conforme LGPD
- [ ] Exclusão de dados - Excluir dados permanentemente
- [ ] Consentimento - Gerenciar consentimentos
- [ ] Política de retenção - Regras de retenção de dados

---

## 🚀 FASE 9: PERFORMANCE E OTIMIZAÇÃO

### 9.1 Performance

#### Otimizações de Performance
- [ ] Virtual scrolling - Scroll virtual para grandes listas
- [ ] Lazy loading - Carregamento sob demanda
- [ ] Cache inteligente - Cache de dados e queries
- [ ] Otimização de imagens - Compressão e lazy load
- [ ] Code splitting - Dividir código em chunks
- [ ] Service Worker - Cache offline
- [ ] IndexedDB - Armazenamento local avançado
- [ ] Web Workers - Processamento em background

### 9.2 Otimizações Técnicas

#### Melhorias de Código
- [ ] Debounce otimizado - Debounce mais eficiente
- [ ] Throttle de scroll - Otimizar eventos de scroll
- [ ] Memoização - Memoizar cálculos pesados
- [ ] React.memo - Otimizar re-renders
- [ ] Bundle size - Reduzir tamanho do bundle
- [ ] Tree shaking - Remover código não usado

---

## 📱 FASE 10: MOBILE E RESPONSIVIDADE

### 10.1 Mobile First

#### Funcionalidades Mobile
- [ ] PWA completo - Progressive Web App
- [ ] Offline mode - Funcionar offline
- [ ] Gestos touch - Swipe, pinch, etc
- [ ] Mobile menu - Menu otimizado para mobile
- [ ] Bottom sheet - Sheets para mobile
- [ ] Pull to refresh - Atualizar puxando para baixo
- [ ] Infinite scroll - Scroll infinito no mobile
- [ ] Camera integration - Tirar foto de documentos

### 10.2 Responsividade

#### Adaptação de Layout
- [ ] Breakpoints otimizados - Breakpoints customizados
- [ ] Layout adaptativo - Layout que se adapta
- [ ] Touch targets - Áreas de toque adequadas
- [ ] Orientation lock - Bloquear orientação quando necessário

---

## 🤖 FASE 11: INTELIGÊNCIA ARTIFICIAL

### 11.1 IA e Machine Learning

#### Recursos de IA
- [ ] Sugestões inteligentes - IA sugere ações
- [ ] Detecção de anomalias - Detectar comportamentos anômalos
- [ ] Previsão de churn - Prever clientes que vão sair
- [ ] Segmentação automática - IA segmenta clientes
- [ ] Recomendações - Recomendar ações baseadas em dados
- [ ] Chatbot - Assistente virtual para clientes
- [ ] Análise de sentimento - Analisar sentimentos em notas
- [ ] OCR de documentos - Extrair dados de documentos

### 11.2 Processamento de Linguagem Natural

#### Recursos de NLP
- [ ] Busca por linguagem natural - Buscar em português natural
- [ ] Geração de relatórios - IA gera relatórios
- [ ] Resumo automático - Resumir informações do cliente
- [ ] Tradução automática - Traduzir conteúdo

---

## 🎨 FASE 12: PERSONALIZAÇÃO

### 12.1 Customização

#### Funcionalidades Personalizáveis
- [ ] Temas personalizados - Criar temas próprios
- [ ] Layout customizável - Arrastar e soltar colunas
- [ ] Campos customizados - Adicionar campos próprios
- [ ] Views salvas - Salvar visualizações personalizadas
- [ ] Dashboard personalizado - Criar dashboards próprios
- [ ] Atalhos de teclado - Atalhos customizáveis
- [ ] Preferências do usuário - Salvar preferências

### 12.2 Branding

#### Identidade Visual
- [ ] Logo personalizado - Upload de logo
- [ ] Cores da marca - Aplicar cores da empresa
- [ ] Email templates - Templates com branding
- [ ] PDFs personalizados - PDFs com identidade visual

---

## 🔔 FASE 13: NOTIFICAÇÕES E ALERTAS

### 13.1 Notificações

#### Canais de Notificação
- [ ] Notificações em tempo real - WebSockets
- [ ] Notificações push - Push notifications
- [ ] Notificações por email - Emails de notificação
- [ ] Notificações por SMS - SMS de alertas
- [ ] Central de notificações - Hub de notificações
- [ ] Preferências de notificação - Configurar notificações

### 13.2 Alertas

#### Tipos de Alertas
- [ ] Alertas de vencimento - Alertas de prazos
- [ ] Alertas de inatividade - Clientes inativos
- [ ] Alertas de anomalias - Comportamentos anômalos
- [ ] Alertas de limite - Limites de crédito, etc
- [ ] Alertas customizados - Criar alertas próprios

---

## 📊 FASE 14: ANALYTICS E INSIGHTS

### 14.1 Analytics

#### Ferramentas de Análise
- [ ] Google Analytics - Integração com GA
- [ ] Heatmaps - Mapas de calor de uso
- [ ] Session recording - Gravar sessões
- [ ] A/B testing - Testes A/B
- [ ] Funnel analysis - Análise de funil
- [ ] Cohort analysis - Análise de coortes

### 14.2 Insights

#### Recursos de Insights
- [ ] Insights automáticos - IA gera insights
- [ ] Recomendações - Recomendar ações
- [ ] Tendências - Identificar tendências
- [ ] Comparativos - Comparar períodos
- [ ] Benchmarks - Comparar com benchmarks

---

## 🧪 FASE 15: TESTES E QUALIDADE

### 15.1 Testes

#### Tipos de Testes
- [ ] Testes unitários - Cobertura de testes
- [ ] Testes de integração - Testes E2E
- [ ] Testes de performance - Testes de carga
- [ ] Testes de acessibilidade - WCAG compliance
- [ ] Testes de usabilidade - Testes com usuários

### 15.2 Qualidade

#### Padrões de Qualidade
- [ ] Code review - Revisão de código
- [ ] Linting - ESLint, Prettier
- [ ] Type safety - TypeScript strict
- [ ] Error boundaries - Tratamento de erros
- [ ] Logging - Sistema de logs
- [ ] Monitoring - Monitoramento de erros

---

## 📚 FASE 16: DOCUMENTAÇÃO

### 16.1 Documentação

#### Recursos de Documentação
- [ ] Documentação de API - Swagger/OpenAPI
- [ ] Guia do usuário - Manual do usuário
- [ ] Tutoriais - Tutoriais interativos
- [ ] FAQ - Perguntas frequentes
- [ ] Changelog - Histórico de mudanças
- [ ] Roadmap - Roadmap público

---

## 🎯 PRIORIDADES SUGERIDAS

### Alta Prioridade (MVP+)
1. ✅ Background animado avançado
2. ✅ Visualização cards/tabela
3. ✅ Filtros e busca
4. ✅ Paginação
5. ✅ Modal de detalhes
6. ✅ Validação CPF/CNPJ
7. ✅ Exportação CSV
8. ✅ Histórico de interações - Implementado com API de auditoria
9. ✅ Vincular representantes - Formulário completo no modal
10. ✅ Exportação PDF - Implementada
11. ✅ Ações em massa - Ativar, desativar, deletar múltiplos
12. ✅ Busca avançada - Busca por múltiplos campos simultaneamente

### Média Prioridade
1. [ ] Dashboard de métricas
2. [ ] Gráficos e visualizações
3. [ ] Notas e anotações
4. [ ] Tags personalizadas
5. [ ] Integração com email
6. [ ] Workflows automáticos
7. [ ] Permissões granulares

### Baixa Prioridade (Futuro)
1. [ ] IA e Machine Learning
2. [ ] Integrações avançadas
3. [ ] PWA completo
4. [ ] Analytics avançado
5. [ ] Customização total

---

## 📝 NOTAS DE IMPLEMENTAÇÃO

### Implementações Recentes - Wizard e Auto-Save (Sessão Atual)

#### Wizard/Stepper Multi-etapas
- ✅ Componente Stepper/Wizard criado no pacote UI
- ✅ Formulário dividido em 5 etapas: Dados Básicos, Contato, Endereço, Observações, Preview
- ✅ Navegação entre etapas com validação
- ✅ Indicador visual de progresso
- ✅ Botão para alternar entre modo Wizard e Tradicional
- ✅ Animações suaves entre etapas

#### Preview Antes de Salvar
- ✅ Etapa de revisão completa antes de finalizar
- ✅ Visualização formatada de todos os dados
- ✅ Validação final antes de salvar
- ✅ Exibição de erros se houver

#### Auto-Save de Rascunho
- ✅ Salvamento automático a cada 30 segundos
- ✅ Indicador visual de salvamento (spinner durante save, check após salvar)
- ✅ Restauração automática de rascunho ao abrir formulário
- ✅ Confirmação antes de restaurar rascunho antigo
- ✅ Limpeza automática do rascunho após salvar com sucesso
- ✅ Rascunhos válidos por 24 horas

#### Validação Condicional
- ✅ Validação por etapa no wizard
- ✅ Campos que aparecem baseados em tipo de cliente (PF/PJ)
- ✅ Validação em tempo real com feedback visual
- ✅ Bloqueio de avanço se etapa não estiver válida

### Implementações Recentes - Nível INSANO (Sessão Anterior)

#### Confetti Celebration ao Salvar
- ✅ Efeito de confetti animado ao criar novo cliente
- ✅ 150 partículas coloridas com física realista
- ✅ Cores dinâmicas baseadas no tema
- ✅ Animação suave de 5 segundos
- ✅ Canvas nativo (sem dependências externas)

#### Indicador de Progresso do Formulário
- ✅ Barra de progresso visual animada
- ✅ Cálculo automático baseado em campos preenchidos
- ✅ Atualização em tempo real
- ✅ Exibição de percentual (0-100%)
- ✅ Animação suave com Framer Motion

#### Seções Colapsáveis Organizadas
- ✅ 4 seções principais: Dados Básicos, Contato, Endereço, Observações
- ✅ Animações de expandir/colapsar
- ✅ Estado persistente por seção
- ✅ Ícones visuais (📋 📞 📍 📝)
- ✅ Chevron animado indicando estado

#### Atalhos de Teclado Profissionais
- ✅ `Ctrl+S` / `Cmd+S` para salvar
- ✅ `Esc` para cancelar
- ✅ Dica visual no cabeçalho do formulário
- ✅ Suporte multiplataforma (Windows/Mac/Linux)

#### Validação em Tempo Real Aprimorada
- ✅ Feedback visual imediato (borda vermelha)
- ✅ Mensagens de erro contextuais
- ✅ Limpeza automática de erros ao corrigir
- ✅ Estados visuais por campo
- ✅ Validação completa antes de submeter

#### Integrações Inteligentes
- ✅ BrasilAPI para CNPJ (preenchimento automático)
- ✅ ViaCEP para endereço (busca ao sair do campo)
- ✅ Loading states durante buscas
- ✅ Notificações de sucesso/erro

### Implementações Recentes - Recursos Inovadores (Sessão Anterior)

#### Integração BrasilAPI - Busca por CNPJ
- ✅ Botão "Buscar" ao lado do campo CNPJ
- ✅ Preenchimento automático de: Razão Social, Nome Fantasia, Endereço, Cidade, Estado, CEP, Telefone
- ✅ Validação antes de buscar
- ✅ Feedback visual com loading spinner
- ✅ Notificações de sucesso/erro

#### Integração ViaCEP - Busca por CEP
- ✅ Busca automática ao sair do campo CEP (onBlur)
- ✅ Preenchimento automático de: Endereço, Cidade, Estado
- ✅ Validação de formato (8 dígitos)
- ✅ Feedback visual durante busca
- ✅ Notificações de sucesso/erro

#### Validação em Tempo Real Aprimorada
- ✅ Validação completa de todos os campos
- ✅ Mensagens de erro contextuais por campo
- ✅ Estados visuais (borda vermelha em campos com erro)
- ✅ Limpeza automática de erros ao corrigir
- ✅ Validação de CPF/CNPJ com algoritmo completo
- ✅ Validação de email com regex
- ✅ Validação de CEP e Estado

#### UX Melhorada
- ✅ Feedback visual imediato
- ✅ Loading states durante buscas
- ✅ Mensagens de erro específicas
- ✅ Preenchimento inteligente de dados
- ✅ Redução de erros de digitação

### Implementações Recentes (Sessão Anterior)

#### Histórico de Interações Completo
- ✅ Criada API `/api/clientes/[id]/audit` para buscar histórico de auditoria
- ✅ Modal de detalhes mostra timeline completa de todas as ações
- ✅ Exibe campos alterados, valores anteriores e novos
- ✅ Mostra email do usuário que realizou a ação quando disponível

#### Vincular Representantes
- ✅ Formulário completo no modal de detalhes
- ✅ Validação de percentual de comissão (0-100%)
- ✅ Máscaras de input para CPF, telefone e CEP
- ✅ Integração com API de representantes
- ✅ Lista de representantes vinculados com informações completas

#### Busca Avançada
- ✅ Painel de busca avançada com múltiplos campos
- ✅ Busca simultânea por: Nome, Documento, Email, Cidade, Estado, Endereço
- ✅ Alternância entre busca simples e avançada
- ✅ Botão para limpar filtros rapidamente

#### Melhorias Gerais
- ✅ Exportação PDF funcional
- ✅ Ações em massa (ativar, desativar, deletar) implementadas
- ✅ Seleção múltipla com checkbox em cards e tabela

---

## 📝 NOTAS

- Este checklist é um guia completo de melhorias
- Priorize baseado nas necessidades do negócio
- Implemente incrementalmente
- Sempre teste antes de deploy
- Documente as mudanças

---

**Última atualização:** 2024-12-19

---

## 📋 RESUMO DAS IMPLEMENTAÇÕES DESTA SESSÃO

### ✅ 1. Modo de Edição em Linha
**Status:** ✅ COMPLETO

- Componente `InlineEditField` criado
- Edição inline na tabela de clientes
- Campos editáveis: Nome, Email, Telefone, Cidade, Estado
- Validação em tempo real
- Atalhos: Enter (salvar), Esc (cancelar)
- Feedback visual completo

### ✅ 2. Sistema de Tags
**Status:** ✅ COMPLETO

**Backend:**
- Schema: `ClienteTag` e `ClienteTagRelation`
- APIs: Listar, Criar, Atualizar tags
- Tags incluídas na resposta de listagem

**Frontend:**
- Componente `TagsInput` com sugestões
- Hook `useClienteTags`
- Integração no wizard (etapa dedicada)
- Visualização nos cards e tabela
- 8 cores padrão

### ✅ 3. Múltiplos Contatos
**Status:** ✅ COMPLETO

**Backend:**
- Schema: `ClienteContact`
- APIs: CRUD completo de contatos
- Suporte a contato principal

**Frontend:**
- Componente `ContactsManager`
- Campos: Nome, Email, Telefone, Celular, Cargo, Departamento, Tipo, Principal, Observações
- Tipos: Geral, Comercial, Financeiro, Suporte, Técnico
- Integração no modal de detalhes (aba "Contatos")

### 📝 Scripts Criados
- `scripts/migrate-cliente-tags.sh` - Migration de tags
- `scripts/migrate-cliente-contacts.sh` - Migration de contatos

### 🔄 Próximos Passos Necessários

1. **Executar Migrations:**
   ```bash
   # Tags
   bash scripts/migrate-cliente-tags.sh
   
   # Contatos
   bash scripts/migrate-cliente-contacts.sh
   ```

2. **Ou executar tudo de uma vez:**
   ```bash
   cd apps/api
   pnpm prisma migrate dev --name add_cliente_tags_and_contacts
   pnpm prisma generate
   ```

3. **Testar funcionalidades:**
   - Criar tags e adicionar aos clientes
   - Adicionar múltiplos contatos aos clientes
   - Testar edição inline na tabela
   - Verificar visualização de tags e contatos

### Implementações Recentes - Sistema Completo de Tags, Edição Inline e Múltiplos Contatos (Sessão Atual)

#### Múltiplos Contatos
- ✅ Schema Prisma atualizado com `ClienteContact`
- ✅ APIs backend completas:
  - `GET /clientes/:id/contatos` - Listar contatos do cliente
  - `POST /clientes/:id/contatos` - Criar novo contato
  - `PUT /clientes/:id/contatos/:contatoId` - Atualizar contato
  - `DELETE /clientes/:id/contatos/:contatoId` - Deletar contato
- ✅ Componente `ContactsManager` criado com:
  - Lista de contatos com informações completas
  - Formulário para adicionar/editar contatos
  - Campos: Nome, Email, Telefone, Celular, Cargo, Departamento, Tipo, Principal, Observações
  - Marcação de contato principal (desmarca outros automaticamente)
  - Tipos de contato: Geral, Comercial, Financeiro, Suporte, Técnico
  - Edição e exclusão de contatos
- ✅ Integração no modal de detalhes (nova aba "Contatos")
- ✅ Rotas Next.js criadas para integração

### Implementações Recentes - Sistema de Tags e Edição Inline (Sessão Anterior)

#### Modo de Edição em Linha
- ✅ Componente `InlineEditField` criado com validação em tempo real
- ✅ Edição inline na tabela de clientes
- ✅ Campos editáveis: Nome, Email, Telefone, Cidade, Estado
- ✅ Atalhos de teclado: Enter para salvar, Esc para cancelar
- ✅ Feedback visual durante salvamento (spinner, check, erro)
- ✅ Notificações de sucesso/erro

#### Sistema de Tags Completo
- ✅ Schema Prisma atualizado com `ClienteTag` e `ClienteTagRelation`
- ✅ APIs backend completas:
  - `GET /clientes/tags` - Listar tags disponíveis
  - `POST /clientes/tags` - Criar nova tag
  - `PUT /clientes/:id/tags` - Atualizar tags do cliente
- ✅ Componente `TagsInput` com:
  - Sugestões de tags disponíveis
  - Criação on-the-fly de novas tags
  - 8 cores padrão para tags
  - Validação e feedback visual
- ✅ Hook `useClienteTags` para gerenciar tags
- ✅ Integração no formulário wizard (etapa dedicada)
- ✅ Preview mostra tags selecionadas
- ✅ Visualização de tags nos cards (com ícone e cores)
- ✅ Visualização de tags na tabela (até 3 tags + contador)
- ✅ Tags incluídas na resposta da API de listagem
- ✅ Salvamento automático de tags ao criar/editar cliente

---

## Implementações Recentes - Campos Adicionais (2025-01-12)

**Campos Implementados:**
- ✅ **Nome Social / Apelido** - Campo para nome preferencial do cliente
- ✅ **Data de Nascimento (PF) / Data de Fundação (PJ)** - Campo de data com validação
- ✅ **RG e Órgão Emissor** - Campos para identificação adicional (apenas PF)

**Alterações Realizadas:**
1. **Schema Prisma** - Adicionados campos: `nomeSocial`, `rg`, `orgaoEmissor`, `dataNascimento`
2. **Schemas de Validação** - Atualizados para incluir novos campos com transformação de data
3. **Entidade de Domínio** - Atualizada com novos campos e métodos de atualização
4. **Repositório** - Atualizado para mapear e persistir novos campos
5. **Use Cases** - Atualizado para incluir novos campos nas respostas
6. **Frontend - Formulário Wizard** - Adicionados campos na etapa de Dados Básicos com validação condicional
7. **Frontend - Cliente Client** - Atualizado tipo, state e funções de submit/edição
8. **Database** - Schema atualizado com `prisma db push`

**Próximos Passos:**
- [x] Adicionar validação de RG por estado ✅
- [x] Adicionar campos: Sexo/Gênero, Estado Civil, Nacionalidade ✅
- [x] Adicionar campos: Naturalidade, Título de Eleitor ✅
- [x] Adicionar campos: Certidões, Nome dos Pais ✅

---

## Implementações Recentes - Campos Adicionais Completos (2025-01-12)

**Todos os campos adicionais implementados:**
- ✅ **Sexo/Gênero** - Opções: Masculino, Feminino, Outro, Prefiro não informar
- ✅ **Estado Civil** - Opções: Solteiro, Casado, Divorciado, Viúvo, União Estável
- ✅ **Nacionalidade** - Campo de texto livre
- ✅ **Naturalidade** - Cidade e Estado (UF)
- ✅ **Título de Eleitor** - Campo numérico com validação
- ✅ **Certidão de Nascimento** - Campo de texto
- ✅ **Certidão de Casamento** - Campo de texto
- ✅ **Nome da Mãe** - Campo obrigatório para validações
- ✅ **Nome do Pai** - Campo opcional
- ✅ **Validação de RG por Estado** - Sistema completo de validação com regras específicas por UF

**Alterações Realizadas:**
1. **Schema Prisma** - Adicionados 10 novos campos para dados pessoais
2. **Validador de RG** (`apps/web/src/lib/validators/rg.ts`):
   - Validação específica por estado brasileiro
   - Regras de formato para todos os 27 estados
   - Função de formatação baseada no estado
   - Descrições de formato por estado
3. **Schemas de Validação** - Atualizados com enums para sexo e estado civil
4. **Entidade de Domínio** - Atualizada com todos os novos campos
5. **Repositório** - Atualizado para mapear e persistir todos os campos
6. **Use Cases** - Atualizado para incluir novos campos nas respostas
7. **Frontend - Formulário Wizard**:
   - Nova etapa "Dados Pessoais" (apenas para PF)
   - Validação de RG em tempo real baseada no estado
   - Campos organizados em grid responsivo
   - Validação condicional (apenas PF)
8. **Frontend - Cliente Client** - Atualizado tipo, state e funções de submit/edição

**Nota sobre Prisma:**
- Schema atualizado com todos os campos
- Prisma Client precisa ser regenerado após ajustes de configuração

---

## Implementações Recentes - Contatos Adicionais e Alertas (2025-01-12)

**Contatos Adicionais Implementados:**
- ✅ **Email Secundário** - Campo para email alternativo
- ✅ **Email Corporativo** - Campo para email corporativo
- ✅ **Telefone Comercial** - Campo para telefone comercial
- ✅ **WhatsApp Business** - Campo para número do WhatsApp Business
- ✅ **Telegram** - Campo para username ou número do Telegram

**Sistema de Alertas:**
- ✅ **Alertas de Documentos Vencidos** - Hook `useDocumentExpiryAlerts`:
  - Identifica documentos expirados
  - Identifica documentos expirando em breve (30 dias)
  - Cards de estatísticas na interface
  - Ordenação automática por prioridade

**Alterações Realizadas:**
1. **Schema Prisma** - Adicionados campos: `emailSecundario`, `emailCorporativo`, `telefoneComercial`, `whatsapp`, `telegram`
2. **Schemas de Validação** - Atualizados com novos campos de contato
3. **Entidade de Domínio** - Atualizada com novos campos
4. **Repositório** - Atualizado para mapear e persistir novos campos
5. **Use Cases** - Atualizado para incluir novos campos nas respostas
6. **Frontend - Formulário Wizard**:
   - Etapa "Contato" expandida com novos campos
   - Validação de emails secundário e corporativo
   - Formatação automática de telefones
   - Placeholders e descrições informativas
7. **Frontend - Cliente Client**:
   - Tipo `Cliente` expandido
   - State `formData` atualizado
   - Funções de submit/edição atualizadas
   - Hook de alertas integrado
   - Cards de estatísticas para documentos expirados/expirando
8. **Hook de Alertas** (`apps/web/src/hooks/use-document-expiry-alerts.ts`):
   - Cálculo automático de dias restantes
   - Classificação por status (válido, expirando, expirado)
   - Ordenação por prioridade
   - Contadores de alertas

---

## Implementações Recentes - Redes Sociais e Campos de Endereço (2025-01-12)

**Redes Sociais Implementadas:**
- ✅ **LinkedIn** - Campo URL para perfil LinkedIn
- ✅ **Facebook** - Campo URL para página/perfil Facebook
- ✅ **Instagram** - Campo URL para perfil Instagram
- ✅ **Twitter/X** - Campo URL para perfil Twitter/X
- ✅ **YouTube** - Campo URL para canal YouTube
- ✅ **Blog** - Campo URL para blog do cliente

**Campos de Endereço Adicionais:**
- ✅ **Ponto de Referência** - Campo de texto livre
- ✅ **Coordenadas GPS** - Campos Latitude e Longitude
- ✅ **Código IBGE** - Campo para código IBGE da cidade
- ✅ **Código do Município** - Campo para código do município
- ✅ **Região** - Select com opções: Norte, Nordeste, Centro-Oeste, Sudeste, Sul
- ✅ **Zona** - Select com opções: Urbana, Rural

**Preferências de Contato:**
- ✅ **Horário Preferencial de Contato** - Campo de texto livre (ex: "08:00-18:00")
- ✅ **Idioma Preferido** - Select com opções: pt-BR, en-US, es-ES, fr-FR
- ✅ **Forma Preferida de Comunicação** - Select com opções: email, telefone, whatsapp, telegram, presencial

**Alterações Realizadas:**
1. **Schema Prisma** - Adicionados 15 novos campos
2. **Schemas de Validação** - Atualizados com validação de URLs para redes sociais
3. **Entidade de Domínio** - Atualizada com todos os novos campos
4. **Repositório** - Atualizado para mapear e persistir novos campos
5. **Use Cases** - Atualizado para incluir novos campos nas respostas
6. **Frontend - Formulário Wizard**:
   - Etapa "Contato" expandida com campos de redes sociais e preferências
   - Etapa "Endereço" expandida com campos adicionais de localização
   - Validação de URLs para redes sociais
   - Selects para Região, Zona, Idioma e Forma de Comunicação
7. **Frontend - Cliente Client** - Atualizado tipo, state e funções de submit/edição
