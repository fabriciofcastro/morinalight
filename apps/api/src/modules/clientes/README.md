# Módulo de Clientes e Representantes

Sistema completo para gestão de clientes, representantes, contratos e comissões, com integração ao e-millennium.

## Estrutura

### Domain Layer
- **Entities**: `Cliente`, `Representante`, `Contrato`, `Comissao`, `Venda`
- **Value Objects**: `ClienteId`, `RepresentanteId`
- **Repositories**: Interfaces para persistência

### Application Layer
- **Use Cases**:
  - `CriarClienteUseCase`
  - `CriarRepresentanteUseCase`
  - `CriarContratoUseCase`
  - `AssinarComissaoUseCase`
  - `PagarComissaoUseCase`
- **Schemas**: Validação com Zod

### Infrastructure Layer
- **Integrations**: `EmillenniumClient` - Cliente para API do e-millennium
- **Services**: `VendaSyncService` - Sincronização de vendas e cálculo de comissões
- **Prisma**: Implementações dos repositórios

## Funcionalidades

### 1. Cadastro de Cliente Avançado
- Dados pessoais/empresariais completos
- Suporte a pessoa física e jurídica
- Validação de documentos (CPF/CNPJ)
- Status: ativo, inativo, bloqueado

### 2. Cadastro de Representante
- Vinculado a um cliente
- Percentual de comissão configurável
- Status: ativo, inativo, suspenso
- Um cliente pode ter apenas um representante

### 3. Contratos
- Vinculado ao representante
- Define percentual de comissão
- Data de início e fim
- Valores mínimo e máximo
- Status: rascunho, pendente_assinatura, vigente, encerrado, cancelado
- Rastreamento de assinatura

### 4. Comissões
- Criadas automaticamente ao sincronizar vendas do e-millennium
- Status: pendente, calculada (assinada), paga, cancelada
- **Assinatura obrigatória**: O representante deve assinar para assumir responsabilidade
- Após assinatura, comissão é calculada e fica disponível para pagamento
- Rastreamento completo de pagamento

### 5. Integração com e-millennium
- Sincronização automática de vendas
- Cálculo automático de comissões baseado no contrato vigente
- Criação de comissões pendentes de assinatura
- Rastreamento de vendas por `emillenniumPedidoId`

## Fluxo de Comissões

1. **Venda no e-millennium** → Sistema sincroniza via `VendaSyncService`
2. **Criação de Venda** → Registro da venda no sistema
3. **Busca de Representante** → Verifica se cliente tem representante ativo
4. **Busca de Contrato Vigente** → Encontra contrato válido para o período
5. **Cálculo de Comissão** → Calcula baseado no percentual do contrato
6. **Criação de Comissão** → Status inicial: `pendente` (aguardando assinatura)
7. **Assinatura do Representante** → Representante assina assumindo responsabilidade
   - Status muda para `calculada`
   - Comissão fica disponível para pagamento
8. **Pagamento** → Sistema marca comissão como paga
   - Status muda para `paga`
   - Registro de número de pagamento e comprovante

## Configuração

### Variáveis de Ambiente

```env
# Configuração do e-millennium
EMILLENNIUM_BASE_URL=https://seu-dominio.com.br:PORTA
EMILLENNIUM_USERNAME=usuario
EMILLENNIUM_PASSWORD=senha
EMILLENNIUM_TENANT_ID=tenant-id
EMILLENNIUM_VITRINE_ID=vitrine-id
```

### Processo de Homologação

1. Contatar pós-venda do e-millennium para iniciar projeto de homologação
2. Obter credenciais de acesso ao WebService
3. Configurar variáveis de ambiente
4. Testar sincronização de vendas
5. Validar cálculo de comissões

## Próximos Passos

- [ ] Criar implementações Prisma dos repositórios
- [ ] Criar rotas HTTP
- [ ] Criar telas no frontend
- [ ] Adicionar testes
- [ ] Dashboard de comissões
- [ ] Relatórios de comissões pagas/não pagas

