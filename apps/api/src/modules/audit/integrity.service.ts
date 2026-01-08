import { createHash, createSign, createVerify } from "crypto";

export interface AuditEventPayload {
  previousHash?: string;
  timestamp: Date;
  userId: string;
  ip: string;
  decision: string;
  resource: string;
  action: string;
}

export class IntegrityService {
  /**
   * Calcula o Hash SHA-256 do evento.
   * Formato: prevHash|timestamp|userId|ip|decision|resource|action
   */
  static calculateHash(event: AuditEventPayload): string {
    const data = [
      event.previousHash || "GENESIS",
      event.timestamp.toISOString(),
      event.userId,
      event.ip,
      event.decision,
      event.resource,
      event.action,
    ].join("|");

    return createHash("sha256").update(data).digest("hex");
  }

  /**
   * Assina o hash com a chave privada (RSA-4096).
   * @param hash O hash SHA-256 do evento
   * @param privateKey PEM string da chave privada
   */
  static signEvent(hash: string, privateKey: string): string {
    const signer = createSign("RSA-SHA256");
    signer.update(hash);
    return signer.sign(privateKey, "base64");
  }

  /**
   * Verifica a integridade da cadeia.
   */
  static verifyChain(events: AuditEventPayload[]): boolean {
    for (let i = 1; i < events.length; i++) {
      const current = events[i];
      const prev = events[i - 1];

      // Recalcula hash do anterior para confirmar link
      const recalculatedPrevHash = IntegrityService.calculateHash(prev);

      if (current.previousHash !== recalculatedPrevHash) {
        console.error(`Broken Chain at index ${i}`);
        return false;
      }
    }
    return true;
  }
}
