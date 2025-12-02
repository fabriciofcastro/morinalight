# 🗺️ Roadmap de Implementação - Admin Company Elite

**Data:** 2 de dezembro de 2025  
**Timeline Estimada:** 5-8 sprints | 5-7 semanas  
**Equipe:** 1-2 devs + 1 designer (part-time)

---

## 📅 Timeline Geral

```
┌─────────────────────────────────────────────────────────────────┐
│ SEMANA 1 │ SEMANA 2 │ SEMANA 3 │ SEMANA 4-5 │ SEMANA 6-7      │
├─────────────────────────────────────────────────────────────────┤
│ PHASE 1: │ PHASE 1: │ PHASE 2: │ PHASE 2:   │ PHASE 3:        │
│ Setup    │ Validators│ Integr. │ Autosave   │ Polish & Deploy │
│ & Base   │ & Tests   │ APIs    │ & Tests    │                 │
├─────────────────────────────────────────────────────────────────┤
│ ✅ LIVE │ ✅ STAGING│ 🔄 DEV  │ 🔄 DEV     │ ✅ PROD        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 SPRINT 1: Fundações (3 dias)

### 📋 Objetivos

- [ ] Criar estrutura base de componentes
- [ ] Implementar hook `useFormWithAutosave`
- [ ] Criar `FormFieldWithValidation` com validação básica
- [ ] Setup validadores (CNPJ, Email, etc)

### 🔧 Tarefas

#### Task 1.1: Criar estrutura de pastas

```bash
mkdir -p src/components/admin/company/CompanyForm
mkdir -p src/components/admin/company/Integrations
mkdir -p src/hooks/company
mkdir -p src/lib/validators
mkdir -p src/lib/company
```

**Arquivos a criar:**

- `src/lib/validators/cnpj.ts` - Validador CNPJ
- `src/lib/validators/email.ts` - Validador Email
- `src/lib/validators/cep.ts` - Validador CEP
- `src/lib/company/types.ts` - Tipos compartilhados

#### Task 1.2: Implementar validadores

```tsx
// src/lib/validators/cnpj.ts
export function validateCnpj(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, "");
  if (cleaned.length !== 14) return false;

  // Algoritmo validação CNPJ
  // ... (implementação)

  return true;
}

export function formatCnpj(cnpj: string): string {
  return cnpj
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}
```

#### Task 1.3: Criar `useFormWithAutosave` hook

**Arquivo:** `src/hooks/useFormWithAutosave.ts` (já documentado)

**Testes a cobrir:**

- [ ] Salva dados corretamente
- [ ] Debounce funciona (1500ms)
- [ ] Detecta mudanças
- [ ] Limpa timeout ao desmontar
- [ ] Trata erros de API

#### Task 1.4: Criar `FormFieldWithValidation`

**Arquivo:** `src/components/admin/company/CompanyForm/FormFieldWithValidation.tsx` (já documentado)

**Testes a cobrir:**

- [ ] Renderiza com todos os estados
- [ ] Validação síncrona funciona
- [ ] Validação assíncrona funciona
- [ ] Debounce de validação (500ms)
- [ ] Sugestões aparecem corretamente
- [ ] Ícones de status aparecem

#### Task 1.5: Testes unitários

```bash
npm run test -- src/lib/validators/ --coverage
npm run test -- src/hooks/useFormWithAutosave.ts --coverage
npm run test -- src/components/admin/company/CompanyForm/ --coverage
```

**Coverage Target:** >85%

### ✅ Definição de Pronto (DoD)

- [ ] Todos os componentes com testes >85%
- [ ] Validadores funcionando para CNPJ, Email, CEP
- [ ] Autosave funcional em staging
- [ ] Sem erros TypeScript
- [ ] Code review aprovado

### 📊 Métricas Sprint 1

- **Commits:** ~15-20
- **Tests:** ~40-50 novos
- **Linhas de código:** ~1500-2000
- **Bugs encontrados:** 0 (target)

---

## 🎯 SPRINT 2: Validação Avançada (3 dias)

### 📋 Objetivos

- [ ] Integrar validadores na página principal
- [ ] Criar componente `FieldGroup`
- [ ] Criar componente `StatusBadge`
- [ ] Implementar validação em tempo real

### 🔧 Tarefas

#### Task 2.1: Criar `FieldGroup` componente

**Arquivo:** `src/components/admin/company/CompanyForm/FieldGroup.tsx` (já documentado)

**Features:**

- [ ] Renderiza com título e descrição
- [ ] Mostra status badge (completo, incompleto, erro)
- [ ] Tooltip com ajuda contextual
- [ ] Link para documentação
- [ ] Responsivo em mobile/tablet/desktop

#### Task 2.2: Criar `StatusBadge` componente

**Arquivo:** `src/components/admin/company/CompanyForm/StatusBadge.tsx` (já documentado)

**Estados:**

- [ ] Complete (verde)
- [ ] Incomplete (amarelo) com contador
- [ ] Error (vermelho)
- [ ] Saving (azul com spinner)

#### Task 2.3: Refatorar `SectionCard` com novo design

```tsx
// src/components/admin/company/SectionCard.tsx
// Adicionar status badge no header
// Melhorar spacing e visual hierarchy

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  status?: "complete" | "incomplete" | "error";
  count?: { completed: number; total: number };
  headerAction?: ReactNode;
  className?: string;
}
```

#### Task 2.4: Integrar validação na página

**Arquivo:** `src/app/(app)/admin/company/edit/page.tsx`

```tsx
// Remover:
- FormField simples
- Validação manual no handleSave

