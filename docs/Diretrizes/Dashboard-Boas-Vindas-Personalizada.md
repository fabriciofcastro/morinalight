# Dashboard - Tela de Boas-Vindas Personalizada

> **Documentação completa sobre implementação de tela de boas-vindas personalizada na dashboard, com informações do tempo e outras informações relevantes, sem prejudicar o conteúdo principal.**

---

## 1. Contexto e Objetivo

### 1.1 Necessidade

Cada usuário que acessa a dashboard deve receber:

- ✅ **Mensagem de boas-vindas personalizada** (nome, cargo, contexto)
- ✅ **Informações do tempo** (clima atual e previsão)
- ✅ **Informações relevantes** (notificações, pendências, lembretes)
- ✅ **Sem prejudicar** as informações principais da dashboard
- ✅ **Solução para usuários sem dashboard** (representantes, usuários com permissões limitadas)

### 1.2 Objetivo

Criar uma experiência personalizada e informativa que:

- Melhore a experiência do usuário
- Forneça contexto útil imediatamente
- Não sobrecarregue a interface
- Seja adaptável a diferentes perfis de usuário

---

## 2. Análise da Dashboard Atual

### 2.1 Estrutura Atual

```
Dashboard
├── Header (Título + Data)
├── Stats Grid (4 cards)
├── Quick Actions (3 ações)
├── Recent Activity (lista)
└── JARVIS Assistant (sidebar)
```

### 2.2 Oportunidades de Melhoria

- ❌ Não há mensagem de boas-vindas personalizada
- ❌ Não há informações do tempo
- ❌ Não há informações contextuais do usuário
- ❌ Não há diferenciação por tipo de usuário

---

## 3. Proposta de Implementação

### 3.1 Componente de Boas-Vindas (Welcome Banner)

#### **Posicionamento:**

- **Topo da dashboard**, logo após o header
- **Não fixo** (pode ser minimizado/fechado)
- **Responsivo** (mobile: compacto, desktop: expandido)

#### **Conteúdo:**

```
┌─────────────────────────────────────────────────────────────────┐
│  👋 Olá, João Silva!                                            │
│  ─────────────────────────────────────────────────────────────── │
│                                                                 │
│  [ Avatar ]  Bom dia! Hoje é Segunda-feira, 19 de Janeiro      │
│              Você tem 3 notificações e 2 tarefas pendentes     │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ 🌤️  São Paulo│  │ 📊 5 pedidos │  │ ⏰ 14:30      │        │
│  │ 28°C         │  │ pendentes    │  │               │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
│  [ Minimizar ]  [ Não mostrar hoje ]                           │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Informações do Tempo (Weather Widget)

#### **Dados a Exibir:**

- **Localização:** Baseada em IP ou configuração do usuário
- **Temperatura atual:** Ex: "28°C"
- **Condição:** Ex: "Ensolarado", "Nublado", "Chuva"
- **Ícone:** Visual representando a condição
- **Previsão:** "Máx: 32°C | Mín: 22°C" (opcional)

#### **Fonte de Dados:**

**Opção 1: API Gratuita (Recomendada)**

- **OpenWeatherMap** (free tier: 1.000 calls/dia)
- **WeatherAPI** (free tier: 1 milhão calls/mês)
- **AccuWeather** (free tier limitado)

**Opção 2: API Paga**

- **OpenWeatherMap Pro:** ~$40/mês
- **WeatherAPI Pro:** ~$4/mês

**Opção 3: Cache Local**

- Cache de 30 minutos
- Reduz chamadas à API
- Fallback se API falhar

### 3.3 Informações Relevantes por Tipo de Usuário

#### **A. Funcionário da Empresa**

**Informações a Exibir:**

- ✅ Notificações não lidas (com sonorização)
- ✅ Tarefas pendentes
- ✅ Aprovações aguardando
- ✅ Reuniões do dia
- ✅ Aniversários de colegas (opcional)
- ✅ Eventos da empresa (opcional)

**Sonorização de Notificações:**

- ✅ Som diferente por tipo (success, error, warning, info)
- ✅ Volume configurável nas preferências
- ✅ Pode ser desativado pelo usuário
- ✅ Respeita configurações do navegador

#### **B. Representante**

**Informações a Exibir:**

- ✅ Comissões pendentes
- ✅ Pedidos aguardando aprovação
- ✅ Valor total de comissões do mês
- ✅ Próximo pagamento
- ✅ Mensagens do gestor

#### **C. Gestor/Administrador**

**Informações a Exibir:**

- ✅ Pendências de aprovação
- ✅ Alertas do sistema
- ✅ Métricas críticas
- ✅ Relatórios pendentes
- ✅ Atividades da equipe

---

## 4. Arquitetura Proposta

### 4.1 Componentes Necessários

#### **4.1.1 WelcomeBanner**

```typescript
// components/dashboard/WelcomeBanner.tsx

