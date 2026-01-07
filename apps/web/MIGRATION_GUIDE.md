# Clean Architecture - Migration Guide

## 🎯 Objetivo

Este guia mostra como migrar módulos existentes do MorinaLight para a nova Clean Architecture.

---

## 📋 Estratégia de Migração

### Abordagem: **Strangler Fig Pattern**

Não faremos rewrite completo. Vamos:

1. ✅ Criar nova implementação em paralelo
2. ✅ Redirecionar tráfego gradualmente
3. ✅ Manter código antigo funcionando
4. ✅ Remover código antigo após validação

### Ordem Recomendada

```
1. Módulos Críticos (User, Auth)
   ↓
2. Módulos de Negócio (Product, Order)
   ↓
3. Módulos Auxiliares (Reports, Analytics)
   ↓
4. Módulos Legacy (Features antigas)
```

---

## 🔄 Passo a Passo: Migrar um Módulo

### Exemplo: Migrar módulo de **Produtos**

#### **Passo 1: Analisar Código Existente**

Identifique:
- [ ] Onde está a lógica de negócio?
- [ ] Quais são as regras de validação?
- [ ] Quais eventos são disparados?
- [ ] Quais dependências externas existem?

**Exemplo - Código Antigo**:
```typescript
// ❌ Código antigo em components/products/product-form.tsx
export function ProductForm() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);

  const handleSubmit = async () => {
    // ❌ Validação no componente
    if (name.length < 3) {
      toast.error('Nome muito curto');
      return;
    }

    // ❌ Lógica de negócio no componente
    if (price < 0) {
      toast.error('Preço inválido');
      return;
    }

    // ❌ Chamada direta ao Prisma
    await prisma.product.create({
      data: { name, price }
    });

    toast.success('Produto criado!');
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

#### **Passo 2: Criar Domain Layer**

**2.1 - Value Objects**

```typescript
// ✅ domain/value-objects/product-name.ts
export class ProductName {
  private constructor(private readonly value: string) {}

  static create(name: string): ProductName {
    if (!name || name.trim().length < 3) {
      throw new ValidationError('Product name must be at least 3 characters', 'name');
    }

    if (name.length > 100) {
      throw new ValidationError('Product name cannot exceed 100 characters', 'name');
    }

    return new ProductName(name.trim());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ProductName): boolean {
    return this.value === other.value;
  }
}
```

```typescript
// ✅ domain/value-objects/money.ts
export class Money {
  private constructor(
    private readonly amount: number,
    private readonly currency: string
  ) {}

  static create(amount: number, currency: string = 'BRL'): Money {
    if (amount < 0) {
      throw new ValidationError('Amount cannot be negative', 'amount');
    }

    return new Money(amount, currency);
  }

  getValue(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new BusinessRuleError('Cannot add different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }
}
```

**2.2 - Entity**

```typescript
// ✅ domain/entities/product.entity.ts
export class ProductEntity {
  constructor(
    public readonly id: string,
    public readonly name: ProductName,
    public readonly price: Money,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly isActive: boolean
  ) {}

  static create(props: {
    id: string;
    name: string;
    price: number;
  }): ProductEntity {
    return new ProductEntity(
      props.id,
      ProductName.create(props.name),
      Money.create(props.price),
      new Date(),
      new Date(),
      true
    );
  }

  static fromPersistence(data: any): ProductEntity {
    return new ProductEntity(
      data.id,
      ProductName.create(data.name),
      Money.create(data.price, data.currency || 'BRL'),
      data.createdAt,
      data.updatedAt,
      data.isActive
    );
  }

  updatePrice(newPrice: number): ProductEntity {
    return new ProductEntity(
      this.id,
      this.name,
      Money.create(newPrice),
      this.createdAt,
      new Date(),
      this.isActive
    );
  }

  applyDiscount(percentage: number): ProductEntity {
    const discountedPrice = this.price.multiply(1 - percentage / 100);
    return new ProductEntity(
      this.id,
      this.name,
      discountedPrice,
      this.createdAt,
      new Date(),
      this.isActive
    );
  }

  toPersistence() {
    return {
      id: this.id,
      name: this.name.getValue(),
      price: this.price.getValue(),
      currency: this.price.getCurrency(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive,
    };
  }
}
```

**2.3 - Domain Events**

```typescript
// ✅ domain/events/product-created.event.ts
export class ProductCreatedEvent extends BaseDomainEvent {
  constructor(
    public readonly productId: string,
    public readonly name: string,
    public readonly price: number
  ) {
    super();
  }

  getEventName(): string {
    return 'product.created';
  }

  getPayload(): Record<string, unknown> {
    return {
      productId: this.productId,
      name: this.name,
      price: this.price,
    };
  }
}
```

---

#### **Passo 3: Criar Application Layer**

**3.1 - Port (Interface)**

```typescript
// ✅ application/ports/product-repository.port.ts
export interface IProductRepository {
  save(product: ProductEntity): Promise<void>;
  findById(id: string): Promise<Option<ProductEntity>>;
  findAll(): Promise<ProductEntity[]>;
  delete(id: string): Promise<void>;
}
```

**3.2 - DTO**

```typescript
// ✅ application/dto/create-product.dto.ts
export interface CreateProductDTO {
  name: string;
  price: number;
}

export interface ProductResponseDTO {
  id: string;
  name: string;
  price: number;
  currency: string;
  createdAt: string;
  isActive: boolean;
}
```

**3.3 - Contract (Validação)**

```typescript
// ✅ application/contracts/create-product.contract.ts
import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(3).max(100),
  price: z.number().min(0),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
```

**3.4 - Use Case**

```typescript
// ✅ application/use-cases/create-product.use-case.ts
export class CreateProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly eventBus: IEventBus,
    private readonly logger: ILogger
  ) {}

  async execute(dto: CreateProductDTO): Promise<Result<ProductResponseDTO>> {
    try {
      // 1. Validar entrada
      const validation = createProductSchema.safeParse(dto);
      if (!validation.success) {
        return Err(new ValidationError(validation.error.message));
      }

      // 2. Criar entidade
      const product = ProductEntity.create({
        id: generateUUID(),
        name: dto.name,
        price: dto.price,
      });

      // 3. Persistir
      await this.productRepository.save(product);

      // 4. Publicar evento
      await this.eventBus.publish(
        new ProductCreatedEvent(
          product.id,
          product.name.getValue(),
          product.price.getValue()
        )
      );

      // 5. Log
      this.logger.info('Product created', { productId: product.id });

      // 6. Retornar DTO
      return Ok({
        id: product.id,
        name: product.name.getValue(),
        price: product.price.getValue(),
        currency: product.price.getCurrency(),
        createdAt: product.createdAt.toISOString(),
        isActive: product.isActive,
      });
    } catch (error) {
      this.logger.error('Failed to create product', error as Error);
      return Err(error as Error);
    }
  }
}
```

---

#### **Passo 4: Criar Infrastructure Layer**

**4.1 - Repository**

```typescript
// ✅ infrastructure/database/prisma-product.repository.ts
export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(product: ProductEntity): Promise<void> {
    const data = product.toPersistence();

    await this.prisma.product.upsert({
      where: { id: product.id },
      create: data,
      update: data,
    });
  }

