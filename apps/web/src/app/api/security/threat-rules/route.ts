/**
 * Threat Rules Management API
 * 
 * CRUD operations for threat response rules
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminRouteMiddleware } from '@/lib/middleware/security-middleware';
import { threatResponseEngine } from '@/lib/security/threat-response-engine';
import { ThreatRule, validateRule } from '@/lib/security/threat-rules';

export async function GET(request: NextRequest) {
    // Apply security middleware
    const middlewareResult = await adminRouteMiddleware(request, {});
    if (middlewareResult) return middlewareResult;

    // Check admin role
    const sessionUser = (request as any).user;
    if (!sessionUser || !['admin', 'super_admin'].includes(sessionUser.role)) {
        return NextResponse.json(
            { error: 'Forbidden - Administrator privileges required' },
            { status: 403 }
        );
    }

    try {
        const rules = threatResponseEngine.getRules();
        return NextResponse.json({ rules });
    } catch (error) {
        console.error('[Threat Rules API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch rules' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    // Apply security middleware
    const middlewareResult = await adminRouteMiddleware(request, {});
    if (middlewareResult) return middlewareResult;

    // Check admin role
    const sessionUser = (request as any).user;
    if (!sessionUser || !['admin', 'super_admin'].includes(sessionUser.role)) {
        return NextResponse.json(
            { error: 'Forbidden - Administrator privileges required' },
            { status: 403 }
        );
    }

    try {
        const body = await request.json();
        const { action, rule } = body;

        if (action === 'update_rules' && Array.isArray(body.rules)) {
            // Validate all rules
            for (const r of body.rules) {
                const validation = validateRule(r);
                if (!validation.valid) {
                    return NextResponse.json(
                        { error: 'Invalid rule', details: validation.errors },
                        { status: 400 }
                    );
                }
            }

            threatResponseEngine.setRules(body.rules);
            return NextResponse.json({ success: true, message: 'Rules updated' });
        }

        if (action === 'toggle_engine') {
            const enabled = body.enabled === true;
            threatResponseEngine.setEnabled(enabled);
            return NextResponse.json({
                success: true,
                message: `Engine ${enabled ? 'enabled' : 'disabled'}`,
            });
        }

        if (action === 'toggle_dry_run') {
            const dryRun = body.dryRun === true;
            threatResponseEngine.setDryRun(dryRun);
            return NextResponse.json({
                success: true,
                message: `Dry-run mode ${dryRun ? 'enabled' : 'disabled'}`,
            });
        }

        return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
        );
    } catch (error) {
        console.error('[Threat Rules API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}
