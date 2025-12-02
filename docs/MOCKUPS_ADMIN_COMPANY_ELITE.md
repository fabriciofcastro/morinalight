# 🎨 Mockups & Visual Guide - Admin Company Elite

## Layout Comparativo

### ❌ ANTES (Atual)

```
╔════════════════════════════════════════════════════════════════╗
║                    STICKY HEADER                               ║
║ 🏢 Configurações da Empresa    [Cancelar]  [💾 Salvar]         ║
╠═════════════════════╦═════════════════════════════════════════╣
║  SIDEBAR            ║         MAIN CONTENT AREA                ║
║                     ║                                           ║
║ Visão Geral         ║  ┌─────────────────────────────────────┐ ║
║   (Geral)           ║  │ Identidade Visual                   │ ║
║                     ║  │ Logo e cores da sua marca           │ ║
║ Fiscal & Tributário ║  │ [📁 Upload] | Remover              │ ║
║   (Fiscal)          ║  │                                     │ ║
║                     ║  └─────────────────────────────────────┘ ║
║ Endereço            ║                                           ║
║   (Address)         ║  ┌─────────────────────────────────────┐ ║
║                     ║  │ Dados Corporativos                  │ ║
║ Contato             ║  │ Nome Fantasia    [__________]       │ ║
║   (Contact)         ║  │ Razão Social     [__________]       │ ║
║                     ║  │ Data Fundação    [__________]       │ ║
║ ┌──────────────────┐║  │ Porte Empresa    [EPP ▼]            │ ║
║ │ Perfil empresa   ││  │                                     │ ║
║ │ ████████░░ 85%   ││  └─────────────────────────────────────┘ ║
║ │ Complete para...  ││                                           ║
║ └──────────────────┘║                                           ║
║                     ║  (MAIS SEÇÕES ABAIXO)                    ║
╚═════════════════════╩═════════════════════════════════════════╝

⚠️ PROBLEMAS:
  - Sem validação em tempo real
  - Usuário pode preencher errado e não saber até salvar
  - Sem inteligência (sem auto-preenchimento)
  - Sidebar pouco informativa
  - Sem feedback de progresso real
```

---

### ✅ DEPOIS (Elite - Phase 1)

```
╔════════════════════════════════════════════════════════════════╗
║                    STICKY HEADER COM STATUS                    ║
║ 🏢 Configurações da Empresa    ⚫ Sincronizando...  📅 2 min   ║
║                                [Cancelar] [💾 Salvando...]     ║
╠═════════════════════╦═════════════════════════════════════════╣
║  SIDEBAR AVANÇADO   ║         MAIN CONTENT (SMART)             ║
║                     ║                                           ║
║ ✅ Geral (3/3)      ║  ┌─────────────────────────────────────┐ ║
║    Identity         ║  │ Identidade Visual         [ℹ️ Help] │ ║
║                     ║  │ Logo e cores da marca               │ ║
║ ⚠️ Fiscal (2/4)    ║  │ [📁 Upload PNG/SVG] | Remover       │ ║
║    Missing data     ║  │ Recomendado: <2MB, fundo transparente ║
║    [→ Avançar]      ║  │                                     │ ║
║                     ║  └─────────────────────────────────────┘ ║
║ ⭕ Endereço (0/8)   ║                                           ║
║                     ║  ┌─────────────────────────────────────┐ ║
║ ⭕ Contato (0/5)    ║  │ Dados Corporativos       [ℹ️ ?]      │ ║
║                     ║  │ Nome Fantasia [Morina Tech] ✓        ║
║ ⭐ Quick Setup      ║  │ Razão Social  [Morina Soluções] ✓   ║
║ 📥 Download Dados   ║  │ Data Fundação [01/01/2020] ✓        ║
║ 🔄 Histórico        ║  │ Porte Empresa [EPP ▼] • Obrigatório ║
║                     ║  │                                     │ ║
║                     ║  └─────────────────────────────────────┘ ║
║                     ║                                           ║
║                     ║  ┌─────────────────────────────────────┐ ║
║                     ║  │ Identificação Fiscal     [ℹ️ ?]      │ ║
║                     ║  │ CNPJ [🔍 Buscar]                    │ ║
║                     ║  │ [12.345.678/0001-90] ⏳ Validando.. ║
║                     ║  │ ℹ️ Auto-preenchendo dados...        ║
║                     ║  │                                     │ ║
║                     ║  └─────────────────────────────────────┘ ║
╚═════════════════════╩═════════════════════════════════════════╝

✨ MELHORIAS:
  ✅ Status por seção com contador
  ✅ Validação em tempo real (✓ verde, ⚠️ amarelo)
  ✅ Tooltips com informações
  ✅ Autosave silencioso (⚫ sincronização visível)
  ✅ Inteligência (🔍 buscar CNPJ, auto-preenchimento)
```

