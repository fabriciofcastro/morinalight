/**
 * Field Encryption Service
 * Criptografia AES-256-GCM para campos sensíveis
 */

import { createCipheriv, createDecipheriv, randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits

let encryptionKey: Buffer | null = null;

/**
 * Obtém ou gera chave de criptografia
 */
async function getEncryptionKey(): Promise<Buffer> {
  if (encryptionKey) {
    return encryptionKey;
  }

  // Tentar obter de variável de ambiente
  const envKey = process.env.ENCRYPTION_KEY;
  if (envKey) {
    // Se for uma string, derivar chave usando scrypt
    encryptionKey = (await scryptAsync(envKey, "morina-salt", KEY_LENGTH)) as Buffer;
    return encryptionKey;
  }

  // Tentar obter de arquivo
  try {
    const { readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const keysPath = process.env.ENCRYPTION_KEY_PATH || join(process.cwd(), "keys");
    const keyFile = join(keysPath, "encryption.key");
    const keyData = readFileSync(keyFile);
    encryptionKey = Buffer.from(keyData.toString("hex"), "hex");
    return encryptionKey;
  } catch (error) {
    throw new Error(
      "Chave de criptografia não configurada. Configure ENCRYPTION_KEY ou coloque encryption.key em ./keys/",
    );
  }
}

/**
 * Criptografa um valor
 */
export async function encrypt(value: string): Promise<string> {
  if (!value) {
    return value;
  }

  try {
    const key = await getEncryptionKey();
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(value, "utf8", "base64");
    encrypted += cipher.final("base64");

    const authTag = cipher.getAuthTag();

    // Formato: iv:authTag:encrypted (todos em base64)
    return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`;
  } catch (error) {
    console.error("Erro ao criptografar valor:", error);
    throw new Error("Falha ao criptografar valor");
  }
}

/**
 * Descriptografa um valor
 */
export async function decrypt(encrypted: string): Promise<string> {
  if (!encrypted) {
    return encrypted;
  }

  try {
    const key = await getEncryptionKey();
    const parts = encrypted.split(":");

    if (parts.length !== 3) {
      throw new Error("Formato de valor criptografado inválido");
    }

    const [ivBase64, authTagBase64, encryptedData] = parts;
    const iv = Buffer.from(ivBase64, "base64");
    const authTag = Buffer.from(authTagBase64, "base64");

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, "base64", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Erro ao descriptografar valor:", error);
    throw new Error("Falha ao descriptografar valor");
  }
}

/**
 * Verifica se uma string está criptografada (formato: iv:authTag:encrypted)
 */
export function isEncrypted(value: string): boolean {
  if (!value || typeof value !== "string") {
    return false;
  }
  const parts = value.split(":");
  return parts.length === 3 && parts.every((part) => {
    try {
      Buffer.from(part, "base64");
      return true;
    } catch {
      return false;
    }
  });
}