interface WelcomeBannerProps {
  user: {
    name: string;
    position?: string;
    department?: string;
    avatarUrl?: string;
  };
  minimized?: boolean;
  onMinimize?: () => void;
  onDismiss?: () => void;
}

export function WelcomeBanner({
  user,
  minimized,
  onMinimize,
  onDismiss,
}: WelcomeBannerProps) {
  // Lógica de boas-vindas
  // Saudação baseada no horário
  // Informações contextuais
}
```

#### **4.1.2 WeatherWidget**

```typescript
// components/dashboard/WeatherWidget.tsx

interface WeatherWidgetProps {
  location?: string; // Cidade do usuário
  showForecast?: boolean;
  compact?: boolean;
}

export function WeatherWidget({
  location,
  showForecast,
  compact,
}: WeatherWidgetProps) {
  // Buscar dados do tempo
  // Exibir temperatura e condição
  // Cache de 30 minutos
}
```

#### **4.1.3 ContextualInfo**

```typescript
// components/dashboard/ContextualInfo.tsx

interface ContextualInfoProps {
  userType: "employee" | "representative" | "manager";
  userId: string;
}

export function ContextualInfo({ userType, userId }: ContextualInfoProps) {
  // Buscar informações contextuais
  // Exibir notificações, pendências, etc.
}
```

### 4.2 Estrutura de Dados

#### **4.2.1 Dados do Usuário**

```typescript
type UserContext = {
  id: string;
  name: string;
  email: string;
  position?: string;
  department?: string;
  avatarUrl?: string;
  userType: "employee" | "representative" | "manager";
  location?: {
    city: string;
    state: string;
    country: string;
  };
  preferences?: {
    showWelcomeBanner: boolean;
    showWeather: boolean;
    minimizedBanner: boolean;
  };
};
```

#### **4.2.2 Dados do Tempo**

```typescript
type WeatherData = {
  location: string;
  temperature: number;
  condition: string;
  icon: string;
  forecast?: {
    max: number;
    min: number;
  };
  lastUpdated: Date;
};
```

#### **4.2.3 Informações Contextuais**

```typescript
type ContextualInfo = {
  notifications: number;
  pendingTasks: number;
  approvalsWaiting: number;
  // Específico por tipo de usuário
  representative?: {
    pendingCommissions: number;
    totalMonthCommissions: number;
    nextPayment?: Date;
  };
  employee?: {
    meetingsToday: number;
    birthdays?: Array<{ name: string; date: Date }>;
  };
  manager?: {
    pendingApprovals: number;
    systemAlerts: number;
    teamActivity: number;
  };
};
```

### 4.3 API Endpoints Necessários

#### **4.3.1 Dashboard Context**

```typescript
// GET /api/dashboard/context
// Retorna: UserContext + ContextualInfo + WeatherData
```

#### **4.3.2 Weather**

```typescript
// GET /api/weather?city=São Paulo
// Retorna: WeatherData
// Cache: 30 minutos
```

---

## 5. Mockups e Layout

### 5.1 Dashboard com Boas-Vindas (Desktop)

```
┌─────────────────────────────────────────────────────────────────┐
│  Dashboard                                    [ 19 Jan 2025 ]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  👋 Olá, João Silva!                                        │ │
│  │  ─────────────────────────────────────────────────────────  │ │
│  │                                                             │ │
│  │  [ Avatar ]  Bom dia! Hoje é Segunda-feira, 19 de Janeiro │ │
│  │              Gerente de Vendas • Departamento Comercial     │ │
│  │                                                             │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │ │
│  │  │ 🌤️  São Paulo│  │ 🔔 3 notif.  │  │ ✅ 2 tarefas │    │ │
│  │  │ 28°C Ensolarado│ │ não lidas    │  │ pendentes    │    │ │
│  │  │ Máx: 32° | Mín: 22° │ │              │  │              │    │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │ │
│  │                                                             │ │
│  │  [ Minimizar ]  [ Não mostrar hoje ]                       │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Faturamento│ │ Clientes │ │ Produtos │ │ Pedidos  │       │
│  │ R$ 245.8K │ │ 1,284    │ │ 3,456    │ │ 892      │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                 │
│  [ Resto da dashboard... ]                                     │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Dashboard com Boas-Vindas (Mobile)

