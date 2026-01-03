import { createHash } from "crypto";
import { AccessContext } from "../types/context.types";

export class LegalService {
    /**
     * Gera um hash SHA-256 para o texto legal obrigatório combinado com o contexto.
     * Isso vincula o aceite à transação específica.
     */
    static generateAckHash(message: string, context: AccessContext): string {
        const dataToSign = `${message}::${context.userId}::${context.timestamp.toISOString()}`;
        return createHash("sha256").update(dataToSign).digest("hex");
    }

    /**
     * Verifica se o hash de aceite fornecido pelo usuário bate com o esperado.
     */
    static verifyAckHash(providedHash: string, message: string, context: AccessContext): boolean {
        const expectedHash = this.generateAckHash(message, context);
        return providedHash === expectedHash;
    }
}
