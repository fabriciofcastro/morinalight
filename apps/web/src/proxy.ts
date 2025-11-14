import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const publicRoutes = ["/login", "/invite"];
const apiPublicRoutes = ["/api/auth/login", "/api/auth/register", "/api/realtime/token"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

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

  return NextResponse.next();
}
