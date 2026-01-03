# 🪶 CLEAN VIBRANT THEME SYSTEM (Dark + Light) — **FULL SPEC**

### TailwindCSS v4 + ShadCN UI + Next.js

> Um único Design System com **modes** (dark/light) e **profiles** (web/erp). O Cursor troca **apenas cores** via `data-theme` e ajusta **densidade** e **comportamento** via `data-profile`.

---

## 0) Convenções de Atributos

- Tema: `<html data-theme="dark|light">`
- Perfil (densidade/uso): `<html data-profile="web|erp">`
- Acessibilidade motion: reconhecido por media query `prefers-reduced-motion`.

---

## 1) Tokens Globais (Tailwind v4 `@theme`)

> Arquivo: `./styles/themes/clean-vibrant.css`

```css
@theme {
  /* =====================
   * 1. CORES (SEMÂNTICAS)
   * ===================== */
  /* DARK */
  [data-theme="dark"] {
    /* Superfícies */
    --bg: 222 28% 10%; /* Fundo global */
    --surface: 222 22% 14%; /* Cards, painéis */
    --elevated: 222 20% 18%; /* Elementos flutuantes */
    --overlay: 0 0% 100% / 0.04;
    --border: 0 0% 100% / 0.06;

    /* Texto */
    --text-1: 0 0% 95%; /* Primário */
    --text-2: 0 0% 75%; /* Secundário */
    --text-3: 0 0% 55%; /* Muted */

    /* Ações (vibrantes) */
    --primary: 210 100% 60%; /* Azul energia */
    --secondary: 270 95% 65%; /* Roxo violeta */
    --accent: 160 90% 55%; /* Verde esmeralda */

    /* Feedback */
    --success: 158 72% 55%;
    --warning: 45 100% 60%;
    --danger: 0 82% 60%;

    /* Grafismos */
    --chart-1: var(--primary);
    --chart-2: 200 95% 60%;
    --chart-3: 280 90% 65%;
    --chart-4: 160 80% 50%;
    --chart-5: 45 95% 55%;

    /* Gradiente global */
    --bg-gradient: linear-gradient(
      135deg,
      hsl(var(--bg)) 0%,
      hsl(230 25% 12%) 45%,
      hsl(240 30% 8%) 100%
    );
  }

  /* LIGHT */
  [data-theme="light"] {
    --bg: 0 0% 98%;
    --surface: 0 0% 100%;
    --elevated: 0 0% 95%;
    --overlay: 0 0% 0% / 0.02;
    --border: 0 0% 0% / 0.08;

    --text-1: 0 0% 10%;
    --text-2: 0 0% 30%;
    --text-3: 0 0% 45%;

    --primary: 210 90% 55%;
    --secondary: 270 85% 55%;
    --accent: 160 85% 40%;

    --success: 158 75% 35%;
    --warning: 45 100% 45%;
    --danger: 0 82% 45%;

    --chart-1: var(--primary);
    --chart-2: 200 85% 45%;
    --chart-3: 280 80% 50%;
    --chart-4: 160 70% 38%;
    --chart-5: 45 90% 48%;

    --bg-gradient: linear-gradient(
      135deg,
      hsl(0 0% 100%) 0%,
      hsl(0 0% 97%) 45%,
      hsl(0 0% 95%) 100%
    );
  }

  /* =====================
   * 2. ESPAÇAMENTO / LAYOUT
   * ===================== */
  /* Escala baseada em 4px */
  --space-0: 0px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 28px;
  --space-8: 32px;
  --space-9: 36px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;

  /* Densidade por perfil */
  [data-profile="web"] {
    --density: 1;
  } /* espaçado */
  [data-profile="erp"] {
    --density: 0.85;
  } /* compacto */

  /* =====================
   * 3. TIPOGRAFIA
   * ===================== */
  --font-sans:
    ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter,
    "Plus Jakarta Sans", "Satoshi", sans-serif;
  --font-mono:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    monospace;

  --text-xs: 12px;
  --leading-xs: 18px;
  --text-sm: 14px;
  --leading-sm: 20px;
  --text-md: 15px;
  --leading-md: 22px; /* corpo padrão */
  --text-lg: 18px;
  --leading-lg: 26px;
  --text-xl: 20px;
  --leading-xl: 28px;
  --text-2xl: 24px;
  --leading-2xl: 32px;
  --text-3xl: 30px;
  --leading-3xl: 38px;

  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;

  /* =====================
   * 4. RADII, BORDAS, SOMBRAS
   * ===================== */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;

  --ring: 0 0 0 3px hsl(var(--primary) / 0.35);
  --ring-focus:
    0 0 0 2px hsl(var(--surface)), 0 0 0 5px hsl(var(--primary) / 0.6);

  --shadow-sm: 0 2px 8px hsl(240 10% 10% / 0.25);
  --shadow-md: 0 8px 24px hsl(240 10% 10% / 0.35);
  --shadow-lg: 0 18px 42px hsl(240 10% 10% / 0.45);

  /* =====================
   * 5. LAYOUT / GRID / BREAKPOINTS
   * ===================== */
  --container-w: 1200px;
  --bp-sm: 640px; /* sm */
  --bp-md: 768px; /* md */
  --bp-lg: 1024px; /* lg */
  --bp-xl: 1280px; /* xl */
  --bp-2xl: 1536px; /* 2xl */
}
```

