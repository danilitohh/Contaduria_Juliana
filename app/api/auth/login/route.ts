import { NextResponse, type NextRequest } from "next/server";
import {
  getSessionSignature,
  isSecureRequest,
  sessionCookieName,
  verifyCredentials,
} from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const sessionSignature = await getSessionSignature();

  if (!sessionSignature) {
    return NextResponse.redirect(new URL("/login?error=config", request.url), 303);
  }

  if (!verifyCredentials(email, password)) {
    return NextResponse.redirect(new URL("/login?error=credentials", request.url), 303);
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url), 303);
  response.cookies.set(sessionCookieName, sessionSignature, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest(request),
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
