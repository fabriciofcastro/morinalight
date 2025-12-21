# Erros Elegantes com Tooltips

## 📋 Visão Geral

O sistema de erros do Morina Light agora inclui componentes elegantes com tooltips que exibem erros de forma discreta, profissional e amigável ao usuário.

## 🎨 Componentes Disponíveis

### 1. **ErrorTooltip** - Tooltip de Erro Genérico

Tooltip elegante que aparece ao passar o mouse sobre um elemento com erro.

```typescript
import { ErrorTooltip } from "@/components/errors";

<ErrorTooltip error={error} side="top">
  <button>Clique aqui</button>
</ErrorTooltip>
```

**Características:**
- ✅ Aparece ao passar o mouse
- ✅ Ícone automático baseado na severidade
- ✅ Cores adaptadas ao tipo de erro
- ✅ Mostra campos de validação se houver
- ✅ Animação suave

### 2. **FieldErrorTooltip** - Tooltip para Campos de Formulário

Tooltip específico para campos de formulário com erro.

```typescript
import { FieldErrorTooltip } from "@/components/errors";

<FieldErrorTooltip error={error} fieldName="Email">
  <input type="email" />
</FieldErrorTooltip>
```

**Características:**
- ✅ Posicionado ao lado do campo (direita por padrão)
- ✅ Ícone de erro visível
- ✅ Mensagem clara e específica
- ✅ Delay reduzido para resposta rápida

### 3. **InputWithError** - Input com Erro Integrado

Input completo com tratamento de erro elegante.

```typescript
import { InputWithError } from "@/components/errors";

<InputWithError
  label="Email"
  error={errors.email}
  fieldName="email"
  required
  type="email"
  placeholder="seu@email.com"
/>
```

**Características:**
- ✅ Label integrado
- ✅ Tooltip de erro automático
- ✅ Borda vermelha quando há erro
- ✅ Indicador de campo obrigatório
- ✅ Mensagem de erro abaixo (opcional)

### 4. **TextareaWithError** - Textarea com Erro Integrado

Textarea com tratamento de erro elegante.

```typescript
import { TextareaWithError } from "@/components/errors";

<TextareaWithError
  label="Descrição"
  error={errors.description}
  fieldName="descrição"
  rows={4}
/>
```

### 5. **ErrorBadge** - Badge de Erro com Tooltip

Badge compacto que mostra erro com tooltip ao passar o mouse.

```typescript
import { ErrorBadge } from "@/components/errors";

<ErrorBadge error={error} variant="subtle" showTooltip />
```

**Variantes:**
- `subtle` - Mais discreto
- `prominent` - Mais destacado

### 6. **InlineErrorIndicator** - Indicador Inline

Indicador de erro posicionado em um canto do elemento.

```typescript
import { InlineErrorIndicator } from "@/components/errors";

<div className="relative">
  <img src="..." alt="..." />
  <InlineErrorIndicator error={error} position="top-right" size="md" />
</div>
```

**Posições:**
- `top-right` (padrão)
- `top-left`
- `bottom-right`
- `bottom-left`

**Tamanhos:**
- `sm` - Pequeno
- `md` - Médio (padrão)
- `lg` - Grande

### 7. **ElegantErrorNotification** - Notificação Elegante

Notificações elegantes que podem ser expandidas.

```typescript
import { ElegantErrorNotification } from "@/components/errors";

<ElegantErrorNotification
  error={error}
  variant="compact" // ou "expanded" ou "minimal"
  position="top-right"
  onDismiss={() => setError(null)}
/>
```

**Variantes:**
- `minimal` - Apenas ícone com tooltip
- `compact` - Linha compacta com tooltip
- `expanded` - Card expansível

### 8. **ElegantErrorToast** - Toast Temporário

Toast de erro que desaparece automaticamente.