---

### ⭐ DEPOIS (Elite - Phase 2)

```
╔════════════════════════════════════════════════════════════════╗
║                    HEADER COM STATUS AVANÇADO                  ║
║ 🏢 Configurações da Empresa    ⚫ ✓ Tudo sincronizado • 5 min  ║
║                                [📊 Preview] [💾 Pronto]        ║
╠═════════════════════╦═════════════════════════════════════════╣
║  WIZARD INTELIGENTE ║    CONTEÚDO COM AUTOSAVE                ║
║                     ║                                           ║
║ 1️⃣ Identidade       ║  ┌─────────────────────────────────────┐ ║
║    ✅ Completo      ║  │ Setup Guiado: Paso 1 de 4          ║
║                     ║  │                                     │ ║
║ 2️⃣ CNPJ/Fiscal     ║  │ ▪ Identidade da Marca              ║
║    🔄 Buscando...   ║  │ Você já tem seu logo da empresa?   ║
║    [💡 Auto-detect] ║  │                                     │ ║
║                     ║  │ ┌─────────────────┐                ║
║ 3️⃣ Endereço        ║  │ │ 📷 Fazer upload │ [Próximo ➜]   ║
║    🤖 Pré-preencher ║  │ └─────────────────┘                ║
║    [CEP: 01310-100] ║  │                                     │ ║
║                     ║  │ 📌 Dica: Se não tem, pule esta    ║
║ 4️⃣ Contato         ║  │    etapa. Pode adicionar depois.   ║
║    ◻️ Prox          ║  │                                     │ ║
║                     ║  └─────────────────────────────────────┘ ║
║ [⏮️ Anterior]        ║                                           ║
║ [🏁 Finalizar]      ║  ┌─────────────────────────────────────┐ ║
║                     ║  │ 💡 DICA INTELIGENTE:               │ ║
║                     ║  │                                     │ ║
║                     ║  │ Seus dados foram auto-preenchidos  │ ║
║                     ║  │ da API de CNPJ! Confira:           │ ║
║                     ║  │                                     │ ║
║                     ║  │ ✓ Nome: Morina Tecnologia          │ ║
║                     ║  │ ✓ Endereço: Av. Paulista, 1000    │ ║
║                     ║  │ ✓ Regime: Simples Nacional         │ ║
║                     ║  │                                     │ ║
║                     ║  │ [✏️ Editar] [✅ Confirmar]         │ ║
║                     ║  │                                     │ ║
║                     ║  └─────────────────────────────────────┘ ║
╚═════════════════════╩═════════════════════════════════════════╝

🚀 PHASE 2 FEATURES:
  🔍 Auto-preenchimento CNPJ
  📍 Auto-complete CEP
  🧠 Regime tributário automático
  🎯 Wizard guiado passo-a-passo
  💡 Dicas inteligentes contextuais
```

---

## Componente: FormFieldWithValidation

### Estados Visuais

```
ESTADO: IDLE (vazio)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Label: CNPJ *
┌────────────────────────────────────────────────┐
│ 00.000.000/0000-00                             │ ← placeholder
└────────────────────────────────────────────────┘
Ajuda: Seu CNPJ está na carta de constituição


ESTADO: FOCADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Label: CNPJ *
┌────────────────────────────────────────────────┐
│ 12.                                            │ ← digitando
└────────────────────────────────────────────────┘
Digitando... (cursor piscando)


ESTADO: VALIDANDO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Label: CNPJ *
┌────────────────────────────────────────────────┐
│ 12.345.678/0001-90                        ⏳   │ ← spinner
└────────────────────────────────────────────────┘
⏳ Validando CNPJ...


ESTADO: VÁLIDO ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Label: CNPJ *
┌────────────────────────────────────────────────┐
│ 12.345.678/0001-90                        ✓   │ ← check verde
└────────────────────────────────────────────────┘
bg: light-green/5 | border: green-500/50

💡 Sugestões encontradas:
   • Morina Soluções em Tecnologia Ltda
   • Endereço: Av. Paulista, 1000 - São Paulo


ESTADO: INVÁLIDO ✗
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Label: CNPJ *
┌────────────────────────────────────────────────┐
│ 12.345.678/0001-XX                        ✗   │ ← x vermelho
└────────────────────────────────────────────────┘
bg: light-red/5 | border: red-500/50

⚠️ CNPJ inválido. Verifique o dígito verificador.
   💡 Dica: O último dígito deve ser 90
   🔗 Saiba mais: www.receita.gov.br/cnpj
```

