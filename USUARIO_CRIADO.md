# ✅ Usuário Criado com Sucesso

## 📋 Detalhes do Usuário

- **Email:** fabricio@morina.com
- **Senha:** 67318696Il!@#
- **Nome:** Fabricio
- **ID:** e135c863-8823-46f9-a388-dc3c683b223f
- **Status:** active

## 🔐 Como Fazer Login

1. Acesse: http://localhost:3000/login
2. Use as credenciais:
   - Email: `fabricio@morina.com`
   - Senha: `67318696Il!@#`

## 🏢 Associar a uma Organização (Opcional)

Se você quiser associar o usuário a uma organização existente, execute:

```bash
cd apps/api
export PNPM_HOME="$HOME/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"
ORG_ID="<id-da-organizacao>" USER_EMAIL="fabricio@morina.com" pnpm create-user
```

Ou use o Prisma Studio para fazer a associação manualmente:

```bash
cd apps/api
pnpm studio
```

## ✅ Status

- ✅ Usuário criado
- ✅ Senha configurada
- ✅ Status: active
- ⏳ Membership em organização: pendente (opcional)

## 📝 Notas

- O usuário foi criado com sucesso no banco de dados
- A senha está criptografada com bcrypt
- O usuário pode fazer login imediatamente
- Para associar a uma organização, use o comando acima ou o Prisma Studio



