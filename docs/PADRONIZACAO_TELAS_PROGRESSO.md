# 📋 Progresso da Padronização de Telas

## 🎯 Objetivo

Padronizar todas as telas de formulário para usar o template `StandardFormPage`, garantindo consistência visual, funcionalidades padronizadas (auto-save, atalhos de teclado, etc.) e melhor manutenibilidade.

---

## ✅ Telas Padronizadas

### 1. Departments (Departamentos) ✅

- **Arquivo:** `apps/web/src/components/admin/departments/department-form-client.tsx`
- **Status:** ✅ Já estava padronizado
- **Funcionalidades:**
  - ✅ StandardFormPage
  - ✅ Auto-save com useAutoSave
  - ✅ Atalhos de teclado (Ctrl+S, Esc)
  - ✅ Indicador de auto-save

### 2. Sectors (Setores) ✅

- **Arquivo:** `apps/web/src/components/admin/sectors/sector-form-client.tsx`
- **Status:** ✅ Padronizado (2025-01-19)
- **Funcionalidades implementadas:**
  - ✅ StandardFormPage
  - ✅ Auto-save com useAutoSave (30 segundos)
  - ✅ Atalhos de teclado (Ctrl+S, Esc)
  - ✅ Indicador de auto-save visual
  - ✅ Notificações de sucesso/erro
  - ✅ Marcação automática de alterações (markDirty)

### 3. Positions (Cargos) ✅

- **Arquivo:** `apps/web/src/components/admin/positions/position-form-client.tsx`
- **Status:** ✅ Padronizado (2025-01-19)
- **Funcionalidades implementadas:**
  - ✅ StandardFormPage
  - ✅ Auto-save com useAutoSave (30 segundos)
  - ✅ Atalhos de teclado (Ctrl+S, Esc)
  - ✅ Indicador de auto-save visual
  - ✅ Notificações de sucesso/erro
  - ✅ Marcação automática de alterações (markDirty)
  - ✅ Sistema de abas mantido (Geral, Detalhes, Salarial)

### 4. Branches (Filiais) ✅

- **Arquivo:** `apps/web/src/components/admin/branches/branch-form-client.tsx`
- **Status:** ✅ Padronizado (2025-01-19)
- **Funcionalidades implementadas:**
  - ✅ StandardFormPage
  - ✅ Auto-save com useAutoSave (30 segundos)
  - ✅ Atalhos de teclado (Ctrl+S, Esc)
  - ✅ Indicador de auto-save visual
  - ✅ Notificações de sucesso/erro
  - ✅ Marcação automática de alterações (markDirty)
  - ✅ Sistema de abas mantido (Geral, Fiscal, Endereço, Contato)
  - ✅ Integração BrasilAPI (CNPJ) com notificações
  - ✅ Integração ViaCEP com notificações

### 5. Roles (Funções/Perfis) ✅

- **Arquivo:** `apps/web/src/components/admin/roles/role-form-client.tsx`
- **Status:** ✅ Padronizado (2025-01-19)
- **Funcionalidades implementadas:**
  - ✅ StandardFormPage
  - ✅ Auto-save com useAutoSave (30 segundos)
  - ✅ Atalhos de teclado (Ctrl+S, Esc)
  - ✅ Indicador de auto-save visual
  - ✅ Notificações de sucesso/erro
  - ✅ Marcação automática de alterações (markDirty)

### 6. Workflow Policies ✅

- **Arquivo:** `apps/web/src/components/admin/workflow-policies/workflow-form-client.tsx`
- **Status:** ✅ Padronizado (2025-01-19)
- **Funcionalidades implementadas:**
  - ✅ StandardFormPage
  - ✅ Auto-save com useAutoSave (30 segundos)
  - ✅ Atalhos de teclado (Ctrl+S, Esc)
  - ✅ Indicador de auto-save visual
  - ✅ Notificações de sucesso/erro
  - ✅ Marcação automática de alterações (markDirty)
  - ✅ Templates mantidos (com notificações)

### 7. Business Segments ✅

- **Arquivo:** `apps/web/src/components/admin/business-segments/segment-form-client.tsx`
- **Status:** ✅ Padronizado (2025-01-19)
- **Funcionalidades implementadas:**
  - ✅ StandardFormPage
  - ✅ Auto-save com useAutoSave (30 segundos)
  - ✅ Atalhos de teclado (Ctrl+S, Esc)
  - ✅ Indicador de auto-save visual
  - ✅ Notificações de sucesso/erro
  - ✅ Marcação automática de alterações (markDirty)

### 8. Status Customizados ✅

