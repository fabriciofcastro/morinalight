import { ProductEntity } from '@/domain/entities/product.entity';
import { ValidationError } from '@/domain/errors';
import { Err, isSome, Ok, Result } from '@/shared/kernel/types';
import { generateUUID } from '@/shared/kernel/utils';
import { createProductSchema } from '../contracts';
import type { CreateProductDTO, ProductResponseDTO } from '../dto';
import type { IEventBus, ILogger, IProductRepository, IUnitOfWork } from '../ports';

/**
 * CreateProductUseCase
 * 
 * Caso de uso para criar um novo produto.
 */
export class CreateProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly uow: IUnitOfWork,
    private readonly eventBus: IEventBus,
    private readonly logger: ILogger
  ) {}

  async execute(dto: CreateProductDTO): Promise<Result<ProductResponseDTO, Error>> {
    try {
      // 1. Validar entrada com Zod
      const validation = createProductSchema.safeParse(dto);
      if (!validation.success) {
        return Err(new ValidationError(validation.error.message));
      }

      return await this.uow.start(async () => {
        // 2. Verificar se SKU já existe
        const existingProduct = await this.productRepository.findBySku(dto.sku);
        if (isSome(existingProduct)) {
          return Err(new ValidationError('Product with this SKU already exists', 'sku', dto.sku));
        }

        // 3. Criar entidade de domínio
        const product = ProductEntity.create({
          ...dto,
          id: generateUUID(),
          status: dto.status as any, // O enum suporta os mesmos valores literais do DTO
        });

        // 4. Persistir
        await this.productRepository.save(product);

        // 5. Publicar evento via Outbox
        await this.uow.saveMessage('product.created', {
          productId: product.id,
          sku: product.sku.getValue(),
          name: product.name.getValue(),
          categoryId: product.categoryId,
          sellingPrice: product.sellingPrice.getValue(),
        });

        this.logger.info('Product created successfully with UoW and Outbox', { 
          productId: product.id, 
          sku: product.sku.getValue() 
        });

        return Ok(product.toJSON() as unknown as ProductResponseDTO);
      });
    } catch (error) {
      this.logger.error('Failed to create product', error as Error);
      return Err(error as Error);
    }
  }
}
