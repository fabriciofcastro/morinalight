Perfeito, Fabrício.
Abaixo está o **arquivo completo `Design System Enhancement Guide.md`**, cuidadosamente elaborado para refletir sua visão: **AlphaSysCore by Morina** — uma aplicação modular, sofisticada e personalizável, com UX futurista, emocional e tecnicamente impecável.
Pronto para o Cursor executar linha por linha.

---

# **Design System Enhancement Guide — AlphaSysCore by Morina**

## 🧭 Visão e Propósito

O **AlphaSysCore** é uma aplicação inteligente desenvolvida pela **Morina**, com o propósito de integrar moda, tecnologia e experiência.
**Não é um ERP.** É uma plataforma modular e sensorial, onde cada detalhe visual e funcional é construído para simplificar processos e elevar o padrão estético do ambiente corporativo.

> “Cada interação deve ser elegante, eficiente e inspiradora — a moda encontra o software.”

---

## 🎨 Conceito Central — _Fashion Futurista Translúcido_

O design deve transmitir:

- **Modernidade feminina** (leveza, movimento, brilho)
- **Tecnologia emocional** (translucidez, animação, fluidez)
- **Estabilidade corporativa** (consistência, tipografia clara, usabilidade prática)

**Tema duplo (Light/Dark):**

- **Light:** base branca com toques sutis de rosa pastel e vidro translúcido.
- **Dark:** azul-royal translúcido como primário, vidro animado sobre fundo escuro, efeitos luminosos sutis.

**Efeito global:**
Transição translúcida em movimento suave da esquerda para a direita, repetida em intervalos aleatórios (usando Framer Motion ou CSS keyframes).

---

## ⚙️ Arquitetura Visual e Técnica

### **1. Fundamentos Visuais**

#### Cores base

```css
:root {
  --primary: #2855ff; /* Azul-royal translúcido */
  --primary-contrast: #ffffff;
  --accent: #ff80b0; /* Rosa elegante para highlights */
  --neutral: #fafafa;
  --surface: rgba(255, 255, 255, 0.12);
  --glass: rgba(255, 255, 255, 0.15);
  --shadow-soft: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-medium: 0 4px 12px rgba(0, 0, 0, 0.1);
  --transition-base: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
```

#### Tipografia

- **Primária:** `DM Sans` — para títulos e botões.
- **Secundária:** `Inter` — para textos e formulários.
- **Peso e contraste:** equilíbrio entre leveza estética e clareza funcional.

---

### **2. Tema Light / Dark**

#### Light Mode

- Fundo branco suave (`#FAFAFA`)
- Sombra e profundidade com `backdrop-filter: blur(12px)`
- Interações com bordas claras e microanimações.

#### Dark Mode

- Fundo azul-escuro translúcido (`rgba(20,30,60,0.9)`)
- Realce de elementos com **azul-royal brilhante** e reflexos de vidro.
- Linhas de interface com efeito de _neon desbotado_.

> O usuário deve sentir o contraste como um “ambiente de trabalho noturno”, elegante e tecnológico.

---

### **3. Efeitos Translúcidos Animados**

#### Animação global

```css
@keyframes translucentSweep {
  0% {
    opacity: 0;
    transform: translateX(-10%);
  }
  50% {
    opacity: 0.6;
    transform: translateX(0);
  }
  100% {
    opacity: 0;
    transform: translateX(10%);
  }
}

.glass-motion {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.15),
    rgba(255, 255, 255, 0.08)
  );
  animation: translucentSweep 12s ease-in-out infinite alternate;
}
```

**Aplicar:**

- Camada global no `layout.tsx`
- Usar `mix-blend-mode: overlay;`
- Controlar intensidade conforme modo do tema.

---

## 🧱 Tela de Login — Experiência Cinematográfica

### **Estrutura**

- **Background:** vídeo de 5s em loop do _Vimeo_ (moda + tecnologia).
- **Overlay:** camada translúcida animada (`.glass-motion`).
- **Formulário:** centralizado, flutuante, efeito vidro.

```tsx
<div className="relative h-screen w-screen overflow-hidden">
  <video
    src="https://player.vimeo.com/video/123456789"
    autoPlay
    loop
    muted
    className="absolute inset-0 w-full h-full object-cover"
  />
  <div className="absolute inset-0 glass-motion"></div>
  <div className="relative z-10 flex flex-col items-center justify-center">
    <LoginForm />
  </div>
</div>
```

### **Comportamentos**

