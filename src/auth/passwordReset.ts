export const PASSWORD_RESET_CONFIRMATION =
  "If an account exists for that email, a password reset link has been sent.";

export function normalizePasswordResetEmail(value: string): string {
  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a valid email address.");
  }
  return email;
}

export function isPrivatePasswordResetError(reason: unknown): boolean {
  if (!reason || typeof reason !== "object" || !("code" in reason)) return false;
  const code = (reason as { code?: unknown }).code;
  return code === "auth/user-not-found";
}
