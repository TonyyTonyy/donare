import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { verifyAccessToken } from "@/lib/jwt";

const AUTH_COOKIE_NAME = "access_token";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rotas públicas
  // - A rota '/' é pública para todos (logado ou não)
  // - login/cadastro só podem ser acessadas por usuários NÃO autenticados
  if (pathname === "/") {
    return NextResponse.next();
  }

  // Permitir assets e rotas internas
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/public") ||
    pathname.match(/\.(?:png|jpg|jpeg|svg|ico|css|js|map|webp|woff2?)$/)
  ) {
    return NextResponse.next();
  }

  // Permitir APIs de autenticação
  if (pathname.startsWith("/api/auth/login") || pathname.startsWith("/api/auth/cadastro")) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  // login/cadastro: se autenticado, manda para '/' (mesmo com cookie válido)
  if (
    pathname === "/login" ||
    pathname === "/cadastro" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/cadastro")
  ) {
    if (cookie) {
      try {
        verifyAccessToken(cookie);
        console.log('decodificado');
        const url = req.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      } catch (err) {
        console.log(err);
        // token inválido -> permite acesso ao login/cadastro
      }
    }

    return NextResponse.next();
  }

  // Todas as demais rotas só para autenticados
  // (inclui páginas internas do app e qualquer outra rota que passe pelo matcher)

  if (!cookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }


  try {
    verifyAccessToken(cookie);
    return NextResponse.next();
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

}