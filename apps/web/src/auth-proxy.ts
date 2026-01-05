import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rotas públicas que não requerem autenticação
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/invite",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/playbook",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  // Páginas legais
  "/lgpd",
  "/termos",
  "/privacidade",
  "/cookies",
  "/antifraude",
  "/retencao-logs",
  "/lei-representante",
  "/vinculo-empregaticio",
];

const apiPublicRoutes = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/realtime/token",
  "/api/health", // Frequentemente útil
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value ?? request.cookies.get("auth_token")?.value;

  // Debug logging (apenas em desenvolvimento)
  if (
    process.env.NODE_ENV === "development" &&
    !pathname.startsWith("/_next/") &&
    !pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot|css|js|map)$/) &&
    !publicRoutes.some((route) => pathname.startsWith(route))
  ) {
    if (!token) {
      console.log('🔍 [PROXY] Pathname:', pathname, '- Token não encontrado');
    }
  }

  let response: NextResponse;

  // Arquivos estáticos e internos do Next.js -> Permitir
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/_vercel") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot|css|js|map)$/)
  ) {
    response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // Rotas Públicas -> Permitir
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // Rotas de API Públicas -> Permitir
  if (apiPublicRoutes.some((route) => pathname.startsWith(route))) {
    response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // Verificação de Auth
  // Se não tem token e não é público, redirecionar para login (a menos que seja uma rota de API, veja abaixo)
  if (!token && !pathname.startsWith("/api")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    response = NextResponse.redirect(loginUrl);
    return addSecurityHeaders(response);
  }

  // Tratamento de rotas de API
  if (pathname.startsWith("/api")) {
    // Se chegou aqui, é uma rota de API.
    // Se fosse pública, teria entrado no if acima.
    // Se é privada e não tem token:
    if (!token) {
      // Permitir passar?
      // O proxy.ts original permitia: "Para outras rotas de API, permitir também (elas têm fallback ou verificam auth internamente)"
      // Vamos preservar o comportamento original: permitir que rotas de API cheguem ao endpoint, onde presumivelmente lidam com auth.
      response = NextResponse.next();
      return addSecurityHeaders(response);
    }
  }

  // Se o token existe ou é permitido por outro motivo
  response = NextResponse.next();
  return addSecurityHeaders(response);
}

/**
 * Adiciona headers de segurança na resposta
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' http: https: ws: wss:;"
  );

  return response;
}
