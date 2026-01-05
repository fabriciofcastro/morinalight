import { Originator, Caretaker, DocumentEditor } from "../memento-pattern";
import { AbstractHandler, ChainBuilder } from "../chain-of-responsibility";

describe("Memento Pattern", () => {
    it("should save and restore state correctly", () => {
        const originator = new Originator({ value: "initial" });
        const caretaker = new Caretaker(originator);

        // Estado inicial
        expect(originator.getState()).toEqual({ value: "initial" });

        // Muda estado
        originator.setState({ value: "changed" });
        expect(originator.getState()).toEqual({ value: "changed" });

        // Salva
        caretaker.backup();

        // Muda novamente
        originator.setState({ value: "changed again" });
        expect(originator.getState()).toEqual({ value: "changed again" });

        // Undo
        caretaker.undo();
        expect(originator.getState()).toEqual({ value: "changed" });
    });

    it("should handle document editor history", () => {
        const editor = new DocumentEditor({
            content: "",
            cursorPosition: 0,
            selection: null
        });
        const history = new Caretaker(editor);

        // Digita "Hello"
        editor.type("Hello");
        history.backup(); // Snapshot 1: "Hello"

        // Digita " World"
        editor.type(" World");
        // Não salva snapshot

        expect(editor.getState().content).toBe("Hello World");

        // Undo (restaura para "Hello" - espera-se que o último backup tenha sido "Hello")
        // NOTE: Na implementação básica do Caretaker.backup(), ele salva o estado ATUAL.
        // Se chamamos backup() LOGO APÓS digitar, ele salva "Hello".
        // Ao digitar " World", o estado muda.
        // Ao chamar undo(), ele recupera o último salvo ("Hello").
        history.undo();

        expect(editor.getState().content).toBe("Hello");
    });
});

describe("Chain of Responsibility Pattern", () => {
    // Mock handlers
    class AuthHandler extends AbstractHandler<any, any> {
        async handle(request: any) {
            if (!request.user) return { error: "Unauthorized" };
            return super.handle(request);
        }
    }

    class ValidationHandler extends AbstractHandler<any, any> {
        async handle(request: any) {
            if (!request.data) return { error: "No data" };
            return super.handle(request);
        }
    }

    class ProcessingHandler extends AbstractHandler<any, any> {
        async handle(request: any) {
            return { success: true, processed: true };
        }
    }

    it("should pass request through chain", async () => {
        const chain = new ChainBuilder()
            .add(new AuthHandler())
            .add(new ValidationHandler())
            .add(new ProcessingHandler())
            .build();

        const request = { user: "john", data: "some content" };
        const result = await chain.handle(request);

        expect(result).toEqual({ success: true, processed: true });
    });

    it("should stop when handler blocks", async () => {
        const chain = new ChainBuilder()
            .add(new AuthHandler())
            .add(new ValidationHandler())
            .add(new ProcessingHandler())
            .build();

        const request = { user: null, data: "some content" }; // Sem user
        const result = await chain.handle(request);

        expect(result).toEqual({ error: "Unauthorized" });
    });
});

import { Cached, InvalidatesCache } from "../caching-decorator";

describe("Caching Decorator", () => {
    // Mock Service
    class TestService {
        callCount = 0;

        @Cached({ ttl: 1 })
        async getData(id: string) {
            this.callCount++;
            return { id, value: Math.random() };
        }

        @InvalidatesCache("TestService")
        async updateData(id: string) {
            return true;
        }
    }

    it("should cache results", async () => {
        const service = new TestService();

        // Primeira chamada
        const result1 = await service.getData("1");
        expect(service.callCount).toBe(1);

        // Segunda chamada (deve vir do cache)
        const result2 = await service.getData("1");
        expect(service.callCount).toBe(1);
        expect(result1).toEqual(result2);

        // Chamada com parâmetro diferente
        await service.getData("2");
        expect(service.callCount).toBe(2);
    });

    it("should invalidate cache on update", async () => {
        const service = new TestService();

        await service.getData("A");
        expect(service.callCount).toBe(1);

        // Update invalida
        await service.updateData("A");

        // Deve chamar novamente
        await service.getData("A");
        expect(service.callCount).toBe(2);
    });
});

import { LegacyPaymentSystem, LegacyPaymentAdapter } from "../adapter-pattern";
import { ProductComponent, ProductBundle } from "../prototype-pattern";

describe("Adapter Pattern", () => {
    it("should adapt legacy system to new interface", async () => {
        const legacy = new LegacyPaymentSystem();
        const adapter = new LegacyPaymentAdapter(legacy, "user-123");

        const result = await adapter.process(100, "USD");

        expect(result.success).toBe(true);
        expect(result.transactionId).toContain("legacy_");
    });
});

describe("Prototype Pattern", () => {
    it("should clone complex objects", () => {
        const component = new ProductComponent("CPU", 200, { socket: "AM5" });
        const bundle = new ProductBundle("Gaming PC");
        bundle.add(component);

        const clonedBundle = bundle.clone();

        // Verifica se é uma nova instância
        expect(clonedBundle).not.toBe(bundle);
        expect(clonedBundle.name).toBe("Gaming PC (Copy)");
        // Verifica se itens foram clonados (deep copy)
        expect(clonedBundle.getItems()[0]).not.toBe(component);
        expect(clonedBundle.getItems()[0].name).toBe("CPU");
    });
});
