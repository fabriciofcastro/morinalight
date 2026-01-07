# Clean Architecture - MorinaLight

## 🎯 Overview

Este projeto implementa **Clean Architecture** rigorosa com:

- ✅ **Domain-Driven Design** (DDD)
- ✅ **SOLID Principles**
- ✅ **Hexagonal Architecture** (Ports & Adapters)
- ✅ **Event-Driven Frontend**
- ✅ **CQRS** (Command Query Responsibility Segregation)
- ✅ **Type-Safe** (Zero `any`, Zod validation)

---

## 📁 Estrutura de Diretórios

```
src/
├── domain/                 # ⭐ Regras de negócio puras
│   ├── entities/           # Entidades com comportamento
│   ├── value-objects/      # Objetos de valor imutáveis
│   ├── events/             # Domain Events
│   ├── policies/           # Regras de negócio complexas
│   └── errors/             # Erros de domínio
│
├── application/            # ⭐ Casos de uso e contratos
│   ├── use-cases/          # Commands (write operations)
│   ├── queries/            # Queries (read operations)
│   ├── ports/              # Interfaces para infraestrutura
│   ├── dto/                # Data Transfer Objects
│   └── contracts/          # Validações com Zod
│
├── infrastructure/         # ⭐ Implementações concretas
│   ├── database/           # Prisma repositories
│   ├── events/             # Event bus
│   ├── logger/             # Logger
│   ├── http/               # API clients
│   └── auth/               # Auth adapters
│
├── presentation/           # ⭐ UI Layer
│   ├── hooks/              # Custom hooks
│   ├── components/         # React components
│   └── view-models/        # Presentation logic
│
├── shared/                 # ⭐ Cross-cutting
│   └── kernel/
│       ├── types/          # Result, Option
│       └── utils/          # Pure functions
│
└── app/                    # ⭐ Next.js integration
    ├── providers.tsx       # Composition Root (DI)
    └── (routes)/           # Pages
```

---

## 🏗️ Dependency Rule

```
domain ← application ← presentation
           ↑
    infrastructure
```

**Regra de Ouro**: Dependências sempre apontam para dentro (domain).

- ✅ `domain` não depende de nada
- ✅ `application` depende apenas de `domain`
- ✅ `infrastructure` implementa ports de `application`
- ✅ `presentation` usa `application`

---

## 💡 Como Usar

### 1. Criar uma Entidade de Domínio

```typescript
// domain/entities/product.entity.ts
export class ProductEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly price: Money
  ) {}

  static create(props: { id: string; name: string; price: number }) {
    return new ProductEntity(
      props.id,
      props.name,
      Money.create(props.price, 'BRL')
    );
  }

  applyDiscount(percentage: number): ProductEntity {
    const newPrice = this.price.multiply(1 - percentage / 100);
    return new ProductEntity(this.id, this.name, newPrice);
  }
}
```

### 2. Criar um Use Case

```typescript
// application/use-cases/create-product.use-case.ts
export class CreateProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly eventBus: IEventBus,
    private readonly logger: ILogger
  ) {}

  async execute(dto: CreateProductDTO): Promise<Result<ProductResponseDTO>> {
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
      new ProductCreatedEvent(product.id, product.name)
    );

    // 5. Retornar DTO
    return Ok({
      id: product.id,
      name: product.name,
      price: product.price.getValue(),
    });
  }
}
```

### 3. Criar um Port (Interface)

```typescript
// application/ports/product-repository.port.ts
export interface IProductRepository {
  save(product: ProductEntity): Promise<void>;
  findById(id: string): Promise<Option<ProductEntity>>;
  delete(id: string): Promise<void>;
}
```

### 4. Implementar Adapter

```typescript
// infrastructure/database/prisma-product.repository.ts
export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(product: ProductEntity): Promise<void> {
    await this.prisma.product.upsert({
      where: { id: product.id },
      create: {
        id: product.id,
        name: product.name,
        price: product.price.getValue(),
      },
      update: {
        name: product.name,
        price: product.price.getValue(),
      },
    });
  }

  async findById(id: string): Promise<Option<ProductEntity>> {
    const data = await this.prisma.product.findUnique({ where: { id } });
    if (!data) return None();
    return Some(this.toDomain(data));
  }

  private toDomain(data: any): ProductEntity {
    return ProductEntity.create({
      id: data.id,
      name: data.name,
      price: data.price,
    });
  }
}
```

