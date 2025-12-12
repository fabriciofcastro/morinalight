Object.defineProperty(exports, "__esModule", { value: true });
exports.PrefichaId = void 0;
const node_crypto_1 = require("node:crypto");
class PrefichaId {
  value;
  constructor(value) {
    this.value = value;
  }
  static from(value) {
    return new PrefichaId(value ?? node_crypto_1.randomUUID());
  }
  toString() {
    return this.value;
  }
}
exports.PrefichaId = PrefichaId;
