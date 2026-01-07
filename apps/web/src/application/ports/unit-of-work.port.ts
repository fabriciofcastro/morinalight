/**
 * IUnitOfWork Port
 * 
 * Define o contrato para gestão de transações atômicas entre múltiplos repositórios.
 * Segue o padrão Unit of Work para garantir consistência (ACID) na camada de Application.
 */
export interface IUnitOfWork {
  /**
   * Inicia uma transação e executa o callback dentro dela.
   * Repositórios usados dentro do callback devem respeitar a mesma transação.
   */
  start<T>(work: (uow: IUnitOfWork) => Promise<T>): Promise<T>;

  /**
   * Commit explícito (opcional dependendo da implementação)
   */
  commit?(): Promise<void>;

  /**
   * Rollback explícito (opcional dependendo da implementação)
   */
  rollback?(): Promise<void>;

  /**
   * Retorna a transação atual (dependente da infraestrutura)
   */
  getTransaction<T>(): T;

  /**
   * Salva uma mensagem no outbox dentro da transação atual.
   */
  saveMessage(type: string, payload: any, correlationId?: string, causationId?: string): Promise<void>;
}