```
┌─────────────────────────┐
│  Dashboard              │
├─────────────────────────┤
│                         │
│  ┌─────────────────────┐│
│  │ 👋 Olá, João!       ││
│  │                     ││
│  │ Bom dia!            ││
│  │ Segunda, 19 Jan     ││
│  │                     ││
│  │ 🌤️ 28°C  São Paulo ││
│  │ 🔔 3  ✅ 2          ││
│  │                     ││
│  │ [ Minimizar ]        ││
│  └─────────────────────┘│
│                         │
│  [ Stats Cards... ]     │
│                         │
└─────────────────────────┘
```

### 5.3 Banner Minimizado

```
┌─────────────────────────────────────────────────────────────────┐
│  👋 Olá, João!  🌤️ 28°C  🔔 3  ✅ 2  [ Expandir ]              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Implementação para Usuários Sem Dashboard

### 6.1 Problema

Alguns usuários podem não ter acesso à dashboard:

- Representantes (podem ter portal próprio)
- Usuários com permissões muito limitadas
- Usuários em onboarding (ainda não configurados)

### 6.2 Soluções Propostas

#### **Opção A: Dashboard Mínima (Recomendada)**

Criar uma dashboard simplificada com:

- Mensagem de boas-vindas
- Informações básicas do usuário
- Ações disponíveis (limitadas)
- Link para solicitar acesso completo

```
┌─────────────────────────────────────────────────────────────────┐
│  👋 Bem-vindo ao MORINA!                                        │
│  ─────────────────────────────────────────────────────────────── │
│                                                                 │
│  Você está acessando o sistema com permissões limitadas.        │
│                                                                 │
│  Ações disponíveis:                                             │
│  • Ver meu perfil                                               │
│  • Alterar senha                                                │
│  • Ver notificações                                             │
│                                                                 │
│  Precisa de mais acesso? Entre em contato com o administrador.  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### **Opção B: Redirecionamento Inteligente**

Baseado no tipo de usuário:

- **Representante** → `/representative/dashboard`
- **Usuário limitado** → `/profile` ou página específica
- **Sem permissões** → Mensagem + contato

#### **Opção C: Dashboard Condicional**

Dashboard que adapta conteúdo baseado em permissões:

- Se não tem permissão para ver stats → Não mostra
- Se não tem permissão para ações → Não mostra
- Mostra apenas o que o usuário pode acessar

---

## 7. Fluxo de Implementação

### 7.1 Fase 1: Welcome Banner Básico

**Objetivo:** Mensagem de boas-vindas simples

**Implementação:**

- [ ] Componente `WelcomeBanner`
- [ ] Saudação baseada no horário (Bom dia/Tarde/Noite)
- [ ] Nome do usuário
- [ ] Data formatada
- [ ] Botão minimizar

**Prazo:** 1 sprint

### 7.2 Fase 2: Informações do Tempo

**Objetivo:** Adicionar widget de clima

**Implementação:**

- [ ] Componente `WeatherWidget`
- [ ] Integração com API de clima (OpenWeatherMap)
- [ ] Cache de 30 minutos
- [ ] Fallback se API falhar
- [ ] Configuração de localização (IP ou manual)

**Prazo:** 1 sprint

### 7.3 Fase 3: Informações Contextuais

**Objetivo:** Adicionar informações relevantes

**Implementação:**

- [ ] Componente `ContextualInfo`
- [ ] Buscar notificações não lidas
- [ ] Buscar tarefas pendentes
- [ ] Informações específicas por tipo de usuário
- [ ] Links para ações rápidas

**Prazo:** 1-2 sprints

### 7.4 Fase 4: Dashboard Condicional

