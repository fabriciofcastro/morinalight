/**
 * Chain of Responsibility Pattern
 *
 * Permite passar requisições por uma corrente de handlers.
 * Cada handler decide se processa a requisição ou a passa para o próximo.
 * Útil para: Middlewares, Pipelines de Validação, Logging sequencial.
 */

// Interface do Handler
export interface Handler<Request = any, Response = any> {
    setNext(handler: Handler<Request, Response>): Handler<Request, Response>;
    handle(request: Request): Promise<Response | null>;
}

// Classe Base Abstrata para Handlers
export abstract class AbstractHandler<Request = any, Response = any> implements Handler<Request, Response> {
    private nextHandler: Handler<Request, Response> | null = null;

    public setNext(handler: Handler<Request, Response>): Handler<Request, Response> {
        this.nextHandler = handler;
        // Retornar o handler passado permite encadear de forma fluente:
        // handlerA.setNext(handlerB).setNext(handlerC)
        return handler;
    }

    public async handle(request: Request): Promise<Response | null> {
        if (this.nextHandler) {
            return this.nextHandler.handle(request);
        }

        return null;
    }
}

/**
 * Exemplo de Uso: Pipeline de Validação de Pedido
 */

export interface OrderContext {
    orderId: string;
    userId: string;
    amount: number;
    items: any[];
    isValid: boolean;
    errors: string[];
}

// Handler 1: Validação de Estoque
export class StockValidationHandler extends AbstractHandler<OrderContext, OrderContext> {
    public async handle(request: OrderContext): Promise<OrderContext | null> {
        console.log("Checking stock...");

        // Simulação de check
        if (request.items.length === 0) {
            request.isValid = false;
            request.errors.push("No items in order");
            return request; // Interrompe a cadeia retornando erro
        }

        return super.handle(request);
    }
}

// Handler 2: Validação de Fraude
export class FraudCheckHandler extends AbstractHandler<OrderContext, OrderContext> {
    public async handle(request: OrderContext): Promise<OrderContext | null> {
        console.log("Checking fraud...");

        if (request.amount > 10000) {
            console.warn("High value order, flagging for manual review");
            // Não falha, mas adiciona nota
            request.errors.push("Flagged for review");
        }

        return super.handle(request);
    }
}

// Handler 3: Validação de Pagamento
export class PaymentValidationHandler extends AbstractHandler<OrderContext, OrderContext> {
    public async handle(request: OrderContext): Promise<OrderContext | null> {
        console.log("Validating payment method...");

        // Simulação
        if (!request.userId) {
            request.isValid = false;
            request.errors.push("User not authenticated");
            return request;
        }

        return super.handle(request);
    }
}

/**
 * Middleware Chain Builder - Helper para construir cadeias facilmente
 */
export class ChainBuilder<Request, Response> {
    private head: Handler<Request, Response> | null = null;
    private tail: Handler<Request, Response> | null = null;

    add(handler: Handler<Request, Response>): this {
        if (!this.head) {
            this.head = handler;
            this.tail = handler;
        } else if (this.tail) {
            this.tail.setNext(handler);
            this.tail = handler;
        }
        return this;
    }

    build(): Handler<Request, Response> {
        if (!this.head) {
            throw new Error("Chain is empty");
        }
        return this.head;
    }
}
