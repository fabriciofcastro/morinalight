import { getPrisma } from "../../../infra/database/prisma.service";
import { randomBytes } from "crypto";

const prisma = getPrisma();

export type WebAuthnCredential = {
    id: string;
    publicKey: string;
    counter: number;
    transports?: string[];
};

export type RegistrationOptions = {
    challenge: string;
    rp: {
        name: string;
        id: string;
    };
    user: {
        id: string;
        name: string;
        displayName: string;
    };
    pubKeyCredParams: Array<{
        type: string;
        alg: number;
    }>;
    timeout: number;
    attestation: string;
    authenticatorSelection: {
        authenticatorAttachment?: string;
        requireResidentKey: boolean;
        userVerification: string;
    };
};

export type AuthenticationOptions = {
    challenge: string;
    timeout: number;
    rpId: string;
    allowCredentials: Array<{
        id: string;
        type: string;
        transports?: string[];
    }>;
    userVerification: string;
};

export class WebAuthnService {
    private readonly RP_NAME = "Morina";
    private readonly RP_ID = process.env.WEBAUTHN_RP_ID || "localhost";
    private readonly ORIGIN = process.env.WEBAUTHN_ORIGIN || "http://localhost:3000";
    private readonly TIMEOUT = 60000; // 60 seconds

    async generateRegistrationOptions(userId: string, email: string, displayName: string): Promise<RegistrationOptions> {
        try {
            const { generateRegistrationOptions } = await import("@simplewebauthn/server");

            // Buscar credenciais existentes do usuário
            const existingCredentials = await prisma.webAuthnCredential.findMany({
                where: { userId },
            });

            const options = await generateRegistrationOptions({
                rpName: this.RP_NAME,
                rpID: this.RP_ID,
                userID: userId,
                userName: email,
                userDisplayName: displayName,
                timeout: this.TIMEOUT,
                attestationType: "none",
                excludeCredentials: existingCredentials.map((cred) => ({
                    id: Buffer.from(cred.credentialId, "base64"),
                    type: "public-key" as const,
                    transports: cred.transports as any,
                })),
                authenticatorSelection: {
                    authenticatorAttachment: "platform", // Preferir biometria do dispositivo
                    requireResidentKey: false,
                    userVerification: "preferred",
                },
                supportedAlgorithmIDs: [-7, -257], // ES256, RS256
            });

            // Salvar challenge temporariamente
            await prisma.webAuthnChallenge.create({
                data: {
                    userId,
                    challenge: options.challenge,
                    expiresAt: new Date(Date.now() + this.TIMEOUT),
                },
            });

            console.log(`🔐 [WEBAUTHN] Registration options geradas para ${email}`);

            return options as any;
        } catch (error) {
            console.error("Error generating registration options:", error);
            throw new Error("WEBAUTHN_REGISTRATION_FAILED");
        }
    }

    async verifyRegistration(
        userId: string,
        credential: any,
        expectedChallenge: string
    ): Promise<WebAuthnCredential> {
        try {
            const { verifyRegistrationResponse } = await import("@simplewebauthn/server");

            // Verificar challenge
            const challengeRecord = await prisma.webAuthnChallenge.findFirst({
                where: {
                    userId,
                    challenge: expectedChallenge,
                    expiresAt: { gt: new Date() },
                },
            });

            if (!challengeRecord) {
                throw new Error("INVALID_CHALLENGE");
            }

            const verification = await verifyRegistrationResponse({
                response: credential,
                expectedChallenge,
                expectedOrigin: this.ORIGIN,
                expectedRPID: this.RP_ID,
            });

            if (!verification.verified || !verification.registrationInfo) {
                throw new Error("VERIFICATION_FAILED");
            }

            const { credentialPublicKey, credentialID, counter } = verification.registrationInfo;

            // Salvar credencial no banco
            await prisma.webAuthnCredential.create({
                data: {
                    userId,
                    credentialId: Buffer.from(credentialID).toString("base64"),
                    publicKey: Buffer.from(credentialPublicKey).toString("base64"),
                    counter,
                    transports: credential.response.transports || [],
                },
            });

            // Remover challenge usado
            await prisma.webAuthnChallenge.delete({
                where: { id: challengeRecord.id },
            });

            console.log(`✅ [WEBAUTHN] Credencial registrada para usuário ${userId}`);

            return {
                id: Buffer.from(credentialID).toString("base64"),
                publicKey: Buffer.from(credentialPublicKey).toString("base64"),
                counter,
                transports: credential.response.transports,
            };
        } catch (error) {
            console.error("Error verifying registration:", error);
            throw new Error("WEBAUTHN_VERIFICATION_FAILED");
        }
    }