- **Arquivo:** `apps/web/src/components/admin/status-customizados-ficha-custo/status-customizado-form-client.tsx`
- **Status:** ✅ Padronizado (2025-01-19)
- **Funcionalidades implementadas:**
  - ✅ StandardFormPage
  - ✅ Auto-save com useAutoSave (30 segundos)
  - ✅ Atalhos de teclado (Ctrl+S, Esc)
  - ✅ Indicador de auto-save visual
  - ✅ Notificações de sucesso/erro
  - ✅ Marcação automática de alterações (markDirty)
  - ✅ Validação de cor hexadecimal

---

## ✅ TODAS AS TELAS PADRONIZADAS!

- **Arquivo:** `apps/web/src/components/admin/positions/position-form-client.tsx`
- **Prioridade:** Alta
- **Observações:** Formulário com abas (general, details, salary)

### 2. Branches (Filiais)

- **Arquivo:** `apps/web/src/components/admin/branches/branch-form-client.tsx`
- **Prioridade:** Alta

### 3. Roles (Funções)

- **Arquivo:** `apps/web/src/components/admin/roles/role-form-client.tsx`
- **Prioridade:** Média

### 4. Workflow Policies

- **Arquivo:** `apps/web/src/components/admin/workflow-policies/workflow-form-client.tsx`
- **Prioridade:** Média

### 5. Business Segments

- **Arquivo:** `apps/web/src/components/admin/business-segments/segment-form-client.tsx`
- **Prioridade:** Média

### 6. Status Customizados (Ficha de Custo)

- **Arquivo:** `apps/web/src/components/admin/status-customizados-ficha-custo/status-customizado-form-client.tsx`
- **Prioridade:** Baixa

---

## 📊 Estatísticas

- **Total de telas:** 8
- **Padronizadas:** 8 (100%) ✅
- **Pendentes:** 0

---

## 🔧 Padrão de Padronização

### Estrutura Base

```typescript
import { StandardFormPage } from "@/components/templates";
import { useAutoSave } from "@/hooks/useAutoSave";
import { notificationCenter } from "@/components/notifications/notification-center";

// 1. Adicionar useAutoSave
const { status, hasUnsavedChanges, markDirty, markClean } = useAutoSave({
  onSave: async () => {
    if (!canSave) return;
    await handleSave();
  },
  intervalMs: 30000,
  requireValid: true,
  isValid: () => canSave,
  onAutoSaveComplete: () => markClean(),
});

// 2. Converter handleSubmit para handleSave (sem e.preventDefault)
const handleSave = useCallback(async () => {
  // Validações e salvamento
}, [dependencies]);

const onSubmit = useCallback(
  async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await handleSave();
  },
  [handleSave],
);

// 3. Substituir estrutura de header/formulário por StandardFormPage
return (
  <StandardFormPage
    title="Título"
    subtitle="Subtítulo"
    icon={<Icon />}
    onSave={onSubmit}
    backUrl="/back/url"
    isValid={canSave}
    loading={loading}
    autoSaveStatus={status}
    hasUnsavedChanges={hasUnsavedChanges}
  >
    <form onSubmit={onSubmit}>
      {/* Campos do formulário */}
    </form>
  </StandardFormPage>
);

// 4. Adicionar markDirty() em todos os onChange dos campos
onChange={(e) => {
  setForm((p) => ({ ...p, field: e.target.value }));
  markDirty();
}}
```

---

## 📝 Checklist de Padronização

Para cada tela, verificar:

- [ ] Importar `StandardFormPage` e `useAutoSave`
- [ ] Substituir estrutura de header customizada por `StandardFormPage`
- [ ] Implementar `useAutoSave` hook
- [ ] Converter `onSubmit` para `handleSave` (sem `e.preventDefault()`)
- [ ] Adicionar `markDirty()` em todos os `onChange`
- [ ] Adicionar `markClean()` após salvar com sucesso
- [ ] Adicionar notificações de sucesso/erro
- [ ] Remover estados de `saving` (usar `loading` do StandardFormPage)
- [ ] Remover botões de ação customizados (StandardFormPage já inclui)
- [ ] Testar auto-save
- [ ] Testar atalhos de teclado
- [ ] Testar navegação (voltar, salvar)

---

## 🎯 Próximos Passos

1. ✅ Padronizar Sectors (CONCLUÍDO)
2. ✅ Padronizar Positions (CONCLUÍDO)
3. ✅ Padronizar Branches (CONCLUÍDO)
4. ✅ Padronizar Roles (CONCLUÍDO)
5. ✅ Padronizar Workflow Policies (CONCLUÍDO)
6. ✅ Padronizar Business Segments (CONCLUÍDO)
7. ✅ Padronizar Status Customizados (CONCLUÍDO)

**✅ TODAS AS 8 TELAS FORAM PADRONIZADAS COM SUCESSO!** 4. ⏳ Padronizar Roles 5. ⏳ Padronizar Workflow Policies 6. ⏳ Padronizar Business Segments 7. ⏳ Padronizar Status Customizados

---

**Última atualização:** 2025-01-19  
**Próxima revisão:** Após padronizar 3 telas
