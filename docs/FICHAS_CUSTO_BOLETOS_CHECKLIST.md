# 📋 Checklist - Implementação de Boletos - Fichas de Custo

## ✅ Status: Em Implementação

**Data de início:** 2025-01-11

---

## 🎯 Objetivo

Implementar todas as funcionalidades relacionadas a boletos nas fichas de custo, conforme especificação funcional seção 9.

---

## 📝 Checklist Detalhado

### 1. Domain Layer (DDD)

#### 1.1 Entity Boleto

- [ ] Criar `apps/api/src/modules/fichas-custo/domain/entities/boleto.ts`
  - [ ] Props: id, fichaCustoId, insumoId, fornecedorId, fornecedorNome, arquivoUrl, arquivoStorageKey, valorBoleto, dataVencimento, codigoBarras, linhaDigitavel, status, dataPagamento, observacoes, anexadoPor, pagoPor
  - [ ] Value Object para `ValorBoleto` (usar ValorMonetario)
  - [ ] Value Object para `StatusBoleto`
  - [ ] Método `criar()`
  - [ ] Método `marcarComoPago()`
  - [ ] Método `validarValorNaoExcedeFicha()`
  - [ ] Validações de negócio

#### 1.2 Métodos na Entity FichaCusto

- [ ] Método `anexarBoleto(boleto: Boleto, actorId: string)`
  - [ ] Validar que ficha está aprovada (`podeAnexarBoleto()`)
  - [ ] Validar valor não excede custo final (`validarValorBoleto()`)
  - [ ] Adicionar boleto ao array
  - [ ] Criar evento de domínio `BoletoAnexadoFicha`
- [ ] Método `pagarBoleto(boletoId: string, actorId: string, dataPagamento?: Date)`
  - [ ] Buscar boleto por ID
  - [ ] Validar que boleto existe
  - [ ] Validar que boleto não está pago
  - [ ] Marcar como pago
  - [ ] Criar evento de domínio `BoletoPagoFicha`

- [ ] Método `listarBoletos()`: retorna array de boletos
- [ ] Método `buscarBoletoPorId(boletoId: string)`: retorna boleto ou null
- [ ] Método `removerBoleto(boletoId: string, actorId: string)` (se permitido)

#### 1.3 Atualizar FichaCustoProps

- [ ] Adicionar campo `boletos: Boleto[]` na entidade FichaCusto

### 2. Repository Layer

#### 2.1 Atualizar FichaCustoRepository Interface

- [ ] Adicionar métodos para boletos:
  - [ ] `buscarBoletoPorId(boletoId: string, orgId: string): Promise<Boleto | null>`
  - [ ] `listarBoletosPorFicha(fichaCustoId: string, orgId: string): Promise<Boleto[]>`

#### 2.2 Atualizar PrismaFichaCustoRepository

- [ ] Mapear `BoletoFichaCusto` do Prisma para Entity `Boleto`
- [ ] Mapear Entity `Boleto` para `BoletoFichaCusto` do Prisma
- [ ] Implementar `buscarBoletoPorId()`
- [ ] Implementar `listarBoletosPorFicha()`
- [ ] Atualizar método `salvar()` para incluir boletos
- [ ] Atualizar método `toDomain()` para incluir boletos

### 3. Application Layer

#### 3.1 Schemas Zod

- [x] `criarBoletoFichaCustoSchema` (já existe)
- [x] `atualizarBoletoFichaCustoSchema` (já existe)
- [x] `pagarBoletoFichaCustoSchema` (já existe)
- [ ] Adicionar `removerBoletoFichaCustoSchema` (se necessário)

#### 3.2 Use Cases

- [ ] `AnexarBoletoFichaCustoUseCase`
  - [ ] Validar input com schema
  - [ ] Buscar ficha de custo
  - [ ] Validar que ficha está aprovada
  - [ ] Criar entity Boleto
  - [ ] Validar valor do boleto
  - [ ] Anexar boleto à ficha
  - [ ] Salvar no repository
  - [ ] Publicar evento de domínio
  - [ ] Retornar boleto criado

- [ ] `PagarBoletoFichaCustoUseCase`
  - [ ] Validar input com schema
  - [ ] Buscar ficha de custo
  - [ ] Buscar boleto na ficha
  - [ ] Validar que boleto existe e não está pago
  - [ ] Marcar boleto como pago
  - [ ] Salvar no repository
  - [ ] Publicar evento de domínio
  - [ ] Retornar boleto atualizado

- [ ] `ListarBoletosFichaCustoUseCase`
  - [ ] Buscar ficha de custo
  - [ ] Validar acesso
  - [ ] Listar boletos da ficha
  - [ ] Retornar array de boletos

