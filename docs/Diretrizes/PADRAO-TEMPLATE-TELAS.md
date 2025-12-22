# 📐 Padrão de Template Reutilizável de Telas

> **Documentação do padrão estabelecido para todas as telas do sistema MORINA**

---

## 🎯 Objetivo

Fornecer um template reutilizável que garanta:
- ✅ Consistência visual entre todas as telas
- ✅ Funcionalidades padronizadas (auto-save, validação, etc)
- ✅ Redução de código duplicado
- ✅ Manutenibilidade e escalabilidade
- ✅ Experiência de usuário consistente

---

## 📦 Componentes Disponíveis

### 1. `StandardFormPage`

Componente principal que encapsula toda a estrutura padrão de uma tela de formulário.

**Localização:** `apps/web/src/components/templates/StandardFormPage.tsx`

**Características:**
- Header futurista com glass morphism
- Indicador de auto-save
- Atalhos de teclado (Ctrl+S, Escape)
- Estados de loading
- Botões de ação padronizados

**Exemplo de Uso:**

```tsx
import { StandardFormPage } from "@/components/templates";
import { Building2 } from "lucide-react";

export function DepartmentForm() {
  const { status, hasUnsavedChanges, markDirty } = useAutoSave({
    onSave: async () => {
      await saveDepartment(formData);
    },
    requireValid: true,
    isValid: () => formIsValid,
  });

  return (
    <StandardFormPage
      title="Cadastro de Departamento"
      subtitle="Gerencie os departamentos da organização"
      icon={<Building2 className="h-8 w-8" />}
      onSave={handleSave}
      backUrl="/settings/organizational-structure"
      isValid={formIsValid}
      autoSaveStatus={status}
      hasUnsavedChanges={hasUnsavedChanges}
    >
      {/* Seu formulário aqui */}
      <FuturisticInput
        label="Nome do Departamento"
        required
        value={formData.name}
        onChange={(e) => {
          setFormData({ ...formData, name: e.target.value });
          markDirty();
        }}
      />
    </StandardFormPage>
  );
}
```

**Props:**

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `title` | `string` | **obrigatório** | Título principal da página |
| `subtitle` | `string?` | - | Subtítulo ou descrição |
| `icon` | `ReactNode?` | `<FileText />` | Ícone do título |
| `children` | `ReactNode` | **obrigatório** | Conteúdo do formulário |
| `onSave` | `() => Promise<void>?` | - | Função de salvamento manual |
| `onCancel` | `() => void?` | - | Função de cancelamento |
| `backUrl` | `string?` | - | URL para voltar |
| `isValid` | `boolean` | `true` | Se o formulário está válido |
| `isLoading` | `boolean` | `false` | Se está carregando dados |
| `loadingMessage` | `string` | `"Carregando..."` | Mensagem de loading |
| `autoSaveStatus` | `"idle" \| "saving" \| "saved"` | `"idle"` | Status do auto-save |
| `hasUnsavedChanges` | `boolean` | `false` | Se há alterações não salvas |
| `headerActions` | `ReactNode?` | - | Ações adicionais no header |
| `showSaveButton` | `boolean` | `true` | Se deve mostrar botão salvar |
| `showCancelButton` | `boolean` | `true` | Se deve mostrar botão cancelar |

---

### 2. `useAutoSave`

Hook padronizado para gerenciar auto-save automático.

**Localização:** `apps/web/src/hooks/useAutoSave.ts`

**Características:**
- Auto-save com intervalo configurável (padrão: 30s)
- Debounce para evitar salvamentos excessivos
- Indicadores visuais de status
- Tratamento de erros
- Validação opcional antes de salvar

**Exemplo de Uso:**

```tsx
import { useAutoSave } from "@/hooks/useAutoSave";

export function MyForm() {
  const [formData, setFormData] = useState({ name: "" });
  const [formIsValid, setFormIsValid] = useState(false);

  const {
    status,              // "idle" | "saving" | "saved" | "error"
    hasUnsavedChanges,  // boolean
    lastSavedAt,        // Date | null
    error,              // Error | null
    markDirty,          // () => void
    markClean,          // () => void
    manualSave,          // () => Promise<void>
    reset,               // () => void
  } = useAutoSave({
    onSave: async () => {
      await api.update(formData);
    },
    intervalMs: 30000,  // 30 segundos
    debounceMs: 1000,   // 1 segundo
    requireValid: true,
    isValid: () => formIsValid,
    onAutoSaveComplete: () => {
      console.log("Salvo automaticamente!");
    },
  });

  return (
    <div>
      <input
        value={formData.name}
        onChange={(e) => {
          setFormData({ ...formData, name: e.target.value });
          markDirty(); // Marcar como alterado
        }}
      />
      <button onClick={manualSave}>Salvar Agora</button>
    </div>
  );
}
```

**Opções:**