- **Responsivo total:** alterna entre layout vertical e colapsado com `toggle lateral`.
- **Transição de tema automática:** segue preferências do sistema.
- **Animação de entrada:** `fade-up + glass-appear` via `tw-animate-css`.

---

## 🧩 Personalização Visual Avançada (Configurações da Empresa)

### **Seção “Identidade Visual”**

Permite às empresas:

- Enviar **logo** (SVG ou PNG transparente)
- Definir **paleta de cores primária/secundária**
- Escolher **modo padrão (light/dark)**
- Inserir **vídeo institucional** (link Vimeo/YouTube)

#### Campos sugeridos:

| Campo            | Tipo         | Descrição                   |
| ---------------- | ------------ | --------------------------- |
| `logoUrl`        | upload       | Logo da empresa             |
| `primaryColor`   | color picker | Cor principal               |
| `secondaryColor` | color picker | Cor secundária              |
| `themeMode`      | select       | Light / Dark / Automático   |
| `videoLink`      | text         | Link de vídeo institucional |

#### Funcionamento técnico:

- Salvar no banco (via Prisma) em `company_settings`.
- Aplicar via `CSS custom properties` em tempo real:

  ```ts
  document.documentElement.style.setProperty("--primary", primaryColor);
  ```

- Persistência com `localStorage` e fallback global padrão Morina.

---

## 🧠 UX & Navegação Inteligente

1. **Sidebar adaptativa**
   - Colapsa automaticamente em telas pequenas.
   - Ícones com tooltips (Lucide).
   - Fundo translúcido animado com interação hover.

2. **Microinterações**
   - Feedbacks visuais em cada clique e envio de formulário.
   - Botões com leve escala e brilho ao pressionar.
   - Uso de `Framer Motion` para suavidade.

3. **Transições**
   - Entre rotas: _blur motion_ lateral.
   - Entre temas: _fade cross dissolve_.

4. **Acessibilidade**
   - Contraste mínimo: 4.5:1
   - Navegação por teclado em todos os componentes.

---

## 🧩 Diretrizes de Naming e Branding

| Elemento               | Regra                                                   |
| ---------------------- | ------------------------------------------------------- |
| Uso do termo “ERP”     | ❌ **Proibido em qualquer contexto visual ou técnico.** |
| Nome institucional     | **AlphaSysCore by Morina**                              |
| Referência corporativa | “Desenvolvido por Morina”                               |
| Módulos e apps         | Devem ser chamados de “Soluções” ou “Ambientes”         |

> Exemplo: “Ambiente Financeiro Morina”, “Solução de Produção AlphaSysCore”.

---

## 🧠 Apêndice Técnico

### **Bibliotecas Principais**

- **TailwindCSS v4**
- **Framer Motion** (animações contextuais)
- **Lucide React** (ícones)
- **React Hook Form + Zod** (validação)
- **tw-animate-css** (transições pré-configuradas)

### **Boilerplate recomendados**

- `theme.config.ts` → define tokens globais.
- `useThemeEngine.ts` → hook para alternar e persistir tema.
- `motion.config.ts` → presets para animações.
- `PersonalizationPanel.tsx` → componente de interface nas configurações.

---

## 🚀 Conclusão

O **AlphaSysCore by Morina** redefine o conceito de UX corporativa:
**não é um sistema de gestão, é uma experiência de identidade e fluidez.**
Cada detalhe visual e interação deve transmitir _sofisticação funcional_.

> “Enquanto outros constroem sistemas, a Morina cria experiências.”

---

Deseja que eu gere uma versão complementar chamada
`theme.config.template.ts` — com os **tokens e presets já prontos** para o Cursor importar no projeto?
Ela servirá como base de implementação imediata.

// ===========================================
// AlphaSysCore by Morina
// Theme Configuration Template
// ===========================================
// Este arquivo define os tokens e presets do design system.
// Ele serve como base para o sistema de personalização visual avançada.
// ===========================================