```typescript
import { ElegantErrorToast } from "@/components/errors";

<ElegantErrorToast
  error={error}
  duration={5000} // 5 segundos
  onDismiss={() => setError(null)}
/>
```

## 🎯 Exemplos de Uso

### Formulário Completo com Erros Elegantes

```typescript
import { InputWithError, TextareaWithError } from "@/components/errors";

function MyForm() {
  const [errors, setErrors] = useState({});

  return (
    <form>
      <InputWithError
        label="Nome"
        error={errors.name}
        fieldName="nome"
        required
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />

      <InputWithError
        label="Email"
        error={errors.email}
        fieldName="email"
        type="email"
        required
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />

      <TextareaWithError
        label="Mensagem"
        error={errors.message}
        fieldName="mensagem"
        rows={4}
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
      />
    </form>
  );
}
```

### Botão com Tooltip de Erro

```typescript
import { ErrorTooltip } from "@/components/errors";

function SubmitButton({ error, onClick }) {
  return (
    <ErrorTooltip error={error} side="top">
      <button
        onClick={onClick}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Enviar
      </button>
    </ErrorTooltip>
  );
}
```

### Card com Indicador de Erro

```typescript
import { InlineErrorIndicator } from "@/components/errors";

function ProductCard({ product, error }) {
  return (
    <div className="relative">
      <div className="card">
        <h3>{product.name}</h3>
        <p>{product.description}</p>
      </div>
      {error && (
        <InlineErrorIndicator
          error={error}
          position="top-right"
          size="sm"
        />
      )}
    </div>
  );
}
```

### Notificação de Erro Global

```typescript
import { ElegantErrorNotification } from "@/components/errors";

function App() {
  const [globalError, setGlobalError] = useState(null);

  return (
    <>
      {/* Seu app */}
      
      {globalError && (
        <ElegantErrorNotification
          error={globalError}
          variant="compact"
          position="top-right"
          onDismiss={() => setGlobalError(null)}
        />
      )}
    </>
  );
}
```

## 🎨 Personalização

### Cores por Severidade

Os tooltips automaticamente ajustam cores:

- **Critical/Error** - Vermelho (`border-red-500/30 bg-red-500/10`)
- **Warning** - Amarelo (`border-yellow-500/30 bg-yellow-500/10`)
- **Info** - Azul (`border-blue-500/30 bg-blue-500/10`)

### Posicionamento

Tooltips podem ser posicionados em:
- `top` (padrão)
- `right`
- `bottom`
- `left`

### Delay

Controlar delay antes do tooltip aparecer:

```typescript
<ErrorTooltip error={error} delayDuration={500}>
  {/* conteúdo */}
</ErrorTooltip>
```

## ✨ Características

✅ **Discreto** - Não interfere na interface  
✅ **Elegante** - Design moderno com glassmorphism  
✅ **Informativo** - Mostra detalhes quando necessário  
✅ **Responsivo** - Adapta-se ao espaço disponível  
✅ **Acessível** - Suporta navegação por teclado  
✅ **Animado** - Transições suaves  
✅ **Customizável** - Múltiplas variantes e opções  

## 🚀 Boas Práticas

1. **Use tooltips para erros não críticos** - Para não interromper o fluxo
2. **Use notificações para erros importantes** - Que precisam atenção imediata
3. **Combine com validação em tempo real** - Para feedback instantâneo
4. **Mantenha mensagens curtas** - Tooltips devem ser concisos
5. **Use variantes apropriadas** - Minimal para erros menores, expanded para detalhes

## 📱 Resultado Visual

Os erros agora aparecem de forma:

- 🎯 **Elegante** - Design moderno e profissional
- 🔔 **Discreta** - Não interrompe o fluxo do usuário
- 📍 **Contextual** - Aparece próximo ao elemento com erro
- 💡 **Informativa** - Mostra detalhes quando necessário
- ✨ **Animada** - Transições suaves e agradáveis

Os usuários têm uma experiência muito mais polida e profissional! 🎉





