# Correções de UX - LoginForm

## Problema Identificado pelo Usuário

"Quando não loga, aparece talvez uma mensagem de erro no formulário invisível, que deixa o formulário maior, cheio de probleminhas bestas"

## Causa Raiz

1. **Animações com Framer Motion** causavam "saltos" no layout
2. **Sem altura fixa** para container de erros
3. **Layout shift** quando erro aparecia/desaparecia

## Correções Aplicadas

### 1. Container de Erro com Altura Fixa ✅

**Antes:**

```tsx
{
  error && (
    <motion.div variants={item}>
      <Alert>{error}</Alert>
    </motion.div>
  );
}
```

**Depois:**

```tsx
<div className="min-h-[60px]">
  {" "}
  {/* ALTURA FIXA! */}
  {error && <Alert>{error}</Alert>}
</div>
```

**Resultado:** Formulário NÃO muda de tamanho quando erro aparece

### 2. Removidas Animações que Causam Saltos ✅

**Antes:**

```tsx
<motion.form variants={container}>
  <motion.div variants={item}>...</motion.div>
</motion.form>
```

**Depois:**

```tsx
<form>
  {" "}
  {/* SEM motion */}
  <div>...</div> {/* SEM variants */}
</form>
```

**Resultado:** Sem "pulos" visuais

### 3. Erro Limpa ao Aceitar Termos ✅

**Antes:**

```tsx
onCheckedChange={(checked) => setTermsAccepted(checked)}
```

**Depois:**

```tsx
onCheckedChange={(checked) => {
    setTermsAccepted(checked);
    if (error) setError(null);  // LIMPA ERRO!
}}
```

**Resultado:** UX mais fluida

### 4. Avisos Não Sobrepõem ✅

**Antes:**

```tsx
{
  error && <Alert>{error}</Alert>;
}
{
  loginAttempts >= 3 && <Alert>Tentativas</Alert>;
}
```

**Depois:**

```tsx
{
  error && <Alert>{error}</Alert>;
}
{
  loginAttempts >= 3 && !error && <Alert>Tentativas</Alert>;
}
/* ^^^^^^ SÓ SE NÃO TIVER ERRO */
```

**Resultado:** Apenas 1 mensagem por vez

## Comparação Visual

### Antes (Problemático)

```
┌─────────────────────┐
│ Email               │
│ Senha               │
│ [x] Termos          │
│ [ Acessar ]         │
└─────────────────────┘
        ↓ (erro aparece)
┌─────────────────────┐
│ ⚠️ Erro aqui!       │  ← FORMULÁRIO CRESCE!
│ Email               │
│ Senha               │
│ [x] Termos          │
│ [ Acessar ]         │
└─────────────────────┘
```

### Depois (Corrigido)

```
┌─────────────────────┐
│ [espaço reservado]  │  ← SEMPRE 60px
│ Email               │
│ Senha               │
│ [x] Termos          │
│ [ Acessar ]         │
└─────────────────────┘
        ↓ (erro aparece)
┌─────────────────────┐
│ ⚠️ Erro aqui!       │  ← MESMO TAMANHO!
│ Email               │
│ Senha               │
│ [x] Termos          │
│ [ Acessar ]         │
└─────────────────────┘
```

## Resultado Final

✅ **Tamanho fixo** - Formulário não muda de altura  
✅ **Sem animações** - Sem saltos visuais  
✅ **UX limpa** - Erro limpa ao aceitar termos  
✅ **Sem sobreposição** - Apenas 1 mensagem por vez

## Teste

1. Acesse http://localhost:3000/login
2. Tente logar SEM aceitar termos
3. **Observe:** Formulário mantém mesmo tamanho
4. Aceite os termos
5. **Observe:** Erro desaparece automaticamente

---

**Status:** ✅ Corrigido  
**Arquivo:** `apps/web/src/components/auth/LoginForm.tsx`
