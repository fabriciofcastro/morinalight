# 🔧 TROUBLESHOOTING - Tela de Clientes

## ❌ Problema: Tela não aparece

### Possíveis Causas e Soluções

#### 1. Servidor não reiniciado

```bash
# Parar o servidor (Ctrl+C)
# Reiniciar o servidor de desenvolvimento
npm run dev
# ou
yarn dev
```

#### 2. Cache do navegador

- Limpar cache do navegador (Ctrl+Shift+Delete)
- Fazer hard refresh (Ctrl+Shift+R ou Cmd+Shift+R)
- Testar em aba anônima/privada

#### 3. Erros de compilação

```bash
# Verificar erros de TypeScript
npm run type-check
# ou
yarn type-check

# Verificar erros de lint
npm run lint
# ou
yarn lint
```

#### 4. Dependências não instaladas

```bash
# Instalar dependências
npm install
# ou
yarn install

# Verificar se framer-motion está instalado
npm list framer-motion
```

#### 5. Verificar console do navegador

- Abrir DevTools (F12)
- Verificar aba Console para erros
- Verificar aba Network para requisições falhando

#### 6. Verificar rota

- Acessar: `http://localhost:3000/clientes`
- Verificar se a rota está correta no navegador

#### 7. Verificar se componente está sendo importado

```typescript
// apps/web/src/app/(app)/clientes/page.tsx
import { ClientesClient } from "./clientes-client";
```

#### 8. Verificar se background está configurado

```typescript
// apps/web/src/components/page-background.tsx
{variant === "clientes" && <ClientesAnimatedBackground />}
```

---

## ✅ Checklist de Verificação

- [ ] Servidor está rodando?
- [ ] Não há erros no console?
- [ ] Dependências estão instaladas?
- [ ] Cache foi limpo?
- [ ] Rota está correta?
- [ ] Componente está exportado?
- [ ] Imports estão corretos?

---

## 🐛 Debug Rápido

### 1. Verificar se componente renderiza

Adicionar um console.log no início do componente:

```typescript
export function ClientesClient() {
  console.log("ClientesClient renderizado");
  // ... resto do código
}
```

### 2. Verificar se dados estão chegando

Adicionar log na função loadClientes:

```typescript
const loadClientes = useCallback(async () => {
  console.log("Carregando clientes...");
  // ... resto do código
  console.log("Clientes carregados:", data);
}, []);
```

### 3. Verificar se background está funcionando

Verificar se o componente de background está sendo renderizado:

```typescript
// No componente PageBackground
console.log("Variant:", variant);
```

---

## 📝 Comandos Úteis

```bash
# Limpar cache do Next.js
rm -rf .next

# Reinstalar dependências
rm -rf node_modules
npm install

# Verificar versão do Node
node --version

# Verificar versão do npm
npm --version
```

---

## 🔍 Verificações Adicionais

### Verificar estrutura de arquivos

```
apps/web/src/app/(app)/clientes/
├── page.tsx
└── clientes-client.tsx

apps/web/src/components/
├── page-background.tsx
└── animations/
    └── clientes-animated-background.tsx
```

### Verificar imports

- `framer-motion` está instalado?
- `lucide-react` está instalado?
- `@morina/ui` está disponível?

---

## 💡 Solução Rápida

Se nada funcionar, tente:

1. **Parar tudo**
2. **Limpar cache**: `rm -rf .next node_modules`
3. **Reinstalar**: `npm install`
4. **Reiniciar servidor**: `npm run dev`
5. **Limpar cache do navegador**
6. **Acessar**: `http://localhost:3000/clientes`

---

## 📞 Próximos Passos

Se o problema persistir:

1. Verificar logs do servidor
2. Verificar console do navegador
3. Verificar Network tab
4. Verificar se há erros de TypeScript
5. Verificar se há erros de lint
