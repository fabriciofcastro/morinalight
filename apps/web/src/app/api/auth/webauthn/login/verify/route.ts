
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { RP_ID, EXPECTED_ORIGIN } from '@/lib/auth/webauthn-config';
import { cookies } from 'next/headers';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt';
import { UserWithPermissions } from '@/lib/auth/rbac'; // Ensure we map User to this structure

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { response } = body;

        const expectedChallenge = cookies().get('webauthn_challenge')?.value;

        if (!expectedChallenge) {
            return NextResponse.json({ error: 'Challenge not found or expired' }, { status: 400 });
        }

        // Buscar authenticator pelo credentialID
        const authenticator = await prisma.authenticator.findUnique({
            where: { credentialID: response.id },
            include: { user: true }
        });

        if (!authenticator) {
            return NextResponse.json({ error: 'Authenticator not found' }, { status: 400 });
        }

        const verification = await verifyAuthenticationResponse({
            response,
            expectedChallenge,
            expectedOrigin: EXPECTED_ORIGIN,
            expectedRPID: RP_ID,
            authenticator: {
                credentialPublicKey: Buffer.from(authenticator.credentialPublicKey, 'base64'),
                credentialID: authenticator.credentialID,
                counter: BigInt(authenticator.counter),
                transports: authenticator.transports ? JSON.parse(authenticator.transports) : undefined,
            },
        });

        if (verification.verified) {
            const { authenticationInfo } = verification;
            const { newCounter } = authenticationInfo;

            // Atualizar contador para prevenir replay attacks
            await prisma.authenticator.update({
                where: { credentialID: response.id },
                data: { counter: BigInt(newCounter) }
            });

            // Limpar challenge
            cookies().delete('webauthn_challenge');

            // --- Gerar Sessão (JWT) ---
            const user = authenticator.user;

            // Mapear para UserWithPermissions (simplificado, role viria de memberships ou tabela user)
            // Assumimos que o token payload espera { userId, role, email... }
            // A role no modelo User é opcional ou não existe? Olhando o schema, User tem 'roles' Relation.
            // Para simplificar, usaremos 'member' default ou pegaremos da tabela UserRole se existisse.

            // Verificar como user.roles é estruturado. No schema: roles UserRole[]
            const userWithRoles = await prisma.user.findUnique({
                where: { id: user.id },
                include: { roles: { include: { role: true } } }
            });

            // Fallback role logic (pegar a role mais alta ou 'member')
            const roleName = userWithRoles?.roles[0]?.role?.name || 'MEMBER'; // Simplificação

            const tokenUser: UserWithPermissions = {
                id: user.id,
                email: user.email,
                role: roleName,
                permissions: [], // Permissions seriam carregadas aqui se necessário para o token
            };

            const accessToken = generateAccessToken(tokenUser);
            // const refreshToken = generateRefreshToken(tokenUser); // Refresh token logic if needed

            // Definir Cookies de Sessão
            cookies().set("auth_token", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60, // 7 dias
                path: "/",
            });

            // Opcional: Selected Org Cookie se o usuário tiver
            const membership = await prisma.organizationMembership.findFirst({
                where: { userId: user.id }
            });

            if (membership) {
                cookies().set("selected_org_id", membership.organizationId, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    maxAge: 7 * 24 * 60 * 60,
                    path: "/",
                });
            }

            return NextResponse.json({ verified: true, redirect: '/' });
        } else {
            return NextResponse.json({ verified: false, error: "Verification failed" }, { status: 400 });
        }

    } catch (error: any) {
        console.error('WebAuthn Verify Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
