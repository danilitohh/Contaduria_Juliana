import { NextResponse, type NextRequest } from "next/server";

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

export function proxy(request: NextRequest) {
  const requiresAuth = process.env.NEXO_REQUIRE_AUTH === "true";
  const isPrivate = privateRoutes.some((route) => request.nextUrl.pathname.startsWith(route));

  if (!requiresAuth || !isPrivate) {
    return NextResponse.next();
  }

  const hasSupabaseCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"));

  if (!hasSupabaseCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
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
  ],
};