export const themeConfig = {
meta: {
brand: "Morina",
project: "AlphaSysCore",
version: "1.0.0",
allowERPKeyword: false, // impede o uso do termo "ERP"
description:
"Design System translúcido e dinâmico da Morina para o AlphaSysCore.",
},

// =======================================================
// CORE TOKENS
// =======================================================
tokens: {
colors: {
primary: "#2855FF", // Azul-royal translúcido
primaryContrast: "#FFFFFF",
accent: "#FF80B0", // Rosa elegante
secondary: "#9C27B0",
backgroundLight: "#FAFAFA",
backgroundDark: "rgba(20,30,60,0.9)",
glassLight: "rgba(255,255,255,0.15)",
glassDark: "rgba(255,255,255,0.08)",
border: "rgba(255,255,255,0.18)",
shadowSoft: "0 2px 8px rgba(0,0,0,0.06)",
shadowMedium: "0 4px 12px rgba(0,0,0,0.10)",
text: "#1C1C1C",
},

    typography: {
      fontPrimary: '"DM Sans", sans-serif',
      fontSecondary: '"Inter", sans-serif',
      sizeBase: "16px",
      lineHeightBase: "1.6",
      headingWeight: 600,
      bodyWeight: 400,
    },

    radii: {
      sm: "6px",
      md: "10px",
      lg: "16px",
      xl: "24px",
    },

    transitions: {
      fast: "0.2s ease-in-out",
      base: "0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      slow: "0.8s ease-in-out",
    },

    effects: {
      blur: "blur(12px)",
      glassLight:
        "backdrop-filter: blur(12px) saturate(180%); background: rgba(255,255,255,0.15);",
      glassDark:
        "backdrop-filter: blur(16px) saturate(160%); background: rgba(255,255,255,0.08);",
    },

},

// =======================================================
// THEMES
// =======================================================
themes: {
light: {
background: "#FAFAFA",
text: "#1C1C1C",
glass: "rgba(255,255,255,0.15)",
motionColor: "rgba(255,255,255,0.08)",
accentGlow: "rgba(255,255,255,0.25)",
},
dark: {
background: "rgba(20,30,60,0.9)",
text: "#FFFFFF",
glass: "rgba(255,255,255,0.08)",
motionColor: "rgba(40,85,255,0.2)",
accentGlow: "rgba(40,85,255,0.35)",
},
},

// =======================================================
// ANIMAÇÕES GLOBAIS (Translúcidas e Cinemáticas)
// =======================================================
animations: {
translucentSweep: {
keyframes: `         @keyframes translucentSweep {
          0% { opacity: 0; transform: translateX(-10%); }
          50% { opacity: 0.6; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(10%); }
        }
      `,
css: `         animation: translucentSweep 12s ease-in-out infinite alternate;
        background: linear-gradient(
          90deg,
          rgba(255,255,255,0.08),
          rgba(255,255,255,0.15),
          rgba(255,255,255,0.08)
        );
      `,
},
},

// =======================================================
// PERSONALIZAÇÃO AVANÇADA (Configurações de Empresa)
// =======================================================
personalization: {
allowLogoUpload: true,
allowColorOverride: true,
allowVideoLink: true, // Vimeo / YouTube
fields: {
logoUrl: {
type: "upload",
label: "Logo da Empresa",
},
primaryColor: {
type: "color",
label: "Cor Primária",
},
secondaryColor: {
type: "color",
label: "Cor Secundária",
},
themeMode: {
type: "select",
options: ["light", "dark", "auto"],
label: "Modo de Tema",
},
videoLink: {
type: "text",
label: "Vídeo Institucional (Vimeo/YouTube)",
},
},
},

// =======================================================
// ESTRATÉGIA DE IMPLEMENTAÇÃO
// =======================================================
implementation: {
persistence: {
storage: "localStorage",
key: "morina-theme",
},
cssInjection: {
method: "customProperties",
apply: `         document.documentElement.style.setProperty('--primary', config.primaryColor);
        document.documentElement.style.setProperty('--secondary', config.secondaryColor);
      `,
},
motion: {
engine: "framer-motion",
basePresets: {
fadeInUp: { opacity: 0, y: 10 },
visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
},
},
},
};

🧩 Como usar no projeto

Criar o arquivo src/config/theme.config.ts

Importar no layout.tsx:

import { themeConfig } from "@/config/theme.config";

Injetar variáveis CSS com base no tema ativo.

Utilizar as chaves themeConfig.tokens.colors e themeConfig.animations.translucentSweep.css no Tailwind via @layer base.

Ativar a personalização no painel de Configuração da Empresa.

🚀 Resultado Esperado

Transições translúcidas com movimento lateral contínuo.

Tema light/dark suave com brilho vítreo.

Personalização corporativa em tempo real.

Design elegante, responsivo e emocional.

UX inovadora e minimalista — assinatura Morina.

Abaixo está o arquivo **`useThemeEngine.ts`** — o _hook React_ oficial da **Morina**, projetado para o **AlphaSysCore**.
Ele aplica o tema (light/dark), injeta as cores e efeitos translúcidos definidos no `theme.config.template.ts`, e gerencia a personalização dinâmica (logo, vídeo, cores) em tempo real.