| Opção | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `onSave` | `() => Promise<void>` | **obrigatório** | Função de salvamento |
| `intervalMs` | `number` | `30000` | Intervalo em ms para auto-save |
| `debounceMs` | `number` | `1000` | Debounce antes de marcar como alterado |
| `enabled` | `boolean` | `true` | Se auto-save está habilitado |
| `requireValid` | `boolean` | `false` | Se deve validar antes de salvar |
| `isValid` | `() => boolean?` | - | Função para verificar validade |

---

### 3. Componentes de Formulário Padronizados

Componentes de input, select e textarea seguindo o padrão visual MORINA.

**Localização:** `apps/web/src/components/templates/StandardFormFields.tsx`

**Componentes:**
- `FuturisticInput` - Input com glass morphism
- `FuturisticSelect` - Select com glass morphism
- `FuturisticTextarea` - Textarea com glass morphism

**Características:**
- Validação visual integrada
- Mensagens de erro acessíveis
- Efeitos hover e focus
- Suporte a temas light/dark

**Exemplo de Uso:**

```tsx
import { FuturisticInput, FuturisticSelect, FuturisticTextarea } from "@/components/templates";

<FuturisticInput
  label="Nome"
  required
  value={name}
  onChange={(e) => setName(e.target.value)}
  error={!!errors.name}
  errorMessage={errors.name}
/>

<FuturisticSelect
  label="Departamento"
  required
  value={departmentId}
  onChange={(e) => setDepartmentId(e.target.value)}
  error={!!errors.departmentId}
  errorMessage={errors.departmentId}
>
  <option value="">Selecione...</option>
  {departments.map((dept) => (
    <option key={dept.id} value={dept.id}>
      {dept.name}
    </option>
  ))}
</FuturisticSelect>

<FuturisticTextarea
  label="Descrição"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  rows={4}
/>
```

---

## 📋 Checklist de Implementação

Ao criar uma nova tela, siga este checklist:

### ✅ Estrutura Base
- [ ] Usar `StandardFormPage` como wrapper
- [ ] Definir título e subtítulo apropriados
- [ ] Adicionar ícone relevante
- [ ] Configurar `backUrl` ou `onCancel`

### ✅ Auto-Save
- [ ] Implementar `useAutoSave` hook
- [ ] Marcar como `dirty` quando usuário edita
- [ ] Passar `status` para `StandardFormPage`
- [ ] Passar `hasUnsavedChanges` para `StandardFormPage`
- [ ] Configurar validação se necessário

### ✅ Formulário
- [ ] Usar componentes `FuturisticInput/Select/Textarea`
- [ ] Implementar validação com Zod (ou similar)
- [ ] Mostrar mensagens de erro apropriadas
- [ ] Marcar campos obrigatórios com `required`

### ✅ Funcionalidades
- [ ] Implementar função `onSave` para salvamento manual
- [ ] Configurar atalhos de teclado (Ctrl+S já vem por padrão)
- [ ] Implementar estados de loading
- [ ] Tratar erros e mostrar notificações

### ✅ Validação
- [ ] Validar formulário antes de salvar
- [ ] Passar `isValid` para `StandardFormPage`
- [ ] Mostrar feedback visual de validação
- [ ] Mensagens de erro acessíveis

---

## 🎨 Padrão Visual

### Header
- Glass morphism com backdrop blur
- Tech corner accents (bordas nos cantos)
- Gradiente sutil de fundo
- Ícone + Título + Subtítulo
- Indicadores de auto-save
- Botões de ação (Salvar, Cancelar)

### Formulário
- Inputs com glass morphism
- Efeitos hover azul
- Validação visual (borda vermelha)
- Mensagens de erro tooltip
- Espaçamento consistente

### Animações
- Fade in do header (0.6s)
- Fade in do conteúdo (0.6s delay 0.2s)
- Transições suaves em hover/focus

---

## 🔄 Migração de Telas Existentes

Para migrar uma tela existente para o novo padrão:

1. **Substituir estrutura manual por `StandardFormPage`**
   ```tsx
   // Antes
   <div className="min-h-screen p-6">
     <div className="header">...</div>
     <form>...</form>
   </div>

   // Depois
   <StandardFormPage title="..." onSave={...}>
     <form>...</form>
   </StandardFormPage>
   ```

2. **Substituir auto-save manual por `useAutoSave`**
   ```tsx
   // Antes
   useEffect(() => {
     const interval = setInterval(() => {
       if (hasChanges) save();
     }, 30000);
     return () => clearInterval(interval);
   }, [hasChanges]);

   // Depois
   const { status, markDirty } = useAutoSave({
     onSave: async () => await save(),
   });
   ```

3. **Substituir inputs por componentes padronizados**
   ```tsx
   // Antes
   <input className="..." />

   // Depois
   <FuturisticInput label="..." />
   ```

---

## 📚 Referências

- **Tela de Referência:** Ficha de Custo de Aviamentos (`apps/web/src/app/(app)/fichas-custo/fichas-custo-client.tsx`)
- **Design System:** `docs/DESIGN_SYSTEM_*.md`
- **Roadmap:** `docs/Diretrizes/Roadmap-Implementação-Priorizado.md` (FASE 4)

---

**Última atualização:** 2025-01-19  
**Mantido por:** Equipe de Arquitetura MORINA








