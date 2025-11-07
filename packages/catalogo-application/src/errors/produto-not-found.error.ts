export class ProdutoNotFoundError extends Error {
  constructor(produtoId: string) {
    super(`Produto ${produtoId} não encontrado`);
  }
}