    async generateAuthenticationOptions(userId: string): Promise<AuthenticationOptions> {
        try {
            const { generateAuthenticationOptions } = await import("@simplewebauthn/server");

            // Buscar credenciais do usuário
            const credentials = await prisma.webAuthnCredential.findMany({
                where: { userId },
            });

            if (credentials.length === 0) {
                throw new Error("NO_CREDENTIALS_FOUND");
            }

            const options = await generateAuthenticationOptions({
                timeout: this.TIMEOUT,
                allowCredentials: credentials.map((cred) => ({
                    id: Buffer.from(cred.credentialId, "base64"),
                    type: "public-key" as const,
                    transports: cred.transports as any,
                })),
                userVerification: "preferred",
                rpID: this.RP_ID,
            });

            // Salvar challenge
            await prisma.webAuthnChallenge.create({
                data: {
                    userId,
                    challenge: options.challenge,
                    expiresAt: new Date(Date.now() + this.TIMEOUT),
                },
            });

            console.log(`🔐 [WEBAUTHN] Authentication options geradas para usuário ${userId}`);

            return options as any;
        } catch (error) {
            console.error("Error generating authentication options:", error);
            throw new Error("WEBAUTHN_AUTH_OPTIONS_FAILED");
        }
    }

    async verifyAuthentication(
        userId: string,
        credential: any,
        expectedChallenge: string
    ): Promise<{ verified: boolean; credentialId: string }> {
        try {
            const { verifyAuthenticationResponse } = await import("@simplewebauthn/server");

            // Verificar challenge
            const challengeRecord = await prisma.webAuthnChallenge.findFirst({
                where: {
                    userId,
                    challenge: expectedChallenge,
                    expiresAt: { gt: new Date() },
                },
            });

            if (!challengeRecord) {
                throw new Error("INVALID_CHALLENGE");
            }

            // Buscar credencial
            const credentialRecord = await prisma.webAuthnCredential.findFirst({
                where: {
                    userId,
                    credentialId: credential.id,
                },
            });

            if (!credentialRecord) {
                throw new Error("CREDENTIAL_NOT_FOUND");
            }

            const verification = await verifyAuthenticationResponse({
                response: credential,
                expectedChallenge,
                expectedOrigin: this.ORIGIN,
                expectedRPID: this.RP_ID,
                authenticator: {
                    credentialID: Buffer.from(credentialRecord.credentialId, "base64"),
                    credentialPublicKey: Buffer.from(credentialRecord.publicKey, "base64"),
                    counter: credentialRecord.counter,
                },
            });

            if (!verification.verified) {
                throw new Error("VERIFICATION_FAILED");
            }

            // Atualizar counter
            await prisma.webAuthnCredential.update({
                where: { id: credentialRecord.id },
                data: {
                    counter: verification.authenticationInfo.newCounter,
                    lastUsedAt: new Date(),
                },
            });

            // Remover challenge usado
            await prisma.webAuthnChallenge.delete({
                where: { id: challengeRecord.id },
            });

            console.log(`✅ [WEBAUTHN] Autenticação verificada para usuário ${userId}`);

            return {
                verified: true,
                credentialId: credentialRecord.credentialId,
            };
        } catch (error) {
            console.error("Error verifying authentication:", error);
            throw new Error("WEBAUTHN_AUTH_VERIFICATION_FAILED");
        }
    }

    async revokeCredential(userId: string, credentialId: string): Promise<void> {
        try {
            await prisma.webAuthnCredential.deleteMany({
                where: {
                    userId,
                    credentialId,
                },
            });

            console.log(`🗑️ [WEBAUTHN] Credencial ${credentialId} revogada`);
        } catch (error) {
            console.error("Error revoking credential:", error);
            throw new Error("WEBAUTHN_REVOKE_FAILED");
        }
    }

    async listCredentials(userId: string): Promise<any[]> {
        try {
            return await prisma.webAuthnCredential.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
            });
        } catch (error) {
            console.error("Error listing credentials:", error);
            return [];
        }
    }
}

// Singleton instance
let webAuthnServiceInstance: WebAuthnService | null = null;

export function getWebAuthnService(): WebAuthnService {
    if (!webAuthnServiceInstance) {
        webAuthnServiceInstance = new WebAuthnService();
    }
    return webAuthnServiceInstance;
}