---

## 2) Base, Contêiner e Responsividade

```css
@layer base {
  html {
    color-scheme: dark light;
  }

  body {
    background: var(--bg-gradient);
    color: hsl(var(--text-1));
    font-family: var(--font-sans);
    line-height: var(--leading-md);
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* Container responsivo */
  .container {
    width: 100%;
    max-width: var(--container-w);
    margin-inline: auto;
    padding-inline: calc(var(--space-5) * var(--density));
  }

  /* Utilitários de Grid */
  .grid-auto {
    display: grid;
    gap: calc(var(--space-5) * var(--density));
  }
  .grid-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .grid-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .grid-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  @media (max-width: 1024px) {
    .grid-4 {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (max-width: 640px) {
    .grid-3,
    .grid-2 {
      grid-template-columns: 1fr;
    }
  }
}
```

---

## 3) Tipografia, Textos e Links

```css
.heading-1 {
  font-size: var(--text-3xl);
  line-height: var(--leading-3xl);
  font-weight: var(--weight-bold);
  color: hsl(var(--text-1));
}
.heading-2 {
  font-size: var(--text-2xl);
  line-height: var(--leading-2xl);
  font-weight: var(--weight-semibold);
  color: hsl(var(--text-1));
}
.heading-3 {
  font-size: var(--text-xl);
  line-height: var(--leading-xl);
  font-weight: var(--weight-semibold);
  color: hsl(var(--text-1));
}
.body {
  font-size: var(--text-md);
  line-height: var(--leading-md);
  color: hsl(var(--text-2));
}
.muted {
  color: hsl(var(--text-3));
}

.link {
  color: hsl(var(--primary));
  transition: color 0.2s ease;
}
.link:hover {
  color: hsl(var(--secondary));
}

.code {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  background: hsl(var(--elevated));
  border: 1px solid hsl(var(--border));
}
```

---

## 4) Espaçamento, Padding e Margens

> Regra: **ERP é 15% mais compacto** (`--density: 0.85`).

- `pad-sm = calc(var(--space-3) * var(--density))` (12px × densidade)
- `pad-md = calc(var(--space-4) * var(--density))` (16px × densidade)
- `pad-lg = calc(var(--space-6) * var(--density))` (24px × densidade)

```css
.pad-sm {
  padding: calc(var(--space-3) * var(--density));
}
.pad-md {
  padding: calc(var(--space-4) * var(--density));
}
.pad-lg {
  padding: calc(var(--space-6) * var(--density));
}
.gap-sm {
  gap: calc(var(--space-3) * var(--density));
}
.gap-md {
  gap: calc(var(--space-4) * var(--density));
}
.gap-lg {
  gap: calc(var(--space-6) * var(--density));
}
```

---

## 5) Componentes — Web vs ERP (densidade e uso de cor)

> A estrutura visual é a mesma. O que muda: **espaços, contrastes e foco**.

### 5.1 Botões

```css
.btn {
  border-radius: var(--radius-md);
  font-weight: var(--weight-medium);
  transition: 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.btn:focus-visible {
  box-shadow: var(--ring-focus);
  outline: none;
}

/* Primário */
.btn-primary {
  background: linear-gradient(
    90deg,
    hsl(var(--primary)),
    hsl(var(--secondary))
  );
  color: white;
  padding: calc(var(--space-3) * var(--density))
    calc(var(--space-5) * var(--density));
}
.btn-primary:hover {
  filter: brightness(1.05);
  box-shadow: var(--shadow-md);
}

/* Secundário */
.btn-secondary {
  background: hsl(var(--surface));
  color: hsl(var(--text-1));
  border: 1px solid hsl(var(--border));
  padding: calc(var(--space-3) * var(--density))
    calc(var(--space-5) * var(--density));
}
.btn-secondary:hover {
  color: hsl(var(--primary));
  border-color: hsl(var(--primary));
}

/* Sutil / Ghost */
.btn-ghost {
  background: transparent;
  color: hsl(var(--text-2));
}
.btn-ghost:hover {
  background: hsl(var(--overlay));
  color: hsl(var(--text-1));
}

/* Densidade ERP (compact) */
[data-profile="erp"] .btn {
  gap: 6px;
}
```

### 5.2 Inputs, Labels, Textarea

