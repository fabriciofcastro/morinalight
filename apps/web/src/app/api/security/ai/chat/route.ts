
import { aiSecurityAnalyst } from '@/lib/ai/security-analyst';
import { getAuthUser } from '@/lib/auth/server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30; // 30 seconds max for Vercel/similar

export async function POST(req: Request) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Role check: Only admin, manager, or owner should clear see this
        if (!['owner', 'admin', 'manager'].includes(user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Check Config
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            return NextResponse.json({ error: 'AI_KEY_MISSING' }, { status: 503 });
        }

        const { messages } = await req.json();

        const result = await aiSecurityAnalyst.streamChat(messages, user.id);

        return result.toDataStreamResponse();

    } catch (error) {
        console.error('AI Chat Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
