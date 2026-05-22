import { NextResponse, type NextRequest } from "next/server";
import { hasValidSession, sessionCookieName } from "@/lib/auth/session";

const privateRoutes = [
  "/dashboard",
  "/clientes",
  "/proveedores",
  "/productos",
  "/cotizaciones",
  "/facturas",
  "/pos",
  "/inventario",
  "/bodegas",
  "/gastos",
  "/pagos",
  "/cartera",
  "/cuentas-por-pagar",
  "/reportes",
  "/nomina",
  "/configuracion",
  "/perfil",
];

const authRoutes = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const isPrivate = privateRoutes.some((route) => request.nextUrl.pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => request.nextUrl.pathname.startsWith(route));
  const isAuthenticated = hasValidSession(request.cookies.get(sessionCookieName)?.value);

  if (isPrivate && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clientes/:path*",
    "/proveedores/:path*",
    "/productos/:path*",
    "/cotizaciones/:path*",
    "/facturas/:path*",
    "/pos/:path*",
    "/inventario/:path*",
    "/bodegas/:path*",
    "/gastos/:path*",
    "/pagos/:path*",
    "/cartera/:path*",
    "/cuentas-por-pagar/:path*",
    "/reportes/:path*",
    "/nomina/:path*",
    "/configuracion/:path*",
    "/perfil/:path*",
    "/login",
    "/register",
  ],
};
