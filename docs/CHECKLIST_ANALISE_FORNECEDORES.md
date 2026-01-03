# 📋 CHECKLIST - IMPLEMENTAÇÃO COMPLETA FORNECEDORES

**Baseado em:** `ANALISE_COMPLETA_FORNECEDORES.md`  
**Data de Criação:** 2025-01-XX  
**Status Geral:** 🟡 Funcional para uso básico, estrutura avançada criada mas não integrada

---

## 🔴 FASE 1: PRIORIDADE ALTA - Funcionalidades Críticas

### 1.1 Completar Tabs na Visualização Detalhada

#### Tab "Fichas de Custo"

- [ ] **Backend:**
  - [ ] Criar endpoint `GET /suppliers/:id/fichas-custo`
  - [ ] Criar use case `BuscarFichasCustoPorFornecedorUseCase`
  - [ ] Integrar com `FichaCustoRepository` ou criar query direta
  - [ ] Buscar fichas via `InsumoFichaCusto.fornecedorId`
  - [ ] Agrupar por `fichaCustoId` (evitar duplicatas)
  - [ ] Retornar fichas completas com dados de insumos
  - [ ] Implementar paginação (opcional)
  - [ ] Adicionar filtros (data, status, valor)
- [ ] **Frontend:**
  - [ ] Criar componente `FichasTab` funcional
  - [ ] Hook `useSupplierFichasCusto(supplierId)`
  - [ ] Lista de fichas com cards/table
  - [ ] Exibir: número sequencial, referência, nome da peça, status
  - [ ] Exibir: data criação, valor total
  - [ ] Link direto para cada ficha (`/fichas-custo/[id]`)
  - [ ] Filtros: data início/fim, status, valor mínimo/máximo
  - [ ] Estatísticas agregadas (total fichas, valor total)
  - [ ] Loading state e empty state
  - [ ] Error handling

#### Tab "Insumos Fornecidos"

- [ ] **Backend:**
  - [ ] Criar endpoint `GET /suppliers/:id/insumos`
  - [ ] Criar use case `ListarInsumosPorFornecedorUseCase`
  - [ ] Buscar todos `InsumoFichaCusto` onde `fornecedorId = supplierId`
  - [ ] Agrupar por descrição do insumo
  - [ ] Calcular: preço médio, mínimo, máximo
  - [ ] Timeline de preços (histórico)
  - [ ] Última atualização de preço
  - [ ] Quantidade total fornecida
- [ ] **Frontend:**
  - [ ] Criar componente `InsumosTab` funcional
  - [ ] Hook `useSupplierInsumos(supplierId)`
  - [ ] Lista de insumos agrupados
  - [ ] Exibir: descrição, tipo, unidade de medida
  - [ ] Exibir: preço atual, médio, mínimo, máximo
  - [ ] Gráfico de evolução de preços (linha do tempo)
  - [ ] Comparação com outros fornecedores (mesmo insumo)
  - [ ] Última compra (data e ficha de custo)
  - [ ] Loading state e empty state
  - [ ] Error handling

#### Tab "Boletos"

- [ ] **Backend:**
  - [ ] Criar endpoint `GET /suppliers/:id/boletos`
  - [ ] Criar use case `ListarBoletosPorFornecedorUseCase`
  - [ ] Buscar em `BoletoFichaCusto` onde `fornecedorId = supplierId`
  - [ ] Retornar com dados da ficha de custo relacionada
  - [ ] Filtros: status, data vencimento, valor
  - [ ] Ordenação: por data de vencimento
- [ ] **Frontend:**
  - [ ] Criar componente `BoletosTab` funcional
  - [ ] Hook `useSupplierBoletos(supplierId)`
  - [ ] Lista de boletos
  - [ ] Exibir: número, valor, data vencimento, status
  - [ ] Exibir: ficha de custo relacionada (link)
  - [ ] Badges de status coloridos
  - [ ] Filtros: status (pendente, pago, vencido, cancelado)
  - [ ] Filtro: data vencimento (range)
  - [ ] Exportação para Excel/PDF
  - [ ] Loading state e empty state
  - [ ] Error handling

