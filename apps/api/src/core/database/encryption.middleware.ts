/**
 * Prisma Middleware para Criptografia Automática de Campos Sensíveis
 */

import type { PrismaClient } from "@prisma/client";
import { decrypt, encrypt, isEncrypted } from "../encryption/field-encryption.service";

// Campos sensíveis por modelo que devem ser criptografados
const SENSITIVE_FIELDS: Record<string, string[]> = {
  User: ["cpf", "rg", "phone", "address", "documentNumber"],
  Cliente: ["documento", "email", "telefone", "celular", "endereco", "cidade", "estado", "cep"],
  Representante: [
    "documento",
    "email",
    "telefone",
    "celular",
    "endereco",
    "cidade",
    "estado",
    "cep",
  ],
  Organization: ["phone", "address"], // Phone e address da organização
  // Adicionar outros modelos conforme necessário
};

/**
 * Registra middleware do Prisma para criptografia automática
 */
export function registerEncryptionMiddleware(prisma: PrismaClient): void {
  prisma.$use(async (params, next) => {
    // Criptografar antes de salvar
    if (
      params.action === "create" ||
      params.action === "update" ||
      params.action === "updateMany"
    ) {
      const model = params.model;
      const sensitiveFields = SENSITIVE_FIELDS[model || ""];

      if (sensitiveFields && params.args.data) {
        const data = params.args.data as Record<string, unknown>;

        for (const field of sensitiveFields) {
          if (data[field] && typeof data[field] === "string" && data[field].trim() !== "") {
            // Não criptografar se já estiver criptografado
            if (!isEncrypted(data[field] as string)) {
              try {
                data[field] = await encrypt(data[field] as string);
              } catch (error) {
                console.error(`Erro ao criptografar campo ${field}:`, error);
                // Continuar sem criptografar se falhar (fallback)
              }
            }
          }
        }
      }
    }

    // Descriptografar após buscar
    if (
      params.action === "findUnique" ||
      params.action === "findFirst" ||
      params.action === "findMany" ||
      params.action === "findFirstOrThrow" ||
      params.action === "findUniqueOrThrow"
    ) {
      const result = await next(params);
      const model = params.model;
      const sensitiveFields = SENSITIVE_FIELDS[model || ""];

      if (sensitiveFields && result) {
        if (Array.isArray(result)) {
          return Promise.all(
            result.map(async (item) => {
              if (item && typeof item === "object") {
                const decrypted = { ...item };
                for (const field of sensitiveFields) {
                  if (decrypted[field] && typeof decrypted[field] === "string") {
                    if (isEncrypted(decrypted[field] as string)) {
                      try {
                        decrypted[field] = await decrypt(decrypted[field] as string);
                      } catch (error) {
                        console.error(`Erro ao descriptografar campo ${field}:`, error);
                        // Manter valor criptografado se falhar
                      }
                    }
                  }
                }
                return decrypted;
              }
              return item;
            }),
          );
        }

        if (result && typeof result === "object") {
          const decrypted = { ...result };
          for (const field of sensitiveFields) {
            if (decrypted[field] && typeof decrypted[field] === "string") {
              if (isEncrypted(decrypted[field] as string)) {
                try {
                  decrypted[field] = await decrypt(decrypted[field] as string);
                } catch (error) {
                  console.error(`Erro ao descriptografar campo ${field}:`, error);
                  // Manter valor criptografado se falhar
                }
              }
            }
          }
          return decrypted;
        }
      }

      return result;
    }

    return next(params);
  });
}
