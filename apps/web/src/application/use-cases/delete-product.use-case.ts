import { IEventBus, ILogger, IProductRepository } from "@/application/ports";
import { BusinessRuleError } from "@/domain/errors";
import { Err, Ok, Result, isNone } from "@/shared/kernel/types";

export class DeleteProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly eventBus: IEventBus,
    private readonly logger: ILogger
  ) {}

  async execute(id: string): Promise<Result<void>> {
    try {
      this.logger.info("Deleting product", { productId: id });

      const productOption = await this.productRepository.findById(id);

      if (isNone(productOption)) {
        return Err(new BusinessRuleError(`Product with ID ${id} not found`));
      }

      await this.productRepository.delete(id);

      this.logger.info("Product deleted successfully", { productId: id });

      return Ok(undefined);

    } catch (error: any) {
      this.logger.error("Failed to delete product", error);
      return Err(new BusinessRuleError(error.message));
    }
  }
}