#### Tab "Histórico/Timeline"

- [ ] **Backend:**
  - [ ] Criar endpoint `GET /suppliers/:id/auditoria`
  - [ ] Usar `AuditoriaSupplierRepository.listar()`
  - [ ] Filtrar por `supplierId`
  - [ ] Ordenar por `createdAt DESC`
  - [ ] Paginação com cursor
  - [ ] Filtros: tipo de ação, data, usuário
- [ ] **Frontend:**
  - [ ] Criar componente `HistoricoTab` funcional
  - [ ] Hook `useSupplierAuditoria(supplierId)`
  - [ ] Timeline cronológica (vertical)
  - [ ] Exibir: data/hora, usuário, ação
  - [ ] Exibir: campo alterado (se aplicável)
  - [ ] Comparação antes/depois (expandível)
  - [ ] Filtros: tipo de ação (criar, atualizar, deletar, restaurar)
  - [ ] Filtro: data (range)
  - [ ] Filtro: usuário
  - [ ] Busca no histórico
  - [ ] Loading state e empty state
  - [ ] Error handling

#### Tab "Versões"

- [ ] **Backend:**
  - [ ] Criar endpoint `GET /suppliers/:id/versoes`
  - [ ] Criar endpoint `GET /suppliers/:id/versoes/:versaoId`
  - [ ] Usar `VersaoSupplierRepository.buscarVersoes()`
  - [ ] Retornar lista de versões ordenadas
  - [ ] Retornar snapshot completo de uma versão específica
- [ ] **Frontend:**
  - [ ] Criar componente `VersoesTab` funcional
  - [ ] Hook `useSupplierVersoes(supplierId)`
  - [ ] Lista de versões
  - [ ] Exibir: número da versão, data, usuário, motivo
  - [ ] Botão "Comparar versões" (selecionar 2)
  - [ ] Modal de comparação (antes/depois)
  - [ ] Botão "Restaurar versão" (com confirmação)
  - [ ] Visualizar snapshot completo
  - [ ] Loading state e empty state
  - [ ] Error handling

#### Tab "Documentos"

- [ ] **Backend:**
  - [ ] Criar endpoint `GET /suppliers/:id/documentos`
  - [ ] Criar endpoint `POST /suppliers/:id/documentos` (upload)
  - [ ] Criar endpoint `DELETE /suppliers/:id/documentos/:docId`
  - [ ] Criar endpoint `GET /suppliers/:id/documentos/:docId/download`
  - [ ] Usar `DocumentoSupplierRepository`
  - [ ] Integrar com storage service (upload/download)
  - [ ] Validar tipos de arquivo
  - [ ] Validar tamanho máximo
- [ ] **Frontend:**
  - [ ] Criar componente `DocumentosTab` funcional
  - [ ] Hook `useSupplierDocumentos(supplierId)`
  - [ ] Lista de documentos
  - [ ] Exibir: nome, tipo, tamanho, data upload, usuário
  - [ ] Upload de documentos (drag & drop)
  - [ ] Preview de documentos (PDF, imagens)
  - [ ] Download de documentos
  - [ ] Deletar documentos (com confirmação)
  - [ ] Categorização por tipo
  - [ ] Filtros: tipo, data
  - [ ] Loading state e empty state
  - [ ] Error handling

#### Tab "Notas"

- [ ] **Backend:**
  - [ ] Criar model Prisma `NotaSupplier`
  - [ ] Campos: id, supplierId, titulo, conteudo, tipo (nota/avaliacao)
  - [ ] Campos: avaliacao (1-5 estrelas), criadoPor, createdAt
  - [ ] Criar `NotaSupplierRepository` (interface + Prisma)
  - [ ] Criar endpoints CRUD completos
  - [ ] Validações e permissões
- [ ] **Frontend:**
  - [ ] Criar componente `NotasTab` funcional
  - [ ] Hook `useSupplierNotas(supplierId)`
  - [ ] Lista de notas/avaliações
  - [ ] Formulário para adicionar nota
  - [ ] Sistema de estrelas (1-5) para avaliações
  - [ ] Editar/deletar notas
  - [ ] Filtros: tipo, data, usuário
  - [ ] Busca
  - [ ] Loading state e empty state
  - [ ] Error handling