---

## Componente: FieldGroup com Status

```
┌───────────────────────────────────────────────────────┐
│ ✅ Dados Corporativos [Completo]                      │
│    Informações legais e de identificação da empresa.  │
│    [ℹ️ Ajuda] [🔗 Documentação]                       │
└───────────────────────────────────────────────────────┘
    Name: [Morina Tech] ✓
    Razão Social: [Morina Soluções Ltda] ✓
    Data: [01/01/2020] ✓
    Porte: [EPP ▼] ✓


┌───────────────────────────────────────────────────────┐
│ ⚠️ Identificação Fiscal (2/4 campos)                  │
│    Registros nos órgãos governamentais.               │
│    [ℹ️ Precisa de atenção!]                           │
└───────────────────────────────────────────────────────┘
    CNPJ: [12.345.678/0001-90] ✓
    IE: [123.456.789.012] ✓
    IM: [_________________] ✗ Obrigatório
    Regime: [____________] ✗ Obrigatório


┌───────────────────────────────────────────────────────┐
│ ⭕ Endereço Principal (0/8 campos)                     │
│    Localização física da sede da empresa.             │
│    [ℹ️ Comece aqui]                                   │
└───────────────────────────────────────────────────────┘
    CEP: [__________]
    Rua: [__________]
    Número: [__________]
    ...
```

---

## Componente: QuickSetupWizard

```
╔─ WIZARD DE SETUP GUIADO ──────────────────────────────╗
║                                                        ║
║  🔹 1️⃣ Identidade Visual              ✅ Completo     ║
║     Seu logo e cores da marca                         ║
║                                                        ║
║  🔵 2️⃣ Dados Corporativos             → Atual        ║
║     Nome fantasia, razão social                       ║
║                                                        ║
║  🔹 3️⃣ Identificação Fiscal           ⭕ Pendente     ║
║     CNPJ, IE, regime tributário                       ║
║                                                        ║
║  🔹 4️⃣ Endereço Principal             ⭕ Pendente     ║
║     Localização da sede                               ║
║                                                        ║
║  ┌────────────────────────────────────────────────┐  ║
║  │ Progresso: ████████░░░░░░░░░░░░░░░░░░ 25%    │  ║
║  └────────────────────────────────────────────────┘  ║
║                                                        ║
║  [⏮️ Anterior]                    [Próximo ➜] [Pular] ║
║                                                        ║
╚────────────────────────────────────────────────────────╝
```

---

## Componente: StatusBadge

```
✅ COMPLETO
┌──────────────────┐
│ ✓ Completo       │ bg: green/10 | text: green-600
└──────────────────┘


⚠️ INCOMPLETO
┌──────────────────┐
│ ⏱ 2/4            │ bg: yellow/10 | text: yellow-600
└──────────────────┘


❌ ERRO
┌──────────────────┐
│ ✗ Erro           │ bg: red/10 | text: red-600
└──────────────────┘


⏳ SALVANDO
┌──────────────────┐
│ ⏳ Salvando...    │ bg: blue/10 | text: blue-600
└──────────────────┘
   (ícone animado)
```

---

## Sidebar Enhanced

```
┌─────────────────────────────────┐
│  🔹 SEÇÕES                      │
├─────────────────────────────────┤
│                                 │
│  ✅ Visão Geral                 │
│     • Identidade visual         │
│     ✓ 3 de 3 campos             │
│                                 │
│  ⚠️  Fiscal & Tributário (ATIVO) │
│     • Identificação Fiscal      │
│     • Regime e Impostos         │
│     ⚠️  2 de 4 campos            │
│     [→ Avançar para próxima]    │
│                                 │
│  ⭕ Endereço                     │
│     • Endereço Principal        │
│     ⭕ 0 de 8 campos             │
│                                 │
│  ⭕ Contato                      │
│     • Canais de Contato         │
│     ⭕ 0 de 5 campos             │
│                                 │
├─────────────────────────────────┤
│  ⭐ ATALHOS                      │
│  [🚀 Quick Setup]               │
│  [📊 Preview PDF]               │
│  [📥 Download JSON]             │
│  [🔄 Ver Histórico]             │
│  [💾 Versões]                   │
└─────────────────────────────────┘
```

