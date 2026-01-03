/**
 * Product Template Service
 * 
 * Uses the Prototype Pattern to manage reusable product configurations.
 */

import { ProductRegistry, ProductBundle, ProductComponent } from "@/lib/patterns/prototype-pattern";

export class ProductTemplateService {
    private registry: ProductRegistry;

    constructor() {
        this.registry = new ProductRegistry();
        this.initializeDefaults();
    }

    private initializeDefaults() {
        // Template: Gaming PC Starter
        const starterPc = new ProductBundle("Gaming PC Starter");
        starterPc.add(new ProductComponent("CPU", 150, { model: "i3" }));
        starterPc.add(new ProductComponent("GPU", 200, { model: "GTX 1650" }));
        starterPc.add(new ProductComponent("RAM", 50, { size: "8GB" }));

        this.registry.register("pc_starter", starterPc);

        // Template: Professional Workstation
        const workstation = new ProductBundle("Workstation Pro");
        workstation.add(new ProductComponent("CPU", 400, { model: "i9" }));
        workstation.add(new ProductComponent("GPU", 800, { model: "RTX 4080" }));
        workstation.add(new ProductComponent("RAM", 200, { size: "64GB" }));
        workstation.add(new ProductComponent("SSD", 150, { size: "2TB" }));

        this.registry.register("pc_workstation", workstation);
    }

    /**
     * Creates a new product instance from a template
     */
    public createFromTemplate(templateId: string, customizationName?: string): ProductBundle | null {
        const prototype = this.registry.createFromPrototype(templateId);

        if (!prototype || !(prototype instanceof ProductBundle)) {
            return null;
        }

        if (customizationName) {
            prototype.name = customizationName;
        }

        return prototype;
    }

    /**
     * Registers a new custom template at runtime
     */
    public registerCustomTemplate(id: string, bundle: ProductBundle) {
        this.registry.register(id, bundle);
    }
}

export const productTemplateService = new ProductTemplateService();
