# Instalação de Dependências - Funcionalidades Opcionais

## Backend (API)

### Dependências Necessárias

```bash
cd apps/api

# Instalar dependências para PDF
pnpm add pdfkit
pnpm add -D @types/pdfkit

# Dependências já instaladas (verificar)
# @nestjs/schedule - para scheduler
# @slack/webhook - para alertas Slack
# nodemailer - para emails
```

### Verificar Instalação

```bash
pnpm list pdfkit
pnpm list @nestjs/schedule
pnpm list @slack/webhook
pnpm list nodemailer
```

## Frontend (Web)

### Dependências Necessárias

```bash
cd apps/web

# Instalar Recharts para gráficos
pnpm add recharts

# Verificar se shadcn/ui components estão instalados
# (Card, Button, Tabs, Badge já devem estar)
```

### Verificar Instalação

```bash
pnpm list recharts
```

## Comandos Rápidos

### Instalar Tudo de Uma Vez

```bash
# Na raiz do projeto
pnpm install

# Ou individualmente
cd apps/api && pnpm add pdfkit @types/pdfkit
cd apps/web && pnpm add recharts
```

## Dependências Opcionais (Futuro)

### Para Machine Learning (Fase 3)
```bash
# TensorFlow.js ou similar
pnpm add @tensorflow/tfjs-node
```

### Para SIEM Integration (Fase 3)
```bash
# Splunk SDK
pnpm add splunk-sdk
```

## Troubleshooting

### Erro ao instalar pdfkit

Se houver erro com canvas/cairo:

```bash
# Ubuntu/Debian
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# macOS
brew install cairo pango
```

### Erro com Recharts

Certifique-se de que React 18+ está instalado:

```bash
pnpm list react
# Deve ser >= 18.0.0
```

## Verificação Final

Após instalar todas as dependências:

```bash
# Backend
cd apps/api
pnpm build

# Frontend
cd apps/web
pnpm build
```

Se ambos compilarem sem erros, as dependências estão corretas! ✅
