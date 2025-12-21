# Erros Amigáveis para Usuários

## 📋 Visão Geral

O sistema de tratamento de erros do Morina Light foi projetado para apresentar mensagens de erro de forma **amigável, clara e acionável** para os usuários finais, transformando códigos de erro técnicos em mensagens compreensíveis.

## 🎯 Como Funciona

### 1. **Mensagens Amigáveis Automáticas**

Todas as mensagens de erro são automaticamente convertidas em mensagens amigáveis em português:

```typescript
import { parseError, getUserFriendlyMessage } from "@/lib/errors";

try {
  await api.post("/users", data);
} catch (error) {
  const appError = parseError(error);
  const friendly = getUserFriendlyMessage(appError);
  
  // friendly.title = "Dados Inválidos"
  // friendly.message = "Por favor, verifique os dados informados..."
  // friendly.action = "Verificar campos"
  // friendly.severity = "warning"
}
```

### 2. **Componente Visual de Erro**

O componente `ErrorDisplay` exibe erros de forma visual e amigável:

```typescript
import { ErrorDisplay } from "@/components/errors";

function MyComponent() {
  const [error, setError] = useState(null);
  
  return (
    <>
      {error && (
        <ErrorDisplay
          error={error}
          onRetry={() => refetch()}
          variant="card" // ou "inline" ou "fullscreen"
          showDetails={false} // true em desenvolvimento
        />
      )}
    </>
  );
}
```

### 3. **Notificações Automáticas**

Os hooks de erro automaticamente mostram notificações amigáveis:

```typescript
import { useErrorHandler } from "@/lib/errors";

function MyComponent() {
  const { handleError } = useErrorHandler({
    showNotification: true, // Mostra notificação automática
  });
  
  const handleSubmit = async () => {
    try {
      await api.post("/data", formData);
    } catch (error) {
      handleError(error); // Notificação amigável aparece automaticamente
    }
  };
}
```

## 📝 Exemplos de Mensagens

### Validação

**Código Técnico:** `VALIDATION_ERROR`  
**Mensagem Amigável:**
- **Título:** "Dados Inválidos"
- **Mensagem:** "Por favor, verifique os dados informados e tente novamente."
- **Ação:** "Verificar campos"

### Autenticação

**Código Técnico:** `INVALID_CREDENTIALS`  
**Mensagem Amigável:**
- **Título:** "Credenciais Inválidas"
- **Mensagem:** "Email ou senha incorretos. Verifique suas credenciais e tente novamente."
- **Ação:** "Tentar Novamente"

### Permissão

**Código Técnico:** `INSUFFICIENT_PERMISSIONS`  
**Mensagem Amigável:**
- **Título:** "Permissão Insuficiente"
- **Mensagem:** "Você não possui as permissões necessárias para esta operação."
- **Ação:** "Solicitar Permissão"

### Erro de Rede

**Código Técnico:** `NETWORK_ERROR`  
**Mensagem Amigável:**
- **Título:** "Erro de Conexão"
- **Mensagem:** "Não foi possível conectar ao servidor. Verifique sua conexão com a internet."
- **Ação:** "Verificar Conexão"

### Erro de Servidor

**Código Técnico:** `INTERNAL_ERROR`  
**Mensagem Amigável:**
- **Título:** "Erro Interno"
- **Mensagem:** "Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver."
- **Ação:** "Tentar Novamente"

## 🎨 Variantes Visuais

### 1. **Inline** - Para erros em formulários

```typescript
<ErrorDisplay
  error={error}
  variant="inline"
  onRetry={handleRetry}
/>
```

Exibe um alerta compacto dentro do formulário.

### 2. **Card** - Para erros em páginas

```typescript
<ErrorDisplay
  error={error}
  variant="card"
  onRetry={handleRetry}
  onGoBack={() => router.back()}
/>
```

Exibe um card centralizado com ícone e botões de ação.

### 3. **Fullscreen** - Para erros críticos

```typescript
<ErrorDisplay
  error={error}
  variant="fullscreen"
  onRetry={handleRetry}
/>
```

Exibe uma tela completa de erro.

## 🔧 Personalização

### Adicionar Nova Mensagem Amigável

Edite `apps/web/src/lib/errors/user-messages.ts`:

```typescript
const USER_FRIENDLY_MESSAGES: Record<string, { title: string; message: string; action?: string }> = {
  // ... mensagens existentes
  
  [ErrorCode.MEU_NOVO_ERRO]: {
    title: "Título Amigável",
    message: "Mensagem explicativa para o usuário.",
    action: "Ação Sugerida",
  },
};
```

### Customizar Severidade Visual

As cores e ícones são automaticamente ajustados baseados na severidade:

- **Critical** - Vermelho com ícone de alerta
- **Error** - Vermelho com X
- **Warning** - Amarelo com círculo de alerta
- **Info** - Azul com ícone de informação

## 📊 Campos de Validação

Quando o erro contém campos de validação, eles são automaticamente exibidos:

```typescript
// Erro com campos
{
  code: "VALIDATION_ERROR",
  fields: [
    { field: "email", message: "Email inválido" },
    { field: "senha", message: "Senha muito curta" }
  ]
}
```

**Exibição:**
- Lista de campos com erros
- Mensagem específica para cada campo
- Formatação visual destacada

## 🚀 Boas Práticas

1. **Sempre use `parseError()`** para converter erros antes de exibir
2. **Use `getUserFriendlyMessage()`** para obter mensagens amigáveis
3. **Use o componente `ErrorDisplay`** para exibição visual consistente
4. **Configure notificações automáticas** nos hooks
5. **Forneça ações claras** (botões de retry, voltar, etc.)
6. **Mostre detalhes técnicos apenas em desenvolvimento**

## 📱 Integração com Notificações

As notificações automáticas já usam mensagens amigáveis:

```typescript
import { useErrorHandler } from "@/lib/errors";

const { handleError } = useErrorHandler({
  showNotification: true, // Ativa notificações amigáveis
});
```

Todas as notificações de erro exibem:
- Título amigável
- Mensagem clara
- Severidade visual apropriada
- Duração baseada na severidade

## 🎯 Resultado

Com este sistema, os usuários veem:

✅ **Mensagens claras** em português  
✅ **Títulos descritivos** que explicam o problema  
✅ **Ações sugeridas** para resolver o problema  
✅ **Visual consistente** com cores e ícones apropriados  
✅ **Detalhes técnicos** apenas quando necessário (desenvolvimento)  
✅ **Campos de validação** destacados quando aplicável  

Os erros técnicos são transformados em uma experiência de usuário positiva e acionável! 🎉