### 1.2 Estatísticas Reais

- [ ] **Backend:**
  - [ ] Criar endpoint `GET /suppliers/:id/estatisticas`
  - [ ] Criar use case `CalcularEstatisticasFornecedorUseCase`
  - [ ] Calcular: total de fichas de custo (count)
  - [ ] Calcular: total de insumos fornecidos (count)
  - [ ] Calcular: valor total em compras (sum)
  - [ ] Calcular: última compra (max data)
  - [ ] Calcular: média de avaliação (quando implementar)
  - [ ] Cache de estatísticas (opcional, 5 minutos)
- [ ] **Frontend:**
  - [ ] Criar hook `useSupplierEstatisticas(supplierId)`
  - [ ] Atualizar cards de estatísticas com dados reais
  - [ ] Substituir hardcoded "0" por valores reais
  - [ ] Formatação de valores (moeda, números)
  - [ ] Loading state durante cálculo
  - [ ] Error handling
  - [ ] Atualizar estatísticas quando necessário (on tab change)

### 1.3 Soft Delete Funcional

- [ ] **Backend:**
  - [ ] Modificar `SupplierRepository.delete()` para soft delete
  - [ ] Atualizar `deletedAt` ao invés de deletar
  - [ ] Atualizar `deletedBy` com userId
  - [ ] Criar endpoint `POST /suppliers/:id/restore`
  - [ ] Criar endpoint `DELETE /suppliers/:id/hard` (deletar permanentemente)
  - [ ] Modificar `findByOrgId()` para excluir deletados (default)
  - [ ] Adicionar parâmetro `includeDeleted` para incluir deletados
  - [ ] Adicionar parâmetro `onlyDeleted` para listar apenas deletados
- [ ] **Frontend:**
  - [ ] Atualizar `suppliersApi.delete()` (chamar endpoint)
  - [ ] Adicionar botão "Restaurar" na listagem (quando mostrar deletados)
  - [ ] Adicionar filtro "Incluir deletados" na listagem
  - [ ] Modal de confirmação diferenciado (soft delete vs hard delete)
  - [ ] Indicador visual para fornecedores deletados
  - [ ] Notificação de sucesso ao restaurar

### 1.4 Auditoria Automática

- [ ] **Backend:**
  - [ ] Integrar auditoria no `SupplierRepository.create()`
  - [ ] Capturar: estado inicial (null), estado novo (dados criados)
  - [ ] Integrar auditoria no `SupplierRepository.update()`
  - [ ] Comparar estados antes/depois
  - [ ] Capturar apenas campos alterados
  - [ ] Integrar auditoria no `SupplierRepository.delete()`
  - [ ] Capturar IP address do request
  - [ ] Capturar User Agent do request
  - [ ] Usar `AuditoriaSupplierRepository.registrar()`
  - [ ] Não bloquear operação se auditoria falhar (log error)
- [ ] **Testes:**
  - [ ] Verificar se auditoria é registrada ao criar
  - [ ] Verificar se auditoria é registrada ao atualizar
  - [ ] Verificar se auditoria é registrada ao deletar
  - [ ] Verificar se campos alterados são capturados corretamente

### 1.5 Versionamento Automático

- [ ] **Backend:**
  - [ ] Integrar versionamento no `SupplierRepository.update()`
  - [ ] Criar snapshot completo antes de atualizar
  - [ ] Salvar snapshot usando `VersaoSupplierRepository.criarVersao()`
  - [ ] Incrementar número da versão automaticamente
  - [ ] Capturar `motivoAlteracao` (opcional, pode ser vazio)
  - [ ] Não bloquear operação se versionamento falhar (log error)
- [ ] **Testes:**
  - [ ] Verificar se versão é criada ao atualizar
  - [ ] Verificar se snapshot está correto
  - [ ] Verificar se número da versão incrementa corretamente

### 1.6 Migrations do Prisma

