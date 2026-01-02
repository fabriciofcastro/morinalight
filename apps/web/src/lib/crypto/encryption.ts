/**
 * Field-Level Encryption
 * 
 * Criptografia AES-256-GCM para dados sensíveis
 */

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;

/**
 * Gera chave de criptografia a partir de senha mestra
 */
function deriveKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(password, salt, 100000, 32, "sha512");
}

/**
 * Obtém chave de criptografia do ambiente
 */
function getEncryptionKey(): Buffer {
    const masterPassword = process.env.ENCRYPTION_MASTER_KEY;

    if (!masterPassword) {
        throw new Error("ENCRYPTION_MASTER_KEY not set in environment");
    }

    // Em produção, use salt fixo armazenado de forma segura
    const salt = Buffer.from(process.env.ENCRYPTION_SALT || crypto.randomBytes(SALT_LENGTH));

    return deriveKey(masterPassword, salt);
}

/**
 * Criptografa texto
 */
export function encrypt(plaintext: string): string {
    if (!plaintext) return "";

    try {
        const key = getEncryptionKey();
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

        let encrypted = cipher.update(plaintext, "utf8", "hex");
        encrypted += cipher.final("hex");

        const authTag = cipher.getAuthTag();

        // Formato: iv:authTag:encrypted
        return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
    } catch (error) {
        console.error("Encryption error:", error);
        throw new Error("Failed to encrypt data");
    }
}

/**
 * Descriptografa texto
 */
export function decrypt(ciphertext: string): string {
    if (!ciphertext) return "";

    try {
        const [ivHex, authTagHex, encryptedText] = ciphertext.split(":");

        if (!ivHex || !authTagHex || !encryptedText) {
            throw new Error("Invalid ciphertext format");
        }

        const key = getEncryptionKey();
        const iv = Buffer.from(ivHex, "hex");
        const authTag = Buffer.from(authTagHex, "hex");
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encryptedText, "hex", "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    } catch (error) {
        console.error("Decryption error:", error);
        throw new Error("Failed to decrypt data");
    }
}

/**
 * Hash one-way (para senhas)
 */
export async function hashPassword(password: string): Promise<string> {
    const bcrypt = await import("bcryptjs");
    return bcrypt.hash(password, 12); // 12 rounds
}

/**
 * Verifica senha
 */
export async function verifyPassword(
    password: string,
    hash: string,
): Promise<boolean> {
    const bcrypt = await import("bcryptjs");
    return bcrypt.compare(password, hash);
}

/**
 * Helpers para campos específicos
 */

export const EncryptedFields = {
    // CPF
    encryptCPF: (cpf: string) => encrypt(cpf),
    decryptCPF: (encrypted: string) => decrypt(encrypted),

    // Cartão de crédito
    encryptCreditCard: (cardNumber: string) => encrypt(cardNumber),
    decryptCreditCard: (encrypted: string) => decrypt(encrypted),

    // Dados bancários
    encryptBankAccount: (account: string) => encrypt(account),
    decryptBankAccount: (encrypted: string) => decrypt(encrypted),

    // Endereço completo
    encryptAddress: (address: string) => encrypt(JSON.stringify(address)),
    decryptAddress: (encrypted: string) => JSON.parse(decrypt(encrypted)),
};

/**
 * EXEMPLO DE USO:
 * 
 * // Criar usuário com dados criptografados
 * const user = await prisma.user.create({
 *   data: {
 *     email: 'user@example.com',
 *     passwordHash: await hashPassword('password123'),
 *     cpf: encrypt('123.456.789-00'),
 *     phone: encrypt('11999999999'),
 *   },
 * });
 * 
 * // Buscar e descriptografar
 * const foundUser = await prisma.user.findUnique({ where: { id: '123' } });
 * const cpf = decrypt(foundUser.cpf);
 * 
 * // Verificar senha
 * const isValid = await verifyPassword('password123', foundUser.passwordHash);
 */

/**
 * Configuração de ambiente necessária:
 * 
 * .env:
 * ENCRYPTION_MASTER_KEY=your-very-long-and-random-master-key-here
 * ENCRYPTION_SALT=your-random-salt-here
 * 
 * Gerar chaves:
 * node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */
