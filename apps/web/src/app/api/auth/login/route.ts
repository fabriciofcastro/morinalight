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
  console.log("🟢 [NEXT.JS] POST /api/auth/login received");
  let body: unknown;

  try {
    body = await request.json();
    console.log("🟢 [NEXT.JS] Request body parsed:", {
      email: (body as any)?.email,
      hasPassword: !!(body as any)?.password
    });
  } catch {
    console.log("🔴 [NEXT.JS] Failed to parse JSON body");
    return NextResponse.json({ message: "Corpo da requisição inválido." }, { status: 400 });
  }

  const schema = z.object({
    email: z.string().trim().min(1, "E-mail é obrigatório").email("E-mail inválido"),
    password: z.string().min(8, "Senha mínima de 8 caracteres"),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    console.log("🔴 [NEXT.JS] Validation failed:", parsed.error.flatten());
    return NextResponse.json(
      { message: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  console.log("🟢 [NEXT.JS] Validation passed, checking rate limit...");

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
    console.log("🟢 [NEXT.JS] Calling backend API:", `${apiUrl}/auth/login`);
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

    // Se login bem-sucedido, repassar cookies do backend
    // O backend já define os cookies httpOnly, apenas repassamos
    const responseHeaders = new Headers({
      "Cache-Control": "no-store, max-age=0",
    });

    // Repassar todos os cookies Set-Cookie do backend
    const setCookieHeaders = response.headers.getSetCookie?.() || [];
    if (setCookieHeaders.length > 0) {
      setCookieHeaders.forEach((cookie) => {
        responseHeaders.append("Set-Cookie", cookie);
      });
      console.log("🟢 [NEXT.JS] Forwarding", setCookieHeaders.length, "cookies from backend");
    }

    return NextResponse.json(payload, {
      status: response.status,
      headers: responseHeaders,
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