```css
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.label {
  font-size: var(--text-sm);
  color: hsl(var(--text-2));
}
.input,
.textarea,
.select {
  background: hsl(var(--elevated));
  color: hsl(var(--text-1));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-sm);
  padding: calc(var(--space-3) * var(--density));
}
.input:focus,
.textarea:focus,
.select:focus {
  box-shadow: var(--ring);
  outline: none;
  border-color: hsl(var(--primary));
}
.textarea {
  min-height: 120px;
  resize: vertical;
}
.helper {
  font-size: var(--text-xs);
  color: hsl(var(--text-3));
}
.error {
  color: hsl(var(--danger));
}
```

### 5.3 Tooltip e Popover

```css
.tooltip {
  background: hsl(var(--elevated));
  color: hsl(var(--text-1));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-sm);
  padding: 6px 8px;
  font-size: var(--text-xs);
}
```

### 5.4 Cards

```css
.card {
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-lg);
  padding: calc(var(--space-5) * var(--density));
  box-shadow: var(--shadow-sm);
  transition: 0.2s;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: calc(var(--space-4) * var(--density));
}
.card-title {
  font-size: var(--text-lg);
  color: hsl(var(--text-1));
  font-weight: var(--weight-semibold);
}
.card-subtitle {
  color: hsl(var(--text-3));
  font-size: var(--text-sm);
}
```

### 5.5 Tabelas (Table)

```css
.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.thead th {
  text-align: left;
  font-size: var(--text-sm);
  color: hsl(var(--text-2));
  background: hsl(var(--elevated));
  padding: calc(var(--space-3) * var(--density))
    calc(var(--space-4) * var(--density));
}
.tbody td {
  padding: calc(var(--space-3) * var(--density))
    calc(var(--space-4) * var(--density));
  border-top: 1px solid hsl(var(--border));
  color: hsl(var(--text-2));
}
.trow:hover td {
  background: hsl(var(--overlay));
}
.trow.selected td {
  background: hsl(var(--primary) / 0.08);
}

/* Densidade ERP */
[data-profile="erp"] .thead th,
[data-profile="erp"] .tbody td {
  padding-block: calc(var(--space-2) * var(--density));
}
```

### 5.6 Navbar / Sidebar

```css
.navbar {
  background: hsl(var(--bg));
  border-bottom: 1px solid hsl(var(--border));
  height: 64px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding-inline: calc(var(--space-5) * var(--density));
}
.sidebar {
  width: 280px;
  background: hsl(var(--bg));
  border-right: 1px solid hsl(var(--border));
  padding: calc(var(--space-4) * var(--density));
}
.sidebar-link {
  display: flex;
  align-items: center;
  gap: 10px;
  color: hsl(var(--text-2));
  padding: 10px 12px;
  border-radius: var(--radius-sm);
}
.sidebar-link:hover {
  background: hsl(var(--elevated));
  color: hsl(var(--primary));
}
.sidebar-link.active {
  color: hsl(var(--primary));
  border-left: 2px solid hsl(var(--primary));
  background: hsl(var(--elevated));
}

/* ERP compacto */
[data-profile="erp"] .sidebar {
  width: 248px;
}
[data-profile="erp"] .navbar {
  height: 56px;
}
```

### 5.7 Modais e Diálogos

```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: hsl(0 0% 0% / 0.4);
  backdrop-filter: blur(2px);
}
.modal {
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-lg);
  width: min(720px, 92vw);
  margin: 10vh auto;
  padding: calc(var(--space-6) * var(--density));
  box-shadow: var(--shadow-lg);
}
```

### 5.8 Notificações / Toasts

```css
.toast {
  display: flex;
  gap: 10px;
  align-items: center;
  border-radius: var(--radius-md);
  padding: 10px 14px;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--elevated));
}
.toast.success {
  border-color: hsl(var(--success));
  background: hsl(var(--success) / 0.1);
  color: hsl(var(--success));
}
.toast.warning {
  border-color: hsl(var(--warning));
  background: hsl(var(--warning) / 0.1);
  color: hsl(var(--warning));
}
.toast.danger {
  border-color: hsl(var(--danger));
  background: hsl(var(--danger) / 0.1);
  color: hsl(var(--danger));
}
```

### 5.9 Gráficos (Recharts/ECharts)

- Fundo do canvas: `background: hsl(var(--surface))`.
- Paleta de séries: `hsl(var(--chart-1))`, `hsl(var(--chart-2))`, ...
- Grades/axes: `stroke: hsl(var(--border))`.
- Labels: `fill: hsl(var(--text-3))`.

---

## 6) Acessibilidade e Motion

