Object.defineProperty(exports, "__esModule", { value: true });
exports.ProdutoNotFoundError = void 0;
class ProdutoNotFoundError extends Error {
  constructor(produtoId) {
    super(`Produto ${produtoId} não encontrado`);
  }
}
exports.ProdutoNotFoundError = ProdutoNotFoundError;