---

## Validação & Feedback Flow

```
USER TYPES CNPJ
       ↓
DEBOUNCE 500ms
       ↓
START VALIDATION
  ✓ Format check
  ✓ Digit verification
  ✓ API lookup
  ✓ Business rules
       ↓
RESULT: VALID ✓
       ↓
SHOW SUCCESS STATE
  - Green border
  - Check icon
  - Show suggestions (auto-prefill options)
       ↓
USER ACCEPTS SUGGESTION
       ↓
AUTO-FILL RELATED FIELDS
  - Company name
  - Address
  - Fiscal info
       ↓
AUTOSAVE TRIGGERED
  - Debounce 1.5s
  - Show sync indicator
       ↓
SAVE SUCCESSFUL
  - Update lastSavedAt
  - Clear dirty flag
  - Show toast (optional)
```

---

## Mobile Responsiveness

### Desktop (1024px+)

```
┌──────────────────────────────────────────────┐
│  HEADER                                      │
├────────────┬────────────────────────────────┤
│ SIDEBAR    │ MAIN CONTENT (3 cols forms)    │
│ (sticky)   │ • Form fields in grid          │
│            │ • Full height scroll           │
│            │ • Tooltips on hover            │
└────────────┴────────────────────────────────┘
```

### Tablet (640px-1023px)

```
┌──────────────────────────────────────────────┐
│  HEADER (compact)                            │
├──────────────────────────────────────────────┤
│  TABS: Geral | Fiscal | Endereço | Contato  │
├──────────────────────────────────────────────┤
│  MAIN CONTENT (2 cols forms)                 │
│  • Shorter fields                            │
│  • Tooltips as modals                        │
│  • Sidebar collapsed                         │
└──────────────────────────────────────────────┘
```

### Mobile (< 640px)

```
┌───────────────────────────────┐
│  HEADER (hamburger menu)       │
├───────────────────────────────┤
│  SECTION TITLE                │
│  [Status Badge]               │
├───────────────────────────────┤
│  Form fields (1 col, full)    │
│  • Larger touch targets       │
│  • Tooltips as expandable     │
│  • Sticky save button         │
├───────────────────────────────┤
│ [💾 Salvar] (sticky bottom)   │
└───────────────────────────────┘
```

---

## Color Palette Reference

```
PRIMARY (Accent): hsl(var(--primary))
  - UI actions
  - Active states
  - Hover effects
  - Validation success (adjusted)

SUCCESS: #22c55e (green-500)
  - Valid state
  - Completed badges
  - ✓ checkmarks

WARNING: #eab308 (yellow-500)
  - Incomplete badges
  - Attention needed
  - ⚠️ alerts

ERROR: #ef4444 (red-500)
  - Invalid state
  - Required missing
  - ✗ errors

MUTED: #a1a1aa (zinc-500)
  - Disabled states
  - Secondary text
  - Borders (subtle)

TEXT:
  - Primary: #ffffff (white)
  - Secondary: rgba(255,255,255,0.6) (white/60)
  - Tertiary: rgba(255,255,255,0.4) (white/40)
```

---

## Animation Specs

```
TRANSITION TIMINGS:
  - Hover effects: 200ms ease-out
  - Form validation: 300ms ease-out
  - Section changes: 200ms ease-out (with Framer Motion)
  - Autosave indicator: 150ms ease-out

LOADING ANIMATIONS:
  - Spinner: 1s linear (infinite)
  - Progress bar: 400ms ease-out
  - Pulse: 2s ease-in-out (infinite)

ENTRANCE ANIMATIONS (Framer Motion):
  - Fields: fade-in + slide-up (200ms)
  - Sections: fade-in + slide-down (200ms)
  - Modals: scale + fade (300ms, spring: {stiffness: 300})
```

---

**Próximo passo:** Implementar componentes no código! 🚀
