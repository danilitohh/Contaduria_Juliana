import { NextResponse, type NextRequest } from "next/server";
import { isSecureRequest, legacySessionCookieNames, sessionCookieName } from "@/lib/auth/session";

export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  const secure = isSecureRequest(request);

  [sessionCookieName, ...legacySessionCookieNames].forEach((cookieName) => {
    response.cookies.set(cookieName, "", {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 0,
    });
  });

  return response;
}
