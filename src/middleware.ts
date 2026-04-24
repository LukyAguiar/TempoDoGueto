import { auth } from "@/lib/auth/config";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as any)?.role as string | undefined;
  const pathname = req.nextUrl.pathname;

  // ── Rotas de admin ────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (role !== "ADMIN") {
      // Barbeiro tentando acessar /admin → manda pro dashboard dele
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // ── Rotas do dashboard (barbeiro) ─────────────────────────
  const isDashboardRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/business") ||
    pathname.startsWith("/services") ||
    pathname.startsWith("/availability") ||
    pathname.startsWith("/appointments");

  if (isDashboardRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ── Rota de registro — bloqueada para todos ───────────────
  // Nenhum usuário pode se auto-cadastrar; só admin cria via /admin/users
  if (pathname.startsWith("/register")) {
    if (isLoggedIn) {
      return NextResponse.redirect(
        new URL(role === "ADMIN" ? "/admin" : "/dashboard", req.url)
      );
    }
    // Não logado tentando acessar /register → login
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ── Usuário logado tentando acessar /login ────────────────
  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(
      new URL(role === "ADMIN" ? "/admin" : "/dashboard", req.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
