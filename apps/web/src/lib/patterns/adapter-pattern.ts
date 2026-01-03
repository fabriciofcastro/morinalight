/**
 * Adapter Pattern Implementation
 *
 * Permite que classes com interfaces incompatíveis trabalhem juntas.
 * Útil para: Integração com sistemas legados ou bibliotecas de terceiros (ex: Gateways de Pagamento Antigos).
 */

import { PaymentResult, PaymentDetails } from "./payment-strategy";

// Interface Nova (Alvo)
export interface ModernPaymentGateway {
    process(amount: number, currency: string): Promise<PaymentResult>;
}

// Classe Legada (Adaptee) - interface incompatível
export class LegacyPaymentSystem {
    public makePayment(value: number, currencyCode: string, userToken: string): boolean {
        console.log(`[Legacy System] Processing payment: ${value} ${currencyCode} for user ${userToken}`);
        return true;
    }

    public getTransactionStatus(id: number): string {
        return "SUCCESS";
    }
}

// Adapter
export class LegacyPaymentAdapter implements ModernPaymentGateway {
    private legacySystem: LegacyPaymentSystem;
    private userId: string;

    constructor(legacySystem: LegacyPaymentSystem, userId: string) {
        this.legacySystem = legacySystem;
        this.userId = userId;
    }

    async process(amount: number, currency: string): Promise<PaymentResult> {
        // Adapta a chamada
        try {
            const success = this.legacySystem.makePayment(amount, currency, this.userId);

            if (success) {
                return {
                    success: true,
                    status: "completed",
                    message: "Processed via Legacy Adapter",
                    transactionId: `legacy_${Date.now()}`
                };
            }

            return {
                success: false,
                status: "failed",
                error: "Legacy system declined transaction"
            };

        } catch (err) {
            return {
                success: false,
                status: "failed",
                error: "Legacy system error"
            };
        }
    }
}
