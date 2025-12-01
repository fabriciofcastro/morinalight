import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const publicRoutes = [
  "/login",
  "/register",
  "/invite",
  "/forgot-password",
  "/reset-password",
  // Legal pages - accessible without login
  "/lgpd",
  "/termos",
  "/privacidade",
  "/cookies",
  "/antifraude",
  "/retencao-logs",
  "/lei-representante",
  "/vinculo-empregaticio",
];
const apiPublicRoutes = ["/api/auth/login", "/api/auth/register", "/api/realtime/token"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  // Debug logging
  if (!pathname.startsWith("/_next/") && !pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot|css|js|map)$/)) {
    console.log('🔍 [PROXY] Pathname:', pathname);
    console.log('🍪 [PROXY] Token exists:', !!token);
    console.log('🍪 [PROXY] Token preview:', token ? token.substring(0, 20) + '...' : 'none');
  }

  // Permitir arquivos estáticos do Next.js e outros recursos estáticos
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/_vercel") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot|css|js|map)$/)
  ) {
    return NextResponse.next();
  }

  // Permitir rotas públicas
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    console.log('✅ [PROXY] Rota pública permitida:', pathname);
    return NextResponse.next();
  }

  // Permitir rotas de API públicas
  if (apiPublicRoutes.some((route) => pathname.startsWith(route))) {
    console.log('✅ [PROXY] API pública permitida:', pathname);
    return NextResponse.next();
  }

  // Se não tem token e não é rota pública, redirecionar para login
  if (!token && !pathname.startsWith("/api")) {
    console.log('❌ [PROXY] Sem token, redirecionando para login');
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  console.log('✅ [PROXY] Token presente, permitindo acesso');
  return NextResponse.next();
}
