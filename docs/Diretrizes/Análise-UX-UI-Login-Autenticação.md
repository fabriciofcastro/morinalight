# Análise UX/UI - Login e Autenticação

> **Análise completa da experiência de login e autenticação considerando dois tipos de usuários: funcionários da empresa e representantes externos.**

---

## 1. Contexto e Objetivo

### 1.1 Tipos de Usuários

O sistema MORINA atende **dois perfis distintos**:

#### 👔 **Usuários da Empresa (Funcionários)**

- Acessam o sistema como parte da organização
- Têm vínculo empregatício ou contratual
- Precisam selecionar organização (multiempresa)
- Acesso completo aos módulos corporativos
- RBAC baseado em cargo/departamento/setor

#### 🤝 **Representantes (Externos)**

- **NÃO fazem parte da empresa**
- Acessam para **lançar suas comissões**
- Baseado em pedidos de venda (como na imagem)
- Campos necessários:
  - Fábrica (ex: MORINA)
  - Cliente
  - Data da Compra
  - Valor da Compra (R$)
  - Romaneio
  - Condições de Pagamento
  - Vencimentos
- Acesso limitado ao módulo de comissões

### 1.2 Objetivo da Análise

Melhorar a experiência de login e autenticação para:

- ✅ Identificar claramente o tipo de usuário
- ✅ Facilitar acesso para representantes
- ✅ Manter segurança e auditoria
- ✅ Reduzir fricção no login
- ✅ Melhorar conversão (representantes completarem lançamento)

---

## 2. Análise da Tela de Login Atual

### 2.1 Pontos Fortes

✅ **Design Moderno e Profissional**

- Glassmorphism bem implementado
- Animações sutis e elegantes
- Feedback visual claro
- Responsivo

✅ **Segurança**

- Validação robusta
- Mensagens de erro claras
- Tratamento de tentativas
- Termos e políticas

✅ **Acessibilidade**

- Labels descritivos
- Feedback de força de senha
- Estados de loading claros

### 2.2 Pontos de Melhoria Identificados

#### 🔴 **CRÍTICO: Falta Identificação de Tipo de Usuário**

**Problema:**

- Não há distinção entre funcionário e representante
- Representantes podem não saber como acessar
- Fluxo único não atende necessidades diferentes

**Impacto:**

- Representantes podem desistir por não entenderem
- Funcionários podem confundir com portal externo
- Suporte recebe mais chamados

#### 🟠 **ALTO: Falta Contexto para Representantes**

**Problema:**

- Representantes não sabem que podem acessar
- Não há informação sobre o que podem fazer
- Falta orientação sobre cadastro inicial

**Impacto:**

- Baixa adesão de representantes
- Representantes não completam cadastro
- Perda de comissões não lançadas

#### 🟡 **MÉDIO: Experiência de Primeiro Acesso**

**Problema:**

- Não há onboarding para novos usuários
- Representantes não sabem o que esperar
- Falta guia rápido

**Impacto:**

- Curva de aprendizado maior
- Abandono no primeiro uso

---

## 3. Proposta de Melhorias UX/UI

### 3.1 Seleção de Tipo de Acesso (Tela Inicial)

#### **Opção A: Tabs/Abas no Login**

```
┌─────────────────────────────────────────┐
│  [ Funcionário ]  [ Representante ]     │ ← Tabs
├─────────────────────────────────────────┤
│                                         │
│  Formulário de Login                    │
│  (contextualizado por tipo)             │
│                                         │
└─────────────────────────────────────────┘
```

**Vantagens:**

- Separação clara
- Um formulário, contexto diferente
- Fácil implementação

**Desvantagens:**

- Pode confundir usuários que não sabem qual escolher

#### **Opção B: Dois Botões de Acesso (Recomendado)**

