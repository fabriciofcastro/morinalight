import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { apiUrl } from "@/lib/env";

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minuto
const RATE_LIMIT_MAX = 5;
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry) {
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return false;
  }

  // Reinicia janela
  if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return false;
  }

  entry.count += 1;
  rateLimitStore.set(ip, entry);

  return entry.count > RATE_LIMIT_MAX;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Corpo da requisição inválido." }, { status: 400 });
  }

  const schema = z.object({
    email: z.string().trim().min(1, "E-mail é obrigatório").email("E-mail inválido"),
    password: z.string().min(8, "Senha mínima de 8 caracteres"),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";

  if (ip !== "unknown" && isRateLimited(ip)) {
    return NextResponse.json(
      { message: "Muitas tentativas de login. Tente novamente em instantes." },
      { status: 429 },
    );
  }

  try {
    // Timeout de 10 segundos para não ficar esperando indefinidamente
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    let response: Response;
    try {
      response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
        cache: "no-store",
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        return NextResponse.json(
          { message: "Timeout: API não respondeu a tempo. Verifique se a API está rodando." },
          { status: 504 },
        );
      }
      // Erro de conexão (ECONNREFUSED, etc)
      const isConnectionError =
        fetchError instanceof Error &&
        (fetchError.message.includes("ECONNREFUSED") ||
          fetchError.message.includes("fetch failed") ||
          fetchError.message.includes("network"));
      if (isConnectionError) {
        return NextResponse.json(
          {
            message: "API não está disponível. Verifique se o servidor está rodando em http://localhost:3333",
            code: "API_UNAVAILABLE",
          },
          { status: 503 },
        );
      }
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }

    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const payload = (isJson ? await response.json() : await response.text()) as
      | Record<string, unknown>
      | string;

    if (!response.ok) {
      return NextResponse.json(
        typeof payload === "object" ? payload : { message: String(payload) },
        { status: response.status },
      );
    }

    // Se login bem-sucedido, salvar token e organização em cookies
    if (response.ok && typeof payload === "object" && "token" in payload) {
      const token = String(payload.token);
      const cookieStore = await cookies();
      
      // Salvar token de autenticação
      cookieStore.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 dias
        path: "/",
      });

      // Salvar organização selecionada se houver
      if ("organizations" in payload && Array.isArray(payload.organizations) && payload.organizations.length > 0) {
        const firstOrg = payload.organizations[0];
        const orgId = typeof firstOrg === "object" && firstOrg !== null
          ? ("organizationId" in firstOrg ? String(firstOrg.organizationId) : "id" in firstOrg ? String(firstOrg.id) : null)
          : typeof firstOrg === "string"
            ? firstOrg
            : null;
        
        if (orgId) {
          cookieStore.set("selected_org_id", orgId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60, // 7 dias
            path: "/",
          });
        }
      }
    }

    return NextResponse.json(payload, {
      status: response.status,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        message: `Erro ao conectar com a API: ${message}. Verifique se a API está rodando.`,
        code: "API_CONNECTION_ERROR",
      },
      { status: 502 },
    );
  }
}
