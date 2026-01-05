import { paymentService } from "../payment-strategy";

describe("PaymentService Legacy Integration", () => {
    it("should process payment using legacy adapter strategy", async () => {
        const result = await paymentService.processPayment("legacy_system", {
            amount: 500,
            currency: "BRL",
            orderId: "123",
            customerId: "456",
            customerEmail: "admin@example.com"
        });

        expect(result.success).toBe(true);
        expect(result.message).toContain("Processed via Legacy Adapter");
        expect(result.status).toBe("completed");
    });

    it("should fail for unknown strategy", async () => {
        const result = await paymentService.processPayment("unknown_method", {
            amount: 100,
            currency: "USD",
            orderId: "000",
            customerId: "000",
            customerEmail: "t@t.com"
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain("Unknown payment method");
    });
});

import { productTemplateService } from "../../services/product-template-service";
import { ProductBundle } from "../prototype-pattern";

describe("ProductTemplateService Integration", () => {
    it("should create independent clones from templates", () => {
        // 1. Create first instance from template
        const pc1 = productTemplateService.createFromTemplate("pc_starter", "My First PC");

        // 2. Create second instance from SAME template
        const pc2 = productTemplateService.createFromTemplate("pc_starter", "My Second PC");

        expect(pc1).not.toBeNull();
        expect(pc2).not.toBeNull();

        // 3. Verify they are different objects
        expect(pc1).not.toBe(pc2);
        expect(pc1?.name).toBe("My First PC");
        expect(pc2?.name).toBe("My Second PC");

        // 4. Modify one shouldn't affect the other
        if (pc1 instanceof ProductBundle && pc2 instanceof ProductBundle) {
            pc1.getItems()[0].price = 9999;
            expect(pc2.getItems()[0].price).toBe(150); // Original price
        }
    });

    it("should return null for unknown template", () => {
        const result = productTemplateService.createFromTemplate("unknown_pc");
        expect(result).toBeNull();
    });
});
