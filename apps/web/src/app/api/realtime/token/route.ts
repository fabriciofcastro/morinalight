import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

/**
 * Decodifica JWT para obter o subject (userId)
 */
function decodeJwt(token: string): { sub?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }
    const payload = parts[1];
    const decoded = Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString(
      "utf-8",
    );
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    // Obter orgId: primeiro dos headers, depois dos cookies
    let orgId = request.headers.get("x-org-id");
    if (!orgId) {
      orgId = cookieStore.get("selected_org_id")?.value ?? null;
    }

    // Obter actorId: primeiro dos headers, depois decodificar do JWT
    let actorId = request.headers.get("x-actor-id");
    if (!actorId && token) {
      const payload = decodeJwt(token);
      actorId = payload?.sub ?? null;
    }

    if (!orgId || !actorId) {
      return NextResponse.json(
        {
          message:
            "x-org-id e x-actor-id são obrigatórios. Verifique se está autenticado e tem uma organização selecionada.",
          missing: {
            orgId: !orgId,
            actorId: !actorId,
          },
        },
        { status: 400 },
      );
    }

    const body = await request.json().catch(() => ({}));

    // Fazer proxy para a API backend
    const response = await fetch(`${API_URL}/realtime/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-org-id": orgId,
        "x-actor-id": actorId,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Erro desconhecido");
      return NextResponse.json({ message: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { message: `Erro ao obter token realtime: ${message}` },
      { status: 502 },
    );
  }
}
