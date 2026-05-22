export const sessionCookieName = "nexo_admin_session";

export function getAdminEmail() {
  return process.env.NEXO_ADMIN_EMAIL ?? "julianaz101@hotmail.com";
}

function getAdminPassword() {
  return process.env.NEXO_ADMIN_PASSWORD;
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function getSessionSignature() {
  const password = getAdminPassword();

  if (!password) {
    return null;
  }

  return sha256(`${getAdminEmail().trim().toLowerCase()}:${password}`);
}

export async function hasValidSession(cookieValue?: string) {
  const expectedSignature = await getSessionSignature();
  return Boolean(expectedSignature && cookieValue && cookieValue === expectedSignature);
}

export function verifyCredentials(email: string, password: string) {
  const allowedEmail = getAdminEmail().trim().toLowerCase();
  const allowedPassword = getAdminPassword();

  if (!allowedEmail || !allowedPassword) {
    return false;
  }

  return email.trim().toLowerCase() === allowedEmail && password === allowedPassword;
}