- [ ] **Banco de Dados:**
  - [ ] Verificar se models avançados estão no schema
  - [ ] Criar migration: `npx prisma migrate dev --name add_supplier_advanced_models`
  - [ ] Verificar se migration foi aplicada corretamente
  - [ ] Testar queries nos novos models
  - [ ] Verificar índices criados

---

## 🟡 FASE 2: PRIORIDADE MÉDIA - Melhorias Essenciais

### 2.1 Integração CNPJ Lookup

- [ ] **Backend:**
  - [ ] Criar API route `/api/integrations/cnpj?cnpj=xxx`
  - [ ] Integrar com ReceitaWS ou BrasilAPI
  - [ ] Cache de resultados (24 horas)
  - [ ] Tratamento de erros (CNPJ inválido, API offline)
  - [ ] Validação de formato CNPJ
- [ ] **Frontend:**
  - [ ] Criar hook `useCnpjLookup()`
  - [ ] Adicionar botão "Buscar CNPJ" no formulário
  - [ ] Preenchimento automático ao sair do campo CNPJ (onBlur)
  - [ ] Preencher: nome, endereço, cidade, estado, CEP
  - [ ] Indicador de loading durante busca
  - [ ] Mensagem de erro se CNPJ não encontrado
  - [ ] Notificação de sucesso

### 2.2 Duplicação de Fornecedor

- [ ] **Backend:**
  - [ ] Criar endpoint `POST /suppliers/:id/duplicate`
  - [ ] Buscar fornecedor original
  - [ ] Criar cópia com dados modificados (se enviados)
  - [ ] Gerar novo ID
  - [ ] Copiar todos os campos (exceto ID, timestamps)
  - [ ] Não copiar documentos/versões/auditoria
- [ ] **Frontend:**
  - [ ] Adicionar botão "Duplicar" na página de detalhes
  - [ ] Modal para editar dados antes de duplicar
  - [ ] Preencher formulário com dados do original
  - [ ] Permitir alterações antes de salvar
  - [ ] Notificação de sucesso
  - [ ] Redirecionar para novo fornecedor

### 2.3 Exportação

- [ ] **Exportar para Excel:**
  - [ ] Backend: Criar endpoint `GET /suppliers/export/excel`
  - [ ] Usar biblioteca (exceljs, xlsx)
  - [ ] Incluir filtros aplicados
  - [ ] Formatação de colunas
  - [ ] Frontend: Botão "Exportar para Excel" na listagem
  - [ ] Loading state durante geração
  - [ ] Download automático
- [ ] **Exportar para PDF (Detalhes):**
  - [ ] Backend: Criar endpoint `GET /suppliers/:id/export/pdf`
  - [ ] Usar biblioteca (puppeteer, pdfkit)
  - [ ] Template de PDF profissional
  - [ ] Incluir todas as informações do fornecedor
  - [ ] Frontend: Botão "Exportar PDF" na página de detalhes
  - [ ] Loading state
  - [ ] Download automático
- [ ] **Exportar Selecionados:**
  - [ ] Frontend: Botão "Exportar selecionados"
  - [ ] Enviar array de IDs para backend
  - [ ] Backend: Gerar arquivo com fornecedores selecionados

### 2.4 Busca Avançada

- [ ] **Backend:**
  - [ ] Adicionar busca por documento (CPF/CNPJ)
  - [ ] Adicionar busca por cidade/estado
  - [ ] Adicionar busca por email
  - [ ] Adicionar busca por telefone
  - [ ] Suporte a operadores (AND, OR)
  - [ ] Busca full-text (opcional, requer índice)
- [ ] **Frontend:**
  - [ ] Criar componente de busca avançada
  - [ ] Múltiplos campos de busca
  - [ ] Operadores lógicos (AND/OR)
  - [ ] Botão "Buscar" e "Limpar"
  - [ ] Salvar buscas recentes (opcional)

### 2.5 Filtros Avançados

- [ ] **Backend:**
  - [ ] Adicionar filtro por tipo de fornecedor (quando implementar campo)
  - [ ] Adicionar filtro por ramo de atividade (quando implementar campo)
  - [ ] Adicionar filtro por estado/cidade
  - [ ] Adicionar filtro por data de criação (range)
  - [ ] Adicionar filtro por data de última compra (range)
  - [ ] Adicionar filtro por valor total de compras (range)
  - [ ] Suporte a múltiplos filtros combinados