```css
:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- Contraste mínimo 4.5:1 para textos.
- Cursor coloca `aria-` e `role` automaticamente nos componentes ShadCN.

---

## 7) Perfis de Uso (Web vs ERP)

### Profile: `web`

- Densidade: `--density: 1` (arejado).
- Títulos maiores (`heading-1/2`), hero com gradiente e CTA com `.btn-primary`.
- Cards com sombras mais perceptíveis (`--shadow-md`).

### Profile: `erp`

- Densidade: `--density: 0.85` (compacto para produtividade).
- Tabelas compactas, navbar mais baixa, sidebar reduzida.
- Menos sombras (foco em legibilidade e velocidade visual), mais bordas.

Para alternar: `<html data-profile="erp">` ou `<html data-profile="web">`.

---

## 8) Padrões de Layout Comuns

- **Form 2 colunas** (desktop): `.grid-auto grid-2`
- **Form 1 coluna** (mobile): responsivo nativo (< 640px)
- **Dashboard**: `grid-3` (cards) → responsivo para `grid-2`/`grid-1`
- **Detalhe de registro**: Sidebar fixa + conteúdo com `.container`

---

## 9) Boas Práticas de Cor

1. Cor viva **apenas** para ações e estados (não para blocos de texto extensos).
2. Máximo de **2 cores vibrantes simultâneas**.
3. Evite texto branco puro sobre fundo vibrante; use `hsl(var(--text-1))` (95%).
4. Fundos: `--surface` / `--elevated`; bordas com `--border`.

---

## 10) Integração com ShadCN UI

- `Button`: adicione classes `.btn` + `.btn-primary|secondary|ghost`.
- `Input/Textarea/Select`: aplicar `.input` e `.textarea` com tokens.
- `Card`: `Card` + `.card` + `CardHeader` com `.card-header`.
- `Table`: usar classes de `.table`, `.thead`, `.tbody`, `.trow`.
- `Dialog`, `Popover`, `Tooltip`: aplicar cores de `--surface`, `--border`, `--text-*`.

---

## 11) Exemplo de Uso (React/Next)

```tsx
<html lang="pt-BR" data-theme="dark" data-profile="erp">
  {" "}
  {/* troca para light/web conforme necessidade */}
  <body>
    <nav className="navbar">
      <button className="btn btn-secondary">Voltar</button>
      <button className="btn btn-primary">Salvar</button>
    </nav>

    <aside className="sidebar">
      <a className="sidebar-link active">Dashboard</a>
      <a className="sidebar-link">Cadastros</a>
    </aside>

    <main className="container grid-auto grid-3 pad-lg">
      <section className="card">
        <header className="card-header">
          <h3 className="card-title">Vendas</h3>
          <span className="card-subtitle">Hoje</span>
        </header>
        {/* Chart aqui com paleta chart-* */}
      </section>
    </main>
  </body>
