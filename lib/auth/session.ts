export const sessionCookieName = "nexo_admin_session";

export function getAdminEmail() {
  return process.env.NEXO_ADMIN_EMAIL ?? "julianaz101@hotmail.com";
}

export function getSessionToken() {
  return process.env.NEXO_SESSION_TOKEN;
}

export function hasValidSession(cookieValue?: string) {
  const expectedToken = getSessionToken();
  return Boolean(expectedToken && cookieValue && cookieValue === expectedToken);
}

export function verifyCredentials(email: string, password: string) {
  const allowedEmail = getAdminEmail().trim().toLowerCase();
  const allowedPassword = process.env.NEXO_ADMIN_PASSWORD;

  if (!allowedEmail || !allowedPassword) {
    return false;
  }

  return email.trim().toLowerCase() === allowedEmail && password === allowedPassword;
}
