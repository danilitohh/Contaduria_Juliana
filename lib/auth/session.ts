export const sessionCookieName = "nexo_admin_session_v2";
export const sessionCookieValue = "active";
export const legacySessionCookieNames = ["nexo_admin_session"];

export function isSecureRequest(request: Request) {
  const forwardedProtocol = request.headers.get("x-forwarded-proto");

  if (forwardedProtocol) {
    return forwardedProtocol.split(",")[0]?.trim() === "https";
  }

  return new URL(request.url).protocol === "https:";
}

export function getAdminEmail() {
  return process.env.NEXO_ADMIN_EMAIL ?? "julianaz101@hotmail.com";
}

export function getAdminUsername() {
  const configuredUsername = process.env.NEXO_ADMIN_USERNAME?.trim();

  if (configuredUsername) {
    return configuredUsername;
  }

  return getAdminEmail().split("@", 1)[0] ?? "";
}

function getAdminPassword() {
  return process.env.NEXO_ADMIN_PASSWORD;
}

export function hasAuthConfig() {
  return Boolean(getAdminEmail().trim() && getAdminPassword());
}

export function hasValidSession(cookieValue?: string) {
  return cookieValue === sessionCookieValue;
}

export function verifyCredentials(identifier: string, password: string) {
  const normalizedIdentifier = identifier.trim().toLowerCase();
  const allowedEmail = getAdminEmail().trim().toLowerCase();
  const allowedUsername = getAdminUsername().trim().toLowerCase();
  const allowedPassword = getAdminPassword();

  if (!allowedEmail || !allowedPassword) {
    return false;
  }

  const hasAllowedIdentifier =
    normalizedIdentifier === allowedEmail ||
    Boolean(allowedUsername && normalizedIdentifier === allowedUsername);

  return hasAllowedIdentifier && password === allowedPassword;
}