</html>
```

---

## 12) Checklist de Migração (Cyberpunk ➜ Clean Vibrant)

- [ ] Substituir todas as cores hardcoded por `hsl(var(--...))`.
- [ ] Remover neon puro e glows agressivos; usar sombras `--shadow-*`.
- [ ] Garantir tokens `--text-*` em todos os textos e ícones.
- [ ] Atribuir `data-profile` por página (landing = `web`, admin = `erp`).
- [ ] Validar contraste (WCAG) e estados `:focus-visible`.

---

## 13) Resultado

- **Um único documento** rege todo o tema: dark/light + web/erp.
- Troca de **cores** via `data-theme` (escopo inteiro) e ajuste de **densidade** via `data-profile`.
- Base sólida para escalabilidade, legibilidade e identidade premium.

---

# 14) BLUEPRINT ERP THEME — **Perfil especializado (compacto, produtivo)**

> Paleta corporativa com base **azul quase escuro**, acentos **esverdeados** (sucesso/ativo) e **laranja** (atenção/CTA secundária). Foco em densidade, contraste e legibilidade de alto volume.

## 14.1 Paleta e Tokens (Tailwind v4 `@theme`)

Crie `./styles/themes/blueprint-erp.css` e importe após o tema principal.

```css
@theme {
  /* =====================
   * BLUEPRINT ERP — DARK
   * ===================== */
  [data-theme="dark"][data-profile="erp"] {
    /* Neutros / superfícies */
    --bg: 220 35% 10%; /* Azul carvão */
    --surface: 222 28% 13%; /* Azul grafite */
    --elevated: 222 24% 17%; /* Painéis */
    --overlay: 0 0% 100% / 0.04;
    --border: 0 0% 100% / 0.07;

    /* Texto */
    --text-1: 0 0% 96%;
    --text-2: 0 0% 78%;
    --text-3: 0 0% 58%;

    /* Semânticas (vivas, porém elegantes) */
    --primary: 220 92% 56%; /* Azul vivo controlado */
    --accent: 168 72% 48%; /* Verde/água (ativo/sync) */
    --highlight: 28 96% 55%; /* Laranja (atenção/CTA alt) */

    /* Estados */
    --success: 153 64% 46%; /* Verde */
    --warning: 36 96% 56%; /* Âmbar/laranja */
    --danger: 355 84% 58%; /* Carmim */
    --info: 200 92% 56%; /* Ciano técnico */

    /* Cores para gráficos */
    --chart-1: 220 92% 56%;
    --chart-2: 168 72% 48%;
    --chart-3: 28 96% 55%;
    --chart-4: 276 70% 62%;
    --chart-5: 12 86% 60%;

    /* Gradiente discreto */
    --bg-gradient: linear-gradient(
      135deg,
      hsl(219 35% 9%) 0%,
      hsl(223 28% 12%) 45%,
      hsl(226 24% 16%) 100%
    );

    /* Densidade ERP */
    --density: 0.85;
  }

  /* =====================
   * BLUEPRINT ERP — LIGHT
   * ===================== */
  [data-theme="light"][data-profile="erp"] {
    --bg: 210 20% 98%;
    --surface: 210 25% 100%;
    --elevated: 210 20% 96%;
    --overlay: 0 0% 0% / 0.02;
    --border: 220 20% 20% / 0.12;

    --text-1: 220 30% 12%;
    --text-2: 220 20% 32%;
    --text-3: 220 10% 48%;

    --primary: 220 90% 52%;
    --accent: 168 70% 40%;
    --highlight: 28 92% 50%;

    --success: 153 60% 40%;
    --warning: 36 96% 48%;
    --danger: 355 80% 46%;
    --info: 200 88% 48%;

    --chart-1: 220 90% 52%;
    --chart-2: 168 70% 40%;
    --chart-3: 28 92% 50%;
    --chart-4: 276 65% 56%;
    --chart-5: 12 80% 52%;

    --bg-gradient: linear-gradient(
      135deg,
      hsl(210 25% 100%) 0%,
      hsl(210 20% 98%) 45%,
      hsl(210 18% 96%) 100%
    );

    --density: 0.85; /* mantém compacto no light também */
  }

  /* =====================
   * ESCALAS PRIMITIVAS (50–950)
   * ===================== */
  /* Azul primário */
  --blue-50: 214 92% 97%;
  --blue-100: 214 90% 92%;
  --blue-200: 216 88% 84%;
  --blue-300: 218 86% 74%;
  --blue-400: 220 84% 64%;
  --blue-500: 220 92% 56%;
  --blue-600: 220 86% 48%;
  --blue-700: 220 72% 40%;
  --blue-800: 220 58% 30%;
  --blue-900: 220 52% 22%;
  --blue-950: 220 48% 14%;

  /* Verde/água */
  --teal-50: 164 68% 97%;
  --teal-100: 164 66% 92%;
  --teal-200: 166 64% 84%;
  --teal-300: 167 60% 72%;
  --teal-400: 168 56% 60%;
  --teal-500: 168 72% 48%;
  --teal-600: 168 70% 40%;
  --teal-700: 169 64% 34%;
  --teal-800: 170 56% 28%;
  --teal-900: 170 50% 20%;
  --teal-950: 170 46% 14%;

  /* Laranja */
  --orange-50: 32 100% 97%;
  --orange-100: 32 98% 92%;
  --orange-200: 30 96% 84%;
  --orange-300: 30 94% 74%;
  --orange-400: 29 92% 64%;
  --orange-500: 28 96% 55%;
  --orange-600: 27 90% 48%;
  --orange-700: 24 86% 42%;
  --orange-800: 22 82% 34%;
  --orange-900: 20 78% 26%;
  --orange-950: 18 72% 18%;

  /* Cinzas técnicos */
  --slate-50: 220 14% 97%;
  --slate-100: 220 12% 94%;
  --slate-200: 220 10% 88%;
  --slate-300: 220 9% 78%;
  --slate-400: 220 8% 66%;
  --slate-500: 220 7% 56%;
  --slate-600: 220 9% 46%;
  --slate-700: 220 12% 36%;
  --slate-800: 220 16% 24%;
  --slate-900: 220 20% 16%;
  --slate-950: 220 24% 10%;
}
```

## 14.2 Regras de Uso (Web vs ERP)

- **ERP**: usa `data-profile="erp"` (compacto) + base **Blueprint** acima.
- **Web**: continua com o **Clean Vibrant** (arejado). Em páginas públicas, mantenha `--highlight` (laranja) apenas para CTA.
- **Atenção**: máximo de **duas cores vivas ativas por tela**.

## 14.3 Component Recipes (refinamento visual)

### Botões

- Primário: gradiente `blue-500 → blue-600`, sombra suave, borda transparente.
- Secundário: `surface` com borda `border`, hover elevando a borda para `primary`.
- Tertiário (ghost): texto `text-2` e hover `overlay`.
- Estados: `success/warning/danger` apenas quando semânticos.

### Inputs / Forms

- Fundo `elevated`, borda `border`, foco com **ring** `primary`.
- Placeholder `text-3`, labels `text-2`.
- Erro: borda `danger`, helper `danger` 85%.

### Tables

- Cabeçalho `elevated`, linhas com `border` top, hover `overlay`.
- Linha selecionada com `primary / 8%`.
- Densidade ERP: reduzir padding vertical 15%.

### Cards

- Radius `lg`, sombra `sm`, hover `md`.
- Header com título `text-1` e meta `text-3`.

### Navbar / Sidebar

- Navbar 56–64px; sidebar 248–280px (ERP mais estreita).
- Link ativo: left-border `primary` + texto `primary`.

### Tooltip / Popover

- Fundo `elevated`, borda `border`, fonte `xs`, opacidade 92%.

### Modais

- Backdrop `#000/40%`, modal `surface`, padding `6 × density`, sombra `lg`.

