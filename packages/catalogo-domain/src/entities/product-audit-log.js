Object.defineProperty(exports, "__esModule", { value: true });
exports.ProdutoAuditoria = void 0;
class ProdutoAuditoria {
  props;
  constructor(props) {
    this.props = props;
  }
  get id() {
    return this.props.id;
  }
  get dados() {
    return this.props;
  }
}
exports.ProdutoAuditoria = ProdutoAuditoria;
