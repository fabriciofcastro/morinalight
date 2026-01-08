import { ProductResponseDTO, UpdateProductDTO } from "@/application/dto";
import { IEventBus, ILogger, IProductRepository } from "@/application/ports";
import { ProductEntity } from '@/domain/entities';
import { BusinessRuleError } from "@/domain/errors";
import { Err, Ok, Result, isNone } from "@/shared/kernel/types";

export class UpdateProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly eventBus: IEventBus,
    private readonly logger: ILogger
  ) {}

  async execute(dto: UpdateProductDTO): Promise<Result<ProductResponseDTO>> {
    try {
      this.logger.info("Updating product", { productId: dto.id });

      const productOption = await this.productRepository.findById(dto.id);
      
      if (!productOption || isNone(productOption)) {
        return Err(new BusinessRuleError(`Product with ID ${dto.id} not found`));
      }

      let product = productOption;

      // Reconstruct entity with updates to enforce validation rules via Factory
      const currentData = product.toPersistence();
      
      product = ProductEntity.create({
        id: currentData.id,
        sku: currentData.sku,
        name: dto.name ?? currentData.name,
        description: dto.description ?? currentData.description,
        categoryId: dto.categoryId ?? currentData.categoryId,
        brand: dto.brand ?? currentData.brand,
        unit: dto.unit ?? currentData.unit,
        status: (dto.status as any) ?? currentData.status,
        costPrice: dto.costPrice ?? currentData.costPrice,
        sellingPrice: dto.sellingPrice ?? currentData.sellingPrice,
        minStock: dto.minStock ?? currentData.minStock,
        maxStock: dto.maxStock ?? currentData.maxStock,
        currentStock: dto.currentStock ?? currentData.currentStock,
        imageUrl: dto.imageUrl ?? currentData.imageUrl
      });

      await this.productRepository.save(product);

      this.logger.info("Product updated successfully", { productId: product.id });

      return Ok(product.toJSON() as ProductResponseDTO);

    } catch (error: any) {
      this.logger.error("Failed to update product", error);
      return Err(new BusinessRuleError(error.message || "Failed to update product"));
    }
  }
}
