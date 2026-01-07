
import { RP_ID } from '@/lib/auth/webauthn-config';
import prisma from '@/lib/prisma';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email } = body;

        let allowCredentials = undefined;

        // Se email for fornecido, restringir chaves a esse usuário
        if (email) {
            const user = await prisma.user.findUnique({
                where: { email },
                include: { authenticators: true }
            });

            if (user && user.authenticators.length > 0) {
                allowCredentials = user.authenticators.map(auth => ({
                    id: auth.credentialID,
                    transports: auth.transports ? JSON.parse(auth.transports) : undefined,
                }));
            }
        }

        const options = await generateAuthenticationOptions({
            rpID: RP_ID,
            allowCredentials,
            userVerification: 'preferred', // 'required' para melhor segurança, mas 'preferred' reduz fricção
        });

        // Salvar challenge
        const cookieStore = await cookies();
        cookieStore.set('webauthn_challenge', options.challenge, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 5 // 5 minutos
        });

        return NextResponse.json(options);

    } catch (error) {
        console.error('WebAuthn Login Options Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
