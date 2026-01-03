"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryId = void 0;
class CategoryId {
    value;
    constructor(value) {
        this.value = value;
        if (!value || !this.isValid(value)) {
            throw new Error("CategoryId inválido");
        }
    }
    isValid(value) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(value);
    }
    static from(value) {
        if (value) {
            return new CategoryId(value);
        }
        // Generate UUID v4
        return new CategoryId("xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        }));
    }
    toString() {
        return this.value;
    }
    equals(other) {
        return this.value === other.value;
    }
}
exports.CategoryId = CategoryId;