  async findById(id: string): Promise<Option<ProductEntity>> {
    const data = await this.prisma.product.findUnique({ where: { id } });
    if (!data) return None();
    return Some(ProductEntity.fromPersistence(data));
  }

  async findAll(): Promise<ProductEntity[]> {
    const products = await this.prisma.product.findMany();
    return products.map(ProductEntity.fromPersistence);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({ where: { id } });
  }
}
```

---

#### **Passo 5: Criar Presentation Layer**

**5.1 - Hook**

```typescript
// ✅ presentation/hooks/use-create-product.ts
export function useCreateProduct() {
  const queryClient = useQueryClient();
  const createProductUseCase = useInjection<CreateProductUseCase>('CreateProductUseCase');

  return useMutation({
    mutationFn: async (dto: CreateProductDTO) => {
      const result = await createProductUseCase.execute(dto);
      if (!isOk(result)) throw result.error;
      return result.value;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
```

**5.2 - Component (Refatorado)**

```typescript
// ✅ presentation/components/create-product-form.tsx
export function CreateProductForm() {
  const { mutate, isPending } = useCreateProduct();
  const [formData, setFormData] = useState<CreateProductDTO>({
    name: '',
    price: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    mutate(formData, {
      onSuccess: () => {
        toast.success('Product created!');
        setFormData({ name: '', price: 0 });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <input
        type="number"
        value={formData.price}
        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
      />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Product'}
      </button>
    </form>
  );
}
```

---

#### **Passo 6: Registrar no DI Container**

```typescript
// ✅ app/providers.tsx
function initializeDIContainer(): DIContainer {
  // ... existing code ...

  // Product module
  const productRepository = new PrismaProductRepository(prisma);
  const createProductUseCase = new CreateProductUseCase(
    productRepository,
    eventBus,
    logger
  );

  container.register('ProductRepository', productRepository);
  container.register('CreateProductUseCase', createProductUseCase);

  return container;
}
```

---

#### **Passo 7: Testar**

**7.1 - Testes de Domínio**

```typescript
// ✅ domain/entities/__tests__/product.entity.spec.ts
describe('ProductEntity', () => {
  it('should create product with valid data', () => {
    const product = ProductEntity.create({
      id: '123',
      name: 'Product Name',
      price: 99.99,
    });

    expect(product.name.getValue()).toBe('Product Name');
    expect(product.price.getValue()).toBe(99.99);
  });

  it('should apply discount correctly', () => {
    const product = ProductEntity.create({
      id: '123',
      name: 'Product',
      price: 100,
    });

    const discounted = product.applyDiscount(10); // 10% off

    expect(discounted.price.getValue()).toBe(90);
  });
});
```

**7.2 - Testes de Use Case**

```typescript
// ✅ application/use-cases/__tests__/create-product.use-case.spec.ts
describe('CreateProductUseCase', () => {
  it('should create product successfully', async () => {
    const mockRepo = {
      save: jest.fn(),
    };

    const useCase = new CreateProductUseCase(mockRepo, mockEventBus, mockLogger);

    const result = await useCase.execute({
      name: 'Product',
      price: 99.99,
    });

    expect(isOk(result)).toBe(true);
    expect(mockRepo.save).toHaveBeenCalled();
  });
});
```

---

#### **Passo 8: Migração Gradual**

**8.1 - Feature Flag**

```typescript
// ✅ Usar feature flag para controlar migração
const USE_NEW_ARCHITECTURE = process.env.NEXT_PUBLIC_USE_CLEAN_ARCH === 'true';

export function ProductPage() {
  if (USE_NEW_ARCHITECTURE) {
    return <NewCreateProductForm />; // Clean Architecture
  }
  return <OldProductForm />; // Código antigo
}
```

**8.2 - Redirecionar Gradualmente**

```
Semana 1: 10% dos usuários
Semana 2: 25% dos usuários
Semana 3: 50% dos usuários
Semana 4: 100% dos usuários
```

**8.3 - Remover Código Antigo**

Após validação completa:
```bash
# Remover código antigo
rm -rf src/components/products/old-product-form.tsx
rm -rf src/lib/old-product-service.ts
```

---

## 📋 Checklist de Migração

Para cada módulo:

### Domain Layer
- [ ] Value Objects criados
- [ ] Entities criadas
- [ ] Domain Events definidos
- [ ] Policies implementadas
- [ ] Testes unitários escritos

### Application Layer
- [ ] Ports (interfaces) definidos
- [ ] DTOs criados
- [ ] Contracts (Zod) criados
- [ ] Use Cases implementados
- [ ] Queries implementadas
- [ ] Testes de integração escritos

### Infrastructure Layer
- [ ] Repositories implementados
- [ ] Adapters criados
- [ ] Testes de adapter escritos

### Presentation Layer
- [ ] Hooks criados
- [ ] Components refatorados
- [ ] Sem lógica de negócio em components
- [ ] Testes de component escritos

### Integration
- [ ] Registrado no DI Container
- [ ] Feature flag configurada
- [ ] Testado end-to-end
- [ ] Documentado

---

## 🎯 Módulos Prioritários

### 1. User Module (FEITO ✅)
- ✅ Domain: UserEntity, Email, CPF, UserRole
- ✅ Application: CreateUserUseCase
- ✅ Infrastructure: PrismaUserRepository
- ✅ Presentation: useCreateUser

### 2. Product Module (PRÓXIMO)
- [ ] Domain: ProductEntity, ProductName, Money
- [ ] Application: CreateProductUseCase, UpdateProductUseCase
- [ ] Infrastructure: PrismaProductRepository
- [ ] Presentation: useCreateProduct, useProducts

### 3. Order Module
- [ ] Domain: OrderEntity, OrderItem, OrderStatus
- [ ] Application: CreateOrderUseCase, CancelOrderUseCase
- [ ] Infrastructure: PrismaOrderRepository
- [ ] Presentation: useCreateOrder, useOrders

### 4. Authentication Module
- [ ] Domain: Credentials, Session, Token
- [ ] Application: LoginUseCase, LogoutUseCase
- [ ] Infrastructure: NextAuthAdapter
- [ ] Presentation: useLogin, useLogout

---

## ⚠️ Armadilhas Comuns

### 1. Não Misturar Camadas

❌ **Errado**:
```typescript
// Domain importando React
import { useState } from 'react'; // ❌ NUNCA!

export class UserEntity {
  // ...
}
```

✅ **Correto**:
```typescript
// Domain puro
export class UserEntity {
  // Sem imports externos
}
```

### 2. Não Pular Validações

❌ **Errado**:
```typescript
const user = new UserEntity(id, email, name); // ❌ Construtor direto
```

✅ **Correto**:
```typescript
const user = UserEntity.create({ id, email, name }); // ✅ Factory com validação
```

### 3. Não Esquecer Eventos

❌ **Errado**:
```typescript
await repository.save(product);
// ❌ Esqueceu de publicar evento
```

✅ **Correto**:
```typescript
await repository.save(product);
await eventBus.publish(new ProductCreatedEvent(...)); // ✅ Evento publicado
```

---

## 📚 Recursos

- [CLEAN_ARCHITECTURE.md](file:///home/fabricio/projects/morinalight/apps/web/CLEAN_ARCHITECTURE.md) - Guia completo
- [CLEAN_ARCHITECTURE_SUMMARY.md](file:///home/fabricio/projects/morinalight/apps/web/CLEAN_ARCHITECTURE_SUMMARY.md) - Sumário
- [User Module](file:///home/fabricio/projects/morinalight/apps/web/src/domain/entities/user.entity.ts) - Exemplo completo

---

## ✅ Conclusão

Siga este guia para migrar cada módulo:

1. ✅ Analise código existente
2. ✅ Crie Domain Layer
3. ✅ Crie Application Layer
4. ✅ Crie Infrastructure Layer
5. ✅ Refatore Presentation Layer
6. ✅ Registre no DI Container
7. ✅ Teste completamente
8. ✅ Migre gradualmente
9. ✅ Remova código antigo

**Boa migração!** 🚀
