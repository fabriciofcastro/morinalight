/**
 * Payment Strategy Pattern
 * 
 * Diferentes estratégias de pagamento
 */

export interface PaymentDetails {
    amount: number;
    currency: string;
    orderId: string;
    customerId: string;
    customerEmail: string;
    metadata?: Record<string, any>;
}

export interface PaymentResult {
    success: boolean;
    transactionId?: string;
    status: "pending" | "completed" | "failed" | "refunded";
    message?: string;
    error?: string;
    providerResponse?: any;
}

/**
 * Interface da estratégia de pagamento
 */
export interface PaymentStrategy {
    name: string;
    processPayment(details: PaymentDetails): Promise<PaymentResult>;
    refund(transactionId: string, amount?: number): Promise<PaymentResult>;
    getStatus(transactionId: string): Promise<PaymentResult>;
}

/**
 * Estratégia: Cartão de Crédito (Stripe)
 */
export class CreditCardStrategy implements PaymentStrategy {
    name = "credit_card";

    async processPayment(details: PaymentDetails): Promise<PaymentResult> {
        try {
            // TODO: Integrar com Stripe
            // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
            // const paymentIntent = await stripe.paymentIntents.create({
            //   amount: details.amount * 100, // centavos
            //   currency: details.currency,
            //   metadata: {
            //     orderId: details.orderId,
            //     customerId: details.customerId,
            //   },
            // });

            return {
                success: true,
                transactionId: `stripe_${Date.now()}`,
                status: "completed",
                message: "Payment processed successfully",
            };
        } catch (error) {
            return {
                success: false,
                status: "failed",
                error: (error as Error).message,
            };
        }
    }

    async refund(transactionId: string, amount?: number): Promise<PaymentResult> {
        try {
            // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
            // const refund = await stripe.refunds.create({
            //   payment_intent: transactionId,
            //   amount: amount ? amount * 100 : undefined,
            // });

            return {
                success: true,
                transactionId,
                status: "refunded",
                message: "Refund processed successfully",
            };
        } catch (error) {
            return {
                success: false,
                status: "failed",
                error: (error as Error).message,
            };
        }
    }

    async getStatus(transactionId: string): Promise<PaymentResult> {
        // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        // const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);

        return {
            success: true,
            transactionId,
            status: "completed",
        };
    }
}

/**
 * Estratégia: PIX
 */
export class PixStrategy implements PaymentStrategy {
    name = "pix";

    async processPayment(details: PaymentDetails): Promise<PaymentResult> {
        try {
            // TODO: Integrar com provedor PIX (Mercado Pago, PagSeguro, etc)
            // Gerar QR code e chave PIX

            return {
                success: true,
                transactionId: `pix_${Date.now()}`,
                status: "pending",
                message: "PIX payment initiated - waiting for confirmation",
                providerResponse: {
                    qrCode: "00020126580014br.gov.bcb.pix...",
                    qrCodeImage: "data:image/png;base64,...",
                    expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min
                },
            };
        } catch (error) {
            return {
                success: false,
                status: "failed",
                error: (error as Error).message,
            };
        }
    }

    async refund(transactionId: string, amount?: number): Promise<PaymentResult> {
        // PIX refund
        return {
            success: true,
            transactionId,
            status: "refunded",
        };
    }

    async getStatus(transactionId: string): Promise<PaymentResult> {
        // Verificar status do PIX
        return {
            success: true,
            transactionId,
            status: "completed",
        };
    }
}

/**
 * Estratégia: Boleto Bancário
 */
export class BoletoStrategy implements PaymentStrategy {
    name = "boleto";

    async processPayment(details: PaymentDetails): Promise<PaymentResult> {
        try {
            // TODO: Integrar com provedor de boleto

            return {
                success: true,
                transactionId: `boleto_${Date.now()}`,
                status: "pending",
                message: "Boleto generated - waiting for payment",
                providerResponse: {
                    boletoUrl: "https://boleto.example.com/123456",
                    barcode: "34191.79001 01043.510047 91020.150008 1 84350000014500",
                    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 dias
                },
            };
        } catch (error) {
            return {
                success: false,
                status: "failed",
                error: (error as Error).message,
            };
        }
    }

