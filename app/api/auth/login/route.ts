import { NextResponse, type NextRequest } from "next/server";
import {
  getSessionToken,
  sessionCookieName,
  verifyCredentials,
} from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const token = getSessionToken();

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=config", request.url), 303);
  }

  if (!verifyCredentials(email, password)) {
    return NextResponse.redirect(new URL("/login?error=credentials", request.url), 303);
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url), 303);
  response.cookies.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