### 5. Registrar no DI Container

```typescript
// app/providers.tsx
const productRepository = new PrismaProductRepository(prisma);
const createProductUseCase = new CreateProductUseCase(
  productRepository,
  eventBus,
  logger
);

container.register('CreateProductUseCase', createProductUseCase);
```

### 6. Criar Hook de Apresentação

```typescript
// presentation/hooks/use-create-product.ts
export function useCreateProduct() {
  const createProductUseCase = useInjection<CreateProductUseCase>(
    'CreateProductUseCase'
  );

  return useMutation({
    mutationFn: async (dto: CreateProductDTO) => {
      const result = await createProductUseCase.execute(dto);
      if (!isOk(result)) throw result.error;
      return result.value;
    },
  });
}
```

### 7. Usar no Componente

```typescript
// presentation/components/create-product-form.tsx
export function CreateProductForm() {
  const { mutate, isPending } = useCreateProduct();

  const handleSubmit = (data: CreateProductDTO) => {
    mutate(data, {
      onSuccess: () => toast.success('Product created!'),
      onError: (err) => toast.error(err.message),
    });
  };

  return <form onSubmit={handleSubmit}>{/* UI */}</form>;
}
```

---

## 🧪 Testing

### Domain Layer (Unit Tests)

```typescript
describe('UserEntity', () => {
  it('should create user with valid data', () => {
    const user = UserEntity.create({
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
    });

    expect(user.email.getValue()).toBe('test@example.com');
  });

  it('should throw error for invalid email', () => {
    expect(() => {
      UserEntity.create({
        id: '123',
        email: 'invalid',
        name: 'Test',
      });
    }).toThrow(ValidationError);
  });
});
```

### Application Layer (Integration Tests)

```typescript
describe('CreateUserUseCase', () => {
  it('should create user successfully', async () => {
    const mockRepo = {
      save: jest.fn(),
      findByEmail: jest.fn().mockResolvedValue(None()),
    };

    const useCase = new CreateUserUseCase(mockRepo, mockEventBus, mockLogger);

    const result = await useCase.execute({
      email: 'test@example.com',
      name: 'Test',
      password: 'Pass123',
    });

    expect(isOk(result)).toBe(true);
    expect(mockRepo.save).toHaveBeenCalled();
  });
});
```

---

## 📚 Patterns Utilizados

### 1. Result Type (Railway-Oriented Programming)

```typescript
const result = await useCase.execute(dto);

if (isOk(result)) {
  console.log(result.value);
} else {
  console.error(result.error);
}
```

### 2. Option Type (Null Safety)

```typescript
const user = await repository.findById('123');

if (isSome(user)) {
  console.log(user.name);
} else {
  console.log('Not found');
}
```

### 3. Domain Events

```typescript
// Publicar
await eventBus.publish(new UserCreatedEvent(userId, email));

// Subscrever
eventBus.subscribe('user.created', async (event) => {
  await sendWelcomeEmail(event.payload.email);
});
```

### 4. Value Objects

```typescript
const email = Email.create('user@example.com');
const cpf = CPF.create('12345678901');
const role = UserRole.admin();
```

---

## 🚀 Demo Pages

Acesse as páginas de demonstração:

- **Lista de Usuários**: `/clean-arch-demo/users`
- **Criar Usuário**: `/clean-arch-demo/users/new`

---

## 📖 Referências

- [Clean Architecture (Uncle Bob)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)

---

## ✅ Checklist de Validação

Ao criar novo código, valide:

- [ ] Domain não importa de outras camadas?
- [ ] Application define ports, não implementações?
- [ ] Infrastructure implementa ports?
- [ ] Presentation usa apenas application?
- [ ] Sem uso de `any`?
- [ ] Validação com Zod em boundaries?
- [ ] Eventos de domínio publicados?
- [ ] Testes escritos?

---

## 🎯 Próximos Passos

1. Migrar módulos existentes para nova arquitetura
2. Adicionar testes unitários e de integração
3. Criar ESLint rules para validar dependency rule
4. Documentar ADRs (Architectural Decision Records)
5. Treinar equipe na nova arquitetura
