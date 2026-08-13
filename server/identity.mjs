export class AuthenticationError extends Error {
  constructor(message = "Sign in is required.", code = "AUTH_REQUIRED", status = 401) {
    super(message);
    this.name = "AuthenticationError";
    this.code = code;
    this.status = status;
  }
}

export class AuthorizationError extends Error {
  constructor(message = "You do not have permission to perform this action.", code = "FORBIDDEN") {
    super(message);
    this.name = "AuthorizationError";
    this.code = code;
    this.status = 403;
  }
}

export async function authenticateRequest(request, services) {
  const decoded = await authenticateFirebaseUser(request, services);

  const membershipSnap = await services.db.collection("memberships").doc(decoded.uid).get();
  if (!membershipSnap.exists) {
    throw new AuthorizationError("Your account has not joined a beta community yet.", "MEMBERSHIP_REQUIRED");
  }
  const membership = membershipSnap.data();
  if (!membership?.tenantId || !["employee", "employer_admin"].includes(membership.role) || membership.status !== "active") {
    throw new AuthorizationError("Your beta membership is inactive or invalid.", "MEMBERSHIP_INACTIVE");
  }
  return {
    uid: decoded.uid,
    email: decoded.email || null,
    tenantId: membership.tenantId,
    role: membership.role,
    authenticatedAt: typeof decoded.auth_time === "number" ? decoded.auth_time * 1000 : null,
    secondFactorVerified: decoded.mfa === true || decoded.firebase?.sign_in_second_factor != null || decoded.amr?.some((value) => ["mfa", "otp", "totp", "webauthn"].includes(value)) === true,
  };
}

export async function authenticateFirebaseUser(request, services) {
  const header = request.headers.authorization || "";
  if (!header.startsWith("Bearer ")) throw new AuthenticationError();
  const token = header.slice(7).trim();
  if (!token) throw new AuthenticationError();

  let decoded;
  try {
    decoded = await services.auth.verifyIdToken(token, true);
  } catch {
    throw new AuthenticationError("Your session is invalid or expired.", "INVALID_SESSION");
  }

  return decoded;
}

export function requireRole(identity, role) {
  if (identity.role !== role) throw new AuthorizationError();
}

export function requireRecentAuthentication(identity, now = Date.now, maxAgeMs = 15 * 60_000) {
  if (!identity.authenticatedAt || now() - identity.authenticatedAt > maxAgeMs || identity.authenticatedAt > now() + 60_000) {
    throw new AuthenticationError("Recent authentication is required.", "RECENT_AUTH_REQUIRED");
  }
}
