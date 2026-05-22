import { NextResponse, type NextRequest } from "next/server";
import {
  hasAuthConfig,
  isSecureRequest,
  legacySessionCookieNames,
  sessionCookieName,
  sessionCookieValue,
  verifyCredentials,
} from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!hasAuthConfig()) {
    return NextResponse.redirect(new URL("/login?error=config", request.url), 303);
  }

  if (!verifyCredentials(email, password)) {
    return NextResponse.redirect(new URL("/login?error=credentials", request.url), 303);
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url), 303);
  const secure = isSecureRequest(request);

  legacySessionCookieNames.forEach((cookieName) => {
    response.cookies.set(cookieName, "", {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 0,
    });
  });

  response.cookies.set(sessionCookieName, sessionCookieValue, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
