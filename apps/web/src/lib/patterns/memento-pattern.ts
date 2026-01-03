/**
 * Memento Pattern Implementation
 *
 * Permite salvar e restaurar o estado anterior de um objeto sem revelar os detalhes de sua implementação.
 * Útil para: Undo/Redo, Snapshots de versão, Rascunhos.
 */

// Interface para o Memento (o snapshot)
export interface Memento<T> {
    getState(): T;
    getDate(): Date;
    getMetadata(): any;
}

// Implementação concreta do Memento
export class ConcreteMemento<T> implements Memento<T> {
    private readonly state: T;
    private readonly date: Date;
    private readonly metadata: any;

    constructor(state: T, metadata: any = {}) {
        // Importante: criar uma cópia profunda do estado para garantir imutabilidade
        this.state = JSON.parse(JSON.stringify(state));
        this.date = new Date();
        this.metadata = metadata;
    }

    getState(): T {
        return this.state;
    }

    getDate(): Date {
        return this.date;
    }

    getMetadata(): any {
        return this.metadata;
    }
}

// Originator: O objeto cujo estado queremos salvar
export class Originator<T> {
    constructor(private state: T) { }

    public setState(state: T): void {
        this.state = state;
        console.log(`[Originator] State updated to:`, state);
    }

    public getState(): T {
        return this.state;
    }

    // Salva o estado atual em um Memento
    public save(metadata?: any): Memento<T> {
        return new ConcreteMemento(this.state, metadata);
    }

    // Restaura o estado a partir de um Memento
    public restore(memento: Memento<T>): void {
        this.state = memento.getState();
        console.log(`[Originator] State restored to:`, this.state);
    }
}

// Caretaker: Gerencia o histórico de Mementos
export class Caretaker<T> {
    private mementos: Memento<T>[] = [];
    protected originator: Originator<T>;

    constructor(originator: Originator<T>) {
        this.originator = originator;
    }

    public backup(metadata?: any): void {
        console.log(`[Caretaker] Saving state...`);
        this.mementos.push(this.originator.save(metadata));
    }

    public undo(): void {
        if (!this.canUndo()) {
            return;
        }

        const memento = this.mementos.pop();
        console.log(`[Caretaker] Restoring state to: ${memento?.getDate().toISOString()}`);

        if (memento) {
            this.originator.restore(memento);
        }
    }

    public getHistory(): Memento<T>[] {
        return [...this.mementos];
    }

    public canUndo(): boolean {
        return this.mementos.length > 0;
    }

    public clear(): void {
        this.mementos = [];
    }
}

/**
 * Exemplo de Caso de Uso: Editor de Documento
 */
export interface DocumentState {
    content: string;
    cursorPosition: number;
    selection: { start: number; end: number } | null;
}

export class DocumentEditor extends Originator<DocumentState> {
    type(text: string) {
        const currentState = this.getState();
        this.setState({
            ...currentState,
            content: currentState.content + text,
            cursorPosition: currentState.cursorPosition + text.length
        });
    }

    select(start: number, end: number) {
        const currentState = this.getState();
        this.setState({
            ...currentState,
            selection: { start, end }
        });
    }
}

/**
 * Exemplo prático para uso no MorinaLight: Versionamento de Configurações
 */
export class SettingsHistoryManager<T> extends Caretaker<T> {
    // Métodos utilitários adicionais, como 'restoreToVersion'
    public restoreToVersion(index: number): void {
        const history = this.getHistory();
        if (index >= 0 && index < history.length) {
            const memento = history[index];
            // @ts-ignore - Acesso protegido ao originator na classe base, mas aqui estendemos
            // Em typescript estrito, talvez precisássemos expor um metodo publico no Caretaker ou usar composição
            // Para simplificar, vamos assumir que queremos apenas recuperar o estado
            // Na implementação padrão do pattern GoF, o Caretaker apenas guarda os mementos.
            // Aqui estamos fazendo uma variação onde o Caretaker também sabe restaurar.

            // Re-implementando lógica de restore específica já que 'originator' é private na base
            // Vamos corrigir a base para protected ou adicionar getter
        }
    }
}