- [ ] **Frontend:**
  - [ ] Criar painel de filtros avançados
  - [ ] Campos de filtro organizados por categoria
  - [ ] Date pickers para ranges de data
  - [ ] Inputs numéricos para ranges de valor
  - [ ] Botão "Aplicar Filtros" e "Limpar Filtros"
  - [ ] Salvar filtros como presets
  - [ ] Indicador de filtros ativos

### 2.6 Ordenação Avançada

- [ ] **Backend:**
  - [ ] Suporte a ordenação múltipla (várias colunas)
  - [ ] Ordenação por: nome, data criação, data atualização, status, avaliação
- [ ] **Frontend:**
  - [ ] Indicadores visuais de ordenação (setas ↑↓)
  - [ ] Clique no header para ordenar
  - [ ] Salvar preferências de ordenação (localStorage)
  - [ ] Restaurar preferências ao carregar página

### 2.7 Ações em Lote

- [ ] **Frontend:**
  - [ ] Adicionar checkbox em cada item da listagem
  - [ ] Checkbox "Selecionar todos"
  - [ ] Barra de ações quando itens selecionados
  - [ ] Botão "Ativar selecionados"
  - [ ] Botão "Desativar selecionados"
  - [ ] Botão "Exportar selecionados"
  - [ ] Botão "Deletar selecionados" (com confirmação)
  - [ ] Contador de itens selecionados
- [ ] **Backend:**
  - [ ] Criar endpoint `POST /suppliers/batch/activate`
  - [ ] Criar endpoint `POST /suppliers/batch/deactivate`
  - [ ] Criar endpoint `POST /suppliers/batch/delete`
  - [ ] Validar permissões para cada operação
  - [ ] Retornar resultado de cada operação

### 2.8 Validações Melhoradas

- [ ] **Backend:**
  - [ ] Validar duplicatas em tempo real (nome ou documento)
  - [ ] Validar email duplicado
  - [ ] Validar CNPJ na ReceitaWS (opcional, quando buscar)
  - [ ] Validação de telefone (formato brasileiro)
- [ ] **Frontend:**
  - [ ] Validação de duplicatas em tempo real
  - [ ] Indicador visual de duplicata encontrada
  - [ ] Sugestão de fornecedor similar (se existir)
  - [ ] Validação de email duplicado
  - [ ] Validação de telefone melhorada

### 2.9 Loading States Melhorados

- [ ] **Frontend:**
  - [ ] Skeleton loaders para listagem
  - [ ] Skeleton loaders para cards de estatísticas
  - [ ] Loading states específicos por seção
  - [ ] Progress indicators para uploads de documentos
  - [ ] Loading overlay durante operações críticas

### 2.10 Error Handling Melhorado

- [ ] **Frontend:**
  - [ ] Error boundaries nas páginas
  - [ ] Mensagens de erro mais descritivas
  - [ ] Retry automático para falhas de rede
  - [ ] Toast de erro com detalhes (opcional)
  - [ ] Log de erros para debugging
- [ ] **Backend:**
  - [ ] Mensagens de erro mais específicas
  - [ ] Códigos de erro padronizados
  - [ ] Log de erros estruturado

---

## 🟢 FASE 3: PRIORIDADE BAIXA - Expansões Futuras

### 3.1 Sistema de Avaliações/Notas

- [ ] Criar model `AvaliacaoSupplier`
- [ ] Sistema de estrelas (1-5)
- [ ] Comentários de avaliação
- [ ] Histórico de avaliações
- [ ] Média de avaliações

### 3.2 Sistema de Tags

- [ ] Criar model `TagSupplier` (many-to-many)
- [ ] Tags customizadas
- [ ] Filtro por tags
- [ ] Tags coloridas

### 3.3 Sistema de Contatos Múltiplos

- [ ] Criar model `ContatoSupplier`
- [ ] Múltiplos contatos por fornecedor
- [ ] Contato principal
- [ ] Tipos de contato (vendas, financeiro, técnico)