```
┌─────────────────────────────────────────┐
│         MORINA SYSTEM                    │
│                                         │
│  ┌──────────────────────┐              │
│  │  👔                  │              │
│  │  ACESSO CORPORATIVO   │              │
│  │  Funcionários         │              │
│  │  [ ENTRAR ]           │              │
│  └──────────────────────┘              │
│                                         │
│  ┌──────────────────────┐              │
│  │  🤝                  │              │
│  │  PORTAL REPRESENTANTE │              │
│  │  Lançar Comissões     │              │
│  │  [ ACESSAR ]          │              │
│  └──────────────────────┘              │
└─────────────────────────────────────────┘
```

**Vantagens:**

- ✅ Muito claro qual é qual
- ✅ Representantes sabem exatamente o que fazer
- ✅ Reduz confusão
- ✅ Pode ter informações diferentes em cada card

**Recomendação:** **Opção B**

### 3.2 Fluxo para Representantes

#### **Tela de Seleção → Login Representante**

```
1. Tela Inicial
   └─> Clica em "Portal Representante"

2. Tela de Login Representante
   ├─> Email/CPF
   ├─> Senha
   ├─> Link: "Não tenho cadastro"
   └─> Botão: "Acessar Portal"

3. Se não tem cadastro
   └─> Formulário de Cadastro
       ├─> Dados pessoais
       ├─> CPF (validação)
       ├─> Email
       ├─> Senha
       └─> Termos específicos para representantes
```

#### **Informações Importantes na Tela de Login Representante**

```
┌─────────────────────────────────────────┐
│  PORTAL DO REPRESENTANTE                 │
│                                         │
│  📋 O que você pode fazer:              │
│  • Lançar pedidos de venda              │
│  • Acompanhar comissões                 │
│  • Visualizar histórico                 │
│                                         │
│  🔐 Acesso Seguro                       │
│  Seus dados estão protegidos            │
│                                         │
│  [ Formulário de Login ]                │
│                                         │
│  Não tem cadastro? [ Criar Conta ]      │
└─────────────────────────────────────────┘
```

### 3.3 Melhorias no Formulário de Login

#### **A. Identificação por Email ou CPF (Representantes)**

**Problema Atual:**

- Apenas email

**Solução:**

- Aceitar email OU CPF para representantes
- Detectar automaticamente o formato
- Validação específica para cada tipo

```typescript
// Detectar tipo de entrada
const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
const isCPF = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(input);

if (isCPF) {
  // Buscar representante por CPF
} else if (isEmail) {
  // Buscar por email
}
```

#### **B. Placeholder Contextual**

**Atual:**

```
placeholder="USUARIO@MORINA.COM"
```

**Melhorado (Funcionário):**

```
placeholder="seu.email@empresa.com"
```

**Melhorado (Representante):**

```
placeholder="email@exemplo.com ou 000.000.000-00"
```

#### **C. Link de Recuperação de Senha Específico**

**Atual:**

- Link genérico

**Melhorado:**

- Para funcionários: "Esqueci minha senha corporativa"
- Para representantes: "Esqueci minha senha" + opção de recuperar por CPF

### 3.4 Onboarding para Representantes

#### **Tela de Boas-Vindas (Primeiro Acesso)**

```
┌─────────────────────────────────────────┐
│  👋 Bem-vindo ao Portal do Representante│
│                                         │
│  Vamos configurar seu acesso:           │
│                                         │
│  1. Dados Pessoais                      │
│  2. Dados de Conta Bancária             │
│  3. Termos e Condições                  │
│                                         │
│  [ Começar ]                            │
└─────────────────────────────────────────┘
```

#### **Guia Rápido Após Login**

```
┌─────────────────────────────────────────┐
│  📖 Como Lançar um Pedido                │
│                                         │
│  1. Clique em "Novo Pedido"             │
│  2. Preencha os dados:                  │
│     • Cliente                           │
│     • Data da Compra                    │
│     • Valor                             │
│     • Romaneio                          │
│  3. Defina condições de pagamento       │
│  4. Envie para aprovação                │
│                                         │
│  [ Fechar ] [ Não mostrar novamente ]   │
└─────────────────────────────────────────┘
```

---

## 4. Melhorias de UI Específicas