    async refund(transactionId: string, amount?: number): Promise<PaymentResult> {
        return {
            success: true,
            transactionId,
            status: "refunded",
        };
    }

    async getStatus(transactionId: string): Promise<PaymentResult> {
        return {
            success: true,
            transactionId,
            status: "pending",
        };
    }
}

/**
 * Estratégia: PayPal
 */
export class PayPalStrategy implements PaymentStrategy {
    name = "paypal";

    async processPayment(details: PaymentDetails): Promise<PaymentResult> {
        try {
            // TODO: Integrar com PayPal SDK

            return {
                success: true,
                transactionId: `paypal_${Date.now()}`,
                status: "completed",
                message: "PayPal payment processed",
            };
        } catch (error) {
            return {
                success: false,
                status: "failed",
                error: (error as Error).message,
            };
        }
    }

    async refund(transactionId: string, amount?: number): Promise<PaymentResult> {
        return {
            success: true,
            transactionId,
            status: "refunded",
        };
    }

    async getStatus(transactionId: string): Promise<PaymentResult> {
        return {
            success: true,
            transactionId,
            status: "completed",
        };
    }
}

/**
 * Payment Service com Strategy Pattern
 */
export class PaymentService {
    private strategies: Map<string, PaymentStrategy> = new Map();

    registerStrategy(strategy: PaymentStrategy) {
        this.strategies.set(strategy.name, strategy);
    }

    async processPayment(
        method: string,
        details: PaymentDetails,
    ): Promise<PaymentResult> {
        const strategy = this.strategies.get(method);

        if (!strategy) {
            return {
                success: false,
                status: "failed",
                error: `Unknown payment method: ${method}`,
            };
        }

        return strategy.processPayment(details);
    }

    async refund(
        method: string,
        transactionId: string,
        amount?: number,
    ): Promise<PaymentResult> {
        const strategy = this.strategies.get(method);

        if (!strategy) {
            return {
                success: false,
                status: "failed",
                error: `Unknown payment method: ${method}`,
            };
        }

        return strategy.refund(transactionId, amount);
    }

    async getStatus(method: string, transactionId: string): Promise<PaymentResult> {
        const strategy = this.strategies.get(method);

        if (!strategy) {
            return {
                success: false,
                status: "failed",
                error: `Unknown payment method: ${method}`,
            };
        }

        return strategy.getStatus(transactionId);
    }
}

/**
 * Instância global
 */
export const paymentService = new PaymentService();

// Registrar estratégias
paymentService.registerStrategy(new CreditCardStrategy());
paymentService.registerStrategy(new PixStrategy());
paymentService.registerStrategy(new BoletoStrategy());
paymentService.registerStrategy(new PayPalStrategy());

// Integration of Adapter Pattern
import { LegacyPaymentSystem, LegacyPaymentAdapter } from "./adapter-pattern";
import { AdapterWrapperStrategy } from "./adapter-wrapper-strategy";

const legacySystem = new LegacyPaymentSystem();
// Em um caso real, o userId viria do contexto, mas para o Singleton service precisamos
// de uma abordagem de Factory ou passar o userId no processPayment. 
// Para simplificar este exemplo de integração estrutural:
const legacyAdapter = new LegacyPaymentAdapter(legacySystem, "system-user");
paymentService.registerStrategy(new AdapterWrapperStrategy(legacyAdapter));

/**
 * EXEMPLO DE USO:
 * 
 * // Processar pagamento com cartão
 * const result = await paymentService.processPayment('credit_card', {
 *   amount: 99.90,
 *   currency: 'BRL',
 *   orderId: 'order-123',
 *   customerId: 'customer-456',
 *   customerEmail: 'customer@example.com',
 * });
 * 
 * if (result.success) {
 *   console.log('Payment successful:', result.transactionId);
 * }
 * 
 * // Processar com PIX
 * const pixResult = await paymentService.processPayment('pix', details);
 * console.log('QR Code:', pixResult.providerResponse.qrCode);
 * 
 * // Reembolso
 * await paymentService.refund('credit_card', transactionId, 50.00);
 * 
 * // Verificar status
 * const status = await paymentService.getStatus('pix', transactionId);
 */
