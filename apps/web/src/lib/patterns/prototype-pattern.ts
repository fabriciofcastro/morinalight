/**
 * Prototype Pattern Implementation
 *
 * Permite copiar objetos existentes sem depender de suas classes.
 * Útil para: Clonagem de estruturas complexas (ex: Árvores de Produtos, Configurações Base).
 */

export interface Prototype {
    clone(): Prototype;
}

export class ProductComponent implements Prototype {
    constructor(
        public name: string,
        public price: number,
        public attributes: Record<string, string> = {}
    ) { }

    clone(): ProductComponent {
        // Cópia rasa (shallow copy) para primitivos
        // Cópia profunda (deep copy) para objetos aninhados
        const clonedAttributes = JSON.parse(JSON.stringify(this.attributes));
        return new ProductComponent(this.name, this.price, clonedAttributes);
    }
}

export class ProductBundle implements Prototype {
    private items: ProductComponent[] = [];

    constructor(public name: string) { }

    add(component: ProductComponent) {
        this.items.push(component);
    }

    getItems(): ProductComponent[] {
        return this.items;
    }

    clone(): ProductBundle {
        const newBundle = new ProductBundle(this.name + " (Copy)");
        // Clona cada item recursivamente
        this.items.forEach(item => {
            newBundle.add(item.clone());
        });
        return newBundle;
    }
}

/**
 * Exemplo de uso: Product Template Registry
 * Mantém protótipos pré-configurados para clonagem rápida
 */
export class ProductRegistry {
    private items: Map<string, Prototype> = new Map();

    register(id: string, prototype: Prototype) {
        this.items.set(id, prototype);
    }

    createFromPrototype(id: string): Prototype | null {
        const prototype = this.items.get(id);
        return prototype ? prototype.clone() : null;
    }
}