// Adicionar:
- FormFieldWithValidation para cada campo
- useFormWithAutosave hook
- FieldGroup para agrupar campos
- StatusBadge para cada seção
```

#### Task 2.5: Atualizar tipos e interfaces

**Arquivo:** `src/lib/company/types.ts`

```tsx
export interface CompanyData {
  id: string;
  name: string;
  legalName: string;
  cnpj: string;
  email: string;
  // ... mais campos
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormSection {
  id: string;
  title: string;
  fields: string[];
  required: boolean;
}
```

#### Task 2.6: Testes de integração

```bash
npm run test -- src/app/(app)/admin/company/edit/page.tsx --coverage
npm run test:e2e -- admin/company
```

**E2E Tests:**

- [ ] Usuário navega entre seções
- [ ] Validação em tempo real funciona
- [ ] Erros são mostrados corretamente
- [ ] Status atualiza

### ✅ Definição de Pronto

- [ ] Página funcionando com validação
- [ ] Sem erros no console
- [ ] Autosave funcionando em staging
- [ ] Testes E2E passando
- [ ] Design aprovado

### 📊 Métricas Sprint 2

- **Commits:** ~10-15
- **Tests:** ~20-30 novos
- **Linhas de código:** ~800-1200
- **Page load performance:** <100ms added

---

## 🎯 SPRINT 3: Inteligência (CNPJ/CEP) (4 dias)

### 📋 Objetivos

- [ ] Integrar API de CNPJ
- [ ] Integrar API de CEP (Viacep/BrasilAPI)
- [ ] Auto-preenchimento inteligente
- [ ] Cache local

### 🔧 Tarefas

#### Task 3.1: Criar `CnpjLookup` componente

**Arquivo:** `src/components/admin/company/Integrations/CnpjLookup.tsx` (já documentado)

**Features:**

- [ ] Input formatado automaticamente
- [ ] Botão "Buscar" integrado
- [ ] Loading state
- [ ] Error handling
- [ ] Cache em sessionStorage

#### Task 3.2: Criar hook `useCnpjLookup`

```tsx
// src/hooks/useCnpjLookup.ts

export function useCnpjLookup() {
  const [data, setData] = useState<CnpjData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, CnpjData>>(new Map());

  const lookup = useCallback(async (cnpj: string) => {
    // Validação
    if (!validateCnpj(cnpj)) {
      setError("CNPJ inválido");
      return;
    }

    // Check cache
    const cached = cacheRef.current.get(cnpj);
    if (cached) {
      setData(cached);
      return;
    }

    // API call
    try {
      setLoading(true);
      const response = await fetch(`/api/company/cnpj-lookup?cnpj=${cnpj}`);
      const result = await response.json();

      cacheRef.current.set(cnpj, result);
      setData(result);
    } catch (err) {
      setError("Erro ao buscar CNPJ");
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, lookup };
}
```

#### Task 3.3: Criar API route para CNPJ

**Arquivo:** `src/app/api/company/cnpj-lookup/route.ts`

```tsx
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cnpj = searchParams.get("cnpj");

  if (!cnpj) {
    return Response.json({ error: "CNPJ required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://brasilapi.com.br/api/cnpj/v1/${cnpj.replace(/\D/g, "")}`,
    );
    const data = await response.json();

    return Response.json({
      cnpj: formatCnpj(cnpj),
      name: data.name,
      legalName: data.legal_name,
      address: {
        street: data.street,
        number: data.number,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        zipCode: data.zip_code,
      },
    });
  } catch (error) {
    return Response.json({ error: "CNPJ not found" }, { status: 404 });
  }
}
```

#### Task 3.4: Criar `AddressAutoComplete` componente

```tsx
// src/components/admin/company/Integrations/AddressAutoComplete.tsx

interface AddressAutoCompleteProps {
  zipCode: string;
  onAddressFound: (address: Address) => void;
  className?: string;
}

export function AddressAutoComplete({
  zipCode,
  onAddressFound,
  className,
}: AddressAutoCompleteProps) {
  // Similar ao CnpjLookup mas para CEP
}
```

#### Task 3.5: Integrar na página

```tsx
// Na seção de Fiscal
<CnpjLookup
  onDataFound={(data) => {
    updateFormData({
      cnpj: data.cnpj,
      legalName: data.legalName,
      name: data.name,
    });
  }}
/>

// Na seção de Endereço
<AddressAutoComplete
  zipCode={formData.address.zipCode}
  onAddressFound={(addr) => {
    updateFormData({
      address: { ...formData.address, ...addr }
    });
  }}
/>
```

#### Task 3.6: Testes

```bash
npm run test -- src/hooks/useCnpjLookup.ts
npm run test -- src/app/api/company/cnpj-lookup
npm run test:e2e -- admin/company/cnpj-lookup
```

### ✅ Definição de Pronto

- [ ] CNPJ lookup funciona
- [ ] CEP lookup funciona
- [ ] Cache funciona
- [ ] Error handling robusto
- [ ] Testes >80%

### 📊 Métricas Sprint 3

- **API calls:** <500ms (com cache)
- **User save time:** 5min → 3min
- **Error rate:** <5%

---

## 🎯 SPRINT 4: AutoSave & Histórico (3 dias)

### 📋 Objetivos

- [ ] AutoSave funcional com debounce
- [ ] Sync status visível
- [ ] Histórico de mudanças
- [ ] Undo/Redo (opcional)

### 🔧 Tarefas

#### Task 4.1: Melhorar header com sync status

```tsx
// src/app/(app)/admin/company/edit/page.tsx

<header>
  <div className="flex items-center gap-2">
    <div
      className={cn(
        "h-3 w-3 rounded-full",
        isSaving ? "bg-blue-500 animate-pulse" : "bg-green-500",
      )}
    />

    <span className="text-sm text-zinc-400">
      {isSaving
        ? "Sincronizando..."
        : `Última atualização: ${formatDistanceToNow(lastSavedAt)}`}
    </span>
  </div>
</header>
```

#### Task 4.2: Implementar histórico

```tsx
// src/lib/company/history.ts

export interface HistoryEntry {
  id: string;
  timestamp: Date;
  changes: Record<string, { before: any; after: any }>;
  userId: string;
}

export class FormHistory {
  private entries: HistoryEntry[] = [];

  record(changes: Record<string, any>) {
    this.entries.push({
      id: generateId(),
      timestamp: new Date(),
      changes,
      userId: getCurrentUserId(),
    });
  }

  undo(): HistoryEntry | null {
    return this.entries.pop() || null;
  }

  getHistory(): HistoryEntry[] {
    return this.entries;
  }
}
```

#### Task 4.3: Criar modal de histórico

```tsx
// src/components/admin/company/CompanyForm/HistoryModal.tsx

export function HistoryModal({ isOpen, onClose, entries }: HistoryModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Histórico de Alterações</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="border-l-2 border-zinc-600 pl-4 py-2"
            >
              <p className="text-sm font-medium text-white">
                {formatDistanceToNow(entry.timestamp)} atrás
              </p>
              <p className="text-xs text-zinc-400">por {entry.userId}</p>
              <ul className="mt-2 space-y-1 text-xs text-zinc-300">
                {Object.entries(entry.changes).map(([field, change]) => (
                  <li key={field}>
                    <strong>{field}:</strong> {change.before} → {change.after}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

#### Task 4.4: Integrar na página

- [ ] Botão "Ver Histórico" no sidebar
- [ ] Modal de histórico
- [ ] Badge com número de mudanças

### ✅ Definição de Pronto

- [ ] Autosave funcionando
- [ ] Sync status visível
- [ ] Histórico funcionando
- [ ] Testes passando

### 📊 Métricas Sprint 4

- **Autosave success rate:** >99%
- **Data loss incidents:** 0
- **User retention:** +10%

---

## 🎯 SPRINT 5: UX Refinements (3 dias)

### 📋 Objetivos

- [ ] Melhorar visual feedback
- [ ] Otimizar mobile
- [ ] Acessibilidade WCAG AA
- [ ] Performance optimization

### 🔧 Tarefas

#### Task 5.1: Tooltips avançados

- [ ] HelpCircle icon em cada seção
- [ ] Conteúdo contextual com markdown
- [ ] Links para documentação
- [ ] Exemplos visuais

#### Task 5.2: Loading states premium

- [ ] Skeleton loaders
- [ ] Pulse animations
- [ ] Progress indicators
- [ ] Toast notifications

#### Task 5.3: Mobile optimization

- [ ] Touch-friendly buttons (48px min)
- [ ] Reflow de layouts
- [ ] Otimizar form fields
- [ ] Testar em browser real (iPhone, Android)

#### Task 5.4: Acessibilidade

- [ ] ARIA labels
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Screen reader testing
- [ ] Color contrast (>4.5:1)
- [ ] Focus indicators visíveis

#### Task 5.5: Performance

```bash
npm run build
npm run analyze # Bundle analysis

# Target:
# - First Contentful Paint: <1.5s
# - Largest Contentful Paint: <2.5s
# - Cumulative Layout Shift: <0.1
# - Time to Interactive: <3s
```

### ✅ Definição de Pronto

- [ ] Lighthouse score: >90
- [ ] Acessibilidade: >95
- [ ] Mobile test passed
- [ ] Performance budget: <+20KB

---

## 🎯 SPRINT 6: Quick Setup Wizard (2 dias)

### 📋 Objetivos

- [ ] Criar `QuickSetupWizard` componente
- [ ] Implementar flow guiado
- [ ] Auto-preenchimento inteligente
- [ ] Progresso visual

### 🔧 Tarefas

#### Task 6.1: Criar wizard componente

**Arquivo:** `src/components/admin/company/CompanyForm/QuickSetupWizard.tsx` (já documentado)

#### Task 6.2: Setup flow logic

```tsx
const SETUP_STEPS = [
  {
    id: "identity",
    title: "Identidade Visual",
    description: "Seu logo e cores",
    fields: ["logoUrl"],
  },
  {
    id: "corporate",
    title: "Dados Corporativos",
    description: "Nome fantasia e razão social",
    fields: ["name", "legalName"],
  },
  {
    id: "fiscal",
    title: "Identificação Fiscal",
    description: "CNPJ e regime tributário",
    fields: ["cnpj", "taxRegime"],
  },
  {
    id: "address",
    title: "Endereço Principal",
    description: "Localização da sede",
    fields: ["address.zipCode", "address.street"],
  },
];
```

#### Task 6.3: Integrar na página

- [ ] Nova rota: `/admin/company/setup`
- [ ] Redirect novo usuário
- [ ] Reutilizar componentes existentes
- [ ] Progress bar

### ✅ Definição de Pronto

- [ ] Wizard funcional
- [ ] Flow tested com usuários
- [ ] Feedback positivo

---

## 🎯 SPRINT 7: Polish & Deploy (2 dias)

### 📋 Objetivos

- [ ] QA & bug fixes
- [ ] Deploy em produção
- [ ] Monitoring & observability
- [ ] Documentação

### 🔧 Tarefas

#### Task 7.1: QA Completo

```bash
# Manual testing
- [ ] Chrome, Firefox, Safari
- [ ] iOS Safari, Chrome mobile
- [ ] Android Chrome
- [ ] Keyboard navigation completo
- [ ] Screen reader testing
- [ ] Validação em todos os casos

# Automated testing
npm run test:e2e
npm run test:a11y
```

#### Task 7.2: Bug fixes & refinements

- [ ] Corrigir bugs encontrados
- [ ] Fine-tuning de performance
- [ ] Adjust timings/delays
- [ ] Visual polish

#### Task 7.3: Monitoring setup

```ts
// Adicionar eventos de tracking
track("company_form_started");
track("company_form_section_completed", { section });
track("company_form_submitted");
track("autosave_triggered");
track("validation_error", { field, error });
track("cnpj_lookup_success");
```

#### Task 7.4: Documentação

- [ ] README do componente
- [ ] JSDoc comments
- [ ] Storybook stories
- [ ] User guide

#### Task 7.5: Deploy

```bash
# Staging
npm run build
npm run test:e2e

# Production
npm run deploy
# Monitor: error rate, performance, user feedback
```

### ✅ Definição de Pronto

- [ ] 0 blockers no QA
- [ ] Monitoring ativo
- [ ] Deploy successful
- [ ] Docs completa

---

## 📊 Roadmap Visual

```
SEMANA 1          SEMANA 2          SEMANA 3-4         SEMANA 5-6         SEMANA 7
┌──────────┐    ┌──────────┐    ┌─────────────┐    ┌────────────┐    ┌──────────┐
│ PHASE 1  │    │ PHASE 1  │    │ PHASE 2     │    │ PHASE 2/3  │    │ PHASE 3  │
│ Setup    │───▶│ Validators│───▶│ Integrations│───▶│ Polish &   │───▶│ Deploy   │
│ & Base   │    │ & Tests  │    │ & Features  │    │ Wizard     │    │ & Launch │
└──────────┘    └──────────┘    └─────────────┘    └────────────┘    └──────────┘
      |               |                |                 |                  |
      ✅ LIVE        ✅ LIVE        🔄 STAGING       🔄 STAGING        ✅ PROD
```

---

## 📈 Success Criteria

### Phase 1 (Validação)

- ✅ Setup form sem erros
- ✅ Validação em tempo real
- ✅ Autosave funcional
- ✅ Tests >85%

### Phase 2 (Inteligência)

- ✅ CNPJ lookup funciona
- ✅ CEP lookup funciona
- ✅ Tempo setup: 5min → 3min
- ✅ Error rate: <2%

### Phase 3 (Elite)

- ✅ Wizard setup: 2.5min
- ✅ Satisfação (NPS): 6.5 → 9
- ✅ Conclusão setup: 70% → 95%
- ✅ Lighthouse: >90

---

## 🔄 Post-Launch

### Semana 1-2 após launch

- Monitor erro rate
- Coletar user feedback
- Adjust performance
- Fix hotfixes

### Semana 3-4

- Analyze usage patterns
- Otimizar based on data
- Expand features
- Plan Phase 4 (temas contextuais, etc)

### Métricas a monitorar

```
- Form completion rate
- Average time to complete
- Error rate por field
- Autosave success rate
- API response times
- User satisfaction (surveys)
- Support tickets relacionados
```

---

## 🛠️ Resources Necessários

### Equipe

- **2 Frontend Devs** - Implementação
- **1 Backend Dev** - APIs + integrations (part-time)
- **1 Designer** - Visual polish (part-time)
- **1 QA** - Testing (part-time)

### Ferramentas

- Figma (design/mockups)
- Storybook (component library)
- GitHub (versionamento)
- Vercel (deployments)
- Sentry (error tracking)
- Datadog (monitoring)
- Playwright (E2E testing)

### Dependências

```json
{
  "framer-motion": "^11.x",
  "react-hook-form": "^8.x",
  "zod": "^3.x",
  "@hookform/resolvers": "^3.x",
  "date-fns": "^3.x"
}
```

---

## ⚠️ Riscos & Contingency

| Risco                       | Probabilidade | Mitigação                |
| --------------------------- | ------------- | ------------------------ |
| API externa (CNPJ) instável | Media         | Fallback manual + cache  |
| Conflicts entre edits       | Baixa         | Conflict resolution UI   |
| Performance degradada       | Baixa         | Bundle analysis + limits |
| Mudanças scope              | Alta          | Strict sprint planning   |

---

## 📞 Próximos Passos

1. **✅ Revisar** roadmap com time
2. **🎯 Confirmar** timeline e recursos
3. **🚀 Kick-off** Sprint 1
4. **👥 Setup** daily standups
5. **📊 Monitorar** progresso

---

**Status:** 🟢 Pronto para execução  
**Última atualização:** 2 de dezembro, 2025  
**Owner:** GitHub Copilot + Your Team