### Toasts

- Fundo `elevated`, borda semântica translúcida 30%, ícone com cor pura.

## 14.4 Motion / Easing

- Durations: 150ms (fast), 250ms (standard), 350ms (slow).
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`.
- Reduzir animações em `prefers-reduced-motion`.

## 14.5 Exemplos de Classe

```css
.btn-primary {
  background: linear-gradient(
    90deg,
    hsl(var(--blue-500)),
    hsl(var(--blue-600))
  );
  color: #fff;
  padding: calc(var(--space-3) * var(--density))
    calc(var(--space-5) * var(--density));
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}
.btn-primary:hover {
  filter: brightness(1.06);
  box-shadow: var(--shadow-md);
}

.badge-warning {
  background: hsl(var(--warning) / 0.12);
  color: hsl(var(--warning));
  border: 1px solid hsl(var(--warning) / 0.45);
  border-radius: 999px;
  padding: 2px 8px;
  font-size: var(--text-xs);
}

.table .trow.selected td {
  background: hsl(var(--primary) / 0.08);
}
```

## 14.6 Integração

1. Importe **após** o tema Clean Vibrant:

```css
@import "./styles/themes/clean-vibrant.css";
@import "./styles/themes/blueprint-erp.css";
```

2. Defina na raiz conforme o contexto:

```html
<html data-theme="dark" data-profile="erp"></html>
```

3. Mantenha componentes ShadCN aplicando somente utilitários e classes do DS.

---

**Conclusão**: O perfil **Blueprint ERP** entrega um visual **azul quase escuro** com acentos **esverdeados** e **laranja** equilibrados. É denso, legível e não cansativo — ideal para operação diária intensa. Para páginas públicas, o **Clean Vibrant (web)** mantém sofisticação e impacto controlado.

---

# === FILE: styles/globals.css ===

```css
@import "tailwindcss";
@import "./themes/clean-vibrant.css"; /* Tema base (dark/light) */
@import "./themes/blueprint-erp.css"; /* Perfil ERP especializado */
@import "./global-improvements.css"; /* Refinos globais e animações */

/*
  Defaults: ERP Dark como padrão.
  ⚠️ Não é possível setar atributos via CSS; o page.tsx garante
  data-theme="dark" e data-profile="erp" se não houver atributos.
*/

