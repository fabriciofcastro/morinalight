
import { getAuthUser } from '@/lib/auth/server';
import { EXPECTED_ORIGIN, RP_ID } from '@/lib/auth/webauthn-config';
import prisma from '@/lib/prisma';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { response } = body;

        // Recuperar challenge do cookie
        const cookieStore = await cookies();
        const expectedChallenge = cookieStore.get('webauthn_challenge')?.value;

        if (!expectedChallenge) {
            return NextResponse.json({ error: 'Challenge not found or expired' }, { status: 400 });
        }

        const verification = await verifyRegistrationResponse({
            response,
            expectedChallenge,
            expectedOrigin: EXPECTED_ORIGIN,
            expectedRPID: RP_ID,
        });

        if (verification.verified && verification.registrationInfo) {
            const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

            // Salvar no banco
            await prisma.authenticator.create({
                data: {
                    userId: user.userId,
                    credentialID: credential.id,
                    credentialPublicKey: Buffer.from(credential.publicKey).toString('base64'),
                    counter: BigInt(verification.registrationInfo.credential.counter || 0), // Use credential counter if available
                    credentialDeviceType,
                    credentialBackedUp,
                    transports: response.transports ? JSON.stringify(response.transports) : null,
                }
            });

            // Limpar challenge
            (await cookies()).delete('webauthn_challenge');

            return NextResponse.json({ verified: true });
        } else {
            return NextResponse.json({ verified: false, error: "Verification failed" }, { status: 400 });
        }

    } catch (error: unknown) {
        console.error('WebAuthn Verify Error:', error);
        return NextResponse.json({ error: (error instanceof Error ? error.message : 'Internal Server Error') }, { status: 500 });
    }
}
