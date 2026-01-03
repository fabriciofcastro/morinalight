/**
 * CSRF Token API Route
 * 
 * Endpoint para gerar tokens CSRF
 */

import { NextResponse } from "next/server";
import { generateCSRFToken } from "@/lib/security/csrf";

export async function GET() {
    const token = generateCSRFToken();

    const response = NextResponse.json({ token });

    // Setar cookie httpOnly com o token
    response.cookies.set("csrf-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 24 horas
        path: "/",
    });

    return response;
}
