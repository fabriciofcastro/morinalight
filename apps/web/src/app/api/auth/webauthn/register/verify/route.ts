
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/server';
import prisma from '@/lib/prisma';
import { RP_ID, EXPECTED_ORIGIN } from '@/lib/auth/webauthn-config';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { response } = body;

        // Recuperar challenge do cookie
        const expectedChallenge = cookies().get('webauthn_challenge')?.value;

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
            const { credentialPublicKey, credentialID, counter, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

            // Salvar no banco
            await prisma.authenticator.create({
                data: {
                    userId: user.id,
                    credentialID: credentialID,
                    credentialPublicKey: Buffer.from(credentialPublicKey).toString('base64'),
                    counter: BigInt(counter),
                    credentialDeviceType,
                    credentialBackedUp,
                    transports: response.transports ? JSON.stringify(response.transports) : null,
                }
            });

            // Limpar challenge
            cookies().delete('webauthn_challenge');

            return NextResponse.json({ verified: true });
        } else {
            return NextResponse.json({ verified: false, error: "Verification failed" }, { status: 400 });
        }

    } catch (error: any) {
        console.error('WebAuthn Verify Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