**Objetivo:** Adaptar dashboard para usuários sem acesso completo

**Implementação:**

- [ ] Verificar permissões do usuário
- [ ] Renderizar apenas conteúdo permitido
- [ ] Dashboard mínima para usuários limitados
- [ ] Redirecionamento inteligente

**Prazo:** 1 sprint

---

## 8. Detalhamento Técnico

### 8.1 Saudação Baseada no Horário

```typescript
function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Bom dia";
  } else if (hour >= 12 && hour < 18) {
    return "Boa tarde";
  } else if (hour >= 18 && hour < 22) {
    return "Boa noite";
  } else {
    return "Boa madrugada";
  }
}
```

### 8.2 Integração com API de Clima

```typescript
// services/weather.service.ts

export class WeatherService {
  private cache: Map<string, { data: WeatherData; expires: Date }> = new Map();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutos

  async getWeather(city: string): Promise<WeatherData> {
    // Verificar cache
    const cached = this.cache.get(city);
    if (cached && cached.expires > new Date()) {
      return cached.data;
    }

    // Buscar da API
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=pt_br`,
    );

    const data = await response.json();

    const weatherData: WeatherData = {
      location: data.name,
      temperature: Math.round(data.main.temp),
      condition: this.translateCondition(data.weather[0].main),
      icon: data.weather[0].icon,
      forecast: {
        max: Math.round(data.main.temp_max),
        min: Math.round(data.main.temp_min),
      },
      lastUpdated: new Date(),
    };

    // Salvar no cache
    this.cache.set(city, {
      data: weatherData,
      expires: new Date(Date.now() + this.CACHE_TTL),
    });

    return weatherData;
  }

  private translateCondition(condition: string): string {
    const translations: Record<string, string> = {
      Clear: "Ensolarado",
      Clouds: "Nublado",
      Rain: "Chuva",
      Drizzle: "Garoa",
      Thunderstorm: "Tempestade",
      Snow: "Neve",
      Mist: "Neblina",
    };
    return translations[condition] || condition;
  }
}
```

### 8.3 Busca de Informações Contextuais

```typescript
// hooks/use-dashboard-context.ts

export function useDashboardContext() {
  const { user } = useAuth();
  const [context, setContext] = useState<ContextualInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContext() {
      try {
        const response = await fetch("/api/dashboard/context", {
          headers: getAuthHeadersWithTenant(),
        });

        if (response.ok) {
          const data = await response.json();
          setContext(data);
        }
      } catch (error) {
        console.error("Erro ao buscar contexto:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchContext();
    }
  }, [user]);

  return { context, loading };
}
```

---

## 9. Componente WelcomeBanner Completo

### 9.1 Estrutura do Componente

```typescript
// components/dashboard/WelcomeBanner.tsx

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronUp, Cloud, Bell, CheckSquare } from "lucide-react";
import { useDashboardContext } from "@/hooks/use-dashboard-context";
import { WeatherWidget } from "./WeatherWidget";
import { getAuthUser } from "@/lib/auth-client";

