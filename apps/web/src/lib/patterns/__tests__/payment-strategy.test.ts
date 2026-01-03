/**
 * Payment Strategy Pattern Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
    PaymentService,
    CreditCardStrategy,
    PixStrategy,
    BoletoStrategy,
    PayPalStrategy,
    type PaymentDetails,
} from "../payment-strategy";

describe("Payment Strategy Pattern", () => {
    let paymentService: PaymentService;
    let mockPaymentDetails: PaymentDetails;

    beforeEach(() => {
        paymentService = new PaymentService();
        paymentService.registerStrategy(new CreditCardStrategy());
        paymentService.registerStrategy(new PixStrategy());
        paymentService.registerStrategy(new BoletoStrategy());
        paymentService.registerStrategy(new PayPalStrategy());

        mockPaymentDetails = {
            amount: 99.90,
            currency: "BRL",
            orderId: "order-123",
            customerId: "customer-456",
            customerEmail: "customer@example.com",
        };
    });

    describe("CreditCardStrategy", () => {
        it("should process credit card payment successfully", async () => {
            const result = await paymentService.processPayment("credit_card", mockPaymentDetails);

            expect(result.success).toBe(true);
            expect(result.status).toBe("completed");
            expect(result.transactionId).toContain("stripe_");
        });

        it("should refund credit card payment", async () => {
            const result = await paymentService.refund("credit_card", "stripe_123", 50);

            expect(result.success).toBe(true);
            expect(result.status).toBe("refunded");
        });

        it("should get payment status", async () => {
            const result = await paymentService.getStatus("credit_card", "stripe_123");

            expect(result.success).toBe(true);
            expect(result.transactionId).toBe("stripe_123");
        });
    });

    describe("PixStrategy", () => {
        it("should initiate PIX payment with QR code", async () => {
            const result = await paymentService.processPayment("pix", mockPaymentDetails);

            expect(result.success).toBe(true);
            expect(result.status).toBe("pending");
            expect(result.providerResponse).toBeDefined();
            expect(result.providerResponse.qrCode).toBeDefined();
            expect(result.providerResponse.qrCodeImage).toBeDefined();
        });
    });

    describe("BoletoStrategy", () => {
        it("should generate boleto with barcode", async () => {
            const result = await paymentService.processPayment("boleto", mockPaymentDetails);

            expect(result.success).toBe(true);
            expect(result.status).toBe("pending");
            expect(result.providerResponse).toBeDefined();
            expect(result.providerResponse.boletoUrl).toBeDefined();
            expect(result.providerResponse.barcode).toBeDefined();
        });
    });

    describe("PayPalStrategy", () => {
        it("should process PayPal payment", async () => {
            const result = await paymentService.processPayment("paypal", mockPaymentDetails);

            expect(result.success).toBe(true);
            expect(result.status).toBe("completed");
            expect(result.transactionId).toContain("paypal_");
        });
    });

    describe("PaymentService", () => {
        it("should fail with unknown payment method", async () => {
            const result = await paymentService.processPayment("unknown", mockPaymentDetails);

            expect(result.success).toBe(false);
            expect(result.status).toBe("failed");
            expect(result.error).toContain("Unknown payment method");
        });

        it("should allow registering custom strategies", () => {
            const customStrategy = {
                name: "custom",
                processPayment: async () => ({ success: true, status: "completed" as const }),
                refund: async () => ({ success: true, status: "refunded" as const }),
                getStatus: async () => ({ success: true, status: "completed" as const }),
            };

            paymentService.registerStrategy(customStrategy);
            expect(paymentService).toBeDefined();
        });
    });
});
