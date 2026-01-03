import { NextRequest } from 'next/server';
import { globalSecurityMiddleware } from './proxy';

/**
 * Next.js Middleware Entry Point
 * 
 * This file is required by Next.js to be in the root of src/ or the project.
 * It delegates to proxy.ts which implements the full security stack 
 * (Threat Intel, Attack Detection, Rate Limiting, SIEM).
 */
export async function middleware(request: NextRequest) {
    return globalSecurityMiddleware(request);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
