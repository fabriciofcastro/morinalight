import { CancelOrderDTO } from "@/application/dto";
import { IEventBus, ILogger, IOrderRepository } from "@/application/ports"; // Ensure IOrderRepository is exported
import { BusinessRuleError } from "@/domain/errors";
import { Err, Ok, Result, isNone } from "@/shared/kernel/types";

export class CancelOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly eventBus: IEventBus,
    private readonly logger: ILogger
  ) {}

  async execute(dto: CancelOrderDTO): Promise<Result<void>> {
    try {
      this.logger.info("Cancelling order", { orderId: dto.orderId });

      const orderOption = await this.orderRepository.findById(dto.orderId);

      if (isNone(orderOption)) {
        return Err(new BusinessRuleError(`Order with ID ${dto.orderId} not found`));
      }

      const order = orderOption;
      
      // Domain Logic to cancel
      const cancelledOrder = order.cancel(dto.reason);

      // Persist
      await this.orderRepository.save(cancelledOrder);

      // Publish Event (if OrderCancelledEvent exists, otherwise just log or generic event)
      // await this.eventBus.publish(new OrderCancelledEvent(cancelledOrder.id));

      this.logger.info("Order cancelled successfully", { orderId: dto.orderId });

      return Ok(undefined);

    } catch (error: any) {
      this.logger.error("Failed to cancel order", error);
      return Err(new BusinessRuleError(error.message));
    }
  }
}