@layer base {
  :root {
    --container-w: 1200px;
    --font-sans:
      ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter,
      "Plus Jakarta Sans", "Satoshi", sans-serif;
    --font-mono:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
      monospace;

    /* radii preferidos (bordas suaves) */
    --radius-sm: 6px;
    --radius-md: 10px; /* padrão */
    --radius-lg: 14px;
    --radius-xl: 20px;
  }

  html {
    font-family: var(--font-sans);
  }

  body {
    background: var(--bg-gradient);
    color: hsl(var(--text-1));
    min-height: 100vh;
    overflow-x: hidden;
    @apply antialiased;
  }

  .container {
    width: 100%;
    max-width: var(--container-w);
    margin-inline: auto;
    padding-inline: 20px;
  }

  /* Glass discreto solicitado (cards e navbar) */
  .glass {
    background: hsl(var(--overlay));
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
}

/* Utilitários de densidade (web vs erp) */
@layer utilities {
  .pad-sm {
    padding: calc(12px * var(--density));
  }
  .pad-md {
    padding: calc(16px * var(--density));
  }
  .pad-lg {
    padding: calc(24px * var(--density));
  }
  .gap-sm {
    gap: calc(12px * var(--density));
  }
  .gap-md {
    gap: calc(16px * var(--density));
  }
  .gap-lg {
    gap: calc(24px * var(--density));
  }

  .card {
    @apply border rounded-lg;
    border-radius: var(--radius-lg);
    background: hsl(var(--surface));
    border-color: hsl(var(--border));
    box-shadow: 0 2px 8px hsl(240 10% 10% / 0.25);
    transition:
      transform 0.2s,
      box-shadow 0.2s,
      border-color 0.2s;
  }
  .card.glass {
    @apply glass;
    background: hsl(var(--overlay));
    border-color: hsl(var(--border));
  }
  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px hsl(240 10% 10% / 0.35);
  }

  .navbar {
    height: 64px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid hsl(var(--border));
    background: hsl(var(--overlay));
    @apply glass;
  }

  .sidebar {
    width: 280px;
    padding: 16px;
    border-right: 1px solid hsl(var(--border));
    background: hsl(var(--bg));
  }
  .sidebar .link {
    display: flex;
    align-items: center;
    gap: 10px;
    color: hsl(var(--text-2));
    padding: 10px 12px;
    border-radius: var(--radius-sm);
  }
  .sidebar .link:hover {
    background: hsl(var(--elevated));
    color: hsl(var(--primary));
  }
  .sidebar .link.active {
    color: hsl(var(--primary));
    border-left: 2px solid hsl(var(--primary));
    background: hsl(var(--elevated));
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    border-radius: var(--radius-md);
    transition: 0.2s;
  }
  .btn:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px hsl(var(--surface)),
      0 0 0 5px hsl(var(--primary) / 0.6);
  }

  .btn-primary {
    color: #fff;
    padding: calc(12px * var(--density)) calc(20px * var(--density));
    background: linear-gradient(
      90deg,
      hsl(var(--primary)),
      hsl(var(--secondary))
    );
  }
  .btn-primary:hover {
    filter: brightness(1.06);
    box-shadow: 0 8px 24px hsl(240 10% 10% / 0.35);
  }

  .btn-secondary {
    color: hsl(var(--text-1));
    padding: calc(12px * var(--density)) calc(20px * var(--density));
    background: hsl(var(--surface));
    border: 1px solid hsl(var(--border));
  }
  .btn-secondary:hover {
    color: hsl(var(--primary));
    border-color: hsl(var(--primary));
  }

  .btn-ghost {
    color: hsl(var(--text-2));
    padding: calc(10px * var(--density)) calc(16px * var(--density));
    background: transparent;
  }
  .btn-ghost:hover {
    background: hsl(var(--overlay));
    color: hsl(var(--text-1));
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .label {
    font-size: 14px;
    color: hsl(var(--text-2));
  }
  .input,
  .select,
  .textarea {
    border-radius: var(--radius-sm);
    background: hsl(var(--elevated));
    border: 1px solid hsl(var(--border));
    color: hsl(var(--text-1));
    padding: calc(12px * var(--density));
    transition:
      border-color 0.2s,
      box-shadow 0.2s;
  }
  .input::placeholder,
  .textarea::placeholder {
    color: hsl(var(--text-3));
  }
  .input:focus,
  .select:focus,
  .textarea:focus {
    outline: none;
    box-shadow: 0 0 0 3px hsl(var(--primary) / 0.35);
    border-color: hsl(var(--primary));
  }
  .textarea {
    min-height: 120px;
    resize: vertical;
  }

  .table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    background: hsl(var(--surface));
    border: 1px solid hsl(var(--border));
    border-radius: var(--radius-lg);
    overflow: hidden;
  }
  .thead th {
    text-align: left;
    font-size: 14px;
    color: hsl(var(--text-2));
    background: hsl(var(--elevated));
    padding: calc(12px * var(--density)) calc(16px * var(--density));
  }
  .tbody td {
    padding: calc(12px * var(--density)) calc(16px * var(--density));
    border-top: 1px solid hsl(var(--border));
    color: hsl(var(--text-2));
  }
  .trow:hover td {
    background: hsl(var(--overlay));
  }
  .trow.selected td {
    background: hsl(var(--primary) / 0.08);
  }

  /* ERP compacto */
  [data-profile="erp"] .navbar {
    height: 56px;
  }
  [data-profile="erp"] .sidebar {
    width: 248px;
  }
  [data-profile="erp"] .thead th,
  [data-profile="erp"] .tbody td {
    padding-block: calc(10px * var(--density));
  }
}
```

# === FILE: styles/global-improvements.css ===

```css
@layer base {
  /* Focus visível consistente */
  :focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px hsl(var(--surface)),
      0 0 0 5px hsl(var(--primary) / 0.6);
  }

  /* Scrollbar sutil */
  * {
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--border)) transparent;
  }
  *::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  *::-webkit-scrollbar-thumb {
    background: hsl(var(--border));
    border-radius: 8px;
  }
  *::-webkit-scrollbar-track {
    background: transparent;
  }
}

