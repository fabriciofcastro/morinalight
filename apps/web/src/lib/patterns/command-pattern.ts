/**
 * Command Pattern Implementation
 * 
 * Encapsula requests como objetos, permitindo parametrizar clientes com diferentes requests,
 * enfileirar ou registrar requests, e suportar operações reversíveis (undo/redo).
 */

export interface Command<T = any> {
    execute(): Promise<T>;
    undo?(): Promise<void>;
    redo?(): Promise<T>;
}

/**
 * Command Invoker - Gerencia execução de comandos
 */
export class CommandInvoker {
    private history: Command[] = [];
    private currentIndex = -1;

    async execute<T>(command: Command<T>): Promise<T> {
        // Remove comandos à frente do index atual (se houver redo disponível)
        this.history = this.history.slice(0, this.currentIndex + 1);

        const result = await command.execute();

        this.history.push(command);
        this.currentIndex++;

        return result;
    }

    async undo(): Promise<void> {
        if (!this.canUndo()) {
            throw new Error("Nothing to undo");
        }

        const command = this.history[this.currentIndex]!;

        if (!command.undo) {
            throw new Error("Command does not support undo");
        }

        await command.undo();
        this.currentIndex--;
    }

    async redo(): Promise<any> {
        if (!this.canRedo()) {
            throw new Error("Nothing to redo");
        }

        this.currentIndex++;
        const command = this.history[this.currentIndex]!;

        if (command.redo) {
            return await command.redo();
        }

        return await command.execute();
    }

    canUndo(): boolean {
        return this.currentIndex >= 0;
    }

    canRedo(): boolean {
        return this.currentIndex < this.history.length - 1;
    }

    clear(): void {
        this.history = [];
        this.currentIndex = -1;
    }

    getHistory(): Command[] {
        return this.history.slice(0, this.currentIndex + 1);
    }
}

/**
 * EXEMPLOS DE COMANDOS
 */

// Comando: Criar Usuário
export class CreateUserCommand implements Command<{ id: string }> {
    private createdUserId?: string;

    constructor(
        private userData: { name: string; email: string },
        private userRepository: any
    ) { }

    async execute(): Promise<{ id: string }> {
        const user = await this.userRepository.create(this.userData);
        this.createdUserId = user.id;
        return { id: user.id };
    }

    async undo(): Promise<void> {
        if (this.createdUserId) {
            await this.userRepository.delete(this.createdUserId);
        }
    }

    async redo(): Promise<{ id: string }> {
        return this.execute();
    }
}

// Comando: Atualizar Produto
export class UpdateProductCommand implements Command<void> {
    private previousData?: any;

    constructor(
        private productId: string,
        private newData: any,
        private productRepository: any
    ) { }

    async execute(): Promise<void> {
        // Salvar estado anterior para undo
        this.previousData = await this.productRepository.findById(this.productId);
        await this.productRepository.update(this.productId, this.newData);
    }

    async undo(): Promise<void> {
        if (this.previousData) {
            await this.productRepository.update(this.productId, this.previousData);
        }
    }

    async redo(): Promise<void> {
        await this.productRepository.update(this.productId, this.newData);
    }
}

// Comando: Processar Pedido
export class ProcessOrderCommand implements Command<void> {
    constructor(
        private orderId: string,
        private orderService: any
    ) { }

    async execute(): Promise<void> {
        await this.orderService.processOrder(this.orderId);
    }

    async undo(): Promise<void> {
        await this.orderService.cancelOrder(this.orderId);
    }
}

// Comando: Enviar Email
export class SendEmailCommand implements Command<void> {
    constructor(
        private to: string,
        private subject: string,
        private body: string,
        private emailService: any
    ) { }

    async execute(): Promise<void> {
        await this.emailService.send({
            to: this.to,
            subject: this.subject,
            body: this.body,
        });
    }

    // Email não tem undo (não pode "desfazer" envio)
}

/**
 * Comando Composto (Macro Command)
 */
export class MacroCommand implements Command<void> {
    constructor(private commands: Command[]) { }

    async execute(): Promise<void> {
        for (const command of this.commands) {
            await command.execute();
        }
    }

    async undo(): Promise<void> {
        // Desfazer na ordem reversa
        for (let i = this.commands.length - 1; i >= 0; i--) {
            const command = this.commands[i]!;
            if (command.undo) {
                await command.undo();
            }
        }
    }

    async redo(): Promise<void> {
        await this.execute();
    }
}

/**
 * EXEMPLO DE USO:
 * 
 * const invoker = new CommandInvoker();
 * 
 * // Executar comando
 * const createUser = new CreateUserCommand(
 *   { name: "John", email: "john@example.com" },
 *   userRepository
 * );
 * 
 * const result = await invoker.execute(createUser);
 * console.log("User created:", result.id);
 * 
 * // Desfazer
 * await invoker.undo(); // Remove o usuário
 * 
 * // Refazer
 * await invoker.redo(); // Cria novamente
 * 
 * // Comando composto (transação)
 * const transaction = new MacroCommand([
 *   new CreateUserCommand(userData, userRepo),
 *   new SendEmailCommand(email, subject, body, emailService),
 *   new ProcessOrderCommand(orderId, orderService),
 * ]);
 * 
 * await invoker.execute(transaction);
 * 
 * // Desfaz toda a transação
 * await invoker.undo();
 */

export const commandInvoker = new CommandInvoker();