### 4.1 Visual Distinto por Tipo de Usuário

#### **Funcionário (Corporativo)**

- Cores: Azul corporativo, mais formal
- Ícone: 👔 ou 🏢
- Tom: Profissional, corporativo

#### **Representante (Portal Externo)**

- Cores: Verde/Amarelo (comissões), mais amigável
- Ícone: 🤝 ou 💰
- Tom: Amigável, orientativo

### 4.2 Mensagens Contextuais

#### **Erro de Login - Funcionário**

```
🔐 Acesso Negado
Verifique suas credenciais corporativas.
Entre em contato com o RH se necessário.
```

#### **Erro de Login - Representante**

```
🔐 Acesso Negado
Verifique email/CPF e senha.
Não tem cadastro? [ Criar Conta ]
Precisa de ajuda? [ Contato ]
```

### 4.3 Feedback Visual Melhorado

#### **Indicador de Tipo de Usuário**

```
┌─────────────────────────────────────────┐
│  [👔] Acesso Corporativo                 │
│  Você está acessando como funcionário   │
└─────────────────────────────────────────┘
```

#### **Status de Representante**

```
┌─────────────────────────────────────────┐
│  [🤝] Portal do Representante            │
│  Comissões pendentes: 3                 │
│  Total este mês: R$ 12.450,00           │
└─────────────────────────────────────────┘
```

---

## 5. Campos do Pedido de Venda (Baseado na Imagem)

### 5.1 Formulário de Lançamento de Pedido

Baseado na imagem fornecida, o formulário deve ter:

```
┌─────────────────────────────────────────┐
│  NOVO PEDIDO DE VENDA                   │
├─────────────────────────────────────────┤
│                                         │
│  Fábrica: [ MORINA ▼ ]                  │
│                                         │
│  Cliente: [ Buscar cliente... ]         │
│                                         │
│  Data da Compra: [ DD/MM/AAAA ]         │
│                                         │
│  Valor da Compra: R$ [ 0,00 ]           │
│                                         │
│  Romaneio: [ Número do romaneio ]       │
│                                         │
│  Condições de Pagamento:                │
│  ○ À Vista                              │
│  ○ Parcelado                            │
│                                         │
│  Se Parcelado:                          │
│  Vencimentos: [ 30, 60, 90 ]            │
│  Valores: R$ [ 928,66 ] cada            │
│                                         │
│  [ Cancelar ]  [ Salvar Rascunho ]      │
│              [ Enviar para Aprovação ]  │
└─────────────────────────────────────────┘

```

### 5.2 Validações Necessárias

- ✅ Fábrica obrigatória
- ✅ Cliente obrigatório (busca por nome/CNPJ)
- ✅ Data não pode ser futura
- ✅ Valor > 0
- ✅ Romaneio único (não pode duplicar)
- ✅ Se parcelado, número de parcelas = número de vencimentos
- ✅ Soma das parcelas = valor total

### 5.3 Busca de Cliente

**Funcionalidade Importante:**

- Busca por nome
- Busca por CNPJ
- Sugestões enquanto digita
- Criar novo cliente se não existir

---

## 6. Implementação Técnica

### 6.1 Estrutura de Rotas

```
/login                          → Tela de seleção (funcionário/representante)
/login/employee                 → Login funcionário
/login/representative           → Login representante
/register/representative        → Cadastro representante
/dashboard/employee             → Dashboard funcionário
/dashboard/representative       → Dashboard representante
/representative/commissions     → Módulo de comissões
/representative/orders/new      → Novo pedido
```

### 6.2 Schema de Autenticação

```typescript
// Tipos de usuário
type UserType = "employee" | "representative";

// Login request
type LoginRequest = {
  identifier: string; // email ou CPF
  password: string;
  userType: UserType;
  remember?: boolean;
};

// Response
type LoginResponse = {
  token: string;
  user: {
    id: string;
    type: UserType;
    email: string;
    name: string;
    // Para funcionário
    organizations?: Organization[];
    // Para representante
    representativeId?: string;
    pendingCommissions?: number;
  };
};
```

