Object.defineProperty(exports, "__esModule", { value: true });
exports.PrefichaAuditoria = void 0;
class PrefichaAuditoria {
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
exports.PrefichaAuditoria = PrefichaAuditoria;