---

```ts
// ============================================================
// useThemeEngine.ts
// Morina | AlphaSysCore
// ============================================================
// Hook de controle dinâmico do tema visual.
// Responsável por aplicar cores, modo dark/light,
// vídeo institucional e personalização corporativa.
// ============================================================

import { useEffect, useState } from "react";
import { themeConfig } from "@/config/theme.config";

export type ThemeMode = "light" | "dark" | "auto";

interface CompanyThemeSettings {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  themeMode?: ThemeMode;
  videoLink?: string;
}

const STORAGE_KEY = themeConfig.implementation.persistence.key;

export function useThemeEngine() {
  const [theme, setTheme] = useState<ThemeMode>("auto");
  const [companyTheme, setCompanyTheme] = useState<CompanyThemeSettings>({});
  const [mounted, setMounted] = useState(false);

  // ============================================================
  // Aplicar variáveis CSS conforme o tema e personalização
  // ============================================================
  const applyThemeVariables = (
    mode: ThemeMode,
    custom?: CompanyThemeSettings,
  ) => {
    const root = document.documentElement;
    const tokens = themeConfig.tokens.colors;
    const selectedTheme =
      themeConfig.themes[mode === "dark" ? "dark" : "light"];

    // Cores padrão do tema
    root.style.setProperty("--primary", custom?.primaryColor || tokens.primary);
    root.style.setProperty(
      "--secondary",
      custom?.secondaryColor || tokens.secondary,
    );
    root.style.setProperty("--background", selectedTheme.background);
    root.style.setProperty("--text", selectedTheme.text);
    root.style.setProperty("--glass", selectedTheme.glass);
    root.style.setProperty("--motion-color", selectedTheme.motionColor);

    // Aplicar variações translúcidas animadas
    const glassMotion = document.querySelector(".glass-motion") as HTMLElement;
    if (glassMotion) {
      glassMotion.style.background = selectedTheme.motionColor;
      glassMotion.style.animation =
        "translucentSweep 12s ease-in-out infinite alternate";
      glassMotion.style.mixBlendMode = "overlay";
    }

    // Persistência local
    const payload = { themeMode: mode, ...custom };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  };

  // ============================================================
  // Carregar preferências ao iniciar
  // ============================================================
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as CompanyThemeSettings;
      setCompanyTheme(parsed);
      setTheme(parsed.themeMode || "auto");
      applyThemeVariables(parsed.themeMode || "auto", parsed);
    } else {
      // Tema automático baseado no sistema
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      const systemMode: ThemeMode = prefersDark ? "dark" : "light";
      setTheme(systemMode);
      applyThemeVariables(systemMode);
    }
    setMounted(true);
  }, []);

  // ============================================================
  // Alternar tema manualmente
  // ============================================================
  const toggleTheme = () => {
    const newMode: ThemeMode = theme === "light" ? "dark" : "light";
    setTheme(newMode);
    applyThemeVariables(newMode, companyTheme);
  };

  // ============================================================
  // Atualizar tema corporativo (quando empresa personaliza)
  // ============================================================
  const updateCompanyTheme = (settings: CompanyThemeSettings) => {
    setCompanyTheme(settings);
    applyThemeVariables(settings.themeMode || theme, settings);
  };

  // ============================================================
  // Retornar vídeo institucional (Vimeo / YouTube)
  // ============================================================
  const getCompanyVideo = () => {
    const link = companyTheme.videoLink;
    if (!link) return null;
    if (link.includes("youtube")) {
      const id = link.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}`;
    }
    if (link.includes("vimeo")) {
      const id = link.split("/").pop();
      return `https://player.vimeo.com/video/${id}?autoplay=1&muted=1&loop=1`;
    }
    return null;
  };

  return {
    mounted,
    theme,
    companyTheme,
    toggleTheme,
    updateCompanyTheme,
    getCompanyVideo,
  };
}
```

---

## 🧠 Como Integrar

### **1️⃣ Importar o hook**

```tsx
import { useThemeEngine } from "@/hooks/useThemeEngine";
```

### **2️⃣ Aplicar no layout principal**

```tsx
const Layout = ({ children }: { children: React.ReactNode }) => {
  const { mounted, theme, toggleTheme, getCompanyVideo } = useThemeEngine();
  if (!mounted) return null;

  const videoSrc = getCompanyVideo();

  return (
    <div className={`relative h-screen ${theme}`}>
      {videoSrc && (
        <iframe
          src={videoSrc}
          className="absolute inset-0 w-full h-full object-cover"
          allow="autoplay; muted"
        />
      )}
      <div className="absolute inset-0 glass-motion" />
      <main className="relative z-10">{children}</main>
      <button
        onClick={toggleTheme}
        className="fixed bottom-4 right-4 bg-primary text-white p-2 rounded-md shadow-md"
      >
        Alternar Tema
      </button>
    </div>
  );
};
```

---

## ⚙️ Recursos do Hook

| Função                         | Descrição                                           |
| ------------------------------ | --------------------------------------------------- |
| `toggleTheme()`                | Alterna manualmente entre Light/Dark                |
| `updateCompanyTheme(settings)` | Aplica personalização avançada (logo, cores, vídeo) |
| `getCompanyVideo()`            | Retorna link formatado de Vimeo/YouTube             |
| `mounted`                      | Controla renderização segura (SSR hydration fix)    |
| `companyTheme`                 | Armazena configurações da empresa                   |

---

## 🚀 Benefícios

- **Tema dinâmico corporativo**: cada empresa pode ter sua própria identidade visual.
- **Persistência automática**: salva localmente e reaplica no reload.
- **Vídeo institucional imersivo**: integrado ao design system.
- **Efeitos translúcidos em tempo real**: ativados por animações suaves.
- **Integração total com Tailwind e Framer Motion.**

---

Excelente, Fabrício.
A seguir está o componente completo **`PersonalizationPanel.tsx`** — o painel oficial de **Personalização Visual Avançada da Morina**, feito para o **AlphaSysCore**.

Esse painel é totalmente integrável ao `useThemeEngine.ts`, aplicando alterações **em tempo real** (logo, cores, tema e vídeo) diretamente na interface.
Ele representa o padrão visual definitivo da Morina: moderno, elegante e funcional — sem o termo “ERP”.

---

```tsx
// ============================================================
// PersonalizationPanel.tsx
// Morina | AlphaSysCore
// ============================================================
// Painel de Personalização Visual Avançada
// Permite que a empresa configure:
// - Logo
// - Cores primária/secundária
// - Modo de tema (light/dark/auto)
// - Vídeo institucional (Vimeo/YouTube)
// ============================================================

