
import { aiSecurityAnalyst } from '@/lib/ai/security-analyst';
import { getAuthUser } from '@/lib/auth/server';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30; // 30 seconds max for Vercel/similar

export async function POST(req: Request) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch full user for role check
        const dbUser = await prisma.user.findUnique({
            where: { id: user.userId },
            include: { roles: { include: { role: true } } }
        });

        if (!dbUser) {
            return NextResponse.json({ error: 'User Not Found' }, { status: 404 });
        }

        const userRoles = dbUser.roles.map(r => r.role.name.toLowerCase());
        const hasPermission = userRoles.some(role => ['owner', 'admin', 'manager'].includes(role));

        if (!hasPermission) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Check Config
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            return NextResponse.json({ error: 'AI_KEY_MISSING' }, { status: 503 });
        }

        const { messages } = await req.json();

        const result = await aiSecurityAnalyst.streamChat(messages, user.userId);

        return result.toTextStreamResponse();

    } catch (error) {
        console.error('AI Chat Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
