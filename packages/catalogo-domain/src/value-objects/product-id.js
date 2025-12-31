"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductId = void 0;
const node_crypto_1 = require("node:crypto");
class ProductId {
    value;
    constructor(value) {
        this.value = value;
    }
    static from(value) {
        return new ProductId(value ?? (0, node_crypto_1.randomUUID)());
    }
    toString() {
        return this.value;
    }
}
exports.ProductId = ProductId;