@layer utilities {
  /* Ícones animados (minimalistas) */
  @keyframes icon-float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-2px);
    }
  }
  .icon-anim {
    animation: icon-float 3s ease-in-out infinite;
  }

  /* Fundo animado suave (aurora mínima) */
  @keyframes bg-shift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
  .bg-animated {
    background-image:
      radial-gradient(
        1200px 600px at 10% 20%,
        hsl(var(--primary) / 0.08),
        transparent 60%
      ),
      radial-gradient(
        1000px 500px at 80% 10%,
        hsl(var(--accent) / 0.08),
        transparent 60%
      ),
      radial-gradient(
        800px 400px at 50% 90%,
        hsl(var(--highlight, var(--secondary)) / 0.08),
        transparent 60%
      );
    background-repeat: no-repeat;
    background-size: 200% 200%;
    animation: bg-shift 24s ease-in-out infinite;
  }

  /* Transições globais suaves */
  .smooth {
    transition: all 0.2s ease;
  }
}

/* Redução de movimento para acessibilidade */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

# === FILE: app/blueprint/page.tsx ===

```tsx
"use client";
import React, { useEffect, useState } from "react";
import {
  Activity,
  Settings2,
  Sparkles,
  Sun,
  Moon,
  Cpu,
  LayoutGrid,
} from "lucide-react";

export default function BlueprintPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [profile, setProfile] = useState<"erp" | "web">("erp");

  // Garante defaults (ERP dark) se nada estiver definido externamente
  useEffect(() => {
    const html = document.documentElement;
    if (!html.getAttribute("data-theme"))
      html.setAttribute("data-theme", theme);
    if (!html.getAttribute("data-profile"))
      html.setAttribute("data-profile", profile);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  useEffect(() => {
    document.documentElement.setAttribute("data-profile", profile);
  }, [profile]);

  return (
    <main className="container pad-lg gap-lg grid-auto grid-3 bg-animated">
      {/* Header / Controls */}
      <section className="card glass" style={{ gridColumn: "1 / -1" }}>
        <div className="card-header">
          <h1 className="heading-2 flex items-center gap-2">
            <Sparkles className="icon-anim" /> Blueprint • Design System (Clean
            Vibrant + Blueprint ERP)
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-md">
          <div className="flex items-center gap-sm">
            <span className="muted">Tema</span>
            <button
              className="btn btn-secondary"
              onClick={() => setTheme("dark")}
            >
              <Moon size={16} /> Dark
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setTheme("light")}
            >
              <Sun size={16} /> Light
            </button>
          </div>
          <div className="flex items-center gap-sm">
            <span className="muted">Perfil</span>
            <button
              className="btn btn-secondary"
              onClick={() => setProfile("erp")}
            >
              <Cpu size={16} /> ERP (compacto)
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setProfile("web")}
            >
              <LayoutGrid size={16} /> Web (arejado)
            </button>
          </div>
        </div>
      </section>

      {/* Navbar de exemplo (glass) */}
      <nav className="navbar card glass" style={{ gridColumn: "1 / -1" }}>
        <button className="btn btn-secondary">
          <Settings2 size={16} className="icon-anim" />
          Preferências
        </button>
        <button className="btn btn-primary">
          <Activity size={16} /> Ação Primária
        </button>
      </nav>

      {/* Botões */}
      <section className="card glass">
        <h3 className="card-title">Botões</h3>
        <div className="flex flex-wrap gap-md">
          <button className="btn btn-primary">Salvar</button>
          <button className="btn btn-secondary">Cancelar</button>
          <button className="btn btn-ghost">Ver Detalhes</button>
          <button className="btn btn-primary">
            <Sparkles size={16} /> CTA
          </button>
        </div>
      </section>

      {/* Inputs */}
      <section className="card glass">
        <h3 className="card-title">Form Controls</h3>
        <div className="grid-auto grid-2 gap-md">
          <div className="field">
            <label className="label">Nome</label>
            <input className="input" placeholder="Digite seu nome" />
          </div>
          <div className="field">
            <label className="label">Categoria</label>
            <select className="select">
              <option>Selecione…</option>
              <option>Financeiro</option>
              <option>Produção</option>
            </select>
          </div>
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label className="label">Descrição</label>
            <textarea className="textarea" placeholder="Detalhe aqui…" />
          </div>
        </div>
      </section>

      {/* Cards + Glass */}
      <section className="card glass">
        <h3 className="card-title">Cards</h3>
        <p className="body muted">
          Bordas suaves (radius-md) + glass discreto para profundidade e
          conforto visual.
        </p>
      </section>

      {/* Tabela */}
      <section className="card glass" style={{ gridColumn: "1 / -1" }}>
        <h3 className="card-title">Tabela</h3>
        <table className="table">
          <thead className="thead">
            <tr>
              <th>Produto</th>
              <th>Preço</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody className="tbody">
            <tr className="trow">
              <td>Camisa Azul</td>
              <td>R$ 79,90</td>
              <td>Ativo</td>
            </tr>
            <tr className="trow selected">
              <td>Calça Jeans</td>
              <td>R$ 129,90</td>
              <td>Em falta</td>
            </tr>
            <tr className="trow">
              <td>Vestido Preto</td>
              <td>R$ 199,90</td>
              <td>Ativo</td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  );
}
```