"use client";

import { useState } from "react";
import { useThemeEngine } from "@/hooks/useThemeEngine";
import Image from "next/image";

export default function PersonalizationPanel() {
  const { updateCompanyTheme, companyTheme, theme } = useThemeEngine();

  const [settings, setSettings] = useState({
    logoUrl: companyTheme.logoUrl || "",
    primaryColor: companyTheme.primaryColor || "#2855FF",
    secondaryColor: companyTheme.secondaryColor || "#9C27B0",
    themeMode: companyTheme.themeMode || theme || "auto",
    videoLink: companyTheme.videoLink || "",
  });

  // ============================================================
  // Atualiza estado e aplica instantaneamente
  // ============================================================
  const handleChange = (field: string, value: string) => {
    const newSettings = { ...settings, [field]: value };
    setSettings(newSettings);
    updateCompanyTheme(newSettings);
  };

  // ============================================================
  // Upload de Logo (Preview local)
  // ============================================================
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const logoUrl = e.target?.result as string;
      handleChange("logoUrl", logoUrl);
    };
    reader.readAsDataURL(file);
  };

  // ============================================================
  // Layout Visual
  // ============================================================
  return (
    <div
      className={`w-full max-w-2xl mx-auto rounded-xl shadow-md border border-border bg-glass/40 backdrop-blur-xl p-6 mt-6 transition-all duration-500 ${
        theme === "dark"
          ? "bg-[rgba(255,255,255,0.08)] text-white"
          : "bg-[rgba(255,255,255,0.25)] text-black"
      }`}
    >
      <h2 className="text-xl font-semibold mb-4 text-center">
        Personalização Visual Morina
      </h2>

      {/* LOGO */}
      <div className="flex flex-col items-center mb-6">
        {settings.logoUrl ? (
          <Image
            src={settings.logoUrl}
            alt="Logo da empresa"
            width={120}
            height={120}
            className="rounded-md shadow-md mb-2"
          />
        ) : (
          <div className="w-24 h-24 bg-border/40 rounded-md mb-2 flex items-center justify-center text-sm">
            Sem logo
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          className="text-sm text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-primary file:text-white hover:file:opacity-90"
          onChange={handleLogoUpload}
        />
      </div>

      {/* CORES */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col">
          <label className="text-sm mb-2">Cor Primária</label>
          <input
            type="color"
            value={settings.primaryColor}
            onChange={(e) => handleChange("primaryColor", e.target.value)}
            className="w-full h-10 rounded-md cursor-pointer"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm mb-2">Cor Secundária</label>
          <input
            type="color"
            value={settings.secondaryColor}
            onChange={(e) => handleChange("secondaryColor", e.target.value)}
            className="w-full h-10 rounded-md cursor-pointer"
          />
        </div>
      </div>

      {/* MODO DE TEMA */}
      <div className="mb-6">
        <label className="block text-sm mb-2">Modo de Tema</label>
        <select
          value={settings.themeMode}
          onChange={(e) => handleChange("themeMode", e.target.value)}
          className="w-full p-2 rounded-md bg-transparent border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
        >
          <option value="light">Claro</option>
          <option value="dark">Escuro</option>
          <option value="auto">Automático</option>
        </select>
      </div>

      {/* LINK DE VÍDEO */}
      <div className="mb-6">
        <label className="block text-sm mb-2">
          Link de Vídeo Institucional
        </label>
        <input
          type="text"
          placeholder="https://player.vimeo.com/video/..."
          value={settings.videoLink}
          onChange={(e) => handleChange("videoLink", e.target.value)}
          className="w-full p-2 rounded-md bg-transparent border border-border focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-xs mt-1 text-muted-foreground">
          Aceita links do Vimeo ou YouTube.
        </p>
      </div>

      {/* PRÉ-VISUALIZAÇÃO */}
      <div className="mt-8 border-t border-border pt-4 text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Pré-visualização em tempo real ativa.
        </p>
        <p className="text-xs text-muted-foreground">
          Suas alterações são aplicadas instantaneamente no layout.
        </p>
      </div>
    </div>
  );
}
```

---

## ⚙️ Integração Recomendada

1️⃣ **Salvar o arquivo em:**
`src/components/settings/PersonalizationPanel.tsx`

2️⃣ **Importar no módulo de Configurações da Empresa:**

```tsx
import PersonalizationPanel from "@/components/settings/PersonalizationPanel";

export default function CompanySettingsPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-10">
      <PersonalizationPanel />
    </div>
  );
}
```

3️⃣ **Verificação:**

- Alterar cor → muda instantaneamente a UI.
- Alterar vídeo → recarrega background do layout.
- Trocar tema → transição suave via animação translúcida.
- Upload de logo → atualiza em tempo real (preview instantâneo).

---

## ✨ Resultado Final

- **UI viva, personalizada e responsiva.**
- **Cada empresa pode criar sua própria identidade visual.**
- **Modo light/dark sincronizado com sistema.**
- **Vídeo institucional no background com efeito vítreo animado.**
- **Design de ponta, assinado pela Morina.**

---

# CompanySettingsPage.md — Personalização Visual Avançada

**AlphaSysCore by Morina** · **Sem “ERP”** (terminologia proibida em UI, código e docs)

---

## 1) Objetivo executivo

Criar a página **Configurações da Empresa → Personalização Visual** com **persistência real** (Prisma), **validação robusta** (Zod), **form UX premium** (React Hook Form), **tema dinâmico** (light/dark), **vídeo institucional** (Vimeo/YouTube) e **aplicação imediata** no layout via `useThemeEngine`.
Stack já presente no projeto: **Next 16**, **React 19**, **Tailwind v4**, **react-hook-form**, **zod**, **tw-animate-css**; Tailwind v4 + `tw-animate-css` já importados no CSS global; PostCSS configurado com `@tailwindcss/postcss`.

**Decisão de design:** usamos **azul-royal translúcido** como primária no dark mode, vidro translúcido no light e **varredura translúcida animada** em todo o projeto. Tokens e camadas base já existem em `globals.css` (root vars, `@layer base`, `@theme inline`) — vamos só **estender** sem quebrar o que está pronto.

---

## 2) Estrutura de dados (Prisma)

> Armazena por empresa; respeite multi-tenant quando houver.

**Tabela `company_settings` (exemplo):**

```prisma
model CompanySettings {
  id            String   @id @default(cuid())
  companyId     String   @unique
  logoUrl       String?  // data URL temporária ou URL persistida (S3, R2, etc.)
  primaryColor  String?  // ex: "#2855FF"
  secondaryColor String? // ex: "#9C27B0"
  themeMode     String?  // "light" | "dark" | "auto"
  videoLink     String?  // Vimeo/YouTube
  updatedAt     DateTime @updatedAt
  createdAt     DateTime @default(now())
}
```

**Nota prática:** logo em **S3/R2** com URL assinada. Se quiser “preview” imediato, aceite **DataURL** no front e faça upload assíncrono na gravação definitiva.

---

## 3) API (Next Route Handlers)

**Rotas:**

- `GET /api/company-settings` → retorna settings da empresa logada
- `PUT /api/company-settings` → valida e persiste

**Validação Zod:**

```ts
import { z } from "zod";

