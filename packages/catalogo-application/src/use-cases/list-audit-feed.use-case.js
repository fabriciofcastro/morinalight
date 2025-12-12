Object.defineProperty(exports, "__esModule", { value: true });
exports.ListarAuditoriaFeedUseCase = void 0;
const audit_1 = require("../schemas/audit");
const product_1 = require("../schemas/product");
class ListarAuditoriaFeedUseCase {
  deps;
  constructor(deps) {
    this.deps = deps;
  }
  async execute(rawInput) {
    const input = audit_1.listarAuditoriaFeedInputSchema.parse(rawInput);
    const pagina = await this.deps.auditoriaRepository.listarFeed(input.orgId, {
      acao: input.acao,
      cursor: input.cursor,
      limite: input.limite,
      inicio: input.inicio,
      fim: input.fim,
    });
    const produtosCache = new Map();
    const itens = [];
    for (const auditoria of pagina.itens) {
      const existente = produtosCache.get(auditoria.dados.produtoId);
      let produtoView = existente;
      if (!produtoView) {
        const produto = await this.deps.produtoRepository.encontrarPorId(
          auditoria.dados.orgId,
          auditoria.dados.produtoId,
        );
        if (produto) {
          produtoView = product_1.produtoViewSchema.parse({
            produtoId: produto.produtoId,
            orgId: produto.dados.orgId,
            nome: produto.dados.nome,
            descricao: produto.dados.descricao ?? null,
            status: produto.dados.status,
            criadoPor: produto.dados.criadoPor,
            atualizadoPor: produto.dados.atualizadoPor,
            criadoEm: produto.dados.criadoEm,
            atualizadoEm: produto.dados.atualizadoEm,
          });
          produtosCache.set(auditoria.dados.produtoId, produtoView);
        }
      }
      itens.push({
        id: auditoria.dados.id,
        produtoId: auditoria.dados.produtoId,
        orgId: auditoria.dados.orgId,
        acao: auditoria.dados.acao,
        actorId: auditoria.dados.actorId,
        payload: auditoria.dados.payload ?? null,
        criadoEm: auditoria.dados.criadoEm,
        produto: produtoView ?? null,
      });
    }
    return audit_1.listarAuditoriaFeedResultadoSchema.parse({
      itens,
      proximoCursor: pagina.proximoCursor ?? null,
    });
  }
}
exports.ListarAuditoriaFeedUseCase = ListarAuditoriaFeedUseCase;
