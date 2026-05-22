import { NextResponse, type NextRequest } from "next/server";
import { isSecureRequest, sessionCookieName } from "@/lib/auth/session";

export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  response.cookies.set(sessionCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest(request),
    path: "/",
    maxAge: 0,
  });

  return response;
}