### 3.4 Informações Comerciais Adicionais

- [ ] Adicionar campos ao schema: tipo, ramo, website, prazo pagamento, etc.
- [ ] Atualizar formulários
- [ ] Validações

### 3.5 Sistema de Lembretes

- [ ] Criar model `LembreteSupplier`
- [ ] Criar lembretes
- [ ] Notificações
- [ ] Calendário integrado

### 3.6 Compartilhamento

- [ ] Gerar link compartilhável
- [ ] Permissões de visualização
- [ ] Link temporário com expiração

### 3.7 Dashboard de Fornecedores

- [ ] Gráficos de performance
- [ ] Top fornecedores
- [ ] Fornecedores inativos há X dias
- [ ] Alertas e notificações

### 3.8 Map View

- [ ] Visualização em mapa
- [ ] Clustering de fornecedores
- [ ] Filtros geográficos
- [ ] Integração com Google Maps

### 3.9 Kanban View

- [ ] Visualização por status
- [ ] Arrastar e soltar
- [ ] Cards customizáveis

### 3.10 Integração com Notificações

- [ ] Notificar sobre novos fornecedores
- [ ] Notificar sobre alterações
- [ ] Notificar sobre boletos vencendo

### 3.11 Sistema de Favoritos

- [ ] Marcar como favorito
- [ ] Filtro "Apenas favoritos"
- [ ] Ordenar por favoritos primeiro

### 3.12 Modo de Comparação

- [ ] Comparar múltiplos fornecedores lado a lado
- [ ] Comparar versões do mesmo fornecedor
- [ ] Exportar comparação

### 3.13 Auto-save

- [ ] Salvar automaticamente durante edição
- [ ] Indicador de "Salvando..."
- [ ] Recuperar rascunho

### 3.14 Sugestões Inteligentes (IA)

- [ ] Sugerir dados baseado em CNPJ
- [ ] Sugerir fornecedores similares
- [ ] Detectar duplicatas potenciais

### 3.15 Relatórios

- [ ] Relatório de fornecedores por status
- [ ] Relatório de compras por fornecedor
- [ ] Relatório de performance
- [ ] Agendar relatórios

---

## 📊 RESUMO DE PROGRESSO

### Fase 1 (Prioridade Alta)

- **Total de itens:** ~80
- **Concluídos:** 0
- **Em progresso:** 0
- **Pendentes:** ~80

### Fase 2 (Prioridade Média)

- **Total de itens:** ~60
- **Concluídos:** 0
- **Em progresso:** 0
- **Pendentes:** ~60

### Fase 3 (Prioridade Baixa)

- **Total de itens:** ~50
- **Concluídos:** 0
- **Em progresso:** 0
- **Pendentes:** ~50

---

## 🎯 MÉTRICAS DE CONCLUSÃO

- [ ] **Fase 1 (ALTA):** 0% completo
- [ ] **Fase 2 (MÉDIA):** 0% completo
- [ ] **Fase 3 (BAIXA):** 0% completo
- [ ] **TOTAL GERAL:** 0% completo

---

## 📝 NOTAS IMPORTANTES

1. **Ordem de Implementação Recomendada:**
   - Começar pela Fase 1.1 (Tabs) - maior impacto visível
   - Depois Fase 1.2 (Estatísticas) - complementa as tabs
   - Em seguida Fase 1.3 (Soft Delete) - funcionalidade essencial
   - Por último Fase 1.4 e 1.5 (Auditoria e Versionamento) - infraestrutura

2. **Dependências:**
   - Fase 1.1 depende de integração com módulo `fichas-custo`
   - Fase 1.6 (Migrations) deve ser feito ANTES de qualquer integração de repositories

3. **Testes:**
   - Cada funcionalidade deve ter testes unitários
   - Testes de integração para endpoints
   - Testes E2E para fluxos completos

4. **Performance:**
   - Considerar cache para estatísticas
   - Paginação em todas as listagens
   - Lazy loading para tabs não ativas

---

**Última atualização:** 2025-01-XX  
**Próxima revisão:** Após conclusão da Fase 1
