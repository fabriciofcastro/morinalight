# JSDoc Documentation Guide

This guide provides templates and examples for documenting code using JSDoc.

## Use Case Documentation Template

```typescript
/**
 * [Use Case Name]
 * 
 * @description
 * [Detailed description of what this use case does]
 * 
 * Business Rules:
 * - [Rule 1]
 * - [Rule 2]
 * 
 * @example
 * ```typescript
 * const result = await useCase.execute({
 *   // Example DTO
 * });
 * 
 * if (result.success) {
 *   console.log('Success:', result.value);
 * }
 * ```
 * 
 * @param dto - [Description of DTO parameter]
 * @returns Result containing [success type] or error
 * 
 * @throws {ValidationError} When [condition]
 * @throws {BusinessRuleError} When [condition]
 * 
 * @emits [EventName] - When [condition]
 */
export class ExampleUseCase {
  async execute(dto: ExampleDTO): Promise<Result<ExampleEntity>> {
    // Implementation
  }
}
```

## Entity Documentation Template

```typescript
/**
 * [Entity Name]
 * 
 * @description
 * [What this entity represents in the domain]
 * 
 * Invariants:
 * - [Invariant 1]
 * - [Invariant 2]
 * 
 * @example
 * ```typescript
 * const entity = EntityName.create({
 *   // Properties
 * });
 * 
 * entity.someMethod();
 * ```
 */
export class ExampleEntity extends BaseEntity {
  /**
   * [Method description]
   * 
   * @param param - [Parameter description]
   * @returns [Return value description]
   * 
   * @throws {DomainError} When [condition]
   */
  someMethod(param: string): void {
    // Implementation
  }
}
```

## Value Object Documentation Template

```typescript
/**
 * [Value Object Name]
 * 
 * @description
 * [What this value object represents]
 * 
 * Validation Rules:
 * - [Rule 1]
 * - [Rule 2]
 * 
 * @example
 * ```typescript
 * const vo = ValueObject.create('value');
 * console.log(vo.getValue());
 * ```
 */
export class ExampleValueObject {
  /**
   * Creates a new [Value Object Name]
   * 
   * @param value - [Description of value parameter]
   * @returns New instance or null if invalid
   * 
   * @example
   * ```typescript
   * const email = Email.create('user@example.com');
   * ```
   */
  static create(value: string): ExampleValueObject | null {
    // Validation and creation logic
  }
}
```

## Repository Documentation Template

```typescript
/**
 * [Repository Name]
 * 
 * @description
 * [What this repository manages]
 * 
 * @implements {IRepository}
 */
export class ExampleRepository implements IExampleRepository {
  /**
   * [Method description]
   * 
   * @param entity - [Entity description]
   * @returns Promise that resolves when saved
   * 
   * @throws {RepositoryError} When [condition]
   * 
   * @example
   * ```typescript
   * await repository.save(entity);
   * ```
   */
  async save(entity: ExampleEntity): Promise<void> {
    // Implementation
  }
}
```

## Hook Documentation Template

```typescript
/**
 * [Hook Name]
 * 
 * @description
 * [What this hook does]
 * 
 * @returns Mutation object with mutate function and state
 * 
 * @example
 * ```typescript
 * const { mutate, isPending } = useExample();
 * 
 * mutate({ data }, {
 *   onSuccess: () => console.log('Success'),
 *   onError: (error) => console.error(error)
 * });
 * ```
 */
export function useExample() {
  // Implementation
}
```

## DTO Documentation Template

```typescript
/**
 * [DTO Name]
 * 
 * @description
 * Data transfer object for [purpose]
 * 
 * @property {string} field1 - [Description]
 * @property {number} field2 - [Description]
 * 
 * @example
 * ```typescript
 * const dto: ExampleDTO = {
 *   field1: 'value',
 *   field2: 123
 * };
 * ```
 */
export interface ExampleDTO {
  field1: string;
  field2: number;
}
```

## Best Practices

1. **Be Descriptive**: Explain WHY, not just WHAT
2. **Include Examples**: Show how to use the code
3. **Document Errors**: List all possible errors
4. **Link Related Code**: Use @see tags
5. **Keep Updated**: Update docs when code changes

## Tools

Generate documentation:
```bash
npx typedoc --out docs/api src/
```

View generated docs:
```bash
cd docs/api && python -m http.server
```
