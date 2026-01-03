/**
 * Adapter Strategy Wrapper
 * 
 * Este arquivo faz a ponte entre o Adapter Pattern e o Strategy Pattern.
 * Ele permite que o LegacyPaymentAdapter seja usado como uma PaymentStrategy
 * dentro do PaymentService existente.
 */

import { PaymentStrategy, PaymentDetails, PaymentResult } from "./payment-strategy";
import { ModernPaymentGateway } from "./adapter-pattern";

/**
 * AdapterWrapperStrategy
 * 
 * Envolve um ModernPaymentGateway (que pode ser um Adapter) para cumprir a interface PaymentStrategy.
 */
export class AdapterWrapperStrategy implements PaymentStrategy {
    name = "legacy_system";

    constructor(private gateway: ModernPaymentGateway) { }

    async processPayment(details: PaymentDetails): Promise<PaymentResult> {
        // Delega para o gateway/adapter
        // Note que o ModernPaymentGateway simplificado apenas pede amount e currency
        // Em um caso real, o Adapter provavelmente receberia mais detalhes
        return this.gateway.process(details.amount, details.currency);
    }

    async refund(transactionId: string, amount?: number): Promise<PaymentResult> {
        return {
            success: false,
            status: "failed",
            error: "Refund not supported by Legacy Adapter"
        };
    }

    async getStatus(transactionId: string): Promise<PaymentResult> {
        // Simulando suporte
        return {
            success: true,
            status: "completed",
            transactionId
        };
    }
}