export const companySettingsSchema = z.object({
  logoUrl: z.string().url().optional().or(z.literal("")).nullable(),
  primaryColor: z
    .string()
    .regex(/^#([0-9A-Fa-f]{3}){1,2}$/)
    .optional(),
  secondaryColor: z
    .string()
    .regex(/^#([0-9A-Fa-f]{3}){1,2}$/)
    .optional(),
  themeMode: z.enum(["light", "dark", "auto"]).optional(),
  videoLink: z.string().url().optional().or(z.literal("")).nullable(),
});
export type CompanySettingsInput = z.infer<typeof companySettingsSchema>;
```

**Handler (exemplo `PUT`):**

```ts
// app/api/company-settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { companySettingsSchema } from "@/schemas/company-settings";
import { db } from "@/server/db"; // seu Prisma client
import { getSessionCompanyId } from "@/server/auth"; // obtenha o companyId

export async function GET() {
  const companyId = await getSessionCompanyId();
  const settings = await db.companySettings.findUnique({
    where: { companyId },
  });
  return NextResponse.json(settings ?? {});
}

export async function PUT(req: NextRequest) {
  const companyId = await getSessionCompanyId();
  const json = await req.json();
  const parsed = companySettingsSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const saved = await db.companySettings.upsert({
    where: { companyId },
    update: { ...data },
    create: { companyId, ...data },
  });

  return NextResponse.json(saved);
}
```

**Segurança:** autentique e autorize. Apenas **admin** da empresa pode editar.

---

## 4) UI e UX do formulário (React 19 + RHF + Tailwind v4)

**Princípios:**

- Inputs minimalistas, labels claras, **feedback imediato**.
- **Preview vivo** (live preview) aplicado via `useThemeEngine`.
- **Acessibilidade**: labels, aria-descriptions, foco visível.

**Página:**

```tsx
// app/(app)/settings/company/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CompanySettingsInput } from "@/schemas/company-settings";
import { companySettingsSchema } from "@/schemas/company-settings";
import { useEffect } from "react";
import { useThemeEngine } from "@/hooks/useThemeEngine";
import PersonalizationPanel from "@/components/settings/PersonalizationPanel";

export default function CompanySettingsPage() {
  const { companyTheme, updateCompanyTheme } = useThemeEngine();

  const form = useForm<CompanySettingsInput>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: {
      logoUrl: companyTheme.logoUrl ?? "",
      primaryColor: companyTheme.primaryColor ?? "#2855FF",
      secondaryColor: companyTheme.secondaryColor ?? "#9C27B0",
      themeMode: companyTheme.themeMode ?? "auto",
      videoLink: companyTheme.videoLink ?? "",
    },
    mode: "onChange",
  });

  // Aplicação ao vivo a cada mudança
  useEffect(() => {
    const sub = form.watch((values) => updateCompanyTheme(values as any));
    return () => sub.unsubscribe?.();
  }, [form, updateCompanyTheme]);

  async function onSubmit(values: CompanySettingsInput) {
    const res = await fetch("/api/company-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      // TODO: toast de erro com detalhes do Zod
      return;
    }
    // TODO: toast de sucesso
  }

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Configurações da Empresa</h1>
        <p className="text-sm text-muted-foreground">
          Personalize identidade visual e experiência de navegação.
        </p>
      </header>

      {/* Painel com preview + controles rápidos */}
      <PersonalizationPanel />

      {/* Form principal (validação e persistência) */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm">Cor Primária</label>
            <input
              type="color"
              {...form.register("primaryColor")}
              className="w-full h-10 rounded-md"
              aria-describedby="primary-help"
            />
            <p id="primary-help" className="text-xs text-muted-foreground">
              Use cores consistentes com sua marca. Evite baixa legibilidade.
            </p>
          </div>

          <div>
            <label className="text-sm">Cor Secundária</label>
            <input
              type="color"
              {...form.register("secondaryColor")}
              className="w-full h-10 rounded-md"
            />
          </div>
        </div>

        <div>
          <label className="text-sm">Modo do Tema</label>
          <select
            {...form.register("themeMode")}
            className="w-full p-2 rounded-md border border-border bg-transparent"
          >
            <option value="light">Claro</option>
            <option value="dark">Escuro</option>
            <option value="auto">Automático</option>
          </select>
        </div>

        <div>
          <label className="text-sm">Link de Vídeo (Vimeo/YouTube)</label>
          <input
            type="url"
            placeholder="https://player.vimeo.com/video/..."
            {...form.register("videoLink")}
            className="w-full p-2 rounded-md border border-border bg-transparent"
          />
        </div>

        <div>
          <label className="text-sm">Logo (URL pública)</label>
          <input
            type="url"
            placeholder="https://cdn.seudominio/logo.png"
            {...form.register("logoUrl")}
            className="w-full p-2 rounded-md border border-border bg-transparent"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-primary text-white shadow-md hover:opacity-90 transition"
          >
            Salvar
          </button>
          <span className="text-xs text-muted-foreground">
            As alterações são aplicadas ao vivo e persistidas ao salvar.
          </span>
        </div>
      </form>
    </div>
  );
}
```

---

## 5) Aplicação visual global (layout)

- **Vídeo institucional:** `useThemeEngine().getCompanyVideo()` dá src para `<iframe>` responsivo.
- **Camada translúcida animada:** `.glass-motion` cobre o viewport (varredura esquerda→direita).
- **Tema:** classe `light/dark` + custom properties.
  Os imports e camadas já estão preparados em `globals.css` com `@import "tailwindcss"` e `@import "tw-animate-css"`, além de base e `@theme inline` que expõem tokens — mantenha a coerência.

**Lembrete:** Tailwind v4 e `tw-animate-css` estão no projeto (package.json). O PostCSS usa `@tailwindcss/postcss`.

---

## 6) Acessibilidade e UX

- **Contraste mínimo 4.5:1** (ajuste cores no light para não cansar; no dark, use primária azul-royal com _glass_).
- **Foco visível** (outline + leve glow).
- **Legibilidade**: títulos com `DM Sans`, texto com `Inter`.
- **Teclado**: tabs em todos os campos; botões com `aria-pressed` quando aplicável.
- **Preferências do sistema**: `auto` respeita `(prefers-color-scheme)`.

---

## 7) Regras de branding e terminologia

- **Proibido** usar “ERP” em código, UI e documentação (regra de lint/QA opcional).
- Padrão: **AlphaSysCore by Morina**.
- Nomear módulos como **Ambientes**/**Soluções** (“Solução Financeira Morina”, etc.).

---

## 8) Testes e Qualidade

- **Unitários**: validar schema Zod e transformação dos links de vídeo.
- **E2E (Playwright)**:
  - Preenche formulário → salva → recarrega → valores idempotentes.
  - Toggling light/dark → transições suaves e sem “flash” branco.

- **Visual Regression**: tire _snapshots_ (Happy DOM + @testing-library) em light/dark.

---

## 9) Roadmap incremental (curto e direto)

1. **Backend:** Prisma `company_settings` + rotas GET/PUT.
2. **Front:** `CompanySettingsPage` + `PersonalizationPanel` (preview ao vivo).
3. **Tema Global:** integração `useThemeEngine` no `layout`.
4. **Qualidade:** testes unitários + e2e + contraste.
5. **Entrega:** PR com _feature flag_ “personalization_v1”.

---

## 10) Check de conformidade com o que já existe

- **Tailwind v4** e **tw-animate-css** confirmados no `package.json` e importados no `globals.css`.
- **PostCSS** com `@tailwindcss/postcss` configurado em `postcss.config.mjs`.
- **Base CSS** com `@layer base`, _custom-variant_ para `.dark` e mapeamento de tokens `@theme inline` já ativo — conservar e estender.

---

## 11) Decisão de design “sem volta”

- **Light:** branco limpo, vidro translúcido suave, **sem saturação cansativa**.
- **Dark:** **azul-royal translúcido** + vidro em ambos os temas, **varredura translúcida** global cronometrada (12s), deslocando da esquerda para a direita.
- **Vídeo (Vimeo/YouTube):** máximo 5–8s em loop, **muted + autoplay + object-cover**.

---

### Fechamento

Entrega pragmática, escalável e com assinatura estética Morina.
Se quiser, eu já preparo um **lint rule** simples para bloquear o termo “ERP” no repo e um **preset de toasts** (sucesso/erro) com **acessibilidade**.
