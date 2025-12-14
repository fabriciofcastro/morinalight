import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../_lib/auth-headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const body = await request.json().catch(() => ({}));
  const { logoutAllDevices = false } = body;

  try {
    // Chamar backend para registrar logout na auditoria
    // O backend já registra automaticamente na auditoria
    const headers = await buildAuthHeaders({ "Content-Type": "application/json" });
    
    if (logoutAllDevices) {
      // Se for logout de todos os dispositivos, usar endpoint específico
      await fetch(`${apiUrl}/auth/logout-all`, {
        method: "POST",
        headers,
      }).catch(() => {
        // Ignorar erros, continuar com logout local
      });
    } else {
      // Logout normal
      await fetch(`${apiUrl}/auth/logout`, {
        method: "POST",
        headers,
      }).catch(() => {
        // Ignorar erros, continuar com logout local
      });
    }
  } catch (error) {
    // Ignorar erros de rede, continuar com logout local
    console.error("Erro ao registrar logout no backend:", error);
  }

  // Limpar cookies
  cookieStore.set("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  cookieStore.set("selected_org_id", "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return NextResponse.json(
    {
      ok: true,
      message: logoutAllDevices
        ? "Logout realizado em todos os dispositivos"
        : "Logout realizado com sucesso",
    },
    { status: 200 },
  );
}
