# 🎯 Estratégias de Otimização de Tokens

## 📋 Arquivo de Estado
- `.checklist-state.json` - Rastreia progresso sem ler arquivos grandes

## 🔧 Estratégias Implementadas

### 1. Leitura Seletiva
- Ler apenas seções específicas (offset/limit)
- Usar grep para encontrar padrões antes de ler
- Evitar ler arquivos >500 linhas completos

### 2. Operações em Lote
- Fazer múltiplas buscas em paralelo
- Agrupar mudanças relacionadas
- Usar replace_all quando possível

### 3. Arquivos de Estado
- `.checklist-state.json` - Progresso
- Evitar re-ler documentação completa
- Atualizar apenas seções relevantes

### 4. Código Direto
- Criar componentes novos diretamente
- Evitar refatorações grandes
- Focar em funcionalidades isoladas

### 5. Busca Eficiente
- codebase_search para contexto
- grep para padrões exatos
- glob_file_search para localização

## 📊 Métricas
- Antes: ~50k tokens/sessão
- Meta: ~30k tokens/sessão (-40%)
- Estratégia: Focar em tarefas <500 linhas