- [ ] `RemoverBoletoFichaCustoUseCase` (opcional, se permitido)
  - [ ] Validar input
  - [ ] Buscar ficha de custo
  - [ ] Buscar boleto
  - [ ] Validar permissões
  - [ ] Remover boleto
  - [ ] Salvar no repository
  - [ ] Publicar evento (se necessário)

### 4. HTTP Layer (REST API)

#### 4.1 Rotas

- [ ] `POST /organizations/:orgId/fichas-custo/:id/boletos`
  - [ ] Handler para anexar boleto
  - [ ] Validação de autenticação
  - [ ] Validação de tenant
  - [ ] Chamar `AnexarBoletoFichaCustoUseCase`
  - [ ] Retornar boleto criado (201)

- [ ] `GET /organizations/:orgId/fichas-custo/:id/boletos`
  - [ ] Handler para listar boletos
  - [ ] Validação de autenticação
  - [ ] Validação de tenant
  - [ ] Chamar `ListarBoletosFichaCustoUseCase`
  - [ ] Retornar array de boletos (200)

- [ ] `POST /organizations/:orgId/fichas-custo/:id/boletos/:boletoId/pagar`
  - [ ] Handler para pagar boleto
  - [ ] Validação de autenticação
  - [ ] Validação de tenant
  - [ ] Chamar `PagarBoletoFichaCustoUseCase`
  - [ ] Retornar boleto atualizado (200)

- [ ] `DELETE /organizations/:orgId/fichas-custo/:id/boletos/:boletoId` (opcional)
  - [ ] Handler para remover boleto
  - [ ] Validação de autenticação
  - [ ] Validação de tenant
  - [ ] Chamar `RemoverBoletoFichaCustoUseCase`
  - [ ] Retornar 204 No Content

#### 4.2 Atualizar index.ts

- [ ] Exportar novas rotas
- [ ] Registrar rotas no módulo

### 5. Frontend

#### 5.1 API Client

- [ ] Adicionar tipos TypeScript para `Boleto`
- [ ] Método `anexarBoleto(fichaCustoId, dados)`
- [ ] Método `listarBoletos(fichaCustoId)`
- [ ] Método `pagarBoleto(fichaCustoId, boletoId, dataPagamento?)`
- [ ] Método `removerBoleto(fichaCustoId, boletoId)` (se permitido)

#### 5.2 Hooks

- [ ] `useBoletosFichaCusto(fichaCustoId)` - listar boletos
- [ ] Métodos no `useFichaCusto` para anexar/pagar boletos

#### 5.3 Componentes UI

- [ ] Componente `BoletoForm` - formulário para anexar boleto
- [ ] Componente `BoletoList` - lista de boletos de uma ficha
- [ ] Componente `BoletoCard` - card individual de boleto
- [ ] Integrar no `fichas-custo-client.tsx`
- [ ] Modal para upload de arquivo do boleto
- [ ] Validação de valor máximo (não exceder custo final)
- [ ] Indicadores visuais de status (pendente/pago)

### 6. Integrações

#### 6.1 Event Bus

- [x] Eventos de domínio já definidos (`BoletoAnexadoFicha`, `BoletoPagoFicha`)
- [ ] Verificar publicação de eventos nos use cases

#### 6.2 Notificações (Futuro)

- [ ] Notificar financeiro quando boleto é anexado
- [ ] Notificar gerência quando boleto é pago

### 7. Testes e Validações

#### 7.1 Validações de Negócio

- [ ] Boleto só pode ser anexado em ficha aprovada
- [ ] Valor do boleto não pode exceder custo final da ficha
- [ ] Boleto pago não pode ser alterado
- [ ] Apenas boletos pendentes podem ser pagos

#### 7.2 Validações de Dados

- [ ] Valor do boleto > 0
- [ ] Data de vencimento obrigatória
- [ ] Ficha de custo deve existir
- [ ] Boleto deve existir para pagar/remover

---

## 🚀 Ordem de Implementação

1. ✅ **Domain Layer** (Entity Boleto + métodos na FichaCusto)
2. ✅ **Repository** (atualizar para lidar com boletos)
3. ✅ **Use Cases** (4 use cases principais)
4. ✅ **HTTP Routes** (4 rotas REST)
5. ✅ **Frontend** (API client, hooks, componentes)

---

## 📊 Progresso

- [ ] 1. Domain Layer (0%)
- [ ] 2. Repository (0%)
- [ ] 3. Use Cases (0%)
- [ ] 4. HTTP Routes (0%)
- [ ] 5. Frontend (0%)

**Total: 0% completo**
