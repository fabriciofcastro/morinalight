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

  // Debug logging (apenas em desenvolvimento e para rotas não estáticas)
  if (
    process.env.NODE_ENV === "development" &&
    !pathname.startsWith("/_next/") &&
    !pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot|css|js|map)$/) &&
    !publicRoutes.some((route) => pathname.startsWith(route))
  ) {
    // Log apenas quando não há token E não é rota pública (situação que requer atenção)
    if (!token) {
      console.log('🔍 [PROXY] Pathname:', pathname, '- Token não encontrado');
    }
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
    return NextResponse.next();
  }

  // Permitir rotas de API públicas
  if (apiPublicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Se não tem token e não é rota pública, redirecionar para login
  if (!token && !pathname.startsWith("/api")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Para rotas de API do Next.js (server-side), permitir sempre
  // Elas podem ter fallback ou lógica própria de autenticação
  if (pathname.startsWith("/api") && !token) {
    // Se é rota pública de API, permitir
    if (apiPublicRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.next();
    }
    // Para outras rotas de API, permitir também (elas têm fallback ou verificam auth internamente)
    return NextResponse.next();
  }

  // Se chegou aqui, tem token ou é rota pública
  return NextResponse.next();
}