### 6.3 Componentes Necessários

#### **Novos Componentes**

1. **`UserTypeSelector`**
   - Tela inicial de seleção
   - Dois cards grandes
   - Animações suaves

2. **`RepresentativeLoginForm`**
   - Aceita email ou CPF
   - Validação específica
   - Link para cadastro

3. **`RepresentativeRegisterForm`**
   - Dados pessoais
   - Validação de CPF
   - Termos específicos

4. **`OrderForm`** (Pedido de Venda)
   - Todos os campos da imagem
   - Validações
   - Busca de cliente
   - Cálculo de parcelas

5. **`RepresentativeDashboard`**
   - Resumo de comissões
   - Pedidos pendentes
   - Histórico
   - Ações rápidas

---

## 7. Checklist de Implementação

### 7.1 Fase 1: Seleção de Tipo de Usuário

- [ ] Criar componente `UserTypeSelector`
- [ ] Criar rota `/login` com seleção
- [ ] Criar rotas separadas `/login/employee` e `/login/representative`
- [ ] Atualizar navegação

### 7.2 Fase 2: Login de Representante

- [ ] Criar `RepresentativeLoginForm`
- [ ] Aceitar email OU CPF
- [ ] Validação de CPF
- [ ] Mensagens específicas
- [ ] Link para cadastro

### 7.3 Fase 3: Cadastro de Representante

- [ ] Criar `RepresentativeRegisterForm`
- [ ] Validação de CPF (busca automática)
- [ ] Termos específicos
- [ ] Fluxo de ativação

### 7.4 Fase 4: Dashboard Representante

- [ ] Criar `RepresentativeDashboard`
- [ ] Resumo de comissões
- [ ] Lista de pedidos
- [ ] Ações rápidas

### 7.5 Fase 5: Formulário de Pedido

- [ ] Criar `OrderForm`
- [ ] Todos os campos da imagem
- [ ] Busca de cliente
- [ ] Cálculo de parcelas
- [ ] Validações completas

### 7.6 Fase 6: Backend

- [ ] Criar modelo `Representative`
- [ ] Endpoint de login representante
- [ ] Endpoint de cadastro
- [ ] Endpoint de pedidos
- [ ] Validações de negócio

---

## 8. Métricas de Sucesso

### 8.1 KPIs de Login

- **Taxa de conversão de login:**
  - Funcionários: > 95%
  - Representantes: > 80%

- **Tempo médio de login:**
  - < 30 segundos (primeira vez)
  - < 10 segundos (usuários recorrentes)

- **Taxa de abandono:**
  - < 5% (funcionários)
  - < 15% (representantes)

### 8.2 KPIs de Representantes

- **Taxa de cadastro:**
  - > 70% dos representantes convidados

- **Taxa de lançamento:**
  - > 60% dos representantes cadastrados lançam pelo menos 1 pedido

- **Tempo para primeiro pedido:**
  - < 5 minutos após cadastro

---

## 9. Próximos Passos

### 9.1 Prioridade ALTA

1. ✅ Implementar seleção de tipo de usuário
2. ✅ Criar login específico para representantes
3. ✅ Criar cadastro de representantes
4. ✅ Implementar formulário de pedido

### 9.2 Prioridade MÉDIA

1. Dashboard de representante
2. Onboarding interativo
3. Notificações de comissões
4. Histórico de pedidos

### 9.3 Prioridade BAIXA

1. App mobile para representantes
2. Integração com WhatsApp
3. Relatórios avançados
4. Exportação de dados

---

## 10. Referências e Inspiração

### 10.1 Padrões de UI

- **Material Design** - Cards de seleção
- **Ant Design** - Formulários complexos
- **Chakra UI** - Feedback visual

### 10.2 Exemplos de Portais Externos

- Portais de fornecedores
- Portais de parceiros
- Sistemas de comissão

---

**Última atualização:** 2025-01-19  
**Versão:** 1.0.0  
**Status:** Proposta para implementação
