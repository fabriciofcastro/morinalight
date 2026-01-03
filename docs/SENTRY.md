# Sentry Enterprise Integration - MorinaLight

Este projeto utiliza o Sentry em nível enterprise para monitoramento de erros, performance e experiência do usuário. A implementação abrange todos os aplicativos críticos (Web e API) com configurações centralizadas.

## 🚀 Features Habilitadas

- **Distributed Tracing**: Monitoramento de transações ponta-a-ponta.
- **Session Replay (Web)**: Gravação visual de sessões de usuários com erros.
- **User Feedback (Web)**: Widget para usuários reportarem detalhes após um erro crítico.
- **Performance Profiling (API)**: Análise detalhada de performance em Node.js.
- **Database Insights (Prisma)**: Monitoramento de queries lentas (>500ms) e breadcrumbs contextuais.
- **Data Scrubbing**: Limpeza automática de dados sensíveis (LGPD Compliance).
- **Release Tracking**: Associação automática de commits e versões via CI/CD.

## 📦 Estrutura

- **packages/observability**: Contém tipos, utilitários e lógica compartilhada.
- **apps/web**: Integração com Next.js, Hooks customizados, Error Boundary Avançado.
- **apps/api**: Integração com Fastify, instrumentação de middleware, tracing e Prisma Extension.

## 🛠️ Instalação e Configuração

Para que o monitoramento funcione corretamente, é necessário configurar as variáveis de ambiente em cada app.

### Criar Projetos no Sentry

Crie 2 projetos separados no painel do Sentry para melhor organização:

1. `morina-web` (Plataforma: **JavaScript / Next.js**)
2. `morina-api` (Plataforma: **Node.js**)

### 🔑 Configuração de DSNs

Adicione as DSNs (Data Source Names) correspondentes nos arquivos `.env` de cada app. Você pode encontrar esses valores nas configurações de cada projeto no painel do Sentry (_Settings > Client Keys (DSN)_).

#### Web Frontend (`apps/web/.env`)

```env
# DSN Público para o Front-end
NEXT_PUBLIC_SENTRY_DSN=https://xxx@yyy.ingest.sentry.io/111

# Token de Autenticação para Upload de Source Maps (CI/CD)
# Crie em: Settings > Account > API > Auth Tokens
SENTRY_AUTH_TOKEN=seu_token_aqui
```

#### API Backend (`apps/api/.env`)

```env
# DSN Privado para o Back-end
SENTRY_DSN=https://xxx@yyy.ingest.sentry.io/222

# Habilitar Explicitamente
SENTRY_ENABLED=true
```

## 💻 Uso no Código

### Web (Frontend)

Use os hooks customizados para enriquecer os dados ou capturar erros manualmente:

```tsx
import { useErrorTracking } from "@/lib/observability/monitoring-hooks";

export function MeuComponente() {
  const { trackError } = useErrorTracking();

  const handleAction = async () => {
    try {
      await apiCall();
    } catch (err) {
      // Captura manual com contexto extra
      trackError(err, { component: "MeuComponente", action: "save" });
    }
  };
}
```

#### User Feedback

Se a aplicação quebrar completamente (Crash), o `GlobalError` ou `AdvancedErrorBoundary` mostrará uma interface amigável com um botão **"Reportar Problema"**. Isso abre um widget do Sentry para o usuário descrever o que aconteceu.

### Backend (API)

A captura de erros é automática para rotas HTTP (Fastify) e queries de banco de dados (Prisma).

#### Database Insights (Prisma)

O serviço do Prisma (`prisma.service.ts`) foi estendido para monitorar performance:

- **Queries > 500ms**: Geram um evento de `WARNING` no Sentry ("Slow DB Query").
- **Queries > 50ms**: Adicionam um `Breadcrumb` ao contexto (não geram alerta, apenas rastro).

#### Middleware

O middleware `sentry-plugin` intercepta erros não tratados e os envia ao Sentry com contexto do usuário (ID, Email, Role) extraído do JWT.

## 🔐 Privacidade e LGPD

O sistema foi configurado (`sentry-utils.ts`) para limpar dados sensíveis antes de enviar ao Sentry:

- **Headers**: Authorization, Cookie, etc. removidos.
- **Campos**: password, token, cpf, credit_card, secret ofuscados.
- **PII**: IPs e User Agents podem ser mascarados nas configurações do projeto no Sentry.

## 📊 CI/CD e Releases

O workflow `.github/workflows/sentry-release.yml` roda automaticamente no push para `main` ou `develop`:

1. Cria uma **Release** no Sentry (ex: `web@0.1.0-sha`).
2. Faz upload dos **Source Maps** (essencial para ver stack traces legíveis de código minificado).
3. Associa os **Commits** da release (para saber quem quebrou o quê).
4. Notifica o **Deploy**.

> **Nota:** Certifique-se de que os segredos `SENTRY_AUTH_TOKEN`, `SENTRY_ORG` e `SENTRY_PROJECT` estejam configurados no GitHub Actions Secrets.