export function WelcomeBanner() {
  const [minimized, setMinimized] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { context, loading } = useDashboardContext();
  const user = getAuthUser();

  // Verificar preferência do usuário
  useEffect(() => {
    const pref = localStorage.getItem(`welcome_banner_${user?.userId}_minimized`);
    if (pref === 'true') {
      setMinimized(true);
    }

    const dismissedToday = localStorage.getItem(`welcome_banner_${user?.userId}_dismissed_${new Date().toDateString()}`);
    if (dismissedToday === 'true') {
      setDismissed(true);
    }
  }, [user?.userId]);

  if (dismissed || !user) return null;

  const greeting = getGreeting();
  const dayName = new Date().toLocaleDateString('pt-BR', { weekday: 'long' });
  const date = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const handleMinimize = () => {
    setMinimized(!minimized);
    localStorage.setItem(`welcome_banner_${user?.userId}_minimized`, String(!minimized));
  };

  const handleDismissToday = () => {
    setDismissed(true);
    localStorage.setItem(
      `welcome_banner_${user?.userId}_dismissed_${new Date().toDateString()}`,
      'true'
    );
  };

  if (minimized) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-xl"
      >
        <div className="flex items-center gap-4 text-sm text-white/70">
          <span>👋 Olá, {user?.displayName || 'Usuário'}!</span>
          {context?.weather && (
            <span>🌤️ {context.weather.temperature}°C</span>
          )}
          {context?.notifications > 0 && (
            <span>🔔 {context.notifications}</span>
          )}
          {context?.pendingTasks > 0 && (
            <span>✅ {context.pendingTasks}</span>
          )}
        </div>
        <button
          onClick={handleMinimize}
          className="text-white/50 hover:text-white transition-colors"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-lg border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-xl"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] flex items-center justify-center text-2xl font-bold text-white">
            {user?.displayName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {greeting}, {user?.displayName || 'Usuário'}!
            </h2>
            <p className="text-sm text-white/70">
              {dayName}, {date}
            </p>
            {user?.position && (
              <p className="text-xs text-white/50 mt-1">
                {user.position} • {user.department}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleMinimize}
            className="p-2 text-white/50 hover:text-white transition-colors"
            title="Minimizar"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            onClick={handleDismissToday}
            className="p-2 text-white/50 hover:text-white transition-colors"
            title="Não mostrar hoje"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {context?.weather && (
          <WeatherWidget data={context.weather} compact />
        )}

        {context?.notifications > 0 && (
          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Bell className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-white/70">Notificações</p>
              <p className="text-xl font-bold text-white">{context.notifications}</p>
              <p className="text-xs text-white/50">não lidas</p>
            </div>
          </div>
        )}

        {context?.pendingTasks > 0 && (
          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckSquare className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-white/70">Tarefas</p>
              <p className="text-xl font-bold text-white">{context.pendingTasks}</p>
              <p className="text-xs text-white/50">pendentes</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  if (hour >= 18 && hour < 22) return 'Boa noite';
  return 'Boa madrugada';
}
```

---

## 10. Dashboard Condicional (Usuários Sem Acesso Completo)

### 10.1 Verificação de Permissões

```typescript
// hooks/use-dashboard-access.ts

export function useDashboardAccess() {
  const { user } = useAuth();
  const { permissions } = usePermissions();

  const hasFullAccess = permissions.includes("dashboard:view:full");
  const hasStatsAccess = permissions.includes("dashboard:view:stats");
  const hasActionsAccess = permissions.includes("dashboard:view:actions");

  return {
    hasFullAccess,
    hasStatsAccess,
    hasActionsAccess,
    userType: user?.userType || "employee",
  };
}
```

### 10.2 Dashboard Adaptativa

```typescript
// app/(app)/dashboard/page.tsx

export default function DashboardPage() {
  const { hasFullAccess, hasStatsAccess, hasActionsAccess, userType } = useDashboardAccess();

  // Se não tem acesso completo, mostrar dashboard mínima
  if (!hasFullAccess) {
    return <MinimalDashboard userType={userType} />;
  }

  // Dashboard completa
  return (
    <div className="space-y-6">
      <WelcomeBanner />

      {hasStatsAccess && <StatsGrid />}
      {hasActionsAccess && <QuickActions />}

      <RecentActivity />
    </div>
  );
}
```

### 10.3 Dashboard Mínima

```typescript
// components/dashboard/MinimalDashboard.tsx

export function MinimalDashboard({ userType }: { userType: string }) {
  return (
    <div className="space-y-6">
      <WelcomeBanner />

      <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">
          Bem-vindo ao MORINA!
        </h2>
        <p className="text-white/70 mb-6">
          Você está acessando o sistema com permissões limitadas.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 max-w-md mx-auto">
          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
          >
            <User className="h-5 w-5 text-[hsl(var(--primary))]" />
            <span>Meu Perfil</span>
          </Link>

          <Link
            href="/notifications"
            className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
          >
            <Bell className="h-5 w-5 text-[hsl(var(--primary))]" />
            <span>Notificações</span>
          </Link>
        </div>

        <p className="mt-6 text-sm text-white/50">
          Precisa de mais acesso? Entre em contato com o administrador.
        </p>
      </div>
    </div>
  );
}
```

---

## 11. API Endpoints Necessários

### 11.1 Dashboard Context

```typescript
// GET /api/dashboard/context

Response: {
  user: {
    id: string;
    name: string;
    email: string;
    position?: string;
    department?: string;
    avatarUrl?: string;
  };
  weather?: {
    location: string;
    temperature: number;
    condition: string;
    icon: string;
    forecast?: {
      max: number;
      min: number;
    };
  };
  contextual: {
    notifications: number;
    pendingTasks: number;
    approvalsWaiting?: number;
    // Específico por tipo
    representative?: {
      pendingCommissions: number;
      totalMonthCommissions: number;
      nextPayment?: string;
    };
  };
}
```

### 11.2 Weather

```typescript
// GET /api/weather?city=São Paulo

Response: {
  location: string;
  temperature: number;
  condition: string;
  icon: string;
  forecast: {
    max: number;
    min: number;
  }
  lastUpdated: string;
}
```

---

## 12. Preferências do Usuário

### 12.1 Armazenamento

```typescript
// Preferências locais (localStorage)
type UserPreferences = {
  welcomeBannerMinimized: boolean;
  welcomeBannerDismissedToday: boolean;
  showWeather: boolean;
  showContextualInfo: boolean;
  dashboardLayout: "default" | "compact" | "minimal";
};
```

### 12.2 Sincronização com Backend (Opcional)

```typescript
// Salvar preferências no backend
// GET /api/user/preferences
// PUT /api/user/preferences
```

---

## 13. Checklist de Implementação

### 13.1 Fase 1: Welcome Banner Básico

- [ ] Criar componente `WelcomeBanner`
- [ ] Integrar com dados do usuário
- [ ] Implementar saudação baseada no horário
- [ ] Adicionar data formatada
- [ ] Implementar minimizar/expandir
- [ ] Implementar "não mostrar hoje"
- [ ] Adicionar à dashboard

### 13.2 Fase 2: Weather Widget

- [ ] Criar componente `WeatherWidget`
- [ ] Escolher API de clima (OpenWeatherMap recomendado)
- [ ] Implementar busca de localização (IP ou manual)
- [ ] Implementar cache (30 minutos)
- [ ] Adicionar fallback se API falhar
- [ ] Integrar com WelcomeBanner

### 13.3 Fase 3: Informações Contextuais

- [ ] Criar hook `useDashboardContext`
- [ ] Criar endpoint `/api/dashboard/context`
- [ ] Buscar notificações não lidas
- [ ] Buscar tarefas pendentes
- [ ] Informações específicas por tipo de usuário
- [ ] Adicionar cards informativos

### 13.4 Fase 4: Dashboard Condicional

- [ ] Criar hook `useDashboardAccess`
- [ ] Verificar permissões do usuário
- [ ] Criar componente `MinimalDashboard`
- [ ] Adaptar dashboard baseado em permissões
- [ ] Testar com diferentes tipos de usuário

---

## 14. Considerações de Performance

### 14.1 Otimizações

- ✅ **Cache de clima:** 30 minutos (reduz chamadas API)
- ✅ **Lazy loading:** Carregar weather widget apenas quando visível
- ✅ **Debounce:** Evitar múltiplas chamadas simultâneas
- ✅ **Skeleton:** Mostrar loading state enquanto carrega

### 14.2 Fallbacks

- ✅ Se API de clima falhar → Não mostrar widget (não quebrar dashboard)
- ✅ Se dados contextuais não carregarem → Mostrar banner básico
- ✅ Se usuário não tiver localização → Usar IP ou não mostrar clima

---

## 15. Acessibilidade

### 15.1 Requisitos

- ✅ Texto alternativo para ícones
- ✅ Navegação por teclado
- ✅ Contraste adequado
- ✅ Screen reader friendly
- ✅ Animações respeitam `prefers-reduced-motion`

---

## 16. Próximos Passos

### 16.1 Imediato (Documentação)

- [x] Documentação completa criada
- [ ] Revisar com equipe de UX
- [ ] Validar com stakeholders

### 16.2 Curto Prazo (Implementação)

- [ ] Implementar Fase 1 (Welcome Banner)
- [ ] Testar com usuários
- [ ] Coletar feedback

### 16.3 Médio Prazo

- [ ] Implementar Fase 2 (Weather)
- [ ] Implementar Fase 3 (Contextual Info)
- [ ] Implementar Fase 4 (Dashboard Condicional)

---

**Última atualização:** 2025-01-19  
**Versão:** 1.0.0  
**Status:** Documentação para implementação futura
