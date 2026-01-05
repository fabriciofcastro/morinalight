
import { startRegistration } from '@simplewebauthn/server';
import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/server';
import prisma from '@/lib/prisma';
import { RP_ID, RP_NAME } from '@/lib/auth/webauthn-config';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Buscar autenticadores existentes para evitar duplicação (excludeCredentials)
        const userAuthenticators = await prisma.authenticator.findMany({
            where: { userId: user.id },
            select: { credentialID: true, transports: true }
        });

        const options = await startRegistration({
            rpName: RP_NAME,
            rpID: RP_ID,
            userID: user.id,
            userName: user.email || user.displayName || 'User',
            // Prevenir registrar o mesmo dispositivo de novo
            excludeCredentials: userAuthenticators.map(auth => ({
                id: auth.credentialID,
                transports: auth.transports ? JSON.parse(auth.transports) : undefined,
            })),
            authenticatorSelection: {
                residentKey: 'preferred',
                userVerification: 'preferred',
                authenticatorAttachment: 'cross-platform', // ou platform para TouchID/FaceID específico
            },
        });

        // Salvar challenge na sessão (cookie seguro) para verificação no passo 2
        // Em produção, isso seria armazenado em Redis ou DB com TTL curto.
        // Aqui usaremos um cookie assinado/criptografado é uma boa prática stateless.
        // Por simplicidade, usaremos um cookie httpOnly temporário.

        cookies().set('webauthn_challenge', options.challenge, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 5 // 5 minutos
        });

        return NextResponse.json(options);

    } catch (error) {
        console.error('WebAuthn Start Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
